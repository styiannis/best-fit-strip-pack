import { bestFitStripPack, bestFitStripPackRotatable } from '../src/core';
import { isValidObjectInstance } from './test-utils';

describe('Core', () => {
  describe('Initializing instances', () => {
    const stripWidth = 100;

    it.each([
      ['bestFitStripPack', bestFitStripPack.create(stripWidth)],
      [
        'bestFitStripPackRotatable',
        bestFitStripPackRotatable.create(stripWidth),
      ],
    ] as const)('%s', (_, instance) => {
      expect(
        isValidObjectInstance(instance, 'best-fit-strip-pack') &&
          instance.packedHeight === 0 &&
          instance.packedWidth === 0 &&
          instance.stripWidth === stripWidth
      ).toBe(true);

      expect(
        isValidObjectInstance(instance.list, 'doubly-list') &&
          instance.list.head === null &&
          instance.list.tail === null &&
          instance.list.size === 0
      ).toBe(true);

      expect(
        isValidObjectInstance(instance.heap, 'min-heap') &&
          instance.heap.length === 0
      ).toBe(true);
    });
  });
});
