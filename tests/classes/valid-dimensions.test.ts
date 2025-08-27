import { BestFitStripPack, BestFitStripPackRotatable } from '../../src';

describe('Rectangles with dimensions that exceed the width of the strip', () => {
  const stripWidth = 1000;

  describe('BestFitStripPack', () => {
    const instance = new BestFitStripPack(stripWidth);

    afterEach(() => {
      instance.reset();
      expect(instance.packedHeight).toBe(0);
      expect(instance.packedWidth).toBe(0);
      expect(instance.stripWidth).toBe(stripWidth);
    });

    it('The value of height is greater than the width of the strip', () => {
      const rectangle = { width: 1, height: stripWidth + 3 };
      const point = instance.insert(rectangle.width, rectangle.height);
      expect(point.x).toBe(0);
      expect(point.y).toBe(0);
      expect(instance.packedWidth).toBe(rectangle.width);
      expect(instance.packedHeight).toBe(rectangle.height);
    });
  });

  describe('BestFitStripPackRotatable', () => {
    const instance = new BestFitStripPackRotatable(stripWidth);

    afterEach(() => {
      instance.reset();
      expect(instance.packedHeight).toBe(0);
      expect(instance.packedWidth).toBe(0);
      expect(instance.stripWidth).toBe(stripWidth);
    });

    it('The value of width is greater than the width of the strip >> Insert in-line', () => {
      const rectangle = { width: stripWidth + 1, height: 3 };
      const point = instance.insert(rectangle.width, rectangle.height);
      expect(point.x).toBe(0);
      expect(point.y).toBe(0);
      expect(point.rotated).toBe(true);
      expect(instance.packedWidth).toBe(rectangle.height);
      expect(instance.packedHeight).toBe(rectangle.width);
    });

    it('The value of width is greater than the width of the strip >> Insert best-fit', () => {
      const rectangles = [
        { width: stripWidth - 1, height: 1 },
        { width: stripWidth + 1, height: 3 },
      ];

      const point1 = instance.insert(rectangles[0].width, rectangles[0].height);

      expect(point1.x).toBe(0);
      expect(point1.y).toBe(0);
      expect(point1.rotated).toBe(false);

      expect(instance.packedWidth).toBe(rectangles[0].width);
      expect(instance.packedHeight).toBe(rectangles[0].height);

      const point2 = instance.insert(rectangles[1].width, rectangles[1].height);

      expect(point2.x).toBe(0);
      expect(point2.y).toBe(1);
      expect(point2.rotated).toBe(true);

      expect(instance.packedWidth).toBe(rectangles[0].width);
      expect(instance.packedHeight).toBe(
        rectangles[0].height + rectangles[1].width
      );
    });

    it('The value of height is greater than the width of the strip >> Insert in-line', () => {
      const rectangle = { width: 1, height: stripWidth + 3 };
      const point = instance.insert(rectangle.width, rectangle.height);
      expect(point.x).toBe(0);
      expect(point.y).toBe(0);
      expect(point.rotated).toBe(false);
      expect(instance.packedWidth).toBe(rectangle.width);
      expect(instance.packedHeight).toBe(rectangle.height);
    });

    it('The value of height is greater than the width of the strip >> Insert best-fit', () => {
      const rectangles = [
        { width: stripWidth - 1, height: 1 },
        { width: 3, height: stripWidth + 1 },
      ];

      const point1 = instance.insert(rectangles[0].width, rectangles[0].height);

      expect(point1.x).toBe(0);
      expect(point1.y).toBe(0);
      expect(point1.rotated).toBe(false);

      expect(instance.packedWidth).toBe(rectangles[0].width);
      expect(instance.packedHeight).toBe(rectangles[0].height);

      const point2 = instance.insert(rectangles[1].width, rectangles[1].height);

      expect(point2.x).toBe(0);
      expect(point2.y).toBe(1);
      expect(point2.rotated).toBe(false);

      expect(instance.packedWidth).toBe(rectangles[0].width);
      expect(instance.packedHeight).toBe(
        rectangles[0].height + rectangles[1].height
      );
    });
  });
});

describe('Rectangles with a greater width than height', () => {
  const stripWidth = 1000;

  describe('BestFitStripPackRotatable', () => {
    const instance = new BestFitStripPackRotatable(stripWidth);

    afterEach(() => {
      instance.reset();
      expect(instance.packedHeight).toBe(0);
      expect(instance.packedWidth).toBe(0);
      expect(instance.stripWidth).toBe(stripWidth);
    });

    it('Rotate >> Insert in-line', () => {
      const rectangles = [
        { width: stripWidth - 1, height: 3 },
        { width: stripWidth - 5, height: 1 },
      ];

      const point1 = instance.insert(rectangles[0].width, rectangles[0].height);

      expect(point1.x).toBe(0);
      expect(point1.y).toBe(0);
      expect(point1.rotated).toBe(false);

      expect(instance.packedHeight).toBe(rectangles[0].height);
      expect(instance.packedWidth).toBe(rectangles[0].width);

      const point2 = instance.insert(rectangles[1].width, rectangles[1].height);

      expect(point2.x).toBe(rectangles[0].width);
      expect(point2.y).toBe(0);
      expect(point2.rotated).toBe(true);

      expect(instance.packedHeight).toBe(rectangles[1].width);
      expect(instance.packedWidth).toBe(
        rectangles[0].width + rectangles[1].height
      );
    });
  });
});

describe('Rectangles with a greater height than width', () => {
  const stripWidth = 1000;

  describe('BestFitStripPackRotatable', () => {
    const instance = new BestFitStripPackRotatable(stripWidth);

    afterEach(() => {
      instance.reset();
      expect(instance.packedHeight).toBe(0);
      expect(instance.packedWidth).toBe(0);
      expect(instance.stripWidth).toBe(stripWidth);
    });

    it('Insert in-line', () => {
      const rectangles = [
        { width: stripWidth - 30, height: 4 },
        { width: 10, height: 45 },
      ];

      const point1 = instance.insert(rectangles[0].width, rectangles[0].height);

      expect(point1.x).toBe(0);
      expect(point1.y).toBe(0);
      expect(point1.rotated).toBe(false);

      const point2 = instance.insert(rectangles[1].width, rectangles[1].height);

      expect(point2.x).toBe(rectangles[0].width);
      expect(point2.y).toBe(0);
      expect(point2.rotated).toBe(false);

      expect(instance.packedHeight).toBe(rectangles[1].height);
      expect(instance.packedWidth).toBe(
        rectangles[0].width + rectangles[1].width
      );
    });

    it('Rotate >> Insert in-line', () => {
      const rectangles = [
        { width: stripWidth - 30, height: 4 },
        { width: 15, height: 20 },
      ];

      const point1 = instance.insert(rectangles[0].width, rectangles[0].height);

      expect(point1.x).toBe(0);
      expect(point1.y).toBe(0);
      expect(point1.rotated).toBe(false);

      const point2 = instance.insert(rectangles[1].width, rectangles[1].height);

      expect(point2.x).toBe(rectangles[0].width);
      expect(point2.y).toBe(0);
      expect(point2.rotated).toBe(true);

      expect(instance.packedHeight).toBe(rectangles[1].width);
      expect(instance.packedWidth).toBe(
        rectangles[0].width + rectangles[1].height
      );
    });
  });
});
