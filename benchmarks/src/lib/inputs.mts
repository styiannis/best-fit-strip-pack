// The rectangles every benchmark packs: integer widths and heights drawn
// uniformly from closed ranges by a seeded linear congruential generator, so
// that every process on every machine packs the same sequence. The default
// ranges, widths 5 to 84 and heights 5 to 64, are the input the documents use
// when they name no other.

export type Rectangle = [width: number, height: number];

export interface Ranges {
  seed?: number;
  wMin?: number;
  wMax?: number;
  hMin?: number;
  hMax?: number;
}

function lcg(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function rectangles(
  n: number,
  { seed = 1, wMin = 5, wMax = 84, hMin = 5, hMax = 64 }: Ranges = {}
): Rectangle[] {
  const random = lcg(seed);

  const between = (lo: number, hi: number) =>
    lo + Math.floor(random() * (hi - lo + 1));

  return Array.from({ length: n }, () => [
    between(wMin, wMax),
    between(hMin, hMax),
  ]);
}
