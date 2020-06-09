import im from "./im";

function getStyle(dom: HTMLElement, name: any, defaultValue?: number) {
  try {
    if (window.getComputedStyle) {
      return window.getComputedStyle(dom, null)[name];
    }
    return im.get(dom, `currentStyle.${name}`);
  } catch (e) {
    if (defaultValue !== null) {
      return defaultValue;
    }
    return null;
  }
}

export function getWidth(el: any, defaultValue?: any) {
  let width = getStyle(el, "width", defaultValue);
  if (width === "auto") {
    width = el.offsetWidth;
  }
  return parseFloat(width);
}
