export const getDataType = (value: any): string => {
  return Object.prototype.toString.call(value).slice(8, -1);
};

export const isDate = (date: any) => {
  return getDataType(date) === "Date";
};

export const encode = (val: any) => {
  if (typeof val === "object") {
    val = JSON.stringify(val);
  }
  return encodeURIComponent(val);
};

export const decode = (val = "") => {
  try {
    val = decodeURIComponent(val);
    return JSON.parse(val);
  } catch (err) {
    return;
  }
};
