# Architecture and API

**Last verified:** 2026-10-04 · v1.3.0

## What one packer holds

A packer keeps no record of the rectangles it has placed. Its whole state is the
skyline of the packing and three numbers, five fields in all:

```typescript
export interface IBestFitStripPack {
  heap: IMinHeap;
  list: IDoublyList;
  packedHeight: number;
  packedWidth: number;
  stripWidth: number;
}
```

The list is the skyline, left to right: one node per segment, carrying its `x`,
its `width` and a pointer to a heap node. The heap holds those heap nodes,
ordered by height, each carrying its `key` — the height of the segment — and a
pointer back to the list node. Every segment is therefore one list node and one
heap node that name each other, created together in `createRecord` and destroyed
together in `removeRecord`.

The pairing is what makes an edit local. Raising a segment is a `key` change
that the heap repairs in `O(log m)`. Removing one is a detach from the list and
a removal from the heap, and neither searches for anything.

## What it costs in memory

Only the skyline is retained, so the memory a packer holds is bounded by the
shape of the profile rather than by the number of rectangles. It is not
constant, because the number of segments changes with every insertion. A single
packer is too small to weigh against process noise, so each figure below comes
from 500 instances built and held together in a process of their own, all given
the same rectangles — widths drawn uniformly from 5 to 84, heights from 5 to 64
— in a strip 1,000 wide. Collection was repeated before each reading until the
memory in use stopped moving, and the rectangles were generated before the
baseline, so they are outside every figure. Kilobytes are 1,000 bytes:

| Rectangles packed | Retained per packer |
| ----------------- | ------------------- |
| none              | 0.4 KB              |
| 1,000             | 6.8 KB              |
| 100,000           | 6.1 KB              |

A hundredfold increase in input does not raise the retained memory. At any
moment the list holds one node per segment and the heap one element per segment,
and nothing else. This packing ended with 36 segments after 1,000 rectangles and
30 after 100,000, which is why the last figure is the lower one. Each figure
moved by at most 0.1 KB over three runs.
[`benchmarks/`](../benchmarks/README.md) has the script behind the table.

For comparison, the 100,000 placement objects the packer returned along the way
would retain 4.8 MB, at 10⁶ bytes to the megabyte, if the caller kept them all —
the caller's decision, and the larger number by far.

## Two layers

`src/` divides into `core/` and `classes/`. The division is a method, not a
convention: `core/` is written as small independent functions over plain
objects, each with behaviour and cost that can be checked in the function
itself, and the cost includes what it allocates. `splitNode` is eight statements
and creates exactly one segment, a list node and a heap node made together by
`createRecord`. `removeRecord` is two calls and releases one of each. Nothing in
the layer allocates in a place the reader cannot see. The classes sit on top of
that layer rather than inside it.

```
src/
├── core/
│   ├── best-fit-strip-pack.ts            create, insert, reset
│   ├── best-fit-strip-pack-rotatable.ts  the same, choosing an orientation
│   ├── utils.ts                          the search and the placement edits
│   ├── validators.ts                     every throw in the library
│   ├── types.ts                          IBestFitStripPack
│   └── lib/
│       ├── doubly-list/                  the skyline as segments
│       ├── min-heap/                     the segments ordered by height
│       ├── fit-position.ts               a candidate placement
│       ├── placement-point*.ts           the two result shapes
│       └── types.ts                      the node types that pair the two
└── classes/                              the published wrappers
```

The `classes/` layer contains no algorithm. `BestFitStripPack.insert` is
`return insert(this.#obj, width, height)`, and every other member is that shape.
What it adds is a private field the caller cannot reach into, getters instead of
readable properties, and the two documented result types.

## The public surface is two classes

Everything the package exports:

| Export                      | Kind      |
| --------------------------- | --------- |
| `BestFitStripPack`          | class     |
| `BestFitStripPackRotatable` | class     |
| `IPlacementPoint`           | interface |
| `IPlacementPointRotatable`  | interface |

Each class has a constructor taking the strip width, the getters `packedWidth`,
`packedHeight` and `stripWidth`, and the two methods `insert` and `reset`.
`IPlacementPoint` is `{ x, y }` and `IPlacementPointRotatable` adds
`rotated: boolean`. There are no subpath exports and no options object.

`src/classes/abstract/` contains `AbstractBestFitStripPack` and
`AbstractBestFitStripPackRotatable`, which the two concrete classes extend, but
`src/index.ts` re-exports the concrete classes by name and stops there. Asking
for either abstract class is a compile error and `undefined` at run time.

## Why these two dependencies

`abstract-linked-lists` holds the skyline. Its nodes carry their own `next` and
`previous`, so a segment reached from its neighbour is unlinked without a
search, which a plain array does not give cheaply. `addressable-binary-heaps`
holds the same segments ordered by height, and maps each one to its position, so
`increase` on a segment costs a lookup and a sift rather than a scan. What that
order is worth to the search is the subject of the next section. Every value
import goes through a subpath — `abstract-linked-lists/doubly-linked-list/list`,
`.../node` and `addressable-binary-heaps/min-heap` — so a bundler that builds
the caller's application takes the five modules behind those three subpaths, two
from the list and three from the heap, and not the libraries around them. The
package roots are named once each, in `core/lib/types.ts`, by type imports that
the build erases.

`core/lib/doubly-list/` wraps `create`, `clear` and `pushNode` from the list
module and `create` and `detach` from the node module, and implements two
operations itself. `detachNode` removes a segment's node, moving the list's
`head` and `tail` past it and decrementing its `size` around the dependency's
`detach`. `insertNextNode` inserts a node directly after another, through a
local `attachNext` in `node.ts`. The skyline does both constantly — every split
inserts and every merge removes — and the list module offers neither.

## A heap that is never popped

`pop` and `peek` do not appear anywhere in `src/`. Past `create` and `clear`,
the heap is used for three things — `add`, `remove` and `increase` — and its
contents are read only by iterating the underlying array.

The search walks that array as a pair of nested loops that step through it level
by level. The indices they produce are exactly `0` to `length - 1`, so every
segment is examined, whatever its position in the array. A segment already
taller than the best height found so far is rejected with a single comparison,
and a candidate replaces the best one only if it is lower, or as low and no
further right. The position returned is therefore the lowest, then the leftmost,
of all candidates, and the order in which they are visited does not change it.
The heap order is not needed for a correct placement. The same search over the
list, left to right, would return the same positions.

The levels would support an early exit, since in a valid min-heap no child is
shorter than its parent. That exit is not implemented.

## Complexity, as implemented

`m` is the number of segments in the skyline, not the number of rectangles
packed.

| Operation                                 | Cost                          |
| ----------------------------------------- | ----------------------------- |
| `new BestFitStripPack(w)`                 | `O(1)`                        |
| `insert` — placed on the floor            | `O(log m)`                    |
| `insert` — best-fit search                | `O(m)` typical, `O(m²)` worst |
| `insert` on the rotatable class           | the same, up to twice         |
| `packedWidth` `packedHeight` `stripWidth` | `O(1)`                        |
| `reset`                                   | `O(m)`                        |

The floor case is the cheap one: a width comparison, and either a widened tail
segment or one new segment added to both structures. The search case is the
expensive one, and its `m` is bounded by the shape of the profile rather than by
the length of the run — 20,000 insertions into a strip 1,000 wide averaged 29.0
segments and never exceeded 45. The rotatable class searches twice only when
both orientations fit the width. When one side is wider than the strip, only the
other orientation is searched.

`reset` is linear because of the heap. Clearing it deletes each element from the
index map before the array is truncated. Clearing the list drops its `head` and
`tail` and visits no node.

## Extending

There is nothing to subclass. The abstract classes are not exported, the core
layer is not published, and `#obj` is a private field, so the only composition
available is the ordinary one: hold a packer, expose what you want, and add
whatever the caller needs beside it. The record of what was placed, which the
packer deliberately does not keep, is the usual reason to write such a wrapper.

## Tooling

TypeScript 5.9 in `strict` mode with `exactOptionalPropertyTypes` and
`noUncheckedIndexedAccess`. Rollup runs four times: the ES build, the CommonJS
build, and a declaration tree for each of them. All four run with
`preserveModules`, so the output mirrors `src/` file for file, all four keep
both dependencies external, and all four label their output by extension —
`.mjs` and `.d.mts` on the ES side, `.cjs` and `.d.cts` on the CommonJS side.

Two scripts check the result. `check-declared-paths` verifies that every path
declared in `package.json` exists, and that each entry point carries the
extension of the module system it is declared for. `check-dist-loads` loads the
two built entries the way a consumer would, the CommonJS one with `require` and
the ES one with `import`. Jest covers both layers, and `npm run verify` runs the
type check, the linter, the build and both checks in sequence.
