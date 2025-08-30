import {
  IDoublyLinkedList,
  IDoublyLinkedListNode,
} from 'abstract-linked-lists';
import { IHeapArray, IHeapNode } from 'addressable-binary-heaps';

/**
 * Coordinates of a placed rectangle within the packing strip.
 */
export interface IPlacementPoint {
  /**
   * Horizontal position of the rectangle's bottom-left corner.
   */
  x: number;

  /**
   * Vertical position of the rectangle's bottom-left corner.
   */
  y: number;
}

/**
 * Coordinates and orientation of a placed rectangle with rotation support.
 */
export interface IPlacementPointRotatable extends IPlacementPoint {
  /**
   * Whether the rectangle was rotated during placement.
   * - `true`: Width and height were swapped
   * - `false`: Original orientation was maintained
   */
  rotated: boolean;
}

/**
 * Node in the doubly-linked list maintaining column segments of the packing strip.
 *
 * @typeParam HN - Type of associated heap node
 */
export interface IDoublyListNode<HN extends IMinHeapNode = IMinHeapNode>
  extends IDoublyLinkedListNode {
  /**
   * Horizontal starting position of this column segment.
   */
  x: number;

  /**
   * Width of the column segment.
   */
  width: number;

  /**
   * Associated heap node tracking column segment height.
   */
  heapNode: HN;

  /**
   * Next node in the doubly-linked list.
   */
  next: IDoublyListNode<HN> | null;

  /**
   * Previous node in the doubly-linked list.
   */
  previous: IDoublyListNode<HN> | null;
}

/**
 * Doubly-linked list structure for maintaining column segments.
 *
 * @typeParam N - Type of nodes in the list
 */
export interface IDoublyList<N extends IDoublyListNode = IDoublyListNode>
  extends IDoublyLinkedList<N> {}

/**
 * Potential placement position discovered during best-fit search.
 * Includes list modification requirements for the placement.
 *
 * @typeParam LN - Type of list nodes involved
 */
export interface IFitPosition<LN extends IDoublyListNode = IDoublyListNode>
  extends IPlacementPoint {
  /**
   * List modification action required for placement:
   * - 'first-only': Modify only the first node
   * - 'merge-and-split-last': Merge nodes and split the last one
   * - 'merge-all': Merge all involved nodes
   */
  action: 'first-only' | 'merge-and-split-last' | 'merge-all';

  /**
   * First list node involved in the placement operation.
   */
  firstNode: LN;

  /**
   * Last list node involved in the placement operation.
   */
  lastNode: LN;
}

/**
 * Potential placement position with rotation consideration.
 *
 * @typeParam LN - Type of list nodes involved
 */
export interface IFitPositionRotatable<
  LN extends IDoublyListNode = IDoublyListNode
> extends IFitPosition<LN> {
  /**
   * Whether rectangle rotation is required for this placement.
   * - `true`: Use rotated orientation (swap width and height)
   * - `false`: Maintain original orientation
   */
  rotated: boolean;
}

/**
 * Node in the min-heap for best-fit candidate selection.
 * Maintains connections between heap and list structures.
 */
export interface IMinHeapNode extends IHeapNode {
  /**
   * Key value for heap ordering, representing column segment height.
   */
  key: number;

  /**
   * Corresponding doubly-linked list node for synchronized updates.
   */
  listNode: IDoublyListNode | null;
}

/**
 * Min-heap structure for best-fit candidate selection.
 * Ordered by column height to quickly find suitable placement positions.
 *
 * @typeParam N - Type of nodes in the heap
 */
export type IMinHeap<N extends IMinHeapNode = IMinHeapNode> = IHeapArray<N>;
