import { BestFitStripPack, BestFitStripPackRotatable } from '../../src';

describe('Insert rectangles with dimensions that exceed the strip width', () => {
  const stripWidth = 1000;

  describe('BestFitStripPack', () => {
    it('Height value is greater than strip width', () => {
      const instance = new BestFitStripPack(stripWidth);
      const rectangle = { width: 1, height: stripWidth + 3 };
      const point = instance.insert(rectangle.width, rectangle.height);

      expect(point.x).toBe(0);
      expect(point.y).toBe(0);

      expect(instance.packedWidth).toBe(rectangle.width);
      expect(instance.packedHeight).toBe(rectangle.height);
      expect(instance.stripWidth).toBe(stripWidth);
    });
  });

  describe('BestFitStripPackRotatable', () => {
    it('Width value is greater than strip width >> Insert in-line', () => {
      const instance = new BestFitStripPackRotatable(stripWidth);
      const rectangle = { width: stripWidth + 1, height: 3 };
      const point = instance.insert(rectangle.width, rectangle.height);

      expect(point.x).toBe(0);
      expect(point.y).toBe(0);
      expect(point.rotated).toBe(true);

      expect(instance.packedWidth).toBe(rectangle.height);
      expect(instance.packedHeight).toBe(rectangle.width);
      expect(instance.stripWidth).toBe(stripWidth);
    });

    it('Width value is greater than strip width >> Insert best-fit', () => {
      const instance = new BestFitStripPackRotatable(stripWidth);
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
      expect(instance.stripWidth).toBe(stripWidth);

      const point2 = instance.insert(rectangles[1].width, rectangles[1].height);

      expect(point2.x).toBe(0);
      expect(point2.y).toBe(1);
      expect(point2.rotated).toBe(true);

      expect(instance.packedWidth).toBe(rectangles[0].width);
      expect(instance.packedHeight).toBe(
        rectangles[0].height + rectangles[1].width
      );
      expect(instance.stripWidth).toBe(stripWidth);
    });

    it('Height value is greater than strip width >> Insert in-line', () => {
      const instance = new BestFitStripPackRotatable(stripWidth);
      const rectangle = { width: 1, height: stripWidth + 3 };
      const point = instance.insert(rectangle.width, rectangle.height);

      expect(point.x).toBe(0);
      expect(point.y).toBe(0);
      expect(point.rotated).toBe(false);

      expect(instance.packedWidth).toBe(rectangle.width);
      expect(instance.packedHeight).toBe(rectangle.height);
      expect(instance.stripWidth).toBe(stripWidth);
    });

    it('Height value is greater than strip width >> Insert best-fit', () => {
      const instance = new BestFitStripPackRotatable(stripWidth);
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
      expect(instance.stripWidth).toBe(stripWidth);

      const point2 = instance.insert(rectangles[1].width, rectangles[1].height);

      expect(point2.x).toBe(0);
      expect(point2.y).toBe(1);
      expect(point2.rotated).toBe(false);

      expect(instance.packedWidth).toBe(rectangles[0].width);
      expect(instance.packedHeight).toBe(
        rectangles[0].height + rectangles[1].height
      );
      expect(instance.stripWidth).toBe(stripWidth);
    });

    it('Rotate >> Insert in-line', () => {
      const instance = new BestFitStripPackRotatable(stripWidth);
      const rectangle = { width: stripWidth - 1, height: 1 };

      const point1 = instance.insert(rectangle.width, rectangle.height);

      expect(point1.x).toBe(0);
      expect(point1.y).toBe(0);
      expect(point1.rotated).toBe(false);

      expect(instance.packedHeight).toBe(rectangle.height);
      expect(instance.packedWidth).toBe(rectangle.width);
      expect(instance.stripWidth).toBe(stripWidth);

      const point2 = instance.insert(rectangle.width, rectangle.height);

      expect(point2.x).toBe(stripWidth - 1);
      expect(point2.y).toBe(0);
      expect(point2.rotated).toBe(true);

      expect(instance.packedHeight).toBe(rectangle.width);
      expect(instance.packedWidth).toBe(stripWidth);
      expect(instance.stripWidth).toBe(stripWidth);
    });
  });
});
