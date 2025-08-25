import { IPlacementPoint, IPlacementPointRotatable } from '../core';

export abstract class AbstractBestFitStripPack {
  abstract insert(width: number, height: number): IPlacementPoint;
  abstract reset(): void;
}

export abstract class AbstractBestFitStripPackRotatable extends AbstractBestFitStripPack {
  abstract insert(width: number, height: number): IPlacementPointRotatable;
}
