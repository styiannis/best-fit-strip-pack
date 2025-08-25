import { doublyList, minHeap } from './lib';
import { IBestFitStripPack } from './types';
import { addBestFit, addInLine, fitsInLine } from './utils';
import { validateDimensions, validateStripWidth } from './validators';

export function create<P extends IBestFitStripPack>(stripWidth: number) {
  validateStripWidth(stripWidth);

  return {
    list: doublyList.list.create(),
    heap: minHeap.heap.create(),
    packedHeight: 0,
    packedWidth: 0,
    stripWidth,
  } as P;
}

export function insert<P extends IBestFitStripPack>(
  instance: P,
  width: number,
  height: number
) {
  validateDimensions(width, height, instance.stripWidth);

  return fitsInLine(instance, width)
    ? addInLine(instance, width, height)
    : addBestFit(instance, width, height);
}

export function reset<P extends IBestFitStripPack>(instance: P) {
  doublyList.list.clear(instance.list);
  minHeap.heap.clear(instance.heap);
  instance.packedHeight = 0;
  instance.packedWidth = 0;
}
