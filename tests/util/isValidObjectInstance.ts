import { arraysEqual } from './arraysEqual';

function isValidHeapObjectInstance(
  instance: any,
  instanceType: 'min-heap' | 'min-heap-node'
) {
  const propNames = Object.getOwnPropertyNames(instance).sort();

  if (instanceType === 'min-heap') {
    return (
      Array.isArray(instance) && arraysEqual(propNames, ['indices', 'length'])
    );
  }

  return (
    'object' === typeof instance &&
    Object.prototype === Object.getPrototypeOf(instance) &&
    arraysEqual(propNames, ['key', 'listNode'])
  );
}

function isValidListObjectInstance(
  instance: any,
  instanceType: 'doubly-list' | 'doubly-list-node'
) {
  if (
    'object' !== typeof instance ||
    Object.prototype !== Object.getPrototypeOf(instance)
  ) {
    return false;
  }

  const propNames = Object.getOwnPropertyNames(instance).sort();

  return instanceType === 'doubly-list'
    ? arraysEqual(propNames, ['head', 'size', 'tail'])
    : arraysEqual(propNames, ['heapNode', 'next', 'previous', 'width', 'x']);
}

function isValidPointObjectInstance(
  instance: any,
  instanceType: 'placement-point' | 'placement-point-rotatable'
) {
  if (
    'object' !== typeof instance ||
    Object.prototype !== Object.getPrototypeOf(instance)
  ) {
    return false;
  }

  const propNames = Object.getOwnPropertyNames(instance).sort();

  return instanceType === 'placement-point'
    ? arraysEqual(propNames, ['x', 'y'])
    : arraysEqual(propNames, ['rotated', 'x', 'y']);
}

function isValidPositionObjectInstance(instance: any) {
  const propNames = Object.getOwnPropertyNames(instance).sort();
  return (
    'object' === typeof instance &&
    Object.prototype === Object.getPrototypeOf(instance) &&
    arraysEqual(propNames, ['action', 'firstNode', 'lastNode', 'x', 'y'])
  );
}

function isValidStripPackObjectInstance(instance: any) {
  const propNames = Object.getOwnPropertyNames(instance).sort();
  return (
    'object' === typeof instance &&
    Object.prototype === Object.getPrototypeOf(instance) &&
    arraysEqual(propNames, [
      'heap',
      'list',
      'packedHeight',
      'packedWidth',
      'stripWidth',
    ])
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
  if (instanceType === 'min-heap' || instanceType === 'min-heap-node') {
    return isValidHeapObjectInstance(instance, instanceType);
  }

  if (instanceType === 'doubly-list' || instanceType === 'doubly-list-node') {
    return isValidListObjectInstance(instance, instanceType);
  }

  if (
    instanceType === 'placement-point' ||
    instanceType === 'placement-point-rotatable'
  ) {
    return isValidPointObjectInstance(instance, instanceType);
  }

  if (instanceType === 'fit-position') {
    return isValidPositionObjectInstance(instance);
  }

  return isValidStripPackObjectInstance(instance);
}
