// The time to pack a sequence of rectangles: three strip widths at a fixed
// count, where the cost follows the segment count, and three counts at a fixed
// strip width, where it does not follow the number of rectangles packed.
//
// One process per scenario. It generates its input, packs it twice to warm up
// and ROUNDS times to measure, each time into a fresh instance, and prints the
// median round. Each figure is the median of three such processes, because a
// single process occasionally lands far from its siblings.

import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { BestFitStripPack } from './lib/package.mts';
import { rectangles } from './lib/inputs.mts';
import { childArgs, inChild, median } from './lib/process.mts';

const ROUNDS = 15;

const args = childArgs();

if (args) {
  const [stripWidth, n] = args.map(Number) as [number, number];

  const input = rectangles(n);

  const round = () => {
    const start = performance.now();
    const strip = new BestFitStripPack(stripWidth);
    for (const [w, h] of input) {
      strip.insert(w, h);
    }
    return performance.now() - start;
  };

  round();
  round();

  process.stdout.write(String(median(Array.from({ length: ROUNDS }, round))));
} else {
  const file = fileURLToPath(import.meta.url);

  const ms = (stripWidth: number, n: number) =>
    median([1, 2, 3].map(() => inChild(file, [stripWidth, n])));

  const row = (label: number, time: number, n: number) =>
    console.log(
      `  ${String(label).padEnd(10)}${time.toFixed(1).padStart(8)} ms${((time / n) * 1000).toFixed(2).padStart(8)} µs each`
    );

  console.log(
    `Node ${process.version}, widths 5-84, heights 5-64, median of ${ROUNDS} rounds per process and of 3 processes`
  );

  console.log('\n20000 rectangles, by strip width');

  for (const stripWidth of [100, 1000, 10_000]) {
    row(stripWidth, ms(stripWidth, 20_000), 20_000);
  }

  console.log('\nstrip 1000, by number of rectangles');

  for (const n of [1000, 10_000, 100_000]) {
    row(n, ms(1000, n), n);
  }
}
