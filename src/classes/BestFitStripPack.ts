import { bestFitStripPack, IBestFitStripPack } from '../core';
import { AbstractBestFitStripPack } from './abstract';

export class BestFitStripPack extends AbstractBestFitStripPack {
  readonly #packer: IBestFitStripPack;

  constructor(stripWidth: number) {
    super();
    this.#packer = bestFitStripPack.create(stripWidth);
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
    return bestFitStripPack.insert(this.#packer, width, height);
  }

  reset() {
    return bestFitStripPack.reset(this.#packer);
  }
}
