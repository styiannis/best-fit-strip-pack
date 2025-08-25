import {
  create as createList,
  clear as clearList,
  pushNode as pushToList,
} from 'abstract-linked-lists/doubly-linked-list/list';
import { IDoublyList } from '../../types';
import { attachNext, detach } from './node';

export function create<L extends IDoublyList>() {
  return createList<L>();
}

export function clear<L extends IDoublyList>(instance: L) {
  return clearList(instance);
}

export function detachNode<L extends IDoublyList>(
  instance: L,
  node: NonNullable<L['head']>
) {
  if (node === instance.head) {
    instance.head = node.next;
  }

  if (node === instance.tail) {
    instance.tail = node.previous;
  }

  detach(node);

  instance.size -= 1;

  return node;
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
  return pushToList(instance, node);
}
