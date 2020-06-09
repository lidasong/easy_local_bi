import {
  getFieldName,
  getFieldAlias,
  isDiscrete,
  isTranpose,
  getChartType,
  isPie,
} from "../utils";
import im from "../utils/im";
import { isArray } from "../utils/type";
import initConfig from "./initiate";
import { RADIUS } from "./consts";
import { Pill } from "../interfaces/Pill";
import { IGeom, ILegend, IConfig } from "../interfaces/Chart";
import {
  setFormat,
  getFormatter,
  setColorConfig,
  setGeomShape,
  setGeomAdjust,
  setGeomRealType,
  setLabelConfig,
  setSizeConfig,
  getFilter,
  setGeomToolTip,
  setChartPadding,
  setChartFilter,
  setAxisScale,
  setRealLegendPos,
} from "./tool";
class Reflex {
  config: any;
  setCoordConfig() {
    const { column, geom } = this.config;
    const isTranposed = isTranpose(column);
    const chartType = im.get(geom, "type");
    const radiusConfig = im.get(geom, "radiusConfig", 0.8);
    const isRing = chartType === "ring";
    this.config = {
      ...this.config,
      coord: {
        transpose: !!isTranposed,
        ...this.config.coord,
        ...(isRing ? { innerRadius: radiusConfig, radius: RADIUS } : {}),
        ...(isPie(chartType) ? { radius: RADIUS } : {}),
      },
    };
    return this;
  }
  setChartConfig() {
    this.config = setChartPadding(this.config);
    this.config = setChartFilter(this.config);
    return this;
  }
  setAxisConfig() {
    const { geom, coord, chart } = this.config;
    const { scale } = chart;
    const chartType = im.get(geom, "type");
    if (isPie(chartType)) {
      const angle = im.get(geom, "angle");
      this.config = {
        ...this.config,
        ...(angle ? { column: angle } : {}),
        geom: {
          ...geom,
          angle: undefined,
        },
      };
    }
    let { row = {}, column = {}, options } = this.config;
    let axisConfig = im.get(options, "axis", {});
    const scales: any = {};
    if (!isArray(row)) {
      row = [row];
    }
    if (!isArray(column)) {
      column = [column];
    }
    axisConfig = row
      .concat(column)
      .filter((pill: Pill) => !!getFieldName(pill))
      .reduce((axisConfig: {}, pill: Pill) => {
        const name = getFieldName(pill);
        const config = im.get(axisConfig, name, {});
        const { tickLine = null } = config;
        const label = im.get(config, "label", {});
        const format = im.get(label, "format");
        let filter = im.get(label, "filter");
        const formatter = format ? getFormatter(format) : null;
        scales[name] = setAxisScale(config);
        filter = filter ? getFilter(filter) : (value: string) => value;
        axisConfig = {
          ...axisConfig,
          [name]: {
            tickLine: tickLine,
            ...config,
            label: {
              ...label,
              ...(formatter
                ? {
                    formatter: (value: string) => {
                      value = filter(value);
                      return value ? formatter(value) : "";
                    },
                  }
                : {
                    formatter: (value: string) => {
                      return filter(value);
                    },
                  }),
              format: undefined,
            },
          },
        };
        return axisConfig;
      }, axisConfig);
    this.config = {
      ...this.config,
      chart: {
        ...chart,
        scale: {
          ...scale,
          ...Object.keys(scales).reduce((result: any, name: any) => {
            const axisScale = scales[name];
            if (im.get(Object.keys(axisScale), "length") === 0) {
              return result;
            }
            result[name] = {
              ...scale[name],
              ...axisScale,
            };
            return result;
          }, {}),
        },
      },
      options: {
        ...options,
        axis: axisConfig,
      },
    };
    const isTranposed = im.get(coord, "transpose");
    isTranposed &&
      (this.config = {
        ...this.config,
        row: im.get(this.config, "column"),
        column: im.get(this.config, "row"),
      });
    return this;
  }
  setGeomConfig() {
    let { geom = {}, row, column } = this.config;
    const { type: chartType } = geom;

    if (!isArray(geom)) {
      geom = [geom];
    }
    geom = geom.map((childGeom: IGeom, index: number) => {
      childGeom = setGeomShape(childGeom);
      childGeom = setGeomAdjust(childGeom);
      childGeom = setGeomToolTip(childGeom, { row, column }, index);
      childGeom = setGeomRealType(childGeom);
      childGeom = setLabelConfig(childGeom);
      childGeom = setSizeConfig(childGeom);
      return childGeom;
    });

    this.config = {
      type: getChartType(chartType, this.config),
      ...this.config,
      geom,
    };
    return this;
  }
  setTooltipConfig() {
    let { tooltip = {}, row = {}, column = {}, geom, coord } = this.config;
    const rowName = getFieldName(row);
    const colName = getFieldName(isArray(column) ? column[0] : column);
    const dimensions = [].concat(row, column).filter(isDiscrete);
    if (!isArray(geom)) {
      geom = [geom];
    }
    const showTitle =
      geom.every((childGeom: IGeom) => {
        const { color, label, detail, type: chartType } = childGeom;
        const geomFieldNames = [color]
          .concat(label, detail)
          .filter(isDiscrete)
          .map((item) => getFieldName(item));
        const isPerspective = dimensions
          .map((item) => getFieldName(item))
          .some((fieldName: string) => {
            return !geomFieldNames.includes(fieldName);
          });
        return (
          chartType !== "map" &&
          rowName &&
          colName &&
          dimensions.length &&
          geomFieldNames.length &&
          isPerspective
        );
      }) ||
      (isArray(column) && column.length > 1);
    const withCross = geom.some((childGeom: IGeom) => {
      return childGeom.type === "line" || childGeom.type === "area";
    });
    this.config = {
      ...this.config,
      tooltip: {
        showTitle: !!showTitle,
        ...(withCross
          ? { crosshairs: { type: (coord.transpose && "x") || "y" } }
          : {}),
        ...tooltip,
      },
    };
    return this;
  }
  setChartScale() {
    let {
      chart = {},
      chart: { scale = {} },
      row = {},
      column = {},
      geom,
    } = this.config;
    scale = {
      ...scale,
      ...(isArray(geom) ? geom : [geom]).reduce((result: any, geom: IGeom) => {
        const { color, size, shape, label, detail } = geom;
        [color, size, shape, label, detail]
          .filter((pill: any) => !!getFieldName(pill))
          .forEach((item: any) => {
            const name = getFieldName(item);
            const alias = getFieldAlias(item);
            name && (result[name] = { alias, ...scale[name] });
          });
        return result;
      }, {}),
      ...[]
        .concat(row, column)
        .filter((pill: Pill) => !!getFieldName(pill))
        .reduce((result: any, pill: Pill) => {
          const name = getFieldName(pill);
          const alias = getFieldAlias(pill);
          result[name] = {
            alias: alias,
            ...scale[name],
          };
          return result;
        }, {}),
    };
    this.config = {
      ...this.config,
      chart: {
        ...chart,
        scale,
      },
    };
    return this;
  }
  setLegendConfig() {
    let { geom = [], legend, chart } = this.config;
    if (!isArray(legend)) {
      legend = [legend];
    }
    if (!isArray(geom)) {
      geom = [geom];
    }
    let mergedLegend = geom.map((childGeom: IGeom, index: number) => {
      const { color } = childGeom;
      const legendItem = legend[index] || {};
      const colorName = getFieldName(color);
      if (colorName) {
        return {
          name: colorName,
          ...legendItem,
        };
      }
      return legendItem;
    });
    mergedLegend = mergedLegend
      .concat(legend.slice(mergedLegend.length))
      .filter((item: any) => !!item.name);
    const padding = im.get(chart, "padding").slice();
    if (mergedLegend.length) {
      mergedLegend
        .filter((item: ILegend) => item.visible)
        .map((item: ILegend) => item.position)
        .forEach((position: string) => {
          switch (position) {
            case "top":
              padding[0] += 60;
              break;
            case "right":
              padding[1] += 160;
              break;
            case "bottom":
              padding[2] += 60;
              break;
            case "left":
              padding[3] += 160;
              break;
          }
        });
      mergedLegend = mergedLegend.map((legend: ILegend) => {
        const position = im.get(legend, "position", "top");
        const isCenter = im.get(legend, "center", false);
        return {
          ...legend,
          position: setRealLegendPos(position, isCenter),
        };
      });
    }
    this.config = {
      ...this.config,
      chart: {
        ...chart,
        padding,
      },
      legend: mergedLegend,
    };
    return this;
  }
  setOptionsConfig() {
    this.config = setFormat(this.config);
    this.config = setColorConfig(this.config);
    return this;
  }
  setDataConfig() {
    const { measures, geom, data = [] } = this.config;
    const hasMValue = isArray(measures) && measures.length;
    const hasMName = (isArray(geom) ? geom : [geom]).some(
      (childGeom: IGeom) => {
        const { size, color, shape, label, detail } = childGeom;
        return [size, color, shape, label, detail].some(
          (pill) => getFieldName(pill) === "mName"
        );
      }
    );
    isArray(data) ||
      (this.config = {
        ...this.config,
        data: [],
      });
    if (hasMValue) {
      if (hasMName) {
        this.config = {
          ...this.config,
          data: data.reduce((result: any, item: any) => {
            result = result.concat(
              measures.map((measure: Pill) => {
                const name = getFieldName(measure);
                return {
                  ...item,
                  mName: getFieldAlias(measure),
                  mValue: item[name],
                };
              })
            );
            return result;
          }, []),
        };
      } else {
        this.config = {
          ...this.config,
          data: data.reduce((result: any, item: any) => {
            item.mValue = measures.reduce((acc: number, measure: Pill) => {
              const name = getFieldName(measure);
              return acc + item[name] || 0;
            }, 0);
            result.push(item);
            return result;
          }, []),
        };
      }
    }
    return this;
  }
  wrapReflex(config: IConfig) {
    config = initConfig(config);
    this.config = {
      ...config,
    };
    return this.setChartConfig()
      .setCoordConfig()
      .setAxisConfig()
      .setTooltipConfig()
      .setChartScale()
      .setLegendConfig()
      .setGeomConfig()
      .setDataConfig()
      .setOptionsConfig().config;
  }
}

export default new Reflex();
