# Best-Fit Strip Pack

[![NPM Version](https://img.shields.io/npm/v/best-fit-strip-pack)](https://www.npmjs.com/package/best-fit-strip-pack)
[![Coverage Status](https://img.shields.io/coverallsCoverage/github/styiannis/best-fit-strip-pack)](https://coveralls.io/github/styiannis/best-fit-strip-pack?branch=main)

Rectangles of arbitrary sizes packed into a strip of **fixed width and
unbounded height**, one at a time, each placed where it adds the least height.
Nothing is moved after it is placed, and nothing is kept: the packer returns a
coordinate and remembers only the profile of what it has filled. A second
class may also turn each rectangle a quarter turn, and reports when it did.

## Install

```bash
npm install best-fit-strip-pack
```

`yarn add` and `pnpm add` work the same way. The package requires Node 18.12 or
later, and ships an ES build and a CommonJS build with type definitions for
each. Its two runtime dependencies are
[abstract-linked-lists](https://www.npmjs.com/package/abstract-linked-lists)
and
[addressable-binary-heaps](https://www.npmjs.com/package/addressable-binary-heaps),
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
`x` across the fixed width and `y` along the growing direction. Which corner of
a screen or a canvas that is remains the caller's choice; the packer produces
numbers and nothing else.

## Rotation, when the caller permits it

`BestFitStripPackRotatable` evaluates both orientations of every rectangle and
reports which one it used. A `rotated` result means the placed box measures
`height × width`:

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

The same five rectangles reach 750 without rotation and 700 with it. That
margin is a property of these five and not a guarantee: rotation helps most
when the strip is narrow relative to the rectangles, and on rectangles taller
than they are wide it can finish _higher_ than the plain class.
[The placement write-up](https://github.com/styiannis/best-fit-strip-pack/blob/main/docs/placement-algorithm.md) measures both.

## What it holds while it packs

The packer stores the **skyline** — the horizontal profile of what has been
filled — and not the rectangles. What it retains grows with the number of
segments in that profile, which the width of the strip bounds, and not with the
number of rectangles packed.

The cost of an insertion follows the same quantity. It is set by the number of
segments in the skyline, which depends on the strip width relative to the
rectangles, not on how many are already packed: a wider strip makes each
insertion dearer, and a longer run of insertions does not.
[The placement write-up](https://github.com/styiannis/best-fit-strip-pack/blob/main/docs/placement-algorithm.md#what-the-search-costs)
measures the cost, and
[the architecture write-up](https://github.com/styiannis/best-fit-strip-pack/blob/main/docs/architecture-and-api.md#what-it-costs-in-memory)
the memory.

## API

Two classes with the same shape. `BestFitStripPackRotatable` differs only in
what `insert` accepts and returns.

| Member                       | Cost   | Notes                                             |
| ---------------------------- | ------ | ------------------------------------------------- |
| `new BestFitStripPack(w)`    | `O(1)` | `w` is fixed for the life of the instance         |
| `insert(width, height)`      | `O(m)` | `m` = skyline segments; `O(m²)` in the worst case |
| `packedWidth` `packedHeight` | `O(1)` | Both only grow, until `reset()`                   |
| `stripWidth`                 | `O(1)` | The `w` given to the constructor                  |
| `reset()`                    | `O(m)` | Empties the strip, keeping the width              |

`insert` returns `{ x, y }`, or `{ x, y, rotated }` from the rotatable class,
and throws `TypeError` on a non-numeric dimension and `RangeError` on one that
is not positive or does not fit the strip.

## When not to use it

The packer places each rectangle once and keeps nothing but the profile. What
follows are the cases where that is the wrong trade.

| If this describes the problem                     | Reach for                                                                                                                               |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| A placed rectangle must later be removed or moved | a repack from a list you keep — there is no `remove` and no handle to a placement, and the only way back is `reset()`                   |
| The layout must be read back from the packer      | that same list — each coordinate is returned once and not recorded                                                                      |
| Every rectangle is known before packing starts    | this packer over the input sorted by decreasing height, which it never does itself and which covers noticeably more of the strip        |
| The packing must be optimal                       | an exact method, on inputs small enough for one — strip packing is NP-hard, and this is a heuristic that leaves part of the strip empty |
| The strip has a maximum height                    | a bin-packing algorithm — the strip is unbounded, and a rectangle is never rejected for being too tall                                  |

## Documentation

- [Guides, the placement rules, the FAQ and the architecture write-up](https://github.com/styiannis/best-fit-strip-pack/tree/main/docs) —
  packing the first rectangles, where a rectangle goes and how good the result
  is, the behaviour that surprises people, and how the library is built.
- [The generated API reference](https://styiannis.github.io/best-fit-strip-pack/) —
  every signature and every type.
- [Open an issue](https://github.com/styiannis/best-fit-strip-pack/issues)
  for a question or a bug report.

The heuristic is the one described in Shinji Imahori and Mutsunori Yagiura,
_The best-fit heuristic for the rectangular strip packing problem: an
efficient implementation and the worst-case approximation ratio_,
[doi:10.1016/j.cor.2009.05.008](https://doi.org/10.1016/j.cor.2009.05.008).

Released under the
[MIT License](https://github.com/styiannis/best-fit-strip-pack/blob/main/LICENSE).
