# Best-Fit Strip Pack

A TypeScript implementation of the online Best-Fit algorithm for the 2D rectangular strip packing problem. Based on the 2009 paper ["The best-fit heuristic for the rectangular strip packing problem: An efficient implementation and the worst-case approximation ratio"](#todo) by Y. Zhang, A. S. K. Mok, and L. Zhang.

Implements the **Best-fit decreasing height (BFDH)** heuristic, which processes rectangles by non-increasing height and places each rectangle in the position that minimizes the increase to overall strip height.

## Features

- **BFDH Algorithm:** Implements Best-fit decreasing height heuristic for optimal space utilization
- **Online Processing:** Processes rectangles one by one in the order they are provided
- **Best-Fit Heuristic:** Places each rectangle in the position that minimizes the increase to overall strip height
- **Rotation Support:** Optional variant that considers rectangle rotation for better space utilization
- **Type Safe:** Full TypeScript support with complete type definitions
- **Real-time Metrics:** Track packed dimensions at any point during insertion
- **Efficient Architecture:** Optimized data structure usage for high performance

## Installation

```bash
npm install best-fit-strip-pack
```

## Usage

### Basic Packing (Without Rotation)

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

// Create a packer for a strip of width 100 units
const packer = new BestFitStripPack(100);

// Insert rectangles (order matters for online algorithm)
const position1 = packer.insert(30, 40); // { x: 0, y: 0 }
const position2 = packer.insert(20, 60); // { x: 30, y: 0 }
const position3 = packer.insert(50, 30); // { x: 0, y: 40 }

// Get current packed dimensions
console.log(
  `Used width: ${packer.packedWidth}, height: ${packer.packedHeight}`
);

// Reset for a new packing sequence
packer.reset();
```

### Packing with Rotation

```typescript
import { BestFitStripPackRotatable } from 'best-fit-strip-pack';

const packer = new BestFitStripPackRotatable(100);

// The algorithm will automatically choose the best orientation
const result = packer.insert(40, 60);
// { x: 0, y: 0, rotated: true } - rectangle was rotated to 60x40

const result2 = packer.insert(30, 20);
// { x: 60, y: 0, rotated: false } - placed in original orientation
```

### Batch Processing

```typescript
const rectangles = [
  { width: 30, height: 40 },
  { width: 20, height: 60 },
  { width: 50, height: 30 },
  { width: 10, height: 20 },
  { width: 60, height: 50 },
];

const packer = new BestFitStripPack(100);
const packedItems = [];

for (const rect of rectangles) {
  const position = packer.insert(rect.width, rect.height);
  packedItems.push({ ...rect, ...position });
}

console.log(`Final strip height: ${packer.packedHeight}`);
console.log('Packed items:', packedItems);
```

## API Reference

### Core Classes

**`BestFitStripPack`**

Main class implementing the Best-Fit algorithm without rotation.

```typescript
new BestFitStripPack(stripWidth: number)
```

**Properties:**

- `packedHeight: number` - Current total height of the packed strip
- `packedWidth: number` - Current total width of the packed strip
- `stripWidth: number` - Fixed width of the strip

**Methods:**

- `insert(width: number, height: number): { x: number; y: number }`
- `reset(): void`

---

**`BestFitStripPackRotatable`**

Extends the basic algorithm to support rectangle rotation.

```typescript
new BestFitStripPackRotatable(stripWidth: number)
```

**Properties:**

- `packedHeight: number` - Current total height of the packed strip
- `packedWidth: number` - Current total width of the packed strip
- `stripWidth: number` - Fixed width of the strip (readonly)

**Methods:**

- `insert(width: number, height: number): { x: number; y: number; rotated: boolean }`
- `reset(): void`

## Algorithm Details

The library implements the **Best-fit decreasing height (BFDH)** heuristic, which uses an efficient architecture with optimized data structures to place each rectangle in the position that minimizes the increase to the overall packed height of the strip.

**Key characteristics:**

- **BFDH Heuristic:** Processes rectangles and places them using the best-fit decreasing height strategy
- **Online Processing:** Rectangles processed sequentially in arrival order
- **Best-Fit Placement:** Algorithm selects positions that minimize global height increase
- **Efficient Data Structures:** Optimized architecture for high-performance operations
- **Column-based Approach:** Maintains and merges columns dynamically during packing
- **Approximation Guarantees:** Provides good results with proven worst-case bounds

**Architecture Highlights:**

- Maintains a dynamic set of columns representing packed areas
- Uses efficient data structures for quick best-fit candidate selection
- Performs column merging to optimize space utilization for future placements
- Real-time tracking of packing metrics

For mathematical details and performance analysis, refer to the [original paper](#todo).

## References

Zhang, Y., Mok, A. S. K., & Zhang, L. (2009). The best-fit heuristic for the rectangular strip packing problem: An efficient implementation and the worst-case approximation ratio. Computers & Operations Research, 36(5), 1605-1611.
