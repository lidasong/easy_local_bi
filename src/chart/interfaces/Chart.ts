import { Pill, PillObject } from "./Pill";
import { IFilter } from "./Formatter";

export interface IProps {
  config: IConfig;
  type?: string;
}
export interface IConfig {
  chart?: IChart;
  row?: IAxises;
  column?: IAxises;
  legend?: ILegend | ILegend[];
  geom: IGeom | IGeom[];
  tooltip?: ITooltip;
  guide?: IGuide | IGuide[];
  hooks?: object;
  events?: object;
  coord?: ICoord;
  Component?: any;
  data: Data;
  options?: object;
}
export interface IGuide {
  region?: IRegion | IRegion[];
  html?: IHTML | IHTML[];
}
export interface IRegion {
  top?: boolean;
  start?: object | [];
  end?: object | [];
  style?: object;
}
export interface IHTML {
  html: string;
  position: object | [];
}
export interface ITooltip {
  title?: string;
  shared?: boolean;
  crosshairs?: object;
  showTitle?: boolean;
  visible?: boolean;
}
export interface IGeom {
  type?: string;
  adjust?: object;
  position?: string;
  color?: Pill;
  detail?: Pill;
  colorConfig?: string | object;
  shape?: Pill;
  angle?: Pill;
  size?: Pill | number;
  sizeConfig?: number;
  opacity?: Pill | number;
  tooltip?: boolean | Pill | Pill[];
  label?: Pill | Pill[];
  labelConfig?: object;
  point?: boolean | object;
  smooth?: boolean;
  active?: boolean;
  select?: boolean;
}

export interface ILegend {
  name?: string;
  visible?: boolean;
  position?: string;
  clickable?: boolean;
  hoverable?: boolean;
  center?: boolean;
}
export interface IChart {
  forceFit?: boolean;
  width?: number;
  height?: number;
  scale?: object;
  padding?: Array<string | number>;
  filter?: {
    [index: string]: IFilter;
  };
}

export interface Data {
  [index: number]: object;
}
export interface ICoord {
  scale?: [];
  reflect?: string | [];
  rotate?: number;
  innerRadius?: number;
  transpose?: boolean;
}

export type IAxisItem = PillObject;

export type IAxises = PillObject | PillObject[];
