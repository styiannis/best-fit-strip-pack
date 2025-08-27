import { IPlacementPoint } from './types';

export function create<T extends IPlacementPoint>(x: T['x'], y: T['y']) {
  return { x, y } as T;
}
