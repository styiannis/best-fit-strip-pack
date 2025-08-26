import { BestFitStripPack, BestFitStripPackRotatable } from '../../src';
import { isValidClassInstance } from '../tests-utils';

describe.each([
  ['BestFitStripPack', BestFitStripPack],
  ['BestFitStripPackRotatable', BestFitStripPackRotatable],
] as const)('(%s) Insert 1x1 rectangles', (instanceType, P) => {
  const width = 1;
  const height = 1;
  const length = 99;

  it('Packed rectangles in single column', () => {
    const stripWidth = 1;
    const instance = new P(stripWidth);

    for (let i = 0; i < length; i++) {
      const { x, y } = instance.insert(width, height);
      expect(x === 0 && y === i).toBe(true);
    }

    expect(
      isValidClassInstance(instance, instanceType) &&
        instance.heap !== null &&
        instance.list !== null &&
        instance.list.size === 1 &&
        instance.packedHeight === length &&
        instance.packedWidth === stripWidth &&
        instance.stripWidth === stripWidth
    ).toBe(true);

    expect(instance.heap.length).toBe(instance.list.size);
  });

  it('Packed rectangles in two columns maximum', () => {
    const perLine = 3;
    const stripWidth = perLine * width;
    const instance = new P(stripWidth);

    for (let i = 0; i < length; i++) {
      const { x, y } = instance.insert(width, height);

      const lines =
        Math.floor((i + 1) / perLine) + (0 === (i + 1) % perLine ? 0 : 1);

      expect(instance.packedHeight).toBe(lines);

      if (i < perLine) {
        expect(instance.packedWidth).toBe(i + 1);
      } else {
        expect(instance.packedWidth).toBe(stripWidth);
      }

      const divFloor = Math.floor(i / perLine);
      const divRest = i % perLine;

      expect(x).toBe(divRest);
      expect(y).toBe(divFloor);

      if (0 === divFloor || divRest + 1 === perLine) {
        expect(instance.list.size).toBe(1);
      } else {
        expect(instance.list.size).toBe(2);
        expect(instance.list.tail?.heapNode.key).toBe(lines - 1);
      }

      expect(instance.list.head?.heapNode.key).toBe(lines);

      expect(instance.heap.length).toBe(instance.list.size);
    }
  });
});
