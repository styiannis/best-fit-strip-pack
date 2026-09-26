import {
  clear as listClear,
  create as listCreate,
  pushNode as listPushNode,
  removeNode as listRemoveNode,
} from 'abstract-linked-lists/doubly-linked-list/list';
import { IDoublyList } from '../types';
import { attachNext } from './node';

export function create<L extends IDoublyList>() {
  return listCreate<L>();
}

export function clear<L extends IDoublyList>(instance: L) {
  return listClear(instance);
}

export function removeNode<L extends IDoublyList>(
  instance: L,
  node: NonNullable<L['head']>
) {
  return listRemoveNode(instance, node);
}

export function insertNextNode<L extends IDoublyList>(
  instance: L,
  node: NonNullable<L['head']>,
  next: NonNullable<L['head']>
) {
  attachNext(node, next);

  if (node === instance.tail) {
    instance.tail = next;
  }

  instance.size += 1;
}

export function pushNode<L extends IDoublyList>(
  instance: L,
  node: NonNullable<L['head']>
) {
  return listPushNode(instance, node);
}
