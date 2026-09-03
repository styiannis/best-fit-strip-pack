# Architecture and API

**Last verified:** 2026-09-25 · v1.2.0

## The public surface is two classes

Everything the package exports:

| Export                      | Kind      |
| --------------------------- | --------- |
| `BestFitStripPack`          | class     |
| `BestFitStripPackRotatable` | class     |
| `IPlacementPoint`           | interface |
| `IPlacementPointRotatable`  | interface |

Each class has a constructor taking the strip width, the getters
`packedWidth`, `packedHeight` and `stripWidth`, and the two methods `insert`
and `reset`. `IPlacementPoint` is `{ x, y }` and `IPlacementPointRotatable`
adds `rotated: boolean`. There are no subpath exports and no options object.

`src/classes/abstract/` contains `AbstractBestFitStripPack` and
`AbstractBestFitStripPackRotatable`, which the two concrete classes extend, but
`src/index.ts` re-exports the concrete classes by name and stops there. Asking
for either abstract class is a compile error and `undefined` at run time.

## Two layers, and why the lower one is written the way it is

`src/` divides into `core/` and `classes/`, and the division is a method rather
than a convention.

`core/` is written as small independent functions over plain objects, each
one short enough that what happens inside it can be read off the page, **and
so can the resources it requires**. `splitNode` is eight statements and creates
exactly one segment, a list node and a heap node made together by
`createRecord`; `removeRecord` is two calls and releases one of each. Nothing
in the layer allocates in a place the reader cannot see.

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
`return insert(this.#obj, width, height)`, and every other member is that
shape. What it adds is a private field the caller cannot reach into, getters
instead of readable properties, and the two documented result types.

## What one packer holds

Five fields, and three of them are numbers:

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
heap node that name each other, created together in `createRecord` and
destroyed together in `removeRecord`.

The pairing is what makes an edit local. Raising a segment is a `key` change
that the heap repairs in `O(log m)`; removing one is a detach from the list and
a removal from the heap, neither of which searches for anything.

## A heap that is never popped

`pop` and `peek` do not appear anywhere in `src/`. Past `create` and `clear`,
the heap is used for three things — `add`, `remove` and `increase` — and its
ordering is read only by iterating the underlying array.

The search visits the segments in the order of that array, level by level, and
rejects any segment already taller than the best height found so far with a
single comparison. The order is not what makes it fast. The same search run over
the list, left to right, produces **identical placements** — 160,000 insertions
compared across eight configurations, both classes included, no difference.
Timed against the heap walk written the same way, and taking the median of three
runs, the list walk took the same time or less in every configuration, and 5 to
8% less in strips 10,000 wide. In a single run it was up to 9% slower. The two
were written around one shared inner step for that comparison, because inlining
the step, as the shipped function does, is by itself worth up to 10%.

The order does hold. The heap restores it after every `remove` and `increase`,
and the array was a valid heap after each of 20,000 insertions into strips 100,
1,000 and 10,000 wide. The search does not depend on it, because it examines
every segment whatever its position in the array.

The array walk is written as a pair of nested loops that step through the heap
level by level. The indices it produces are exactly `0` to `length - 1`, which
is what a single loop would produce, and a single loop gives the same
placements. Neither form is faster everywhere. Written the same way, the single
loop was 8 to 9% faster in strips 100 and 1,000 wide, and 6 to 7% slower in
strips 10,000 wide, where the search costs most and where it was slower in every
run. The levels would also support an early exit, since in a valid min-heap no
child is shorter than its parent. That exit is not implemented. Tried, it gave
the same placements, and its time stayed within 4% of the walk without it, lower
in some configurations and higher in others.

## Why these two dependencies

`abstract-linked-lists` holds the skyline. Its nodes carry their own `next`
and `previous`, so a segment whose neighbour the algorithm is already holding
is unlinked without a search, which a plain array does not give cheaply.
`addressable-binary-heaps` holds the same segments ordered by height, and maps
each one to its position, so `increase` on a segment costs a lookup and a sift
rather than a scan; what that order is worth to the search is the subject of
the previous section. Every value import goes through a subpath —
`abstract-linked-lists/doubly-linked-list/list`, `.../node` and
`addressable-binary-heaps/min-heap` — so a bundler that builds the caller's
application takes the five modules behind those three subpaths, two from the
list and three from the heap, and not the libraries around them. The package
roots are named once each, in `core/lib/types.ts`, by type imports that the
build erases.

`core/lib/doubly-list/list.ts` wraps `create`, `clear`, `pushNode` and
`removeNode` from the dependency in functions of its own and implements one
operation itself: inserting a node directly after another. The skyline does it
constantly — every split inserts — and the dependency does not offer it.

## Complexity

`m` is the number of segments in the skyline, not the number of rectangles
packed.

| Operation                                 | Cost                             |
| ----------------------------------------- | -------------------------------- |
| `new BestFitStripPack(w)`                 | `O(1)`                           |
| `insert` — placed on the floor            | `O(log m)`                       |
| `insert` — best-fit search                | `O(m)` walks, `O(m²)` worst case |
| `insert` on the rotatable class           | the same, up to twice            |
| `packedWidth` `packedHeight` `stripWidth` | `O(1)`                           |
| `reset`                                   | `O(m)`                           |

The floor case is the cheap one: a width comparison, and either a widened tail
segment or one new segment added to both structures. The search case is the
expensive one, and its `m` is bounded by the shape of the profile rather than by
the length of the run — 20,000 insertions into a strip 1,000 wide averaged 29.0
segments and never exceeded 45. The rotatable class searches twice only when
both orientations fit the width; when one side is wider than the strip, only the
other orientation is searched.

`reset` is linear in both structures. Clearing the list sets both pointers of
every node to `null` before it drops the head and the tail, and clearing the
heap deletes each element from the index map before the array is truncated. The
whole operation is two passes over the segments and nothing more.

## What it costs in memory

Only the skyline is retained, so the figure is bounded by the shape of the
profile rather than by the number of rectangles. It is not constant, because the
number of segments changes with every insertion. A single packer is too small to
weigh against process noise, so each figure below comes from 500 instances built
and held together in a process of their own, all given the same rectangles —
widths drawn uniformly from 5 to 84, heights from 5 to 64 — in a strip 1,000
wide. Collection was repeated before each reading until the memory in use
stopped moving, and the rectangles were generated before the baseline, so they
are outside every figure. Kilobytes are 1,000 bytes:

| Rectangles packed | Retained per packer |
| ----------------- | ------------------- |
| none              | 0.4 KB              |
| 1,000             | 6.8 KB              |
| 100,000           | 6.1 KB              |

A hundredfold increase in input does not raise the retained memory. At any
moment the list holds one node per segment and the heap one element per
segment, and nothing else. This packing ended with 36 segments after 1,000
rectangles and 30 after 100,000, which is why the last figure is the lower one.
Each figure moved by at most 0.1 KB over three runs.

For comparison, the 100,000 placement objects the packer returned along the way
would retain 4.8 MB, at 10⁶ bytes to the megabyte, if the caller kept them all
— the caller's decision, and the larger number by far.

## Extending

There is nothing to subclass. The abstract classes are not exported, the core
layer is not published, and `#obj` is a private field, so the only composition
available is the ordinary one: hold a packer, expose what you want, and add
whatever the caller needs beside it — the record of what was placed, which the
packer deliberately does not keep, is the usual reason to write such a wrapper.

## Tooling

TypeScript 5.9 in `strict` mode with `exactOptionalPropertyTypes` and
`noUncheckedIndexedAccess`. Rollup runs four times — the ES build, the CommonJS
build and a declaration tree for each — every one of them with
`preserveModules`, so the output mirrors `src/` file for file, with both
dependencies marked external, and every one labelled by extension: `.mjs` and
`.d.mts` on one side, `.cjs` and `.d.cts` on the other. Two scripts check the
result. `check-declared-paths` verifies that every path `package.json` declares
exists, and that every entry point has the extension its condition implies;
`check-dist-loads` loads each built entry the way a consumer would, one with
`require` and one with `import`. Jest covers both layers, and `npm run verify`
runs the type check, the linter, the build and both checks in sequence.
