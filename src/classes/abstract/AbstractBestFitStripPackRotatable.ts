import { IPlacementPointRotatable } from '../../core/lib';
import { AbstractBestFitStripPack } from './AbstractBestFitStripPack';

/**
 * Abstract class extending the basic Best-Fit Strip Packing algorithm to support
 * rectangle rotation (swapping width and height) for potentially better space utilization.
 *
 * This variant will automatically consider both orientations of each rectangle
 * and choose the one that results in better packing efficiency according to the
 * Best-Fit heuristic.
 *
 * @abstract
 * @extends AbstractBestFitStripPack
 * @class AbstractBestFitStripPackRotatable
 */
export abstract class AbstractBestFitStripPackRotatable extends AbstractBestFitStripPack {
  /**
   * Inserts a new rectangle into the strip, considering both possible orientations.
   *
   * Evaluates both the original orientation (width × height) and the rotated
   * orientation (height × width) to determine which provides better packing
   * efficiency. For each orientation, the algorithm evaluates potential placements
   * based on which choice minimizes the increase to the overall packed height
   * of the strip. The orientation and placement that results in the smallest
   * overall height increase is selected.
   *
   * @abstract
   * @param {number} width - The width of the rectangle to insert. Must be ≤ stripWidth.
   * @param {number} height - The height of the rectangle to insert.
   * @returns {{ x: number; y: number; rotated: boolean }} The coordinates of the bottom-left corner
   *          and a flag indicating whether the rectangle was rotated (true) or not (false).
   * @throws {Error} If both the width and height exceed the strip width (making both orientations invalid).
   */
  abstract insert(width: number, height: number): IPlacementPointRotatable;
}
