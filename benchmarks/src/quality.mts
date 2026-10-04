// The figures that are outputs rather than measurements: occupancy, the effect
// of rotation, and the number of segments in the skyline. Each is a
// deterministic function of the input, so it reproduces to the last digit on
// any machine and needs no isolation or repetition.
//
// Occupancy is the area of the rectangles divided by the area of the strip up
// to `packedHeight`. Equivalently, it is the lowest height the rectangles could
// reach, their area divided by the strip width, as a share of the height
// reached.

import {
  BestFitStripPack,
  BestFitStripPackRotatable,
  segmentCounts,
} from './lib/package.mts';
import { rectangles, type Rectangle, type Ranges } from './lib/inputs.mts';

type Packer = typeof BestFitStripPack | typeof BestFitStripPackRotatable;

function packedHeight(Class: Packer, stripWidth: number, input: Rectangle[]) {
  const strip = new Class(stripWidth);

  for (const [w, h] of input) {
    strip.insert(w, h);
  }

  return strip.packedHeight;
}

// A shelf packer: rectangles go left to right along the current shelf, and one
// that does not fit starts a new shelf on top of the tallest rectangle in the
// current one. Nothing below the current shelf is looked at again.
function shelfHeight(stripWidth: number, input: Rectangle[]) {
  let shelfY = 0;
  let shelfX = 0;
  let shelfHeight = 0;

  for (const [w, h] of input) {
    if (shelfX + w > stripWidth) {
      shelfY += shelfHeight;
      shelfX = 0;
      shelfHeight = 0;
    }
    shelfX += w;
    shelfHeight = Math.max(shelfHeight, h);
  }

  return shelfY + shelfHeight;
}

function occupancyOf(stripWidth: number, input: Rectangle[], height: number) {
  return input.reduce((sum, [w, h]) => sum + w * h, 0) / stripWidth / height;
}

function meanAndMax(counts: number[]) {
  return [
    counts.reduce((sum, c) => sum + c, 0) / counts.length,
    Math.max(...counts),
  ] as const;
}

function occupancy() {
  const STRIP = 1000;
  const N = 10_000;

  const inputs = [84, 304].map((wMax) => rectangles(N, { wMax }));

  const byHeight = (input: Rectangle[]) =>
    [...input].sort((a, b) => b[1] - a[1]);

  const rows: [string, (input: Rectangle[]) => number][] = [
    ['arrival order', (i) => packedHeight(BestFitStripPack, STRIP, i)],
    [
      'arrival order, rotatable',
      (i) => packedHeight(BestFitStripPackRotatable, STRIP, i),
    ],
    [
      'sorted by height first',
      (i) => packedHeight(BestFitStripPack, STRIP, byHeight(i)),
    ],
    ['row by row, no best fit', (i) => shelfHeight(STRIP, i)],
  ];

  console.log(`occupancy, ${N} rectangles, strip ${STRIP}, heights 5-64`);
  console.log(
    `  ${''.padEnd(24)}${'widths 5-84'.padStart(14)}${'widths 5-304'.padStart(14)}`
  );

  for (const [name, height] of rows) {
    const cells = inputs.map((input) =>
      `${(occupancyOf(STRIP, input, height(input)) * 100).toFixed(1)}%`.padStart(
        14
      )
    );

    console.log(`  ${name.padEnd(24)}${cells.join('')}`);
  }
}

// The sign of the difference depends on the input, hence four of them.
function rotation() {
  const N = 10_000;

  const INPUTS: [string, number, Ranges][] = [
    ['widths 5-84, heights 5-64', 1000, {}],
    ['widths 5-304, heights 5-64', 1000, { wMax: 304 }],
    ['widths 5-84, heights 5-64', 100, {}],
    [
      'widths 20-40, heights 60-90',
      1000,
      { wMin: 20, wMax: 40, hMin: 60, hMax: 90 },
    ],
  ];

  console.log(`\nrotation, ${N} rectangles, height reached`);
  console.log(
    `  ${'input'.padEnd(30)}${'strip'.padStart(6)}${'plain'.padStart(9)}${'rotatable'.padStart(11)}${'difference'.padStart(12)}`
  );

  for (const [name, stripWidth, ranges] of INPUTS) {
    const input = rectangles(N, ranges);
    const plain = packedHeight(BestFitStripPack, stripWidth, input);
    const rotated = packedHeight(BestFitStripPackRotatable, stripWidth, input);
    const d = ((rotated - plain) / plain) * 100;

    console.log(
      `  ${name.padEnd(30)}${String(stripWidth).padStart(6)}${String(plain).padStart(9)}${String(rotated).padStart(11)}${`${d > 0 ? '+' : ''}${d.toFixed(1)}%`.padStart(12)}`
    );
  }
}

function segments() {
  const N = 20_000;
  const input = rectangles(N);

  console.log(
    `\nskyline segments, ${N} rectangles, sampled after every insertion`
  );
  console.log(
    `  ${'strip'.padEnd(8)}${'mean'.padStart(8)}${'maximum'.padStart(10)}`
  );

  for (const stripWidth of [100, 1000, 10_000]) {
    const [mean, max] = meanAndMax(segmentCounts(stripWidth, input));
    console.log(
      `  ${String(stripWidth).padEnd(8)}${mean.toFixed(1).padStart(8)}${String(max).padStart(10)}`
    );
  }
}

// How much of the above belongs to the one order the documents use, seed 1:
// the same ranges drawn in ten other orders.
function orders() {
  const run = (seed: number) => ({
    occupancy: [84, 304].map((wMax) => {
      const input = rectangles(10_000, { seed, wMax });
      return occupancyOf(
        1000,
        input,
        packedHeight(BestFitStripPack, 1000, input)
      );
    }),
    counts: [100, 1000, 10_000].map((stripWidth) =>
      meanAndMax(segmentCounts(stripWidth, rectangles(20_000, { seed })))
    ),
  });

  const base = run(1);

  let occupancy = 0;
  let mean = 0;
  let max = 0;
  for (let seed = 2; seed <= 11; seed += 1) {
    const other = run(seed);

    other.occupancy.forEach((o, k) => {
      occupancy = Math.max(
        occupancy,
        Math.abs(o - (base.occupancy[k] as number)) * 100
      );
    });

    other.counts.forEach(([m, x], k) => {
      const [baseMean, baseMax] = base.counts[k] as readonly [number, number];
      mean = Math.max(mean, Math.abs(m / baseMean - 1) * 100);
      max = Math.max(max, Math.abs(x / baseMax - 1) * 100);
    });
  }

  console.log('\nseeds 2-11 against seed 1, largest difference');
  console.log(`  occupancy              ${occupancy.toFixed(2)} points`);
  console.log(`  mean segment count     ${mean.toFixed(1)}%`);
  console.log(`  maximum segment count  ${max.toFixed(1)}%`);
}

occupancy();
rotation();
segments();
orders();
