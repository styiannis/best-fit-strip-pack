import { IMinHeapNode } from '../../types';

export function create<N extends IMinHeapNode>(
  key: N['key'],
  listNode: N['listNode']
) {
  return { key, listNode } as N;
}
