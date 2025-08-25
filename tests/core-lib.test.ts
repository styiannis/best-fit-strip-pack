import {
  doublyList,
  fitPosition,
  minHeap,
  placementPoint,
  placementPointRotatable,
} from '../src/core/lib';
import { isValidObjectInstance } from './test-utils';

describe('Core >> lib', () => {
  describe('Initializing instances', () => {
    it('Doubly list', () => {
      const instance = doublyList.list.create();

      expect(
        isValidObjectInstance(instance, 'doubly-list') &&
          instance.head === null &&
          instance.tail === null &&
          instance.size === 0
      ).toBe(true);
    });

    it('Doubly list node', () => {
      const heapNode = minHeap.node.create(0, null);
      const value = doublyList.nodeValue.create(0, 0);
      const instance = doublyList.node.create(value, heapNode);

      expect(
        isValidObjectInstance(instance, 'doubly-list-node') &&
          isValidObjectInstance(instance.heapNode, 'min-heap-node') &&
          isValidObjectInstance(instance.value, 'doubly-list-node-value') &&
          instance.heapNode === heapNode &&
          instance.value === value &&
          instance.next === null &&
          instance.previous === null
      ).toBe(true);
    });

    it('Fit position', () => {
      const firstNodeHeap = minHeap.node.create(0, null);
      const firstNodeValue = doublyList.nodeValue.create(0, 0);
      const firstNode = doublyList.node.create(firstNodeValue, firstNodeHeap);

      const lastNodeHeap = minHeap.node.create(0, null);
      const lastNodeValue = doublyList.nodeValue.create(0, 0);
      const lastNode = doublyList.node.create(lastNodeValue, lastNodeHeap);

      const x = 2;
      const y = 6;

      const action = 'remove-rest-nodes';

      const instance = fitPosition.create(firstNode, lastNode, x, y, action);

      expect(
        isValidObjectInstance(instance, 'fit-position') &&
          instance.firstNode === firstNode &&
          instance.lastNode === lastNode &&
          instance.action === action &&
          instance.x === x &&
          instance.y === y
      ).toBe(true);

      expect(
        isValidObjectInstance(instance.firstNode, 'doubly-list-node') &&
          instance.firstNode.heapNode === firstNodeHeap &&
          instance.firstNode.value === firstNodeValue &&
          instance.firstNode.next === null &&
          instance.firstNode.previous === null
      ).toBe(true);

      expect(
        isValidObjectInstance(instance.lastNode, 'doubly-list-node') &&
          instance.lastNode.heapNode === lastNodeHeap &&
          instance.lastNode.value === lastNodeValue &&
          instance.lastNode.next === null &&
          instance.lastNode.previous === null
      ).toBe(true);
    });

    it('Min-heap node', () => {
      const height = 5;
      const instance = minHeap.node.create(height, null);

      expect(
        isValidObjectInstance(instance, 'min-heap-node') &&
          instance.key === height &&
          instance.listNode === null
      ).toBe(true);
    });

    it('Placement point', () => {
      const x = 1;
      const y = 2;
      const instance = placementPoint.create(x, y);

      expect(
        isValidObjectInstance(instance, 'placement-point') &&
          instance.x === x &&
          instance.y === y
      ).toBe(true);
    });

    it('Placement point rotatable', () => {
      const x = 1;
      const y = 2;
      const rotated = true;
      const instance = placementPointRotatable.create(x, y, rotated);

      expect(
        isValidObjectInstance(instance, 'placement-point-rotatable') &&
          instance.rotated === rotated &&
          instance.x === x &&
          instance.y === y
      ).toBe(true);
    });
  });
});
