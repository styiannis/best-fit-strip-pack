import { BestFitStripPack, BestFitStripPackRotatable } from '../src';
import { isValidClassInstance, isValidObjectInstance } from './test-utils';

describe('Classes', () => {
  describe('Initialized instances', () => {
    const stripWidth = 123;

    it.each([
      ['BestFitStripPack', BestFitStripPack],
      ['BestFitStripPackRotatable', BestFitStripPackRotatable],
    ] as const)('%s', (instanceType, P) => {
      const instance = new P(stripWidth);

      expect(
        isValidClassInstance(instance, instanceType) &&
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
