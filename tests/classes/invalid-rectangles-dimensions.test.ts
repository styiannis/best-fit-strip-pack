import { BestFitStripPack, BestFitStripPackRotatable } from '../../src';

describe('Invalid rectangles dimensions', () => {
  describe.each([
    ['BestFitStripPack', BestFitStripPack],
    ['BestFitStripPackRotatable', BestFitStripPackRotatable],
  ] as const)('%s', (_, P) => {
    it('Strip width value is not a number', () => {
      const stripWidth = 'a';

      // @ts-expect-error
      expect(() => new P(stripWidth)).toThrow(TypeError);

      // @ts-expect-error
      expect(() => new P(stripWidth)).toThrow(
        `Strip width (${stripWidth}) should be numerical value.`
      );
    });

    it('Strip width value is 0', () => {
      const stripWidth = 0;

      expect(() => new P(stripWidth)).toThrow(RangeError);
      expect(() => new P(stripWidth)).toThrow(
        `Strip width value (${stripWidth}) should be greater than 0.`
      );
    });

    it('Strip width value is less than 0', () => {
      const stripWidth = -4;

      expect(() => new P(stripWidth)).toThrow(RangeError);
      expect(() => new P(stripWidth)).toThrow(
        `Strip width value (${stripWidth}) should be greater than 0.`
      );
    });

    it('Width value is not a number', () => {
      const stripWidth = 1000;
      const rectangle = { width: 'a', height: 99 };
      const instance = new P(stripWidth);

      // @ts-expect-error
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        TypeError
      );

      // @ts-expect-error
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be numerical values.`
      );
    });

    it('Height value is not a number', () => {
      const stripWidth = 1000;
      const rectangle = { width: 88, height: 'b' };
      const instance = new P(stripWidth);

      // @ts-expect-error
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        TypeError
      );

      // @ts-expect-error
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be numerical values.`
      );
    });

    it('The values of both dimensions are not numbers', () => {
      const stripWidth = 1000;
      const rectangle = { width: 'c', height: 'd' };
      const instance = new P(stripWidth);

      // @ts-expect-error
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        TypeError
      );

      // @ts-expect-error
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be numerical values.`
      );
    });

    it('Width value is 0', () => {
      const stripWidth = 1000;
      const rectangle = { width: 0, height: 99 };
      const instance = new P(stripWidth);

      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        RangeError
      );
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be greater than 0.`
      );
    });

    it('Height value is 0', () => {
      const stripWidth = 1000;
      const rectangle = { width: 88, height: 0 };
      const instance = new P(stripWidth);

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
      const instance = new P(stripWidth);

      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        RangeError
      );
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be greater than 0.`
      );
    });

    it('Width value is less than 0', () => {
      const stripWidth = 1000;
      const rectangle = { width: -12, height: 99 };
      const instance = new P(stripWidth);

      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        RangeError
      );
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be greater than 0.`
      );
    });

    it('Height value is less than 0', () => {
      const stripWidth = 1000;
      const rectangle = { width: 88, height: -23 };
      const instance = new P(stripWidth);

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
      const instance = new P(stripWidth);

      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        RangeError
      );
      expect(() => instance.insert(rectangle.width, rectangle.height)).toThrow(
        `Both dimensions (${rectangle.width}x${rectangle.height}) should be greater than 0.`
      );
    });
  });
});

describe('Rectangles dimensions that exceed the strip width', () => {
  describe('BestFitStripPack', () => {
    it('Width value is greater than strip width', () => {
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

    it('The values of both dimensions are greater than strip width', () => {
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
    it('The values of both dimensions are greater than strip width', () => {
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
