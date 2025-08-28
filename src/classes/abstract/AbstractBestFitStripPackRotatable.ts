import { IPlacementPointRotatable } from '../../core/lib';
import { AbstractBestFitStripPack } from './AbstractBestFitStripPack';

/**
 * Abstract class for Best-Fit Strip Packing with rotation support.
 */
export abstract class AbstractBestFitStripPackRotatable extends AbstractBestFitStripPack {
  /**
   * Inserts a rectangle, considering both orientations.
   *
   * @param width - Rectangle width
   * @param height - Rectangle height
   * @returns Placement coordinates and rotation flag
   */
  abstract insert(width: number, height: number): IPlacementPointRotatable;
}
