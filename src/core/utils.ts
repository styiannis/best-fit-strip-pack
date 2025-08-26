import {
  doublyList,
  fitPosition,
  minHeap,
  placementPoint,
  placementPointRotatable,
} from './lib';
import {
  IDoublyListNode,
  IFitPosition,
  IFitPositionRotatable,
  IMinHeapNode,
  IBestFitStripPack,
} from './types';

/* ----------------------------------------- */
/* ---------- // Helper functions ---------- */
/* ----------------------------------------- */

function bestFitPlacement<P extends IBestFitStripPack>(
  instance: P,
  action: 'first-node-only' | 'remove-rest-nodes' | 'last-node-split',
  firstNode: NonNullable<P['list']['head']>,
  lastNode: NonNullable<P['list']['head']>,
  w: number,
  h: number,
  y: number
) {
  if (action === 'first-node-only') {
    if (w < firstNode.value.width) {
      splitNode(instance, firstNode, w);
    }

    minHeap.heap.increase(instance.heap, firstNode.heapNode, h);

    mergeEqualHeightNodes(
      instance,
      firstNode.previous ?? firstNode,
      firstNode.next ?? firstNode
    );
  } else if (action === 'remove-rest-nodes') {
    removeAllNodesButTheFirst(instance, firstNode, lastNode);

    firstNode.value.width = w;

    minHeap.heap.increase(
      instance.heap,
      firstNode.heapNode,
      y + h - firstNode.heapNode.key
    );

    mergeEqualHeightNodes(
      instance,
      firstNode.previous ?? firstNode,
      firstNode.next ?? firstNode
    );
  } else {
    removeAllNodesButTheFirst(
      instance,
      firstNode,
      lastNode.previous ?? firstNode
    );

    firstNode.value.width = w;

    minHeap.heap.increase(
      instance.heap,
      firstNode.heapNode,
      y + h - firstNode.heapNode.key
    );

    lastNode.value.width =
      lastNode.value.x + lastNode.value.width - firstNode.value.x - w;

    lastNode.value.x = firstNode.value.x + firstNode.value.width;

    mergeEqualHeightNodes(
      instance,
      firstNode.previous ?? firstNode,
      lastNode.next ?? lastNode
    );
  }

  updatePackedDimensions(instance, y + h);
}

function createRecord(width: number, height: number, x: number) {
  const listNodevalue = doublyList.nodeValue.create(width, x);
  const heapNode = minHeap.node.create<IMinHeapNode>(height, null);
  const listNode = doublyList.node.create<IDoublyListNode>(
    listNodevalue,
    heapNode
  );
  heapNode.listNode = listNode;
  return { heapNode, listNode };
}

function findBestFitPositionRotatable<P extends IBestFitStripPack>(
  instance: P,
  width: number,
  height: number
) {
  const pos: IFitPositionRotatable = {
    ...getBestFitPosition(instance, width),
    rotated: false,
  };

  const posRotated: IFitPositionRotatable = {
    ...getBestFitPosition(instance, height),
    rotated: true,
  };

  return pos.y + height <= posRotated.y + width ? pos : posRotated;
}

function getBestFitPosition<P extends IBestFitStripPack>(
  instance: P,
  width: number
) {
  const position = fitPosition.create<IFitPosition>(
    instance.list.head as NonNullable<P['list']['head']>,
    instance.list.tail as NonNullable<P['list']['tail']>,
    0,
    instance.packedHeight,
    'remove-rest-nodes'
  );

  for (let i = 0, x = 1; i < instance.heap.length; i = x - 1) {
    x *= 2;
    for (let j = i; j < instance.heap.length && j < x - 1; j += 1) {
      const listNode = instance.heap[j].listNode as NonNullable<
        P['list']['head']
      >;

      if (listNode.heapNode.key <= position.y) {
        const currHeight = listNode.heapNode.key;

        let first = listNode;

        for (
          let prev = first.previous;
          prev?.heapNode && prev.heapNode.key <= currHeight;
          prev = prev.previous
        ) {
          first = prev;
        }

        let last = first;
        let maxHeight = first.heapNode.key;
        let totalWidth = first.value.width;

        for (
          let next = first.next;
          totalWidth < width &&
          next?.heapNode &&
          next.heapNode.key <= currHeight;
          next = next.next
        ) {
          last = next;
          maxHeight = Math.max(maxHeight, next.heapNode.key);
          totalWidth += next.value.width;
        }

        validateBestFitPosition(
          instance,
          position,
          first,
          last,
          width,
          maxHeight
        );
      }
    }
  }

  return position;
}

function inLinePlacement<P extends IBestFitStripPack>(
  instance: P,
  w: number,
  h: number
) {
  if (instance.list.tail?.heapNode?.key === h) {
    instance.list.tail.value.width += w;
  } else {
    const { heapNode, listNode } = createRecord(w, h, instance.packedWidth);
    minHeap.heap.add(instance.heap, heapNode);
    doublyList.list.pushNode(instance.list, listNode);
  }

  updatePackedDimensions(instance, h);
}

function mergeEqualHeightNodes<P extends IBestFitStripPack>(
  instance: P,
  firstNode: NonNullable<P['list']['head']>,
  lastNode: NonNullable<P['list']['head']>
) {
  let node = firstNode;
  while (node !== lastNode && node.next) {
    const next = node.next;

    if (node.heapNode.key === next.heapNode.key) {
      node.value.width += next.value.width;
      removeAllNodesButTheFirst(instance, node, next);
    } else {
      node = next;
    }
  }
}

function removeAllNodesButTheFirst<P extends IBestFitStripPack>(
  instance: P,
  firstNode: NonNullable<P['list']['head']>,
  lastNode: NonNullable<P['list']['head']>
) {
  if (firstNode === lastNode) {
    return;
  }

  for (let removeNode = firstNode.next, next; removeNode; removeNode = next) {
    next = removeNode === lastNode ? null : removeNode.next;
    removeRecord(instance, removeNode);
  }
}

function removeRecord<P extends IBestFitStripPack>(
  instance: P,
  listNode: NonNullable<P['list']['head']>
) {
  minHeap.heap.remove(instance.heap, listNode.heapNode);
  doublyList.list.detachNode(instance.list, listNode);
}

function splitNode<P extends IBestFitStripPack>(
  instance: P,
  node: NonNullable<P['list']['head']>,
  width: number
) {
  const nodeHeapNode = node.heapNode;

  const newNodeWidth = node.value.width - width;
  const newNodeHeight = nodeHeapNode.key;
  const newNodeX = node.value.x + width;

  const { heapNode, listNode } = createRecord(
    newNodeWidth,
    newNodeHeight,
    newNodeX
  );

  doublyList.list.insertNextNode(instance.list, node, listNode);
  minHeap.heap.add(instance.heap, heapNode);

  node.value.width = width;
}

function updatePackedDimensions<P extends IBestFitStripPack>(
  instance: P,
  newHeight: number
) {
  instance.packedHeight = Math.max(instance.packedHeight, newHeight);
  instance.packedWidth = instance.list.tail
    ? instance.list.tail.value.x + instance.list.tail.value.width
    : 0;
}

function validateBestFitPosition<P extends IBestFitStripPack>(
  instance: P,
  position: IFitPosition,
  firstNode: NonNullable<P['list']['head']>,
  lastNode: NonNullable<P['list']['head']>,
  width: number,
  y: number
) {
  const x = firstNode.value.x;

  if (y > position.y || (y === position.y && x > position.x)) {
    return;
  }

  const totalWidth =
    lastNode.value.x + lastNode.value.width - firstNode.value.x;

  if (width <= totalWidth) {
    position.firstNode = firstNode;
    position.lastNode = lastNode;
    position.x = x;
    position.y = y;
    position.action =
      firstNode === lastNode
        ? 'first-node-only'
        : width === totalWidth
        ? 'remove-rest-nodes'
        : 'last-node-split';

    return;
  }

  if (
    lastNode === instance.list.tail &&
    width <= instance.stripWidth - firstNode.value.x
  ) {
    position.firstNode = firstNode;
    position.lastNode = lastNode;
    position.x = x;
    position.y = y;
    position.action = 'remove-rest-nodes';
  }
}

/* ----------------------------------------- */
/* ---------- Helper functions // ---------- */
/* ----------------------------------------- */

export function addBestFit<P extends IBestFitStripPack>(
  instance: P,
  width: number,
  height: number
) {
  const { action, firstNode, lastNode, x, y } = getBestFitPosition(
    instance,
    width
  );

  bestFitPlacement(instance, action, firstNode, lastNode, width, height, y);

  return placementPoint.create(x, y);
}

export function addBestFitRotatable<P extends IBestFitStripPack>(
  instance: P,
  width: number,
  height: number
) {
  const { action, firstNode, lastNode, rotated, x, y } =
    findBestFitPositionRotatable(instance, width, height);

  const w = rotated ? height : width;
  const h = rotated ? width : height;

  bestFitPlacement(instance, action, firstNode, lastNode, w, h, y);

  return placementPointRotatable.create(x, y, rotated);
}

export function addInLine<P extends IBestFitStripPack>(
  instance: P,
  width: number,
  height: number
) {
  const point = placementPoint.create(instance.packedWidth, 0);

  inLinePlacement(instance, width, height);

  return point;
}

export function addInLineRotatable<P extends IBestFitStripPack>(
  instance: P,
  width: number,
  height: number,
  rotated: boolean
) {
  const point = placementPointRotatable.create(
    instance.packedWidth,
    0,
    rotated
  );

  inLinePlacement(instance, width, height);

  return point;
}

export function fitsInLine<P extends IBestFitStripPack>(
  instance: P,
  width: number
) {
  return instance.packedWidth + width <= instance.stripWidth;
}
