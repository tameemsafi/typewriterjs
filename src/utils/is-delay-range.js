/**
 * Check if a value is a delay range such as { min: 50, max: 100 }
 *
 * @param {Mixed} value Value to check
 * @return {Boolean}
 */
const isDelayRange = (value) => {
  if(value === null || typeof value !== 'object') {
    return false;
  }

  return typeof value.min === 'number' && typeof value.max === 'number';
};

export default isDelayRange;
