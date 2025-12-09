import {
  AbstractBestFitStripPack,
  AbstractBestFitStripPackRotatable,
  BestFitStripPack,
  BestFitStripPackRotatable,
} from '../../src/classes';

export function isValidClassInstance(
  instance: any,
  instanceType: 'BestFitStripPack' | 'BestFitStripPackRotatable'
) {
  const propertyNames = Object.getOwnPropertyNames(instance).sort();
  const proto = Object.getPrototypeOf(instance);

  if (
    'object' !== typeof instance ||
    proto === Object.prototype ||
    propertyNames.length !== 0
  ) {
    return false;
  }

  if (instanceType === 'BestFitStripPack') {
    return (
      instance instanceof BestFitStripPack &&
      instance instanceof AbstractBestFitStripPack &&
      Object(instance) instanceof BestFitStripPack &&
      Object(instance) instanceof AbstractBestFitStripPack &&
      proto === BestFitStripPack.prototype &&
      proto !== AbstractBestFitStripPack.prototype
    );
  }

  return (
    instance instanceof BestFitStripPackRotatable &&
    instance instanceof AbstractBestFitStripPackRotatable &&
    Object(instance) instanceof BestFitStripPackRotatable &&
    Object(instance) instanceof AbstractBestFitStripPackRotatable &&
    proto === BestFitStripPackRotatable.prototype &&
    proto !== AbstractBestFitStripPackRotatable.prototype
  );
}
