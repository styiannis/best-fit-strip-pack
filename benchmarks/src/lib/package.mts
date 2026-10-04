// The package under test, loaded from its CommonJS build the way a `require`
// consumer loads it. Every script goes through here, so that all of them
// measure the same build.

import { createRequire } from 'node:module';
import type * as Package from '../../../src/index.ts';
import type { Rectangle } from './inputs.mts';

const require = createRequire(import.meta.url);

export const { BestFitStripPack, BestFitStripPackRotatable } =
  require('best-fit-strip-pack') as typeof Package;

// The classes keep the skyline in a private field, so the number of segments
// is read through the core layer they delegate to, from the same build.
const core = require('../../../dist/cjs/core/best-fit-strip-pack.cjs');

// The number of segments after each insertion.
export function segmentCounts(stripWidth: number, input: Rectangle[]) {
  const instance = core.create(stripWidth);

  return input.map(([w, h]) => {
    core.insert(instance, w, h);
    return instance.list.size as number;
  });
}
