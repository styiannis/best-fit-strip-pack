import { IDoublyListNodeValue } from '../../types';

export function create<V extends IDoublyListNodeValue>(
  width: number,
  x: number
) {
  return { width, x } as V;
}
