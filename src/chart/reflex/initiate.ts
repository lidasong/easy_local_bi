import im from "../utils/im";
import {
  DEFAULT_CONFIG,
  LEGEND_TOP_BOTTOM,
  LEGEND_COMMON_STYLE,
} from "./consts";
import { cloneDeep } from "../utils";
import { isArray, isObject } from "../utils/type";
import { ILegend } from "../interfaces/Chart";

function initConfig(initSetting: any = cloneDeep(DEFAULT_CONFIG)) {
  return function wrapConfig(config: any = {}, partSetting?: any) {
    partSetting = partSetting || initSetting;
    if (typeof partSetting !== "object") {
      return config;
    }
    Object.keys(partSetting).forEach((configKey) => {
      if (configKey === "legend") {
        let legends = im.get(config, "legend");
        !isArray(legends) && (legends = [legends]);
        legends = legends.map((legend: ILegend) => {
          const position = im.get(legend, "position", "top");
          switch (position) {
            case "top":
            case "bottom":
              return {
                ...partSetting[configKey],
                ...LEGEND_TOP_BOTTOM,
                ...LEGEND_COMMON_STYLE,
              };
              break;
            case "left":
            case "right":
              return {
                ...partSetting[configKey],
                offsetX: position === "right" ? 8 : -8,
                "g2-legend": {
                  "max-width": "160px",
                  "max-height": `${im.get(config, "chart.height")}px`,
                },
                ...LEGEND_COMMON_STYLE,
              };
              break;
          }
        });
        partSetting = {
          ...partSetting,
          [configKey]: legends.length > 1 ? legends : legends[0],
        };
      }
      if (configKey === "forceFit") {
        config = {
          ...config,
          forceFit: config.width === undefined,
        };
        return config;
      }
      if (typeof config[configKey] === "object" && config[configKey] !== null) {
        let wrapedConfig;
        if (isArray(config[configKey])) {
          wrapedConfig = config[configKey].map((item: any, index: number) => {
            if (isObject(item)) {
              const partSettingItem = isArray(partSetting[configKey])
                ? im.get(partSetting[configKey], String(index))
                : partSetting[configKey];
              return wrapConfig(item, partSettingItem);
            }
            return item;
          });
        } else {
          wrapedConfig = wrapConfig(config[configKey], partSetting[configKey]);
        }
        config = {
          ...config,
          [configKey]: wrapedConfig,
        };
        return config;
      }
      if (config[configKey] === undefined) {
        config = {
          ...config,
          [configKey]: partSetting[configKey],
        };
        return config;
      }
      if (
        typeof partSetting[configKey] === "object" &&
        partSetting[configKey] !== null
      ) {
        config = {
          ...config,
          [configKey]: {
            ...partSetting[configKey],
            ...config[configKey],
          },
        };
        return config;
      }
    });
    return config;
  };
}

export default initConfig();
