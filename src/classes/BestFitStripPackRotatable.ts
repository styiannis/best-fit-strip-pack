import { IBestFitStripPack } from '../core';
import { create, insert, reset } from '../core/best-fit-strip-pack-rotatable';
import { AbstractBestFitStripPackRotatable } from './abstract';

/**
 * Implementation of the Best-Fit Strip Packing algorithm with rotation support.
 *
 * This class provides a concrete implementation of the best-fit heuristic that
 * automatically considers both orientations of each rectangle (original and rotated)
 * to find the optimal placement that minimizes the overall strip height.
 */
export class BestFitStripPackRotatable extends AbstractBestFitStripPackRotatable {
  /** Internal implementation instance. */
  readonly #obj: IBestFitStripPack;

  /**
   * Creates a new best-fit strip packing instance with rotation support.
   *
   * @param stripWidth - The fixed width of the packing strip.
   * @throws `TypeError` if `stripWidth` is not a number.
   * @throws `RangeError` if `stripWidth` is not a positive number.
   */
  constructor(stripWidth: number) {
    super();
    this.#obj = create(stripWidth);
  }

  /**
   * Gets the current total height of the packed strip.
   *
   * This represents the vertical space used by all placed rectangles
   * and is updated after each rectangle insertion.
   */
  get packedHeight() {
    return this.#obj.packedHeight;
  }

  /**
   * Gets the current total width of the packed strip.
   *
   * This represents the horizontal space used by all placed rectangles
   * and is updated after each rectangle insertion.
   */
  get packedWidth() {
    return this.#obj.packedWidth;
  }

  /**
   * Gets the fixed width of the strip.
   *
   * This is the maximum allowable width for any rectangle to be inserted.
   */
  get stripWidth() {
    return this.#obj.stripWidth;
  }

  /**
   * Inserts a rectangle into the strip, considering both orientations.
   *
   * The algorithm evaluates both the original orientation (`width × height`) and
   * the rotated orientation (`height × width`) to determine which provides better
   * packing efficiency. The orientation and placement that results in the smallest
   * overall height increase is selected.
   *
   * @param width - Rectangle width
   * @param height - Rectangle height
   * @returns Placement coordinates and rotation flag.
   * @throws `TypeError` if `width` or `height` is not a number.
   * @throws `RangeError` if `width` or `height` value is not positive.
   * @throws `RangeError` if both `width` and `height` exceed the strip width.
   */
  insert(width: number, height: number) {
    return insert(this.#obj, width, height);
  }

  /**
   * Resets the instance to initial state.
   */
  reset() {
    return reset(this.#obj);
  }
}
