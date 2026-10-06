# Architecture and API

**Last verified:** 2026-10-07 · v1.3.0

## What one packer holds

A packer keeps no record of the rectangles it has placed. It keeps only the
**skyline**: the outline formed by the tops of the rectangles packed so far. Its
whole state is five fields, two structures that hold the skyline and three
numbers:

```typescript
export interface IBestFitStripPack {
  heap: IMinHeap;
  list: IDoublyList;
  packedHeight: number;
  packedWidth: number;
  stripWidth: number;
}
```

The skyline is a sequence of **segments**. A segment is a stretch of the outline
at one height, and it belongs to the outline, not to a rectangle: neighbouring
rectangles whose tops are at the same height form one segment.

Each segment is stored twice, once in each structure. The list holds the
segments from left to right. Each list node records where its segment starts, as
`x`, the distance from the strip's left end, and how wide the segment is, as
`width`. In the heap, each node records its segment's height as its `key`, and
the heap keeps the segments ordered by that key. A segment's list node and heap
node point at each other. They are created together, in `createRecord`, and
destroyed together, in `removeRecord`.

That link between the two nodes keeps every edit local. An edit to the skyline
starts at a list node, and the link leads straight to the matching heap node.
Raising a segment changes its heap node's `key`, and the heap restores its order
in `O(log m)`, where `m` is the number of segments. Removing a segment detaches
its list node and removes its heap node, and neither step searches for anything.

The two structures and the pointers between them are how Shinji Imahori and
Mutsunori Yagiura store the skyline in _The best-fit heuristic for the
rectangular strip packing problem: an efficient implementation and the
worst-case approximation ratio_,
[doi:10.1016/j.cor.2009.05.008](https://doi.org/10.1016/j.cor.2009.05.008).

[quality-and-cost.md](quality-and-cost.md#what-an-insertion-costs) gives what
searching and editing the two structures costs, in time and in memory.

## Two layers

`src/` divides into `core/` and `classes/`. The division is a method, not a
convention: `core/` is written as small independent functions over plain
objects, so the behaviour and cost of each one, including what it allocates, can
be checked in the function itself. The classes sit on top of that layer rather
than inside it.

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
│       ├── placement-point.ts            the result { x, y }
│       ├── placement-point-rotatable.ts  the result { x, y, rotated }
│       └── types.ts                      the node types that pair the two
└── classes/
    ├── BestFitStripPack.ts               the exported plain packer
    ├── BestFitStripPackRotatable.ts      the exported rotatable packer
    └── abstract/                         the classes they extend, not exported
```

The `classes/` layer contains no algorithm. `BestFitStripPack.insert` is
`return insert(this.#obj, width, height)`, and every other member is that shape.
What it adds is a private field (`#obj`) the caller cannot reach into, read-only
getters in place of the core object's writable fields, and the two documented
result types.

## What the package exports

| Export                      | Kind      |
| --------------------------- | --------- |
| `BestFitStripPack`          | class     |
| `BestFitStripPackRotatable` | class     |
| `IPlacementPoint`           | interface |
| `IPlacementPointRotatable`  | interface |

Each class has a constructor taking the strip width, the getters `packedWidth`,
`packedHeight` and `stripWidth`, and the methods `insert` and `reset`. `insert`
returns an `IPlacementPoint`, `{ x, y }`, on `BestFitStripPack`, and an
`IPlacementPointRotatable`, which adds `rotated: boolean`, on
`BestFitStripPackRotatable`. There are no subpath exports and no options object.

## Extending

The two exported classes can be extended, but a subclass reaches nothing that a
caller cannot. The packer's state is in the private field `#obj`, and neither
the abstract classes nor the core functions are exported, so a subclass can add
members and override the public ones, reaching the packer only through `super`.
A wrapper that holds a packer instead of extending it has the same reach. Either
one is the place to keep the record of what was placed, which the packer does
not keep and [getting-started.md](getting-started.md#keep-the-geometry-yourself)
collects by hand.

## Tooling

The source is TypeScript in `strict` mode, with `exactOptionalPropertyTypes` and
`noUncheckedIndexedAccess`. Rollup produces four outputs: an ES build, a
CommonJS build, and a declaration tree for each. All four use `preserveModules`,
so each mirrors `src/` file for file, and all four leave both dependencies
external. The module system is carried by the extension: `.mjs` and `.d.mts` on
the ES side, `.cjs` and `.d.cts` on the CommonJS side.

Two scripts check the result. `check-declared-paths` verifies that every path
declared in `package.json` exists, and that each entry point carries the
extension of the module system it is declared for. `check-dist-loads` loads the
two built entries the way a consumer would, the CommonJS one with `require` and
the ES one with `import`. `npm run verify` runs the type check, the linter, the
build and both checks in sequence. Two more commands stay outside it: `npm test`
runs the Jest suites, which cover both `core/` and `classes/`, and
`check-benchmarks-types` type-checks the scripts in `benchmarks/`.
