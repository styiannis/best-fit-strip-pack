import { BestFitStripPack, BestFitStripPackRotatable } from '../../src';

describe('Invalid strip width value', () => {
  describe.each([
    ['BestFitStripPack', BestFitStripPack],
    ['BestFitStripPackRotatable', BestFitStripPackRotatable],
  ] as const)('%s', (_, BFSP) => {
    it('The strip width value is not numerical', () => {
      const stripWidth = 'a';

      // @ts-expect-error
      expect(() => new BFSP(stripWidth)).toThrow(TypeError);

      // @ts-expect-error
      expect(() => new BFSP(stripWidth)).toThrow(
        `Strip width (${stripWidth}) should be numerical value.`
      );
    });

    it('The strip width value is 0', () => {
      const stripWidth = 0;

      expect(() => new BFSP(stripWidth)).toThrow(RangeError);
      expect(() => new BFSP(stripWidth)).toThrow(
        `Strip width value (${stripWidth}) should be greater than 0.`
      );
    });

    it('The strip width value is less than 0', () => {
      const stripWidth = -4;

      expect(() => new BFSP(stripWidth)).toThrow(RangeError);
      expect(() => new BFSP(stripWidth)).toThrow(
        `Strip width value (${stripWidth}) should be greater than 0.`
      );
    });
  });
});

describe('Invalid rectangle dimensions', () => {
  describe.each([
    ['BestFitStripPack', BestFitStripPack],
    ['BestFitStripPackRotatable', BestFitStripPackRotatable],
  ] as const)('%s', (_, BFSP) => {
    it('The width value is not numerical', () => {
      const stripWidth = 1000;
      const rectangle = { width: 'a', height: 99 };
      const instance = new BFSP(stripWidth);

      // @ts-expect-error
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        TypeError
      );

      // @ts-expect-error
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be numerical values.`
      );
    });

    it('The height value is not numerical', () => {
      const stripWidth = 1000;
      const rectangle = { width: 88, height: 'b' };
      const instance = new BFSP(stripWidth);

      // @ts-expect-error
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        TypeError
      );

      // @ts-expect-error
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be numerical values.`
      );
    });

    it('The values of both dimensions are not numerical', () => {
      const stripWidth = 1000;
      const rectangle = { width: 'c', height: 'd' };
      const instance = new BFSP(stripWidth);

      // @ts-expect-error
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        TypeError
      );

      // @ts-expect-error
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be numerical values.`
      );
    });

    it('The width value is 0', () => {
      const stripWidth = 1000;
      const rectangle = { width: 0, height: 99 };
      const instance = new BFSP(stripWidth);

      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        RangeError
      );
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be greater than 0.`
      );
    });

    it('The height value is 0', () => {
      const stripWidth = 1000;
      const rectangle = { width: 88, height: 0 };
      const instance = new BFSP(stripWidth);

      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        RangeError
      );
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be greater than 0.`
      );
    });

    it('The values of both dimensions are 0', () => {
      const stripWidth = 1000;
      const rectangle = { width: 0, height: 0 };
      const instance = new BFSP(stripWidth);

      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        RangeError
      );
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be greater than 0.`
      );
    });

    it('The width value is less than 0', () => {
      const stripWidth = 1000;
      const rectangle = { width: -12, height: 99 };
      const instance = new BFSP(stripWidth);

      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        RangeError
      );
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be greater than 0.`
      );
    });

    it('The height value is less than 0', () => {
      const stripWidth = 1000;
      const rectangle = { width: 88, height: -23 };
      const instance = new BFSP(stripWidth);

      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        RangeError
      );
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be greater than 0.`
      );
    });

    it('The values of both dimensions are less than 0', () => {
      const stripWidth = 1000;
      const rectangle = { width: -11, height: -33 };
      const instance = new BFSP(stripWidth);

      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        RangeError
      );
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be greater than 0.`
      );
    });
  });
});

describe('Rectangles with dimensions that exceed the width of the strip', () => {
  describe('BestFitStripPack', () => {
    it('The width is greater than the width of the strip', () => {
      const stripWidth = 1000;
      const rectangle = { width: stripWidth + 1, height: 3 };
      const instance = new BestFitStripPack(stripWidth);

      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        RangeError
      );
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Width (${rectangle.width}) should not exceed strip width (${stripWidth}).`
      );
    });

    it('Both dimensions are greater than the width of the strip', () => {
      const stripWidth = 1000;
      const rectangle = { width: stripWidth + 1, height: stripWidth + 3 };
      const instance = new BestFitStripPack(stripWidth);

      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        RangeError
      );
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Width (${rectangle.width}) should not exceed strip width (${stripWidth}).`
      );
    });
  });

  describe('BestFitStripPackRotatable', () => {
    it('Both dimensions are greater than the width of the strip', () => {
      const stripWidth = 1000;
      const rectangle = { width: stripWidth + 1, height: stripWidth + 3 };
      const instance = new BestFitStripPackRotatable(stripWidth);

      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        RangeError
      );
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `At least one of the dimensions (${rectangle.width}x${rectangle.height}) should not exceed strip width (${stripWidth}).`
      );
    });
  });
});
