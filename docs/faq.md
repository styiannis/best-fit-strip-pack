# FAQ

Behaviours that surprise people, every error the library throws, and the
integration questions the package shape raises.

**Last verified:** 2026-10-05 · v1.3.0

## Behaviour

### A rectangle went to the bottom of a strip that is already tall

Because the bottom still had room. Before searching the profile at all, `insert`
checks whether the rectangle fits in the width that has never been used, and
places it there at `y = 0` if it does:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const strip = new BestFitStripPack(100);

console.log(strip.insert(60, 10)); // { x: 0, y: 0 }
console.log(strip.insert(50, 4)); // { x: 0, y: 10 }
console.log(strip.insert(30, 3)); // { x: 60, y: 0 }
```

The 50×4 did not fit in the 40 units left on the floor and was placed by best
fit, on top of the first rectangle. The 30×3 did fit, so it went back down. The
rule applies for the life of the packer, not only to the first few insertions.

### The space under a rectangle was never used again

The packer no longer knows it is there. A rectangle that spans a lower segment
is placed at the height of the tallest segment beneath it, and the skyline then
records only its top. The space between the lower segment and the rectangle's
underside is not part of the profile, so no later search can offer it:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const strip = new BestFitStripPack(100);

console.log(strip.insert(60, 50)); // { x: 0, y: 0 }
console.log(strip.insert(40, 10)); // { x: 60, y: 0 }
console.log(strip.insert(100, 10)); // { x: 0, y: 50 }
console.log(strip.insert(40, 30)); // { x: 0, y: 60 }

console.log(strip.packedHeight); // 90
```

The 100×10 spans the 40-wide segment at height 10 and closes a 40×40 space at
`(60, 10)`. The 40×30 would fit there and goes on top instead. Keeping that
space would mean tracking every free rectangle rather than a skyline, which is
what a maximal-rectangles packer does.

### Can I remove a rectangle, or move one?

No. The API is `insert`, `reset` and three getters. There is no handle to a
placement and no `remove`. The packer stores the profile of what is filled, not
the rectangles that filled it, and undoing one rectangle would require knowing
what the profile looked like before it. Storing only the profile is a choice of
this implementation, not of the best-fit heuristic. A layout that changes is
repacked from a list you kept yourself.

### Does the packer remember what it placed?

No. Each coordinate is returned once and not retained. `packedWidth` and
`packedHeight` are the only things you can read back, and they describe the
bounding box rather than its contents.

### Can I change the strip width?

No. `stripWidth` is a getter over a value fixed by the constructor, and
`reset()` deliberately keeps it. A different width is a different instance.

### Is `packedWidth` the same as the strip width?

Only once the packing has reached the right-hand edge. Until then it is how far
the used region extends, and it can grow during a best-fit placement: if the
lowest span ends at the right-hand end of the used width and the strip has
untouched width beyond it, the rectangle takes some of that width instead of
going higher.

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const strip = new BestFitStripPack(100);

console.log(strip.insert(65, 20)); // { x: 0, y: 0 }
console.log(strip.insert(25, 5)); // { x: 65, y: 0 }
console.log(strip.packedWidth, strip.packedHeight); // 90 20

console.log(strip.insert(30, 10)); // { x: 65, y: 5 }
console.log(strip.packedWidth, strip.packedHeight); // 95 20

console.log(strip.insert(5, 30)); // { x: 95, y: 0 }
console.log(strip.packedWidth, strip.packedHeight); // 100 30
```

The 30×10 is wider than the 25-wide segment at height 5, but that segment ends
where the used width ends. The rectangle therefore extends 5 units into
untouched width rather than going on top of the 65×20: `packedWidth` grows and
`packedHeight` does not. The 5×30 fits in the last 5 units of the floor, so it
goes to `y = 0`, and only then does `packedWidth` equal the strip width. After
that, only `reset()` changes it.

### Do fractional dimensions work?

Yes. The packer only adds, subtracts and compares the numbers it is given, and
nothing rounds, truncates or requires integers. How exact the positions are
therefore depends on those numbers and on JavaScript's number type, not on the
algorithm. Decimal fractions carry the usual binary rounding error, accumulated
across insertions:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const unit = new BestFitStripPack(1);

console.log(unit.insert(0.1, 1)); // { x: 0, y: 0 }
console.log(unit.insert(0.2, 1)); // { x: 0.1, y: 0 }
console.log(unit.packedWidth); // 0.30000000000000004
```

The choice of units is the caller's. Dimensions expressed in a unit that makes
them integers give exact positions, which can be scaled afterwards.

### Does rotation always give a shorter packing?

No, and nothing guarantees it. The rotatable class decides each rectangle's
orientation when it arrives, without regard to the rectangles that follow.

Measurement shows that it can lose. Over 10,000 rectangles 20 to 40 wide and 60
to 90 tall in a strip 1,000 wide, the rotatable class finished 2.4% **higher**
than the plain one.
[placement-algorithm.md](placement-algorithm.md#how-rotation-is-decided)
compares four inputs, including those where rotation helps.

Beyond that, only a test on your own data shows which class packs it lower.

### Two gaps are at the same height — which one is used?

The left one. Candidates are scored by the height they would place the rectangle
at and by nothing else, and equal heights are broken by the smaller `x`:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const strip = new BestFitStripPack(100);

console.log(strip.insert(30, 20)); // { x: 0, y: 0 }
console.log(strip.insert(20, 10)); // { x: 30, y: 0 }
console.log(strip.insert(10, 40)); // { x: 50, y: 0 }
console.log(strip.insert(20, 10)); // { x: 60, y: 0 }
console.log(strip.insert(20, 40)); // { x: 80, y: 0 }

console.log(strip.insert(20, 5)); // { x: 30, y: 10 }
```

The gaps at `x = 30` and `x = 60` are both 20 wide at height 10, and the 20×5
fills either exactly, so it takes the left one.

### Does inserting ever move something already placed?

No. This is the online heuristic: each rectangle is placed when it arrives and
the decision is final. Nothing is reordered, and the same sequence of calls on a
fresh instance always produces the same coordinates.

## Errors

Every failure is an exception thrown before anything is placed.

| Call                                  | Condition                     | Error        | Message                                                                         |
| ------------------------------------- | ----------------------------- | ------------ | ------------------------------------------------------------------------------- |
| `new BestFitStripPack(w)`             | `w` not a number, or `NaN`    | `TypeError`  | `Strip width (NaN) should be numerical value.`                                  |
| `new BestFitStripPack(w)`             | `w <= 0`                      | `RangeError` | `Strip width value (0) should be greater than 0.`                               |
| `insert(w, h)`                        | either not a number, or `NaN` | `TypeError`  | `Both dimensions (NaNx10) should be numerical values.`                          |
| `insert(w, h)`                        | either `<= 0`                 | `RangeError` | `Both dimensions (0x10) should be greater than 0.`                              |
| `insert(w, h)` on the plain class     | `w` exceeds the strip width   | `RangeError` | `Width (120) should not exceed strip width (100).`                              |
| `insert(w, h)` on the rotatable class | **both** exceed the width     | `RangeError` | `At least one of the dimensions (120x110) should not exceed strip width (100).` |

Both constructors validate the same way. A `TypeError` message shows a number as
it is, a string in quotes (`"50"`), `null` as `null`, and any other value by its
type, such as `object`.

`Infinity` passes the numeric checks. A strip of infinite width places every
rectangle at `y = 0`. An infinite width on `insert` exceeds the strip width, so
`BestFitStripPack` rejects it and `BestFitStripPackRotatable` rotates the
rectangle when its height fits. Both classes accept an infinite height, which
leaves `packedHeight` at `Infinity`.

## Environment and integration

### Does it work in the browser?

Yes. `src/` references no platform API — no `process`, no `document`, no
`Buffer`, no timers — so the built modules run unmodified in browsers, Node,
Deno, Bun, workers and edge runtimes. The one platform requirement comes from
the heap it uses internally, which needs `WeakMap`. Every ES2015 runtime has it.

### ESM or CommonJS?

Both. `import` resolves to `dist/es/index.mjs` and `require` to
`dist/cjs/index.cjs`, each with its own declarations —
`dist/@types/es/index.d.mts` and `dist/@types/cjs/index.d.cts` — emitted from
the same source by the same build. The module system is carried by the file
extension rather than inferred from a `type` field, so Node reads each build as
what it is and neither path prints a warning.

### Can I import only part of the library?

There is nothing to import separately. The package root exports two classes and
two type definitions, and declares no subpaths:

```typescript
import {
  BestFitStripPack,
  BestFitStripPackRotatable,
  type IPlacementPoint,
  type IPlacementPointRotatable,
} from 'best-fit-strip-pack';
```

The internal layer that the classes delegate to is not published.

### Will unused parts be dropped from my bundle?

The package declares `"sideEffects": false` and ships an ES build that keeps one
module per source file, so a bundler that performs tree-shaking removes what you
do not import. Importing `BestFitStripPack` alone does not pull in the rotatable
class or its module.

### What does it depend on at runtime?

Two packages, both declared as `dependencies`:
[abstract-linked-lists](https://github.com/styiannis/abstract-linked-lists) and
[addressable-binary-heaps](https://github.com/styiannis/addressable-binary-heaps).
Every value import goes through a subpath, so what a bundler pulls in is two
list modules and three heap modules rather than either library in full. Neither
appears in the API, and neither has runtime dependencies of its own.

### What are the version requirements?

Node 18.12 or later, and npm 8 or later. The published code targets ES2022.
