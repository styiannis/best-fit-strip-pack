import {
  IDoublyLinkedList,
  IDoublyLinkedListNode,
} from 'abstract-linked-lists';
import { IHeapArray, IHeapNode } from 'addressable-binary-heaps';

export interface IPlacementPoint {
  x: number;
  y: number;
}

export interface IPlacementPointRotatable extends IPlacementPoint {
  rotated: boolean;
}

export interface IDoublyListNodeValue {
  width: number;
  x: number;
}

export interface IDoublyListNode<HN extends IMinHeapNode = IMinHeapNode>
  extends IDoublyLinkedListNode {
  value: IDoublyListNodeValue;
  heapNode: HN;
  next: IDoublyListNode<HN> | null;
  previous: IDoublyListNode<HN> | null;
}

export interface IDoublyList<N extends IDoublyListNode = IDoublyListNode>
  extends IDoublyLinkedList<N> {}

export interface IFitPosition<LN extends IDoublyListNode = IDoublyListNode>
  extends IPlacementPoint {
  action: 'first-node-only' | 'last-node-split' | 'remove-rest-nodes';
  firstNode: LN;
  lastNode: LN;
}

export interface IFitPositionRotatable<
  LN extends IDoublyListNode = IDoublyListNode
> extends IFitPosition<LN> {
  rotated: boolean;
}

export interface IMinHeapNode extends IHeapNode {
  listNode: IDoublyListNode | null;
}

export type IMinHeap<N extends IMinHeapNode = IMinHeapNode> = IHeapArray<N>;
