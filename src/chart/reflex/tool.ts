import {
  formatTime,
  unique,
  formatWithThousandPlace,
  getFieldName,
  isDiscrete,
  isContinuous,
  isTranpose,
  isDuplex,
  equal,
  isPie,
} from "../utils";
import im from "../utils/im";
import { isArray, isFunction } from "../utils/type";
import { G2 } from "bizcharts";
import { IFormatter, IFilter } from "../interfaces/Formatter";
import {
  MARGIN_RATIO,
  CHART_MAPPING,
  CHART_PADDING_MAP,
  LEGEND_POSITION,
} from "./consts";
import { IGeom, IConfig } from "../interfaces/Chart";
const {
  colors: baseColors,
  colors_16,
  colors_24,
  colors_pie: pieBaseColors,
  colors_pie_16,
} = G2.Global;
const DEFAULT_COLOR = im.get(G2.Global, "defaultColor", "#1890FF");
const DEFAULT_CONTINUOUS_COLOR = [DEFAULT_COLOR, "#0050B3"].join("-");
export function setFormat(config: any) {
  let {
    options,
    chart,
    chart: { scale = {} },
  } = config;
  const { formatMap = {} } = options;
  Object.keys(formatMap).forEach((field) => {
    const format = formatMap[field] || {};
    const formatter = getFormatter(format);
    scale = {
      ...scale,
      [field]: {
        formatter,
        ...scale[field],
      },
    };
    config = {
      ...config,
      chart: {
        ...chart,
        scale,
      },
    };
  });
  return config;
}

export function getFormatter({
  type,
  decimalPlace,
  thousandPlace,
  divider,
  multiple = 1,
  prefix = "",
  suffix = "",
  formal = "",
  format,
}: IFormatter) {
  let formatter;
  switch (type) {
    case "num":
      formatter = (value: any) => {
        value = multiple * value;
        value = divider ? value / divider : value;
        value =
          typeof decimalPlace === "number"
            ? value.toFixed(decimalPlace)
            : value;
        value = thousandPlace ? formatWithThousandPlace(value) : value;
        value = prefix ? prefix + value : value;
        value = suffix ? value + suffix : value;
        return value;
      };
      break;
    case "str":
      formatter = (value: any) => {
        value = prefix ? prefix + value : value;
        value = suffix ? value + suffix : value;
        return value;
      };
      break;
    case "time":
      formatter = (value: any) => {
        return formatTime(value, formal);
      };
      break;
    case "percent":
      formatter = (value: any) => {
        value *= 100;
        value =
          typeof decimalPlace === "number"
            ? value.toFixed(decimalPlace)
            : value;
        value += "%";
        return value;
      };
      break;
    case "custom":
      isFunction(format) && (formatter = format);
      break;
    default:
      formatter = (value: any) => value;
      break;
  }
  return formatter;
}

export function setColorConfig(config: any) {
  let { geom = [], options, data } = config;
  geom = geom.map((geom: any = {}) => {
    const { color } = geom;
    const colorFiledName = getFieldName(color);
    const isContinuousColor = isContinuous(color);
    const chartType = im.get(geom, "type");
    let colorConfig = im.get(geom, "colorConfig");
    colorConfig =
      colorConfig || (isContinuousColor ? DEFAULT_CONTINUOUS_COLOR : "");
    const { colorConfigMap = {} } = options;
    const colorMap = im.get(colorConfigMap, colorFiledName);
    let colors = [];
    if (colorFiledName && colorMap) {
      const colorCategories = unique(
        data.map((item: any) => item[colorFiledName])
      );
      const catesLen = colorCategories.length;
      let defaultColors: any;
      if (chartType === "pie") {
        defaultColors = catesLen > 8 ? colors_pie_16 : pieBaseColors;
      } else {
        defaultColors =
          catesLen > 16 ? colors_24 : catesLen > 8 ? colors_16 : baseColors;
      }
      const defaultColorsLen = defaultColors.length;
      colors = colorCategories.map((cate: string, index: number) => {
        const color = colorMap[cate];
        if (color) {
          return color;
        }
        return defaultColors[index % defaultColorsLen];
      });
    }
    return {
      ...geom,
      color: colors.length
        ? [colorFiledName, colors]
        : colorFiledName && colorConfig
        ? [colorFiledName, colorConfig]
        : colorFiledName
        ? colorFiledName
        : colorConfig,
      colorConfig: undefined,
    };
  });
  return {
    ...config,
    geom,
  };
}

export function setGeomShape(geom: any) {
  const shape = getFieldName(geom.shape);
  if (geom.smooth) {
    return {
      shape: "smooth",
      ...geom,
      ...(shape ? { shape } : {}),
    };
  }
  return {
    ...geom,
    ...(shape ? { shape } : {}),
  };
}

export function setGeomAdjust(geom: any) {
  const { type: chartType } = geom;
  if (["barStack", "barAlign"].includes(chartType)) {
    const { adjust = {} } = geom;
    const isStack = chartType === "barStack";
    geom = {
      ...geom,
      adjust: {
        type: isStack ? "stack" : "dodge",
        marginRatio: MARGIN_RATIO,
        ...adjust,
      },
    };
    geom.adjust = {
      type: isStack ? "stack" : "dodge",
      marginRatio: MARGIN_RATIO,
      ...adjust,
    };
  }
  return geom;
}

export function setGeomRealType(geom: IGeom) {
  const { type: chartType = "auto" } = geom;
  const realChartType = (CHART_MAPPING as any)[chartType] || chartType;
  geom = {
    ...geom,
    type: realChartType,
  };
  return geom;
}

export function setLabelConfig(geom: IGeom) {
  const { labelConfig } = geom;
  const filter = im.get(labelConfig, "filter");
  if (!filter) {
    return geom;
  }
  const formatter = getFilter(filter);
  return {
    ...geom,
    labelConfig: {
      ...labelConfig,
      formatter,
    },
  };
}

export function setSizeConfig(geom: any) {
  const { size, sizeConfig } = geom;
  const sizeName = getFieldName(size);
  if (sizeName) {
    return {
      ...geom,
      size: sizeConfig ? [sizeName, sizeConfig] : sizeName,
    };
  }
  if (sizeConfig) {
    return {
      ...geom,
      size: sizeConfig,
    };
  }
  return geom;
}

export function getFilter(filter: IFilter) {
  const { inclusion = [], exclusion = [] } = im.get(filter, "normal", {});
  let formatter;
  if (inclusion.length && exclusion.length) {
    console.error("inclusion and exclusion can not set at the same time");
    return formatter;
  }
  if (inclusion.length) {
    formatter = (value: any) => (inclusion.includes(value) ? value : "");
  }
  if (exclusion.length) {
    formatter = (value: any) => (!exclusion.includes(value) ? value : "");
  }
  return formatter;
}

export function setChartPadding(config: IConfig) {
  const { chart = {}, column, geom } = config;
  const isTranposed = isTranpose(column);
  const isDuplexed = isDuplex(column);
  const chartType = im.get(geom, "type");
  const { padding } = chart;
  let contrastPadding = CHART_PADDING_MAP.DEFAULT;
  if (equal(padding, contrastPadding)) {
    if (isPie(chartType)) {
      contrastPadding = CHART_PADDING_MAP.PIE;
      config = {
        ...config,
        chart: {
          ...chart,
          padding: [...contrastPadding],
        },
      };
    }
    if (isDuplexed) {
      config = isTranposed
        ? {
            ...config,
            chart: {
              ...chart,
              padding: [80, 20, 80, 40],
            },
          }
        : {
            ...config,
            chart: {
              ...chart,
              padding: [20, 80, 40, 80],
            },
          };
    }
  }
  return config;
}

export function setChartFilter(config: IConfig): IConfig {
  const { chart = {} } = config;
  const { filter = {} } = chart;
  const chartFilters = Object.keys(filter).reduce(
    (result: any, key: string) => {
      const formatter = getFilter(filter[key]);
      formatter && result.push([key, formatter]);
      return result;
    },
    []
  );
  return chartFilters.length
    ? {
        ...config,
        chart: {
          ...chart,
          filter: chartFilters,
        },
      }
    : config;
}

export function setGeomToolTip(
  geom: IGeom,
  { row = {}, column = {} }: any,
  index: number
) {
  const rowName = getFieldName(row);
  const { color, size, shape, tooltip, label, detail, type: chartType } = geom;
  const isColumnMulti = isArray(column) && column.length > 1;
  const isRowMulti = isArray(row) && row.length > 1;
  const curCol = isArray(column) ? column[index] : column;
  const colName = getFieldName(curCol);
  const dimensions = [row, column].filter(isDiscrete);
  const isMap = chartType === "map";
  const geomFieldNames = [color]
    .concat(label, detail)
    .filter(isDiscrete)
    .map((item) => getFieldName(item));
  const isPerspective = dimensions
    .map((item) => getFieldName(item))
    .some((fieldName: string) => {
      return !geomFieldNames.includes(fieldName);
    });

  const withoutGeomToolTip =
    !isMap &&
    rowName &&
    colName &&
    dimensions.length &&
    geomFieldNames.length &&
    isPerspective;
  !withoutGeomToolTip &&
    (geom = {
      ...geom,
      tooltip:
        tooltip ||
        (chartType === "map"
          ? [detail, color, size, shape, label]
          : [row, curCol, detail, color, size, shape, label]
        )
          .sort((item) => {
            if (isDiscrete(item)) {
              return -1;
            } else if (isContinuous(item)) {
              return 1;
            }
            return 0;
          })
          .map((item) => getFieldName(item))
          .filter((item) => !!item)
          .filter(
            (item) => !isColumnMulti || (isColumnMulti && item !== rowName)
          )
          .filter((item) => !isRowMulti || (isRowMulti && item !== colName))
          .reduce((tips: any, tip: any) => {
            if (!tips.includes(tip)) {
              tips.push(tip);
            }
            return tips;
          }, [])
          .join("*"),
    });
  return geom;
}

export function setAxisScale(config: any) {
  return ["min", "max", "tickCount", "ticks", "tickInterval", "type"]
    .filter((item) => config[item] !== undefined)
    .reduce((result: any, item: string) => {
      result[item] = config[item];
      return result;
    }, {});
}

export function setRealLegendPos(position: "string", isCenter: "boolean") {
  if (isCenter && ["top", "bottom"].includes(position)) {
    return `${position}-center`;
  }
  return im.get(LEGEND_POSITION, position, LEGEND_POSITION.top);
}
