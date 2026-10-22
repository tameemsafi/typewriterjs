const isFunction = (value) => {
  return typeof value === 'function';
};

const isObject = (value) => {
  return value !== null && typeof value === 'object';
};

const areArraysEqual = (arrayA, arrayB) => {
  if(arrayA.length !== arrayB.length) {
    return false;
  }

  return arrayA.every((item, index) => areOptionsEqual(item, arrayB[index]));
};

const areObjectsEqual = (objectA, objectB) => {
  const keysA = Object.keys(objectA);
  const keysB = Object.keys(objectB);

  if(keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every(key => areOptionsEqual(objectA[key], objectB[key]));
};

const areOptionsEqual = (valueA, valueB) => {
  if(isFunction(valueA) && isFunction(valueB)) {
    return true;
  }

  if(Array.isArray(valueA) && Array.isArray(valueB)) {
    return areArraysEqual(valueA, valueB);
  }

  if(isObject(valueA) && isObject(valueB)) {
    return areObjectsEqual(valueA, valueB);
  }

  return valueA === valueB;
};

export default areOptionsEqual;
