// What a packer retains, and what the placements it returns would retain if
// the caller kept them.
//
// One packer is smaller than the noise of a single reading, so a reading holds
// PACKERS instances at once, all given the same input, and divides the
// difference by that count. Each reading runs in a `--expose-gc` process of its
// own, which generates its input, collects until the memory in use stops
// moving, takes a baseline, builds what it measures, collects again and
// prints the difference. The input exists before the baseline and is kept
// alive through both readings, so it is outside every figure.
//
// Besides the random input, it weighs the input that reaches the ceiling on
// the segment count: one rectangle per unit of the strip's width, each one unit
// wide and alternately 1 and 2 high, so that no two neighbours merge.

import { fileURLToPath } from 'node:url';
import { BestFitStripPack, segmentCounts } from './lib/package.mts';
import { rectangles, type Rectangle } from './lib/inputs.mts';
import { childArgs, inChild } from './lib/process.mts';

const STRIP = 1000;
const PACKERS = 500;

// The input that leaves one segment per unit of width.
function ceiling() {
  return Array.from({ length: STRIP }, (_, i): Rectangle => [1, (i % 2) + 1]);
}

function pack(input: Rectangle[]) {
  const strip = new BestFitStripPack(STRIP);

  for (const [w, h] of input) {
    strip.insert(w, h);
  }

  return strip;
}

// Each returns what it built, so that it stays reachable through the reading.
const SCENARIOS: Record<string, (input: Rectangle[]) => unknown> = {
  packers: (input) => Array.from({ length: PACKERS }, () => pack(input)),
  // One packer and every placement it returned. Subtracting the packer alone
  // cancels what the insertions leave in the process, whatever is kept.
  placements: (input) => {
    const strip = new BestFitStripPack(STRIP);
    return [strip, input.map(([w, h]) => strip.insert(w, h))];
  },
  packer: pack,
};

function settle() {
  const gc = globalThis.gc as () => void;

  let previous = -1;
  let current = process.memoryUsage().heapUsed;
  for (let i = 0; i < 50 && current !== previous; i += 1) {
    gc();
    previous = current;
    current = process.memoryUsage().heapUsed;
  }

  return current;
}

const args = childArgs();

if (args) {
  const [scenario, n] = args as [string, string];

  const input = n === 'ceiling' ? ceiling() : rectangles(Number(n));

  const before = settle();
  const held = (SCENARIOS[scenario] as (input: Rectangle[]) => unknown)(input);
  const after = settle();
  process.stdout.write(String(after - before));

  void held;
  void input;
} else {
  const file = fileURLToPath(import.meta.url);

  const bytes = (scenario: string, n: number | string) =>
    inChild(file, [scenario, n], ['--expose-gc']);

  console.log(
    `Node ${process.version}, strip ${STRIP}, widths 5-84, heights 5-64`
  );
  console.log(`\nretained per packer, ${PACKERS} packers held at once`);
  console.log(
    `  ${'rectangles'.padEnd(12)}${'KB'.padStart(6)}${'segments'.padStart(10)}`
  );

  for (const n of [0, 1000, 100_000]) {
    const kb = bytes('packers', n) / PACKERS / 1e3;
    const segments = n === 0 ? 0 : segmentCounts(STRIP, rectangles(n)).at(-1);
    console.log(
      `  ${String(n).padEnd(12)}${kb.toFixed(1).padStart(6)}${String(segments).padStart(10)}`
    );
  }

  {
    const kb = bytes('packers', 'ceiling') / PACKERS / 1e3;
    const segments = segmentCounts(STRIP, ceiling()).at(-1);
    console.log(
      `  ${'ceiling'.padEnd(12)}${kb.toFixed(1).padStart(6)}${String(segments).padStart(10)}`
    );
  }

  const N = 100_000;
  const mb = (bytes('placements', N) - bytes('packer', N)) / 1e6;

  console.log(`\n${N} returned placements, kept: ${mb.toFixed(1)} MB`);
}
