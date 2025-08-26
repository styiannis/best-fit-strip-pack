import { BestFitStripPack, BestFitStripPackRotatable } from '../../src';
import { isValidClassInstance, isValidObjectInstance } from '../tests-utils';

describe('Classes', () => {
  describe('Initialized instances', () => {
    const stripWidth = 123;

    it.each([
      ['BestFitStripPack', new BestFitStripPack(stripWidth)],
      ['BestFitStripPackRotatable', new BestFitStripPackRotatable(stripWidth)],
    ] as const)('%s', (instanceType, instance) => {
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
