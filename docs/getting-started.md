# Getting started

From an empty strip to a packed sheet: how to insert rectangles, what the
coordinates mean, when the packer rotates something, and what it refuses.

**Last verified:** 2026-09-25 · v1.2.0 · Node ≥ 18.12

## Install

```bash
npm install best-fit-strip-pack
```

Two runtime dependencies come with it, both used internally and neither
visible in the API. The package ships an ES build, a CommonJS build and type
definitions, so TypeScript needs no additional configuration and JavaScript
works with either module system.

## Pack the first rectangles

A packer is created around one number, the width of the strip, and that number
does not change afterwards. Each `insert` takes a width and a height and
returns the position it chose for the bottom-left corner:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const strip = new BestFitStripPack(100);

console.log(strip.insert(40, 30)); // { x: 0, y: 0 }
console.log(strip.insert(30, 50)); // { x: 40, y: 0 }
console.log(strip.insert(30, 20)); // { x: 70, y: 0 }

console.log(strip.packedWidth, strip.packedHeight); // 100 50
```

Three rectangles, three positions along the bottom, and a strip that is now
100 wide and 50 tall. `packedWidth` is how much of the fixed width has been
reached and `packedHeight` how far the packing has grown; both are read-only
and neither decreases except through `reset()`.

The direction `y` grows in is yours to decide. The packer produces numbers
from a corner; whether that corner is the top-left of a page or the
bottom-left of a canvas is a question about your renderer, not about the
packing.

## Where the fourth rectangle goes

The bottom row is full, so the next insertions have to find space in the
profile the first three left behind:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const strip = new BestFitStripPack(100);

strip.insert(40, 30);
strip.insert(30, 50);
strip.insert(30, 20);

console.log(strip.insert(50, 25)); // { x: 0, y: 50 }
console.log(strip.insert(20, 40)); // { x: 70, y: 20 }

console.log(strip.packedWidth, strip.packedHeight); // 100 75
```

The 50×25 is wider than any gap, so it goes on top of the tallest column. The
20×40 is the interesting one: it fits in the 30-wide gap above the third
rectangle, whose surface is at 20, and the packer puts it there instead of
stacking it on top. That choice — the lowest position the rectangle fits in
rather than the next free one — is what best fit means, and
[placement-algorithm.md](placement-algorithm.md) describes how it is found.

## Keep the geometry yourself

`insert` hands you a coordinate once. The packer does not keep a list of what
it placed, so if you need the rectangles later, collect them as you go:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const placed: { w: number; h: number; x: number; y: number }[] = [];
const sheet = new BestFitStripPack(100);

for (const [w, h] of [
  [40, 30],
  [30, 50],
  [30, 20],
] as [number, number][]) {
  placed.push({ w, h, ...sheet.insert(w, h) });
}

console.log(placed);
// [
//   { w: 40, h: 30, x: 0, y: 0 },
//   { w: 30, h: 50, x: 40, y: 0 },
//   { w: 30, h: 20, x: 70, y: 0 }
// ]
```

This is also the only way to undo anything. There is no `remove`, so a layout
that changes is repacked from a list you kept, not edited in place.

## Expect the floor to be used first

One rule surprises people, and it is worth meeting deliberately. As long as a
rectangle still fits in the unused width at the right-hand end of the strip, it
goes there, at `y = 0`, no matter what has already been packed above:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const floor = new BestFitStripPack(100);

console.log(floor.insert(60, 10)); // { x: 0, y: 0 }
console.log(floor.insert(50, 4)); // { x: 0, y: 10 }
console.log(floor.insert(30, 3)); // { x: 60, y: 0 }

console.log(floor.packedWidth, floor.packedHeight); // 90 14
```

The second rectangle does not fit in the 40 units left on the floor, so it is
placed by best fit and lands on top of the first. The third fits in those 40
units, so it goes back down to the floor at `x = 60`. The floor is at `y = 0`,
lower than any position the search could find, so the rule never costs height.

## Let the packer choose the orientation

`BestFitStripPackRotatable` has the same API and one extra field in its
result. It tries both orientations of every rectangle and tells you which one
it used:

```typescript
import { BestFitStripPackRotatable } from 'best-fit-strip-pack';

const strip = new BestFitStripPackRotatable(100);

const at = strip.insert(20, 70);

console.log(at); // { x: 0, y: 0, rotated: true }
console.log(at.rotated ? [70, 20] : [20, 70]); // [ 70, 20 ]
```

When `rotated` is `true` the placed box measures `height × width`, and the
rectangle you drew as 20 wide occupies 70. Swapping the dimensions is your
job; the packer reports the decision and nothing else.

## Pack a second sheet

`reset()` empties the strip and keeps its width, so one instance can pack a new
sequence:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const sheet = new BestFitStripPack(100);

sheet.insert(40, 30);
sheet.insert(30, 50);
console.log(sheet.packedWidth, sheet.packedHeight); // 70 50

sheet.reset();
console.log(sheet.packedWidth, sheet.packedHeight, sheet.stripWidth); // 0 0 100
console.log(sheet.insert(40, 30)); // { x: 0, y: 0 }
```

A different strip width needs a different instance; `stripWidth` is a getter
with no setter behind it.

## What it refuses

Dimensions are validated on every call, and the failures are exceptions rather
than return values:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const s = new BestFitStripPack(100);

try {
  s.insert(120, 10);
} catch (e) {
  console.log((e as RangeError).message);
  // Width (120) should not exceed strip width (100).
}

try {
  s.insert(-5, 10);
} catch (e) {
  console.log((e as RangeError).message);
  // Both dimensions (-5x10) should be greater than 0.
}
```

Height is not checked against the strip width, because the strip has no
maximum height. A rectangle taller than the strip is wide is packed without
complaint:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const tall = new BestFitStripPack(100);

console.log(tall.insert(10, 4000), tall.packedHeight); // { x: 0, y: 0 } 4000
```

The full list of conditions, with the exact message each one produces, is in
[faq.md](faq.md).

## Sort the input when you can

The packer places each rectangle when it arrives and never reconsiders, so the
order of the input shapes the result. That order is something you control
from outside:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const boxes: [number, number][] = [
  [40, 30],
  [30, 50],
  [30, 20],
  [50, 25],
  [20, 40],
];

const sorted = new BestFitStripPack(100);
for (const [w, h] of [...boxes].sort((a, b) => b[1] - a[1])) {
  sorted.insert(w, h);
}

console.log(sorted.packedHeight); // 70
```

The same five rectangles reach 75 in the order they are written and 70 sorted
by decreasing height. Over 10,000 rectangles 5 to 84 wide and 5 to 64 tall, in
a strip 1,000 wide, the same sort took the fraction of the packed area the
rectangles cover from 90.4% to 97.1%. Sort when you have every rectangle in
advance; when they arrive one at a time, you cannot, and packing them as they
come is what this library is for.

## What this page did not cover

[faq.md](faq.md) answers what the packer does with a rectangle it cannot fit
neatly, why it never rotates without being asked, and how it behaves with
fractional dimensions. [placement-algorithm.md](placement-algorithm.md)
explains how a position is chosen and what it costs to find.
[architecture-and-api.md](architecture-and-api.md) covers the two layers, the
data structures underneath and what a packer retains in memory.
