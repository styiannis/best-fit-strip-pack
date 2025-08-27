import { IDoublyList, IMinHeap } from './lib';

export interface IBestFitStripPack {
  heap: IMinHeap;
  list: IDoublyList;
  packedHeight: number;
  packedWidth: number;
  stripWidth: number;
}
