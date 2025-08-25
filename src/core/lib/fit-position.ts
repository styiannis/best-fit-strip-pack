import { IFitPosition } from '../types';

export function create<P extends IFitPosition>(
  firstNode: P['firstNode'],
  lastNode: P['lastNode'],
  x: P['x'],
  y: P['y'],
  action: P['action']
) {
  return { action, firstNode, lastNode, x, y } as P;
}
