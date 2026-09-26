# How a rectangle is placed

Every call to `insert` answers one question: of all the positions this
rectangle could occupy, which one raises the top of the packing least? This
page is the answer in full — the rule, the state it is computed from, what the
search costs, and how good the result is.

**Last verified:** 2026-09-25 · v1.2.0

## The skyline is the whole state

The packer does not remember rectangles. It remembers the **skyline**: the
horizontal profile of everything packed so far, stored as consecutive segments
covering the used width from left to right, each with a start, a width and a
height. Two adjacent segments of equal height are always merged into one, so
the profile is the shortest description of itself.

Five insertions into a strip 100 wide, with the resulting skyline written as
`from-to:height`:

```text
40x30 -> (0,0)     0-40:30
30x50 -> (40,0)    0-40:30  40-70:50
30x20 -> (70,0)    0-40:30  40-70:50  70-100:20
50x25 -> (0,50)    0-50:75  50-70:50  70-100:20
20x40 -> (70,20)   0-50:75  50-70:50  70-90:60  90-100:20
```

Three segments describe four rectangles on the fourth line, and four describe
five on the fifth. The count follows the shape of the profile rather than the
number of rectangles, and that is what keeps both the memory and the cost of a
search bounded no matter how long the packing runs.

## Rule one: the floor before the profile

Before any search happens, `insert` asks whether the rectangle still fits in
the width that has never been touched — whether `packedWidth + width` is
within the strip. If it does, the rectangle is placed there, at `y = 0`,
flat on the floor of the strip.

This is why the first three insertions above went left to right along the
bottom without any of them being examined against the others. It is also why
the rule keeps applying later: a narrow rectangle arriving after the packing
has grown tall will still go to the floor if the floor has room for it. The
[FAQ](faq.md) has the case where that surprises people.

## Rule two: the lowest surface the rectangle covers

When the floor is full, the search begins, and it considers one candidate per
segment. From a segment, the packer walks left over every neighbour no taller
than that segment, then right over neighbours of the same kind until the run is
wide enough for the rectangle. That run is where the rectangle would sit, and
the height it would sit at is the **tallest** segment in the run — a rectangle
cannot straddle a run and hover above its highest point.

Every candidate is scored by that height, and the lowest wins. Equal heights
are broken by the smaller `x`, which makes the packing fill left to right:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const strip = new BestFitStripPack(100);

strip.insert(30, 10);
strip.insert(40, 20);
strip.insert(30, 10);
console.log(strip.packedWidth, strip.packedHeight); // 100 20

console.log(strip.insert(25, 5)); // { x: 0, y: 10 }
console.log(strip.insert(25, 5)); // { x: 70, y: 10 }
```

The two 10-high gaps at each end of the strip are indistinguishable by height,
so the first 25×5 takes the left one and the second takes the other.

One case lets a run be too narrow. If a run reaches the right-hand end of the
used width before it is wide enough, and the strip still has untouched width
beyond it, the rectangle may extend into that width — the packing gets wider
rather than taller:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const strip = new BestFitStripPack(100);

console.log(strip.insert(65, 20)); // { x: 0, y: 0 }
console.log(strip.insert(25, 5)); // { x: 65, y: 0 }
console.log(strip.packedWidth, strip.packedHeight); // 90 20

console.log(strip.insert(30, 10)); // { x: 65, y: 5 }
console.log(strip.packedWidth, strip.packedHeight); // 95 20
```

The 30-wide rectangle needs more than the 25 units of low ground at `x = 65`,
and taking the five unused units to its right costs nothing, so it does. Had
it been placed on the profile instead, the packing would have grown to 30.

## What a placement does to the skyline

Three shapes of edit cover every case, and which one applies is decided by the
same search that chose the position.

- **One segment.** The run is a single segment. If the rectangle is narrower
  than it, the segment is split in two and only the left part is raised.
- **Merge all.** The run is exactly as wide as the rectangle, or the rectangle
  extends past the end of the used width. Every segment in the run collapses
  into the first, which takes the rectangle's width and the new height.
- **Merge and split the last.** The run is wider than the rectangle. Everything
  but the final segment collapses into the first, and the final segment keeps
  the leftover width, shifted to the right.

Whichever applies, the neighbours on both sides are then checked and merged
into the result if their heights now match. That is the step that keeps the
segment count tied to the shape of the profile rather than to the length of the
run: in the trace at the top of this page, five rectangles left four segments,
and 20,000 rectangles into the same strip 100 wide averaged 5.2 segments and
never exceeded 13.

## How rotation is decided

`BestFitStripPackRotatable` runs the search once for each orientation that fits
the width — twice for a rectangle whose sides both fit, once for one whose
longer side is wider than the strip — and compares where the top of the
rectangle would end up in each: the position's height plus the dimension that
would be vertical. The lower top wins, and a tie goes to the unrotated
orientation.

On the floor the decision is made differently and earlier: the packer tries to
lay the **longer** side along the strip, and rotates a tall rectangle onto its
side if that is what fits in the row. This is why a fresh rotatable packer
turns a 20×70 into a 70×20 without being asked.

Rotation is not free and not always a gain. It can double the search, and
whether it lowers the packing depends on the input. Ten thousand rectangles
each time, with the height each class reached:

| Rectangles                  | Strip | Plain   | Rotatable | Difference |
| --------------------------- | ----- | ------- | --------- | ---------- |
| widths 5–84, heights 5–64   | 1,000 | 16,872  | 16,791    | −0.5%      |
| widths 5–304, heights 5–64  | 1,000 | 63,731  | 62,934    | −1.3%      |
| widths 5–84, heights 5–64   | 100   | 210,070 | 185,929   | −11.5%     |
| widths 20–40, heights 60–90 | 1,000 | 24,871  | 25,460    | +2.4%      |

It pays most where the strip is narrow relative to the rectangles, and it
costs height where the rectangles are taller than they are wide.

## What the search costs

The search examines every segment of the skyline, and each examination walks
the neighbouring segments that are no taller than the one it started from. So
the cost of an insertion is set by the number of segments — call it `m` — and
not by how many rectangles have already been packed. It is `O(m)` walks in the
common case and `O(m²)` when every segment's run spans the whole profile.

`m` is governed by the strip width relative to the rectangles. Inserting 20,000
rectangles 5 to 84 units wide and 5 to 64 tall, with the segment count sampled
at every insertion:

| Strip width | Mean segments | Maximum | 20,000 insertions |
| ----------- | ------------- | ------- | ----------------- |
| 100         | 5.2           | 13      | 5 ms              |
| 1,000       | 29.0          | 45      | 10 ms             |
| 10,000      | 285.3         | 326     | 42–55 ms          |

The segment counts are exact for this input. The timings are one machine's
(Node 22.12.0). Each is the median of three processes, and each process
reports the median of fifteen rounds. The one for a strip 10,000 wide moved
between 42 and 55 ms across three runs of the whole set. What travels is the
shape. Widening the strip a hundredfold multiplied the segment count by about
55 and the time by about 10, so the cost follows `m` but well below proportion.
The number of rectangles already packed does not enter into it at all: packing
10,000 and 100,000 rectangles into a strip 1,000 wide took 5.0 ms and 50 ms,
half a microsecond per insertion either way.

## How good the packing is

The heuristic is the online one: rectangles are placed in the order they
arrive and nothing is reconsidered. That constraint is the point of the
library and also the ceiling on its quality. Ten thousand rectangles 5 to 64
tall, into a strip 1,000 wide, with the fraction of the packed area that the
rectangles cover. The same fraction is the lowest height the rectangles could
reach — their total area divided by the strip width — as a share of the height
actually reached:

| Input                    | Widths 5–84 | Widths 5–304 |
| ------------------------ | ----------- | ------------ |
| Arrival order            | 90.4%       | 83.0%        |
| Arrival order, rotatable | 90.8%       | 84.1%        |
| Sorted by height first   | 97.1%       | 94.7%        |
| Row by row, no best fit  | 54.4%       | 56.0%        |

The last row is a shelf heuristic that starts a new row whenever the current one
is full and never looks below it. The gap between it and the first row is what
the skyline search buys. The gap between the first row and the third is what
being online costs: if every rectangle is available before packing starts,
sorting them by decreasing height recovers most of it, and doing so is one line
at the call site.

The heuristic is the one analysed in Shinji Imahori and Mutsunori Yagiura,
_The best-fit heuristic for the rectangular strip packing problem: an
efficient implementation and the worst-case approximation ratio_,
[doi:10.1016/j.cor.2009.05.008](https://doi.org/10.1016/j.cor.2009.05.008),
where its worst-case behaviour is derived. Strip packing is NP-hard, so no
heuristic closes the remaining gap in general.

## Where it does badly

A rectangle wider than every low run in a fragmented profile has nowhere to go
but the top. It raises the packing by its full height and leaves the low ground
beneath it usable only by something narrow enough for the gap it sits in. The
wider the rectangles are relative to the strip, the more often that happens,
which is the difference between the two columns of the table above: the same
count of rectangles, with the widths drawn up to 304 instead of up to 84, packs
to 83.0% instead of 90.4%.

There is no maximum height. A strip is unbounded by construction, so the
packer never rejects a rectangle for being too tall and never reports that a
packing has become unreasonable; that judgement belongs to the caller, who has
`packedHeight` after every insertion.

## Reproducing these numbers

The measurements are not shipped with the package. Every input above is
integer widths and heights drawn uniformly from the ranges named, in one fixed
pseudo-random order, so the heights, occupancies and segment counts are exact
outputs for that order and reproduce on any machine. Another order drawn from
the same ranges moved the occupancies by less than half a point and the mean
segment counts by under 2% over ten tries, and the maxima by up to 15%. Time
each configuration in a process of its own, packing into a fresh instance on
every round, and compare the strip widths with each other rather than with a
clock.
