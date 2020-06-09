import {
  isSameType,
  isStrictObject,
  isNumber,
  isArray,
  isObject,
  isString,
} from "./type";

export default {
  /**
   * 获取json对象中对应路径下的数据，switching传入，如果根据
   * path没有拿到或者拿到的类型不一致，使用switching对应的值
   * @example get({a:{b:{c:{d:1}}}}, 'a.b.c.d') === 1
   * @example get({a:{b:{c:{d:1}}}}, 'a.c.b.d') === undefined
   * @example get({a:{b:{c:{d:1}}}}, 'a.b.c.d', '1') === '1'
   */
  get(target: any, path: string, switching?: any) {
    if (!isString(path)) {
      return target;
    }
    const pathes = path.split(".");
    for (path of pathes) {
      if (target && typeof target === "object") {
        target = target[path];
        continue;
      }
      target = undefined;
      break;
    }
    if (target === undefined && switching !== undefined) {
      return switching;
    }
    if (switching !== undefined && !isSameType(target, switching)) {
      return switching;
    }
    return target;
  },

  /**
   * 设置json对象中对应路径下的数据
   * target = { a: 1, b: [2] }
   * @example im.set(target, 'a', 2).toEqual({a: 2})
   * @example im.set(target, '', 1).toEqual({a: 1})
   * @example im.set(target, 'b.1', 1).toEqual([2,1])
   */
  set(target: any, path: string, data: any) {
    if (!(path && isObject(target) && target)) {
      return target;
    }
    let next = target;
    const pathes = path.split(".");
    const len = pathes.length;
    for (let i = 0; i < len - 1; i++) {
      const path = pathes[i];
      if (!isStrictObject(next[path])) {
        next[path] = {};
      }
      next = next[path];
    }

    const last = pathes[len - 1];
    if (isArray(next[last]) && isNumber(last)) {
      next[last] = next[last].slice().splice(last, 1, data);
    } else {
      next[last] = data;
    }
    return target;
  },
};
