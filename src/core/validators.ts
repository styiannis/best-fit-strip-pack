function validatePositiveNumericDimensions(width: number, height: number) {
  if (isNaN(width) || isNaN(height)) {
    throw new TypeError(
      `Both dimensions (${width}x${height}) should be numerical values.`
    );
  }

  if (0 >= width || 0 >= height) {
    throw new RangeError(
      `Both dimensions (${width}x${height}) should be greater than 0.`
    );
  }
}

export function validateDimensions(
  width: number,
  height: number,
  stripWidth: number
) {
  validatePositiveNumericDimensions(width, height);

  if (stripWidth < width) {
    throw new RangeError(
      `Width (${width}) should not exceed strip width (${stripWidth}).`
    );
  }
}

export function validateDimensionsRotatable(
  width: number,
  height: number,
  stripWidth: number
) {
  validatePositiveNumericDimensions(width, height);

  if (stripWidth < height && stripWidth < width) {
    throw new RangeError(
      `At least one of the dimensions (${width}x${height}) should not exceed strip width (${stripWidth}).`
    );
  }
}

export function validateStripWidth(stripWidth: number) {
  if (isNaN(stripWidth)) {
    throw new TypeError(
      `Strip width (${stripWidth}) should be numerical value.`
    );
  }

  if (0 >= stripWidth) {
    throw new RangeError(
      `Strip width value (${stripWidth}) should be greater than 0.`
    );
  }
}
