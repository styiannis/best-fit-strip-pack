import {
  AbstractBestFitStripPack,
  AbstractBestFitStripPackRotatable,
  BestFitStripPack,
  BestFitStripPackRotatable,
} from '../src/classes';

function arraysAreIdentical(first: any[], second: any[]) {
  return (
    first.length === second.length &&
    first.every((value, i) => value === second[i])
  );
}

export function isValidClassInstance(
  instance: any,
  instanceType: 'BestFitStripPack' | 'BestFitStripPackRotatable'
) {
  const propertyNames = Object.getOwnPropertyNames(instance).sort();

  if (
    !(
      'object' === typeof instance &&
      Object.getPrototypeOf(instance) !== Object.prototype &&
      arraysAreIdentical(propertyNames, [])
    )
  ) {
    return false;
  }

  if (instanceType === 'BestFitStripPack') {
    return (
      instance instanceof BestFitStripPack &&
      instance instanceof AbstractBestFitStripPack &&
      Object(instance) instanceof BestFitStripPack &&
      Object(instance) instanceof AbstractBestFitStripPack &&
      Object.getPrototypeOf(instance) === BestFitStripPack.prototype &&
      Object.getPrototypeOf(instance) !== AbstractBestFitStripPack.prototype
    );
  }

  return (
    instance instanceof BestFitStripPackRotatable &&
    instance instanceof AbstractBestFitStripPackRotatable &&
    Object(instance) instanceof BestFitStripPackRotatable &&
    Object(instance) instanceof AbstractBestFitStripPackRotatable &&
    Object.getPrototypeOf(instance) === BestFitStripPackRotatable.prototype &&
    Object.getPrototypeOf(instance) !==
      AbstractBestFitStripPackRotatable.prototype
  );
}

export function isValidObjectInstance(
  instance: any,
  instanceType:
    | 'best-fit-strip-pack'
    | 'doubly-list'
    | 'doubly-list-node'
    | 'fit-position'
    | 'min-heap'
    | 'min-heap-node'
    | 'placement-point'
    | 'placement-point-rotatable'
) {
  if (instanceType === 'min-heap') {
    if (!Array.isArray(instance)) {
      return false;
    }
  } else if (
    'object' !== typeof instance ||
    Object.prototype !== Object.getPrototypeOf(instance)
  ) {
    return false;
  }

  const propertyNames = Object.getOwnPropertyNames(instance).sort();

  if (instanceType === 'best-fit-strip-pack') {
    return arraysAreIdentical(propertyNames, [
      'heap',
      'list',
      'packedHeight',
      'packedWidth',
      'stripWidth',
    ]);
  }

  if (instanceType === 'doubly-list') {
    return arraysAreIdentical(propertyNames, ['head', 'size', 'tail']);
  }

  if (instanceType === 'doubly-list-node') {
    return arraysAreIdentical(propertyNames, [
      'heapNode',
      'next',
      'previous',
      'width',
      'x',
    ]);
  }

  if (instanceType === 'fit-position') {
    return arraysAreIdentical(propertyNames, [
      'action',
      'firstNode',
      'lastNode',
      'x',
      'y',
    ]);
  }

  if (instanceType === 'min-heap') {
    return arraysAreIdentical(propertyNames, ['indices', 'length']);
  }

  if (instanceType === 'min-heap-node') {
    return arraysAreIdentical(propertyNames, ['key', 'listNode']);
  }

  if (instanceType === 'placement-point') {
    return arraysAreIdentical(propertyNames, ['x', 'y']);
  }

  if (instanceType === 'placement-point-rotatable') {
    return arraysAreIdentical(propertyNames, ['rotated', 'x', 'y']);
  }

  return false;
}
