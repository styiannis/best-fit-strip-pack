# Best-Fit Strip Pack

[![NPM Version](https://img.shields.io/npm/v/best-fit-strip-pack)](https://www.npmjs.com/package/best-fit-strip-pack)
[![Coverage Status](https://img.shields.io/coverallsCoverage/github/styiannis/best-fit-strip-pack)](https://coveralls.io/github/styiannis/best-fit-strip-pack?branch=main)

A TypeScript implementation of the online best-fit algorithm for the 2D rectangular [strip packing problem](https://en.wikipedia.org/wiki/Strip_packing_problem). The strip packing problem involves packing rectangles of varying dimensions into a strip of fixed width and infinite height, minimizing the total height used.

The algorithm places each rectangle in the position that minimizes the increase to the overall strip height, processing items sequentially in insertion order without pre-sorting. This makes it suitable for real-time scenarios where rectangles arrive one by one.

Based on the best-fit heuristic described in "[The best-fit heuristic for the rectangular strip packing problem: An efficient implementation and the worst-case approximation ratio](https://doi.org/10.1016/j.cor.2009.05.008)" by Shinji Imahori and Mutsunori Yagiura.

## Features

- **Online Best-Fit Heuristic**: Places each rectangle in the position that minimizes the increase to overall strip height, processing items in insertion order
- **Real-time Processing**: Handles rectangles sequentially without pre-sorting or post-processing
- **Rotation Support**: Optional variant that automatically considers both rectangle orientations for better space utilization
- **Optimized Data Structures**: Uses linked lists and min-heaps for high-performance operations

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
console.log(bfsp.insert(30, 20)); // { x: 0, y: 0 }
console.log(bfsp.insert(20, 40)); // { x: 30, y: 0 }
console.log(bfsp.insert(60, 10)); // { x: 0, y: 40 }

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
import { BestFitStripPack } from 'best-fit-strip-pack';

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

## Code documentation

The complete API reference of the library is available at the [code documentation site](https://styiannis.github.io/best-fit-strip-pack/).

## Issues and Support

If you encounter any issues or have questions, please [open an issue](https://github.com/styiannis/best-fit-strip-pack/issues).

## License

This project is licensed under the [MIT License](https://github.com/styiannis/best-fit-strip-pack?tab=MIT-1-ov-file#readme).
