import { bestFitStripPackRotatable, IBestFitStripPack } from '../core';
import { AbstractBestFitStripPackRotatable } from './abstract';

export class BestFitStripPackRotatable extends AbstractBestFitStripPackRotatable {
  readonly #packer: IBestFitStripPack;

  constructor(stripWidth: number) {
    super();
    this.#packer = bestFitStripPackRotatable.create(stripWidth);
  }

  get packedHeight() {
    return this.#packer.packedHeight;
  }

  get packedWidth() {
    return this.#packer.packedWidth;
  }

  get stripWidth() {
    return this.#packer.stripWidth;
  }

  insert(width: number, height: number) {
    return bestFitStripPackRotatable.insert(this.#packer, width, height);
  }

  reset() {
    return bestFitStripPackRotatable.reset(this.#packer);
  }
}
