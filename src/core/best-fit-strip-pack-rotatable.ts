import { doublyList, minHeap } from './lib';
import { IBestFitStripPack } from './types';
import {
  addBestFit,
  addBestFitRotatable,
  addInLineRotatable,
  fitsInLine,
} from './utils';
import { validateDimensionsRotatable, validateStripWidth } from './validators';

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
  validateDimensionsRotatable(width, height, instance.stripWidth);

  if (instance.stripWidth < width) {
    return fitsInLine(instance, height)
      ? addInLineRotatable(instance, height, width, true)
      : { ...addBestFit(instance, height, width), rotated: true };
  }

  if (instance.stripWidth < height) {
    return fitsInLine(instance, width)
      ? addInLineRotatable(instance, width, height, false)
      : { ...addBestFit(instance, width, height), rotated: false };
  }

  if (width >= height) {
    return fitsInLine(instance, width)
      ? addInLineRotatable(instance, width, height, false)
      : fitsInLine(instance, height)
      ? addInLineRotatable(instance, height, width, true)
      : addBestFitRotatable(instance, width, height);
  }

  return fitsInLine(instance, height)
    ? addInLineRotatable(instance, height, width, true)
    : fitsInLine(instance, width)
    ? addInLineRotatable(instance, width, height, false)
    : addBestFitRotatable(instance, width, height);
}

export function reset<P extends IBestFitStripPack>(instance: P) {
  doublyList.list.clear(instance.list);
  minHeap.heap.clear(instance.heap);
  instance.packedHeight = 0;
  instance.packedWidth = 0;
}
