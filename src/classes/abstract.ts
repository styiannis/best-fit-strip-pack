import { IPlacementPoint, IPlacementPointRotatable } from '../core/lib';

export abstract class AbstractBestFitStripPack {
  abstract get packedHeight(): number;
  abstract get packedWidth(): number;
  abstract get stripWidth(): number;
  abstract insert(width: number, height: number): IPlacementPoint;
  abstract reset(): void;
}

export abstract class AbstractBestFitStripPackRotatable extends AbstractBestFitStripPack {
  abstract insert(width: number, height: number): IPlacementPointRotatable;
}
