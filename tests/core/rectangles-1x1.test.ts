import { bestFitStripPack, bestFitStripPackRotatable } from '../../src/core';
import { isValidObjectInstance } from '../tests-utils';

describe.each([
  ['bestFitStripPack', bestFitStripPack],
  ['bestFitStripPackRotatable', bestFitStripPackRotatable],
] as const)('(%s) Insert 1x1 rectangles', (_, bfsp) => {
  const width = 1;
  const height = 1;
  const length = 100;

  it('Packed rectangles in single column', () => {
    const stripWidth = 1;
    const instance = bfsp.create(stripWidth);

    for (let i = 0; i < length; i++) {
      const { x, y } = bfsp.insert(instance, width, height);
      expect(x === 0 && y === i).toBe(true);
    }

    expect(
      isValidObjectInstance(instance, 'best-fit-strip-pack') &&
        instance.heap !== null &&
        instance.list !== null &&
        instance.list.size === 1 &&
        instance.packedHeight === length &&
        instance.packedWidth === stripWidth &&
        instance.stripWidth === stripWidth
    ).toBe(true);

    expect(instance.heap.length).toBe(instance.list.size);
  });

  it('Packed rectangles in two columns at most', () => {
    const perLine = 3;
    const stripWidth = perLine * width;
    const instance = bfsp.create(stripWidth);

    for (let i = 0; i < length; i++) {
      const { x, y } = bfsp.insert(instance, width, height);

      const lines =
        Math.floor((i + 1) / perLine) + (0 === (i + 1) % perLine ? 0 : 1);

      expect(instance.packedHeight).toBe(lines);
      expect(instance.packedWidth).toBe(i < perLine ? i + 1 : stripWidth);

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
