import { insert, reset } from '../core/best-fit-strip-pack-rotatable';
import { IBestFitStripPack, IDoublyList, IMinHeap } from '../core';
import { doublyList, minHeap } from '../core/lib';
import { validateStripWidth } from '../core/validators';
import { AbstractBestFitStripPackRotatable } from './abstract';

export class BestFitStripPackRotatable
  extends AbstractBestFitStripPackRotatable
  implements IBestFitStripPack
{
  heap: IMinHeap = minHeap.heap.create();
  list: IDoublyList = doublyList.list.create();
  packedHeight = 0;
  packedWidth = 0;

  constructor(public stripWidth: number) {
    super();
    validateStripWidth(stripWidth);
  }

  insert(width: number, height: number) {
    return insert(this, width, height);
  }

  reset() {
    return reset(this);
  }
}
