import { IPlacementPoint } from '../../core/lib';

/**
 * Abstract base class defining the core interface for a Best-Fit Strip Packing algorithm.
 *
 * This class implements the 2D rectangular strip packing solution based on the
 * Best-Fit heuristic as described in the 2009 paper:
 * "The best-fit heuristic for the rectangular strip packing problem: An efficient implementation
 * and the worst-case approximation ratio" by Y. Zhang, A. S. K. Mok, and L. Zhang.
 *
 * The algorithm processes rectangles online (in the order they are provided), attempting to
 * place each new rectangle in a position that minimizes the overall increase to the strip's
 * height, using an efficient packing strategy.
 *
 * @abstract
 * @class AbstractBestFitStripPack
 */
export abstract class AbstractBestFitStripPack {
  /**
   * Gets the current total height of the packed strip.
   * This represents the length of the used portion of the strip and is updated
   * after each rectangle insertion. It is the height of the tallest packed rectangle.
   *
   * @readonly
   * @abstract
   * @type {number}
   */
  abstract get packedHeight(): number;

  /**
   * Gets the current total width of the packed strip.
   * This represents the width of the used portion of the strip and is updated
   * after each rectangle insertion. It is the width of the widest row of packed
   * rectangles and will be less than or equal to the stripWidth.
   *
   * @readonly
   * @abstract
   * @type {number}
   */
  abstract get packedWidth(): number;

  /**
   * Gets the fixed width of the strip. This is the maximum allowable width
   * for any rectangle to be inserted. All rectangles must have width ≤ this value.
   *
   * @readonly
   * @abstract
   * @type {number}
   */
  abstract get stripWidth(): number;

  /**
   * Inserts a new rectangle into the strip using the Best-Fit heuristic.
   *
   * Finds an optimal position for the rectangle by evaluating potential placements
   * and selecting the one that minimizes the increase to the overall packed height
   * of the strip. The placement is chosen based on which results in the best local
   * choice for minimizing global height increase.
   *
   * @abstract
   * @param {number} width - The width of the rectangle to insert. Must be ≤ stripWidth.
   * @param {number} height - The height of the rectangle to insert.
   * @returns {{ x: number; y: number }} The coordinates of the bottom-left corner of the placed rectangle.
   * @throws {Error} If the rectangle width exceeds the strip width.
   */
  abstract insert(width: number, height: number): IPlacementPoint;

  /**
   * Resets the packer to its initial empty state.
   * Clears all previously packed rectangles and internal state, preparing the
   * instance for a new packing sequence. After reset, packedHeight and packedWidth
   * will return 0.
   *
   * @abstract
   */
  abstract reset(): void;
}
