import {
  add as minHeapAdd,
  clear as minHeapClear,
  create as minHeapCreate,
  increase as minHeapIncrease,
  remove as minHeapRemove,
} from 'addressable-binary-heaps/min-heap';
import { IMinHeap } from '../types';

export function add<H extends IMinHeap>(instance: H, node: H[0]) {
  return minHeapAdd(instance, node);
}

export function clear<H extends IMinHeap>(instance: H) {
  return minHeapClear(instance);
}

export function create<H extends IMinHeap>() {
  return minHeapCreate<H>();
}

export function increase<H extends IMinHeap>(
  instance: H,
  node: H[0],
  increaseValue: number
) {
  return minHeapIncrease(instance, node, increaseValue);
}

export function remove<H extends IMinHeap>(instance: H, node: H[0]) {
  return minHeapRemove(instance, node);
}
