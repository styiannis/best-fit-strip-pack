# Best-Fit Strip Pack

[![NPM Version](https://img.shields.io/npm/v/best-fit-strip-pack)](https://www.npmjs.com/package/best-fit-strip-pack)
[![Coverage Status](https://img.shields.io/coverallsCoverage/github/styiannis/best-fit-strip-pack)](https://coveralls.io/github/styiannis/best-fit-strip-pack?branch=main)

Rectangles of arbitrary sizes packed into a strip of **fixed width and unbounded
height**, one at a time, each placed as low as it fits. It is the **best-fit
heuristic** for strip packing in its **online** form: each rectangle is placed
as it arrives and never moved. None is kept, because the packer returns a
coordinate and remembers only the top edge of what it has filled. A rotatable
variant chooses an orientation for every rectangle and returns which one it
used.

## Install

```bash
npm install best-fit-strip-pack
```

`yarn add` and `pnpm add` work the same way. The package requires Node 18.12 or
later, and ships an ES build and a CommonJS build with type definitions for
each. Its two runtime dependencies are
[abstract-linked-lists](https://github.com/styiannis/abstract-linked-lists)
and
[addressable-binary-heaps](https://github.com/styiannis/addressable-binary-heaps),
imported through three subpaths, so that a bundler takes only the five modules
behind them.

## Each rectangle is placed when it arrives

`insert` takes a width and a height and returns the coordinates it chose for
the bottom-left corner. There is no batch call and no second pass:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const strip = new BestFitStripPack(1000);

console.log(strip.insert(400, 300)); // { x: 0, y: 0 }
console.log(strip.insert(300, 500)); // { x: 400, y: 0 }
console.log(strip.insert(300, 200)); // { x: 700, y: 0 }
console.log(strip.insert(500, 250)); // { x: 0, y: 500 }
console.log(strip.insert(200, 400)); // { x: 700, y: 200 }

console.log(strip.packedWidth, strip.packedHeight); // 1000 750
```

The first three fill the floor of the strip from the left. The fourth is too
wide for any gap and goes above everything at `y = 500`. The fifth is the one
that shows the heuristic working: it drops into the 300-wide gap at `x = 700`,
whose surface is at `y = 200`, rather than onto the top of the packing.

Coordinates are measured from the corner where the first rectangle lands, with
`x` across the fixed width and `y` along the growing direction. The caller
decides which corner of a screen or a canvas that is. The packer produces
numbers and nothing else.

## Rotation, when the caller permits it

`BestFitStripPackRotatable` chooses an orientation for every rectangle and
reports which one it used. While the floor has room, it lays the rectangle on
its longer side, or stands it up when only that fits. Above the floor, it
evaluates each orientation that fits the strip and keeps the one whose top ends
lower. `rotated: true` means the placed rectangle measures `height × width`:

```typescript
import { BestFitStripPackRotatable } from 'best-fit-strip-pack';

const strip = new BestFitStripPackRotatable(1000);

for (const [w, h] of [
  [400, 300],
  [300, 500],
  [300, 200],
  [500, 250],
  [200, 400],
] as [number, number][]) {
  const at = strip.insert(w, h);
  console.log(w, h, at, at.rotated ? [h, w] : [w, h]);
}
// 400 300 { x: 0, y: 0, rotated: false } [ 400, 300 ]
// 300 500 { x: 400, y: 0, rotated: true } [ 500, 300 ]
// 300 200 { x: 0, y: 300, rotated: false } [ 300, 200 ]
// 500 250 { x: 300, y: 300, rotated: false } [ 500, 250 ]
// 200 400 { x: 800, y: 300, rotated: false } [ 200, 400 ]

console.log(strip.packedHeight); // 700
```

The same five rectangles reach 750 without rotation and 700 with it. That margin
is a property of these five and not a guarantee: rotation helps most when the
strip is narrow relative to the rectangles. On rectangles taller than they are
wide it can finish _higher_ than the plain class, which could be a better choice
for such input.

## What it stores, and what an insertion costs

The packer does not keep the rectangles. It keeps the **skyline**: the top edge
of the area filled so far, traced from left to right across the strip. The
skyline is flat in stretches and steps up or down between them, and each flat
stretch is a **segment**. An insertion searches those segments, so both the
memory held and the time an insertion takes depend on how many segments there
are, and not on how many rectangles have been packed.

The strip bounds that number. In a strip 1000 wide where every dimension is a
multiple of 100, a segment can only start at a multiple of 100, so there are
never more than ten, whether ten rectangles have been packed or a million.

## API

Two classes with the same shape. `BestFitStripPackRotatable` differs only in
what `insert` accepts and returns.

| Member                       | Cost (typical) | Cost (worst) | Notes                                                       |
| ---------------------------- | -------------- | ------------ | ----------------------------------------------------------- |
| `new BestFitStripPack(w)`    | `O(1)`         | `O(1)`       | `w` is fixed for the life of the instance                   |
| `packedWidth` `packedHeight` | `O(1)`         | `O(1)`       | Both only grow, until `reset()`                             |
| `stripWidth`                 | `O(1)`         | `O(1)`       | The `w` given to the constructor                            |
| `insert(width, height)`      | `O(m)`         | `O(m²)`      | `m` = skyline segments; `O(log m)` while the floor has room |
| `reset()`                    | `O(m)`         | `O(m)`       | Empties the strip, keeping the strip width                  |

`insert` returns `{ x, y }`, or `{ x, y, rotated }` from the rotatable class. It
throws `TypeError` on a non-numeric dimension, and `RangeError` on one that is
not positive or does not fit the strip (from the rotatable class, when neither
dimension fits).

## What the approach rules out

The package implements, in its online form, the best-fit heuristic for strip
packing described by Shinji Imahori and Mutsunori Yagiura in
[_The best-fit heuristic for the rectangular strip packing problem: an
efficient implementation and the worst-case approximation ratio_](https://doi.org/10.1016/j.cor.2009.05.008),
Computers & Operations Research, 2010. Each of the four terms in that
sentence rules a class of problem out:

| Term          | What it rules out                                                                                                                                   | Use instead                                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Strip packing | A maximum height. The strip is unbounded, and no rectangle is rejected for making the packing too tall.                                             | A two-dimensional bin-packing algorithm, which opens a new bin when a rectangle does not fit the open ones           |
| Heuristic     | An optimal packing. The problem is NP-hard, so a heuristic packs fast and may leave empty space that an optimal packing would fill.                 | An exact method such as branch-and-bound or an integer-programming model, on inputs small enough for one             |
| Online        | Choosing the order. Rectangles are placed as they arrive and never reconsidered, so input known in advance is packed no better than if it were not. | An offline packer, or this one over the input sorted by decreasing height, which covers noticeably more of the strip |
| Best fit      | Filling space below the top. Only the skyline is kept, so the space under a rectangle that bridges a lower segment is never offered again.          | A maximal-rectangles packer, which tracks every free rectangle rather than a skyline                                 |

One more limit is a choice of this implementation rather than of the
approach. A placement is final: the packer records none and has no `remove`,
and the strip width is fixed for the life of the instance. A layout that must
change is kept by the caller as a list of placements and repacked after
`reset()`.

## Documentation

- [The generated API reference](https://styiannis.github.io/best-fit-strip-pack/) —
  every signature and every type.
- [Open an issue](https://github.com/styiannis/best-fit-strip-pack/issues)
  for a question or a bug report.

Released under the
[MIT License](https://github.com/styiannis/best-fit-strip-pack/blob/main/LICENSE).
