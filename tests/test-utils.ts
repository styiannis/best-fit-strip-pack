function arraysAreIdentical(first: any[], second: any[]) {
  return (
    first.length === second.length &&
    first.every((value, i) => value === second[i])
  );
}

export function isValidObjectInstance(
  instance: any,
  objectType:
    | 'best-fit-strip-pack'
    | 'doubly-list'
    | 'doubly-list-node'
    | 'doubly-list-node-value'
    | 'fit-position'
    | 'min-heap'
    | 'min-heap-node'
    | 'placement-point'
    | 'placement-point-rotatable'
) {
  if (objectType === 'min-heap') {
    if (!Array.isArray(instance)) {
      return false;
    }
  } else {
    if (
      'object' !== typeof instance ||
      Object.prototype !== Object.getPrototypeOf(instance)
    ) {
      return false;
    }
  }

  const propertyNames = Object.getOwnPropertyNames(instance).sort();

  if (objectType === 'doubly-list') {
    return arraysAreIdentical(propertyNames, ['head', 'size', 'tail']);
  }

  if (objectType === 'doubly-list-node') {
    return arraysAreIdentical(propertyNames, [
      'heapNode',
      'next',
      'previous',
      'value',
    ]);
  }

  if (objectType === 'doubly-list-node-value') {
    return arraysAreIdentical(propertyNames, ['width', 'x']);
  }

  if (objectType === 'fit-position') {
    return arraysAreIdentical(propertyNames, [
      'action',
      'firstNode',
      'lastNode',
      'x',
      'y',
    ]);
  }

  if (objectType === 'min-heap') {
    return arraysAreIdentical(propertyNames, ['indices', 'length']);
  }

  if (objectType === 'min-heap-node') {
    return arraysAreIdentical(propertyNames, ['key', 'listNode']);
  }

  if (objectType === 'placement-point') {
    return arraysAreIdentical(propertyNames, ['x', 'y']);
  }

  if (objectType === 'placement-point-rotatable') {
    return arraysAreIdentical(propertyNames, ['rotated', 'x', 'y']);
  }

  if (objectType === 'best-fit-strip-pack') {
    return arraysAreIdentical(propertyNames, [
      'heap',
      'list',
      'packedHeight',
      'packedWidth',
      'stripWidth',
    ]);
  }

  return false;
}
