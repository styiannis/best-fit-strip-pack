import { IPlacementPointRotatable } from './types';

export function create<T extends IPlacementPointRotatable>(
  x: T['x'],
  y: T['y'],
  rotated: T['rotated']
) {
  return { x, y, rotated } as T;
}
