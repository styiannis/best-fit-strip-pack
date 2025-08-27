import {
  create as nodeCreate,
  detach as nodeDetach,
} from 'abstract-linked-lists/doubly-linked-list/node';
import { IDoublyListNode } from '../types';

export function create<N extends IDoublyListNode>(
  value: N['value'],
  heapNode: N['heapNode']
) {
  const instance = nodeCreate<N>();

  instance.value = value;
  instance.heapNode = heapNode;

  return instance;
}

export function attachNext<N extends IDoublyListNode>(instance: N, node: N) {
  if (instance.next) {
    instance.next.previous = node;
    node.next = instance.next;
  }

  node.previous = instance;
  instance.next = node;
}

export function detach<N extends IDoublyListNode>(instance: N) {
  return nodeDetach(instance);
}
