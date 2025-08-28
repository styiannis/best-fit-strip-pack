import { IPlacementPoint } from '../../core/lib';

/**
 * Abstract base class for Best-Fit Strip Packing algorithm.
 */
export abstract class AbstractBestFitStripPack {
  /**
   * Current total height of the packed strip.
   */
  abstract get packedHeight(): number;

  /**
   * Current total width of the packed strip.
   */
  abstract get packedWidth(): number;

  /**
   * Fixed width of the strip.
   */
  abstract get stripWidth(): number;

  /**
   * Inserts a rectangle into the strip at optimal position.
   *
   * @param width - Rectangle width)
   * @param height - Rectangle height
   * @returns Placement coordinates
   */
  abstract insert(width: number, height: number): IPlacementPoint;

  /**
   * Clears all rectangles and resets to initial state.
   */
  abstract reset(): void;
}
