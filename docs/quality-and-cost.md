# Packing quality and cost

How close the packer comes to the lowest packing possible, what in the input
moves it closer or further, and what an insertion costs in time and memory.

**Last verified:** 2026-10-07 · v1.3.0

## How close to the lowest packing

The packer places each rectangle at the lowest position where it fits on the
**skyline**, the outline formed by the tops of the rectangles packed so far. It
is a sequence of **segments**, each a stretch of the outline at one height.
[getting-started.md](getting-started.md#where-the-fourth-rectangle-goes) shows a
rectangle placed this way. The packer chooses each position when the rectangle
arrives, without knowing the rectangles that follow, and never moves a rectangle
once it is placed. Space left below a rectangle stays empty, because the skyline
records only its top.

No packing can be lower than the total area of its rectangles divided by the
strip's width, the height it would reach if it left no space empty. That height
as a share of the height the packer reached is the **occupancy**, also the
fraction of the packed area that the rectangles cover. Ten thousand rectangles 5
to 84 wide and 5 to 64 tall, in a strip 1,000 wide, reach an occupancy of 90.4%,
so the packing is at most 10.6% taller than the lowest packing possible for
those rectangles. The real margin is smaller, by whatever space the lowest
packing must leave empty itself. That packing cannot be computed for comparison:
strip packing is NP-hard, and no method is known that finds it in time
polynomial in the number of rectangles.

There is no limit to how far the packer can be from the lowest packing. In a
strip `W` wide, take `W` rectangles 1 wide and `W` tall, each followed by one
`W` wide and 1 tall. Each wide rectangle covers the whole strip, so it rests on
top of the narrow one before it, and the next narrow one stands on it. Each pair
adds `W + 1` to the height, and the packing reaches `W(W + 1)`. The lowest
packing stands the narrow rectangles side by side and stacks the wide ones above
them, `2W` in all. The ratio, `(W + 1) / 2`, grows with the strip: in a strip
100 wide, the packer reaches 10,100 where 200 is possible.
`BestFitStripPackRotatable` has an input of its own with the same property,
given in [When rotation helps](#when-rotation-helps).

Shinji Imahori and Mutsunori Yagiura prove that a related heuristic has no
constant worst-case ratio either, in
[doi:10.1016/j.cor.2009.05.008](https://doi.org/10.1016/j.cor.2009.05.008). In
theirs, by Burke, Kendall and Whitwell, the lowest segment of the skyline
chooses its rectangle from all those not yet placed. Here, each rectangle
chooses its position as it arrives. Their proof is written for their heuristic,
and the input above is this packer's own.

## What the input costs

How wide the rectangles are and the order in which they arrive both move the
packing away from the lowest one. Sorting and rotation are what a caller can do
about them, and neither always helps.

### What wide rectangles cost

A wider rectangle needs more of the skyline to rest on, so fewer positions can
hold it. And where it rests on segments of different heights, the space between
the lower ones and its underside is closed for good, because the skyline records
only the rectangle's top.
[The FAQ](faq.md#the-space-under-a-rectangle-was-never-used-again) shows the
case.

Wide rectangles also lower the occupancy where the packer is not the cause. A
hundred rectangles 51 wide and 10 tall, in a strip 100 wide, go one above the
other, 1,000 high, an occupancy of 51%. No packing does better, because no two
of them fit side by side.

### What the input order costs

When every rectangle is known before packing starts, sorting them by decreasing
height can lower the packing:

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

const rects: [number, number][] = [
  [50, 10],
  [50, 40],
  [50, 10],
  [50, 40],
];

function pack(input: [number, number][]) {
  const strip = new BestFitStripPack(100);
  for (const [w, h] of input) {
    strip.insert(w, h);
  }
  return strip.packedHeight;
}

console.log(pack(rects)); // 60
console.log(pack([...rects].sort((a, b) => b[1] - a[1]))); // 50
```

Sorted, the two tall rectangles share the bottom row and the two short ones fit
level on top of them. In arrival order, the two short rectangles take half of
the bottom row, and the second tall one goes on top of them. Sorted the same
way, the rectangles of the unlimited case in
[How close to the lowest packing](#how-close-to-the-lowest-packing) reach 200 in
a strip 100 wide, the lowest packing possible.

Sorting does not always help. In a strip 10 wide, rectangles 3 by 10, 4 by 8 and
10 by 9, in that order, pack 19 high: the first two share the floor and the
third rests on them. Sorted, the 10 by 9 comes second. It rests on the first and
covers the floor beside it, and the 4 by 8 goes on top of it, 27 high.

### When rotation helps

`BestFitStripPackRotatable` chooses each rectangle's orientation when it
arrives. On the floor, it lays the longer side along the strip when that fits,
and the shorter side when only that fits. Above the floor, it searches once for
each orientation that fits the strip's width and keeps the one whose top ends
lower. A tie keeps the rectangle as given.

Rotation removes the cost of both inputs above. It lays the narrow rectangles of
the unlimited case flat, and they reach 200 in a strip 100 wide, the lowest
packing possible. It turns some of the 51 by 10 rectangles upright, so that
several share a row, and they reach 561 instead of 1,000.

The rule for the floor has an unlimited case of its own. In a strip `W` wide, a
rectangle `W − 1` wide and 1 tall leaves one unit of floor. The next, `W` wide
and 1 tall, does not fit there lying down but fits standing, so the rotatable
class stands it on the floor, `W` high. The plain class lays it on top of the
first, 2 high. In a strip 100 wide, that is 100 against 2.

On random input, rotation helped most where the strip was narrow relative to the
rectangles, and cost height where the rectangles were taller than they were
wide. Other inputs need a test of their own.

## What an insertion costs

`m` is the number of segments in the skyline.

| Operation                                   | Cost                          |
| ------------------------------------------- | ----------------------------- |
| `new BestFitStripPack(w)`                   | `O(1)`                        |
| `insert` — placed on the floor              | `O(log m)`                    |
| `insert` — best-fit search                  | `O(m)` typical, `O(m²)` worst |
| `insert` on the rotatable class             | the same, up to twice         |
| `packedWidth`, `packedHeight`, `stripWidth` | `O(1)`                        |
| `reset`                                     | `O(m)`                        |

An insertion that fits on the floor needs a width comparison and at most one
heap operation. If the last segment already has the rectangle's height, it is
widened. Otherwise one new segment is added to both structures that hold the
skyline, and adding it to the heap takes `O(log m)`.
[architecture-and-api.md](architecture-and-api.md#what-one-packer-holds)
describes the two structures.

An insertion that does not fit on the floor runs the search. The search
considers every segment as a possible position for the rectangle. The heap keeps
the segments ordered by height, but the search does not use that order to stop
early. Each segment costs at least one comparison, which rejects it if it is
taller than the best position found so far. From every other segment, the search
walks along the neighbours to measure the space around it: first left, past
every neighbour that is no taller, then back right until the space is wide
enough for the rectangle.

The cost of the search is therefore the number of segments plus the length of
the walks. On random input the walks are short, so the search is `O(m)`. `m`
itself follows the shape of the skyline, not the number of insertions, within
the limits given in
[What a packer retains in memory](#what-a-packer-retains-in-memory).

The walks are longest on a skyline that rises step by step from left to right,
each segment one unit wide and one unit taller than the one before it, when the
new rectangle is as wide as the strip. No segment is taller than the top of the
skyline, so the comparison rejects none of them, and every segment starts a
walk. Each walk passes all the segments to its left, which are all lower, and
comes all the way back, because the space it measures is narrower than the
rectangle. Only the walk from the tallest segment covers the whole strip and
finds room. One insertion takes `m(m − 1)` steps: the `O(m²)`.

The rotatable class searches twice only when the rectangle fits the floor in
neither orientation and fits the width in both. When one side is wider than the
strip, only the other orientation is searched. `reset` is linear because
emptying the heap visits every segment.

## What a packer retains in memory

A packer's memory follows the number of segments in its skyline, not the number
of rectangles it has packed. Each segment is one list node and one heap node,
and nothing else is kept, so a rectangle that adds no segment adds no memory.
The segment count rises and falls as the packing proceeds. The memory is
therefore not constant, but it does not grow with the input.

The number of segments has an upper limit. Each insertion adds at most one
segment, so a packer never holds more segments than rectangles. With integer
widths, every segment is also at least one unit wide, so a strip 1,000 wide
never holds more than 1,000 segments. That limit is reached when every segment
is one unit wide and no two neighbours have the same height. With fractional
widths, only the first limit applies.

Which rectangles are packed matters more than how many. A strip 1,000 wide,
packed with random rectangles, widths 5 to 84 and heights 5 to 64, and with the
input that reaches the limit:

| Rectangles packed                              | Segments | Retained per packer |
| ---------------------------------------------- | -------- | ------------------- |
| none                                           | 0        | 0.4 KB              |
| 1,000 random                                   | 36       | 6.8 KB              |
| 100,000 random                                 | 30       | 6.1 KB              |
| 1,000, one unit wide, 1 and 2 high alternately | 1,000    | 163.6 KB            |

A hundred times as many random rectangles left fewer segments and less memory,
and the 1,000 rectangles of the last row retain more than 25 times what the
100,000 do. Keeping the placements `insert` returns is the caller's choice, and
it costs more than the packer: the 100,000 of the third row would retain 4.8 MB.

## What the numbers rest on

[`benchmarks/`](../benchmarks/README.md) holds the scripts behind every
measurement of random input on this page and describes how each was measured.
Every random input is integer widths and heights drawn uniformly from the ranges
named, by a generator seeded with 1, so the heights, occupancies and segment
counts are exact for that sequence and reproduce on any machine. Drawn in ten
other orders from the same ranges, the occupancies moved by less than half a
point, the mean segment counts by under 2%, and the maximum segment counts by
about 15%. The memory figures depend on the Node version, and the times do not
reproduce exactly. The extreme inputs are fixed sequences, and pack to the same
heights on every run.
