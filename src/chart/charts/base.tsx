import React, { Component } from "react";
import * as BizCharts from "bizcharts";
import { IAxisItem, IGeom, IAxises, IChart } from "../interfaces/Chart";
import im from "../utils/im";
import { getFieldName } from "../utils";
import { getWidth } from "../utils/dom";
import { isFunction } from "../utils/type";
const { Chart, Geom, Axis, Tooltip, Coord, Label, Legend, Guide } = BizCharts;

const { Html, Region } = Guide;
const DEFAULT_POINT = {
  shape: "circle",
  size: 4,
};

class Base extends Component<any, any> {
  chart: any;
  container?: HTMLDivElement;
  state = {
    width: 0,
  };
  constructor(props: any) {
    super(props);
  }

  refCallback(container: HTMLDivElement) {
    this.container = container;
  }

  componentDidMount() {
    const container = this.container;
    container &&
      this.setState({
        width: getWidth(container),
      });
  }

  getCoord(type: string) {
    const { row, column, coord = {} } = this.props;
    if (type === "pie" || type === "ring") {
      type = getFieldName(row) && getFieldName(column) ? "polar" : "theta";
    } else {
      type = "rect";
    }
    return <Coord type={type} {...coord} />;
  }

  getAxisOf(which = "row") {
    const { row, column, options = {} } = this.props;
    let curAxis = which === "row" ? row : (column as IAxises),
      axises: string[] = [];
    if (!Array.isArray(curAxis)) {
      curAxis = [curAxis];
    }
    return curAxis
      .filter((itemAxis: IAxisItem) => {
        const name = getFieldName(itemAxis);
        if (name && !axises.includes(name)) {
          axises.push(name);
          return true;
        }
        return false;
      })
      .map((itemAxis: IAxisItem) => {
        const name = getFieldName(itemAxis);
        const config = im.get(options, `axis.${name}`);
        return <Axis name={name} {...config} key={name} />;
      });
  }

  getToolTip() {
    const { tooltip = {} } = this.props;
    const { visible = true, ...config } = tooltip;
    return visible ? <Tooltip {...config} /> : null;
  }

  getGuide() {
    const { guide } = this.props;
    if (guide) {
      return (
        <Guide>
          {this.getGuideRegion()}
          {this.getGuideHtml()}
        </Guide>
      );
    }
    return null;
  }

  getGuideRegion() {
    const { guide = {} } = this.props;
    let { region } = guide;
    if (!region) {
      return;
    }
    if (!Array.isArray(region)) {
      region = [region];
    }
    return region.map((item: any, index: number) => {
      return <Region key={`region_${index}`} {...item} />;
    });
  }

  getGuideHtml() {
    const { guide = {} } = this.props;
    let { html } = guide;
    if (!html) {
      return;
    }
    if (!Array.isArray(html)) {
      html = [html];
    }
    return html.map((item: any, index: number) => {
      return <Html key={`html_${index}`} {...item} />;
    });
  }

  getLabel(geom: IGeom) {
    let { label, labelConfig = {} } = geom;
    let content: string;
    if (!label) {
      return null;
    }
    if (typeof label === "object") {
      label = Array.isArray(label) ? label : [label];
      content = label
        .map(({ field, name, content }: any) => field || name || content)
        .join("*");
    } else {
      content = label;
    }
    return <Label content={content} {...labelConfig} />;
  }

  getLegend() {
    const { legend = [], data = [] } = this.props;
    if (data.length === 0) {
      return null;
    }
    return legend.map((item: any) => {
      return <Legend key={item.name} {...item} />;
    });
  }

  getGeom() {
    let { geom } = this.props;
    if (!Array.isArray(geom)) {
      geom = [geom];
    }
    return geom.reduce((result: IGeom[], childGeom: IGeom, index: number) => {
      const pointGeom = this.processLineWithPoint(childGeom);
      if (pointGeom) {
        result.push(this.getGeomBase(pointGeom, index));
      }
      result.push(this.getGeomBase(childGeom, index));
      return result;
    }, []);
  }

  processLineWithPoint(geom: IGeom) {
    let { point = {}, ...geomBase } = geom;
    const { smooth } = geomBase;
    geomBase = {
      ...geomBase,
      shape: smooth ? "smooth" : "",
    };
    const hasPointConfig = !!Object.keys(point).length;
    const withPoint = typeof point === "boolean" ? point : hasPointConfig;
    let pointConfig = hasPointConfig
      ? {
          ...(point as {}),
        }
      : DEFAULT_POINT;
    pointConfig = {
      color: geomBase.color,
      tooltip: {
        visible: false,
      },
      ...pointConfig,
    };
    return withPoint
      ? {
          type: "point",
          ...pointConfig,
        }
      : null;
  }

  getGeomBase(geom: any, index: number) {
    let { row, column } = this.props;
    const { type } = geom;
    if (!Array.isArray(column)) {
      column = [column];
    }
    column = column[index] || column[0];
    const colName = getFieldName(column);
    const rowName = getFieldName(row);
    return (
      <Geom
        type={type}
        position={[rowName, colName].join("*")}
        key={[type, rowName, colName].join("*")}
        {...geom}
      >
        {this.getLabel(geom)}
      </Geom>
    );
  }

  preprocessConfig(chart: IChart) {
    const { hooks } = this.props;
    const { forceFit } = chart;
    if (forceFit && this.state.width) {
      chart.width = this.state.width;
    }
    if (hooks.preprocessConfig) {
      return hooks.preprocessConfig(chart);
    }
    return chart;
  }

  preprocessData(data: any) {
    const { hooks } = this.props;
    if (hooks.preprocessData) {
      return hooks.preprocessData(data);
    }
    return data;
  }

  onGetChartInstance(chart: any) {
    const { event } = this.props;
    const getInstance = im.get(event, "onGetG2Instance");
    isFunction(getInstance) && getInstance(chart);
    this.chart = chart;
  }

  onTooltipChange(evt: any) {
    const { event } = this.props;
    const changeTooltip = im.get(event, "onTooltipChange");
    isFunction(changeTooltip) && changeTooltip(evt);
  }

  onTooltipShow(evt: any) {
    const { event } = this.props;
    const showTooltip = im.get(event, "onTooltipShow");
    isFunction(showTooltip) && showTooltip(evt);
  }

  onTooltipHide(evt: any) {
    const { event } = this.props;
    const hideTooltip = im.get(event, "onTooltipHide");
    isFunction(hideTooltip) && hideTooltip(evt);
  }

  onPlotEnter(evt: any) {
    const { event } = this.props;
    const enterPlot = im.get(event, "onPlotEnter");
    isFunction(enterPlot) && enterPlot(evt);
  }

  onPlotMove(evt: any) {
    const { event } = this.props;
    const move = im.get(event, "onPlotMove");
    isFunction(move) && move(evt);
  }

  onPlotLeave(evt: any) {
    const { event } = this.props;
    const leavePlot = im.get(event, "onPlotLeave");
    isFunction(leavePlot) && leavePlot(evt);
  }

  onPlotClick(evt: any) {
    const { event } = this.props;
    const clickPlot = im.get(event, "onPlotClick");
    isFunction(clickPlot) && clickPlot(evt);
  }

  onPlotDblClick(evt: any) {
    const { event } = this.props;
    const dbClickPlot = im.get(event, "onPlotDblClick");
    isFunction(dbClickPlot) && dbClickPlot(evt);
  }

  onContextMenu(evt: any) {
    const { event } = this.props;
    const setContextMenu = im.get(event, "onContextMenu");
    evt.preventDefault();
    isFunction(setContextMenu) && setContextMenu(evt, this.chart);
  }

  getChartInstance() {
    return this.chart;
  }

  render() {
    let { type, data = [], chart = {}, className = "" } = this.props;
    const { width } = this.state;
    chart = this.preprocessConfig(chart);
    data = this.preprocessData(data);
    return (
      <div
        onContextMenu={(evt) => this.onContextMenu(evt)}
        className={`lst-chart-${type} ${className}`}
        ref={(ele: HTMLDivElement) => this.refCallback(ele)}
      >
        {width ? (
          <Chart
            data={data}
            {...chart}
            onGetG2Instance={(chart) => this.onGetChartInstance(chart)}
            onTooltipChange={(evt) => this.onTooltipChange(evt)}
            onTooltipShow={(evt) => this.onTooltipShow(evt)}
            onTooltipHide={(evt) => this.onTooltipHide(evt)}
            onPlotClick={(evt) => this.onPlotClick(evt)}
            onPlotDblClick={(evt) => this.onPlotDblClick(evt)}
            onPlotEnter={(evt) => this.onPlotEnter(evt)}
            onPlotMove={(evt) => this.onPlotMove(evt)}
            onPlotLeave={(evt) => this.onPlotLeave(evt)}
          >
            {this.getCoord(type)}
            {[this.getAxisOf("row"), this.getAxisOf("column")]}
            {this.getToolTip()}
            {this.getLegend()}
            {this.getGuide()}
            {this.getGeom()}
          </Chart>
        ) : null}
      </div>
    );
  }
}

export default Base;
