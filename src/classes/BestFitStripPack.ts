import { bestFitStripPack, IBestFitStripPack } from '../core';
import { AbstractBestFitStripPack } from './abstract';

/**
 * Implementation of the Best-Fit Strip Packing algorithm without rotation.
 *
 * This class provides a concrete implementation of the Best-Fit heuristic that
 * places rectangles in their original orientation only, finding the optimal
 * placement that minimizes the overall strip height.
 */
export class BestFitStripPack extends AbstractBestFitStripPack {
  /** Internal implementation instance. */
  readonly #instance: IBestFitStripPack;

  /**
   * Creates a new Best-Fit strip packing instance.
   *
   * @param stripWidth - The fixed width of the packing strip. Must be a positive number.
   * @throws `TypeError` if `stripWidth` is not a number.
   * @throws `RangeError` if `stripWidth` is not a positive number.
   */
  constructor(stripWidth: number) {
    super();
    this.#instance = bestFitStripPack.create(stripWidth);
  }

  /**
   * Gets the current total height of the packed strip.
   *
   * This represents the vertical space used by all placed rectangles
   * and is updated after each rectangle insertion.
   */
  get packedHeight() {
    return this.#instance.packedHeight;
  }

  /**
   * Gets the current total width of the packed strip.
   *
   * This represents the horizontal space used by all placed rectangles
   * and is updated after each rectangle insertion.
   */
  get packedWidth() {
    return this.#instance.packedWidth;
  }

  /**
   * Gets the fixed width of the strip.
   *
   * This is the maximum allowable width for any rectangle to be inserted.
   */
  get stripWidth() {
    return this.#instance.stripWidth;
  }

  /**
   * Inserts a rectangle into the strip at optimal position.
   *
   * Finds an optimal position for the rectangle by evaluating potential placements
   * and selecting the one that minimizes the increase to the overall packed height
   * of the strip. The placement is chosen based on which results in the best local
   * choice for minimizing global height increase.
   *
   * @param width - Rectangle width
   * @param height - Rectangle height
   * @returns Placement coordinates
   * @throws `TypeError` if `width` or `height` is not a number.
   * @throws `RangeError` if `width` or `height` value is not positive.
   * @throws `RangeError` if `width` is larger than strip width.
   */
  insert(width: number, height: number) {
    return bestFitStripPack.insert(this.#instance, width, height);
  }

  /**
   * Clears all rectangles and resets to initial state.
   */
  reset() {
    return bestFitStripPack.reset(this.#instance);
  }
}
