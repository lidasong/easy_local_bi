import { Pill } from "../interfaces/Pill";
import { isArray, getTypeof, isObject } from "./type";
import im from "./im";
import { IAxises } from "../interfaces/Chart";

const FormatStyle = {
  YYYY: (date: Date) => date.getFullYear(),
  MM: (date: Date) => alignWithZero(date.getMonth() + 1),
  DD: (date: Date) => alignWithZero(date.getDate()),
  hh: (date: Date) => alignWithZero(date.getHours()),
  mm: (date: Date) => alignWithZero(date.getMinutes()),
  ss: (date: Date) => alignWithZero(date.getSeconds()),
};

function alignWithZero(value: string | number, length = 2) {
  const alignWidth = length - ("" + value).length;
  return alignWidth > 0 ? Array(alignWidth).fill(0).join("") + value : value;
}

function formatTime(value: string | number | Date, formal = "") {
  try {
    value = new Date(value);
    let [date, time] = formal.split(" ");
    if (date.includes(":")) {
      time = date;
      date = "";
    }
    date = date
      ? date
          .split("-")
          .map((item: string) => {
            item = item.toUpperCase();
            const format: any = (FormatStyle as any)[item];
            return format(value);
          })
          .join("-")
      : "";
    time = time
      ? time
          .split(":")
          .map((item: string) => {
            item = item.toLowerCase();
            const format: any = (FormatStyle as any)[item];
            return format(value);
          })
          .join(":")
      : "";
    return date ? date + (time ? " " + time : "") : time;
  } catch (err) {
    console.error("can not format the data by time, please check the config");
    return value;
  }
}

function unique(data: any) {
  if (!isArray(data)) {
    return [];
  }
  return data.reduce(
    (result: any, item: any) => {
      const { cates, check } = result;
      if (!check[item]) {
        check[item] = true;
        cates.push(item);
      }
      return result;
    },
    {
      cates: [],
      check: {},
    }
  ).cates;
}

/**
 * 目前正则只支持最多三位小数的数值
 * @param value 输入需要格式化的数值
 */
export function formatWithThousandPlace(value: any) {
  if (isNaN(value) || value === null) {
    return value;
  }
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function cloneDeep(target: any): any {
  switch (getTypeof(target)) {
    case "object":
      return cloneObjectDeep(target);
    case "array":
      return cloneArrayDeep(target);
    default:
      return target;
  }
}

function cloneObjectDeep(target: any) {
  if (!isObject(target)) {
    return target;
  }
  const result: any = {};
  for (const key in target) {
    if (target.hasOwnProperty(key)) result[key] = cloneDeep(target[key]);
  }
  return result;
}

function cloneArrayDeep(target: any) {
  const result = [];
  for (let i = 0; i < target.length; i++) {
    result[i] = cloneDeep(target[i]);
  }
  return result;
}

function getFieldName(pill: any): string {
  if (typeof pill === "object") {
    const { name = "", field } = pill;
    return field || name;
  }
  return pill;
}

function getFieldAlias(pill: Pill): string {
  if (typeof pill === "object") {
    const { field, name = "", alias } = pill;
    return alias || field || name;
  }
  return pill;
}

function isTranpose(column: any) {
  return isDiscrete(column);
}

function isDimension(pill: Pill | undefined) {
  return pill && typeof pill === "object" && pill.type === "dimension";
}
function isMeasure(pill: Pill) {
  return pill && typeof pill === "object" && pill.type === "measure";
}

function equal(origin: any, contrast: any) {
  if (origin === contrast) {
    return true;
  }
  if (typeof origin !== "object" || typeof contrast !== "object") {
    return false;
  }
  const originKeys = Object.keys(origin);
  const contrastKeys = Object.keys(contrast);
  if (originKeys.length !== contrastKeys.length) {
    return false;
  }
  return !originKeys.some((key) => origin[key] !== contrast[key]);
}

function noop() {}

function isDuplex(column: IAxises | undefined) {
  return im.get(column, "1.duplex") === true;
}

function getChartType(chartType: any, config: any) {
  return isDuplex(config.column || config.row) ? "duplex" : chartType || "bar";
}

function isPie(type: string) {
  return ["pie", "ring"].includes(type);
}

function isDiscrete(pill: Pill | undefined) {
  const interpretation = im.get(pill, "interpretation");
  return (
    interpretation === "discrete" ||
    (interpretation === undefined && isDimension(pill))
  );
}

function isContinuous(pill: Pill) {
  const interpretation = im.get(pill, "interpretation");
  return (
    interpretation === "continuous" ||
    (interpretation === undefined && isMeasure(pill))
  );
}

export {
  formatTime,
  unique,
  cloneDeep,
  getFieldName,
  getFieldAlias,
  isTranpose,
  isDimension,
  isMeasure,
  equal,
  noop,
  getChartType,
  isPie,
  isDuplex,
  isDiscrete,
  isContinuous,
};
