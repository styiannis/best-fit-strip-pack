export const arraysEqual = (first: any[], second: any[]) =>
  first.length === second.length &&
  first.every((value, i) => value === second[i]);
