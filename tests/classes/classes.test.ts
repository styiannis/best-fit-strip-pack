import { BestFitStripPack, BestFitStripPackRotatable } from '../../src';
import { isValidClassInstance } from '../tests-utils';

describe('classes', () => {
  describe('Initializing classes instances', () => {
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
    });
  });
});
