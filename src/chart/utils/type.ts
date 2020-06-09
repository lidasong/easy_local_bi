export function getTypeof(value: any) {
  return Object.prototype.toString
    .call(value)
    .split(" ")[1]
    .slice(0, -1)
    .toLowerCase();
}

export function isSameType(target: any, contrast: any) {
  return getTypeof(target) === getTypeof(contrast);
}

export function isString(target: any) {
  return getTypeof(target) === "string";
}

export function isStrictObject(target: any) {
  return getTypeof(target) === "object";
}

export function isObject(target: any) {
  return typeof target === "object";
}

export function isNumber(target: any) {
  return getTypeof(target) === "number";
}

export function isArray(target: any) {
  return Array.isArray(target);
}

export function isFunction(target: any) {
  return typeof target === "function";
}
