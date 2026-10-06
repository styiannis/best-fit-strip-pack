# Benchmarks

The scripts behind every measured figure in [`docs/`](../docs/README.md). They
load the package's own CommonJS build, the way a `require` consumer does, so
build it first. From the package root:

```bash
npm run build

node --experimental-strip-types benchmarks/src/quality.mts
node --experimental-strip-types benchmarks/src/memory.mts
node --experimental-strip-types benchmarks/src/timing.mts
```

They are TypeScript run by Node directly, with no dependency beyond the
package's own. Node 22.6 or later is required. On 22.6.0, 22.12.0 and 23.5.0
they run only with the flag. On 22.18.0, 23.6.0, 24.4.0 and 24.21.0 they run
with or without it. The versions 22.6.0, 22.12.0, 23.5.0 and 23.6.0 print a
warning that type stripping is experimental, and the others do not.

## The scripts

```
src/
├── quality.mts      occupancy, rotation, segment counts
├── memory.mts       what a packer retains
├── timing.mts       what an insertion costs
└── lib/
    ├── inputs.mts   the rectangles every script packs
    ├── package.mts  the build under test
    └── process.mts  one process per measurement
```

**`lib/inputs.mts`** generates the rectangles from a seeded generator, so every
process on every machine packs the same sequence. Its default ranges, widths 5
to 84 and heights 5 to 64, are the input the documents use when they name no
other.

**`quality.mts`** prints the occupancy table, the rotation table and the mean
and maximum segment count of the skyline sampled after every insertion, for
[quality-and-cost.md](../docs/quality-and-cost.md) and
[faq.md](../docs/faq.md). It ends with how far
the occupancies and segment counts move when the same ranges are drawn in ten
other orders. It runs in about a second.

**`memory.mts`** weighs what a packer retains, for
[quality-and-cost.md](../docs/quality-and-cost.md). One packer is too
small to measure against the noise of its process, so each reading holds 500
packers at once, all given the same input, and divides by 500. It weighs them
empty, after 1,000 and 100,000 rectangles of the default ranges, and after the
input that reaches the limit on the segment count: 1,000 rectangles one unit
wide and alternately 1 and 2 high in the strip 1,000 wide, so that no two
neighbours merge and every unit of width is a segment of its own. Each reading
runs in a `node --expose-gc` process of its own, which generates the input
before its baseline, so the rectangles are outside every figure. Before each of
its two readings, the process collects until the memory in use stops moving. The
script also weighs the 100,000 placements one packer returns, as the difference
between a process that keeps the packer and its placements and one that keeps
the packer alone. The subtraction cancels what the insertions leave in the
process regardless of what is kept. Kilobytes and megabytes are decimal, 1,000
and 10⁶ bytes. It takes about half a minute.

**`timing.mts`** times 20,000 insertions into strips 100, 1,000 and 10,000 wide,
and 1,000, 10,000 and 100,000 insertions into a strip 1,000 wide. Each process
warms up with two rounds, times fifteen, each into a fresh instance, and reports
the median round. Each figure is the median of three processes.

## What reproduces

Everything `quality.mts` prints reproduces to the last digit on any machine. So
do the segment counts of `memory.mts`. Its memory figures depend on the Node
version, and under the same version the empty-packer figure, the figure at the
limit and the placement figure reproduce exactly. The other two memory figures
sit on a rounding boundary and read 6.8 or 6.9 KB and 6.1 or 6.2 KB from run to
run.

The timings do not reproduce. The documents quote runs under Node 22.12.0, where
the cell for a strip 10,000 wide moved between about 40 and 55 ms across runs
and the others by a few percent. What carries over to another machine is the
comparison between rows: the cost following the segment count, and not the
number of rectangles already packed.
