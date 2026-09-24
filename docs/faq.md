# FAQ

Behaviours that surprise people, every error the library throws, and the
integration questions the package shape raises.

**Last verified:** 2026-09-24 · v1.1.0

## Behaviour

### A rectangle went to the bottom of a strip that is already tall

Because the bottom still had room. Before searching the profile at all,
`insert` checks whether the rectangle fits in the width that has never been
used, and places it there at `y = 0` if it does:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const strip = new BestFitStripPack(100);

console.log(strip.insert(60, 10)); // { x: 0, y: 0 }
console.log(strip.insert(50, 4)); // { x: 0, y: 10 }
console.log(strip.insert(30, 3)); // { x: 60, y: 0 }
```

The 50×4 did not fit in the 40 units left on the floor and was placed by best
fit, on top of the first rectangle. The 30×3 did fit, so it went back down.
The rule applies for the life of the packer, not only to the first few
insertions.

### It went on top although there was clearly room lower down

A rectangle has to sit on a **contiguous** run of the profile that is wide
enough for it, and it sits at the height of the tallest segment in that run. Two
low patches on either side of a tall one are not one place:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const strip = new BestFitStripPack(100);

strip.insert(30, 10);
strip.insert(40, 40);
strip.insert(30, 10);
console.log(strip.packedHeight); // 40

console.log(strip.insert(80, 5)); // { x: 0, y: 40 }
```

The 80-wide rectangle would have to span all three segments, and the middle
one is at 40, so 40 is where it goes. The two 30-wide patches of low ground
stay where they are, available to anything narrow enough to use them.

### Can I remove a rectangle, or move one?

No. The API is `insert`, `reset` and three getters; there is no handle to a
placement and no `remove`. This follows from what the packer stores — the
profile of what is filled, not the rectangles that filled it — and undoing one
rectangle would require knowing what the profile looked like before it. A
layout that changes is repacked from a list you kept yourself.

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
lowest run ends at the right-hand end of the used width and the strip has
untouched width beyond it, the rectangle takes some of that width instead of
going higher.

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const strip = new BestFitStripPack(100);

strip.insert(65, 20);
strip.insert(25, 5);
console.log(strip.packedWidth); // 90

strip.insert(30, 10);
console.log(strip.packedWidth); // 95
```

Neither dimension ever decreases, except through `reset()`.

### Do fractional dimensions work?

Yes. Nothing rounds or truncates, and nothing requires integers. The
consequence is ordinary binary floating point, accumulated across insertions:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const unit = new BestFitStripPack(1);

console.log(unit.insert(0.1, 1)); // { x: 0, y: 0 }
console.log(unit.insert(0.2, 1)); // { x: 0.1, y: 0 }
console.log(unit.packedWidth); // 0.30000000000000004
```

If exact edges matter — CSS pixels, print units — pack in integers and scale
the results afterwards.

### Why did `rotated` come back `true` when I did not ask for rotation?

Because `BestFitStripPackRotatable` decides for itself; that is the difference
between the two classes. On an empty strip it puts the longer side along the
width, so a tall rectangle is laid on its side:

```typescript
import {
  BestFitStripPack,
  BestFitStripPackRotatable,
} from 'best-fit-strip-pack';

const rot = new BestFitStripPackRotatable(100);
console.log(rot.insert(20, 70)); // { x: 0, y: 0, rotated: true }

const plain = new BestFitStripPack(100);
console.log(plain.insert(20, 70)); // { x: 0, y: 0 }
```

`BestFitStripPack` never rotates anything, and its result has no `rotated`
field at all. Use it when the orientation is yours to keep.

### Does rotation always give a shorter packing?

No. It can double the search and it changes the shape of the profile, and the
outcome depends on the input. Over 10,000 rectangles 20 to 40 wide and 60 to 90
tall in a strip 1,000 wide, the rotatable variant finished 2.4% **higher** than
the plain one; over 10,000 rectangles 5 to 84 wide and 5 to 64 tall in a strip
100 wide, 11.5% lower. [placement-algorithm.md](placement-algorithm.md) has
the full comparison. Measure it on your own data before assuming it helps.

### It accepted a rectangle taller than the strip is wide

That is correct: the strip is unbounded in height by construction, so only the
width is constrained. `insert(10, 4000)` into a strip 100 wide succeeds and
leaves `packedHeight` at 4000. The rotatable class checks that **at least one**
dimension fits the width, since it may rotate.

### Two gaps look identical — which one is used?

The left one. Candidates are scored by the height they would place the
rectangle at, and equal heights are broken by the smaller `x`.

### Does inserting ever move something already placed?

No. This is the online heuristic: each rectangle is placed when it arrives and
the decision is final. Nothing is reordered, and the same sequence of calls on
a fresh instance always produces the same coordinates.

## Errors

Every failure is an exception thrown before anything is placed. There is no
error return and no silent rejection.

| Call                                  | Condition                     | Error        | Message                                                                         |
| ------------------------------------- | ----------------------------- | ------------ | ------------------------------------------------------------------------------- |
| `new BestFitStripPack(w)`             | `w` not a number, or `NaN`    | `TypeError`  | `Strip width (NaN) should be numerical value.`                                  |
| `new BestFitStripPack(w)`             | `w <= 0`                      | `RangeError` | `Strip width value (0) should be greater than 0.`                               |
| `insert(w, h)`                        | either not a number, or `NaN` | `TypeError`  | `Both dimensions (NaNx10) should be numerical values.`                          |
| `insert(w, h)`                        | either `<= 0`                 | `RangeError` | `Both dimensions (0x10) should be greater than 0.`                              |
| `insert(w, h)`                        | `w` exceeds the strip width   | `RangeError` | `Width (120) should not exceed strip width (100).`                              |
| `insert(w, h)` on the rotatable class | **both** exceed the width     | `RangeError` | `At least one of the dimensions (120x110) should not exceed strip width (100).` |

Both constructors validate the same way, and both classes validate dimensions
on every `insert`. A `TypeError` message shows a number as it is and a string
in quotes, so passing `"50"` produces
`Both dimensions ("50"x10) should be numerical values.`. `null` appears as
`null`, and any other value by its type: an object reads `object` and a
symbol `symbol`.

`Infinity` is not `NaN` and is not rejected as such. A strip constructed with an
infinite width accepts every width that passes the checks above and never leaves
`y = 0`; an infinite width on `insert` fails the comparison against the strip
width instead.

## Environment and integration

### Does it work in the browser?

Yes. `src/` references no platform API — no `process`, no `document`, no
`Buffer`, no timers — so the built modules run unmodified in browsers, Node,
Deno, Bun, workers and edge runtimes. The one platform requirement comes from
the heap it uses internally, which needs `WeakMap`; every ES2015 runtime has it.

### ESM or CommonJS?

Both. `import` resolves to `dist/es/index.mjs` and `require` to
`dist/cjs/index.cjs`, each with its own declarations —
`dist/@types/es/index.d.mts` and `dist/@types/cjs/index.d.cts` — emitted from
the same source by the same build. The module system is carried by the file
extension rather than inferred from a `type` field, so Node reads each build
as what it is and neither path prints a warning.

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

The package declares `"sideEffects": false` and ships an ES build that keeps
one module per source file, so a bundler that performs tree-shaking removes
what you do not import. Importing `BestFitStripPack` alone does not pull in the
rotatable class or its module.

### What does it depend on at runtime?

Two packages, both declared as `dependencies`:
[abstract-linked-lists](https://www.npmjs.com/package/abstract-linked-lists)
and
[addressable-binary-heaps](https://www.npmjs.com/package/addressable-binary-heaps).
Every value import goes through a subpath, so what a bundler pulls in is two
list modules and three heap modules rather than either library in full. Neither
appears in the API, and neither has runtime dependencies of its own.

### What are the version requirements?

Node 18.12 or later, and npm 8 or later. The published code targets ES2022.
