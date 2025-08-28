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

### Install via npm

```bash
npm install best-fit-strip-pack
```

### Install via yarn

```bash
yarn add best-fit-strip-pack
```

### Install via pnpm

```bash
pnpm install best-fit-strip-pack
```

## Usage

### Basic Packing (Without Rotation)

```typescript
import { BestFitStripPack } from 'best-fit-strip-pack';

// Create an instance for a strip of width 100 units
const bfsp = new BestFitStripPack(100);

// Insert rectangles
console.log(bfsp.insert(30, 40)); // { x: 0, y: 0 }
console.log(bfsp.insert(20, 60)); // { x: 30, y: 0 }
console.log(bfsp.insert(50, 30)); // { x: 0, y: 40 }

// Get current packed dimensions
console.log(`Used width: ${bfsp.packedWidth}, height: ${bfsp.packedHeight}`);

// Reset for a new packing sequence
bfsp.reset();
```

### Packing with Rotation

```typescript
import { BestFitStripPackRotatable } from 'best-fit-strip-pack';

const bfsp = new BestFitStripPackRotatable(100);

// The algorithm will automatically choose the best orientation
console.log(bfsp.insert(40, 60));
// { x: 0, y: 0, rotated: true } - rectangle was rotated to 60x40

console.log(bfsp.insert(30, 20));
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

const bfsp = new BestFitStripPack(100);

const packedItems = [];

for (const rect of rectangles) {
  const position = bfsp.insert(rect.width, rect.height);
  packedItems.push({ ...rect, ...position });
}

console.log(`Final strip height: ${bfsp.packedHeight}`);
// Final strip height: 110

console.log('Packed items:', packedItems);
// Packed items: [
//   { width: 30, height: 40, x: 0, y: 0 },
//   { width: 20, height: 60, x: 30, y: 0 },
//   { width: 50, height: 30, x: 50, y: 0 },
//   { width: 10, height: 20, x: 50, y: 30 },
//   { width: 60, height: 50, x: 0, y: 60 }
// ]
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

## Code documentation

The complete API reference of the library with detailed examples is available at the [code documentation site](https://styiannis.github.io/best-fit-strip-pack/).

## Issues and Support

If you encounter any issues or have questions, please [open an issue](https://github.com/styiannis/best-fit-strip-pack/issues).

## License

This project is licensed under the [MIT License](https://github.com/styiannis/best-fit-strip-pack?tab=MIT-1-ov-file#readme).

## References

Zhang, Y., Mok, A. S. K., & Zhang, L. (2009). The best-fit heuristic for the rectangular strip packing problem: An efficient implementation and the worst-case approximation ratio. Computers & Operations Research, 36(5), 1605-1611.
