import React from "react";
import Base from "./base";
import { Chart } from "bizcharts";
import DataSet from "@antv/data-set";
import ChinaProvince from "../consts/geo/china_province";

import { IProps } from "../interfaces/Chart";

class Map extends Base {
  constructor(props: IProps) {
    super(props);
  }

  interceptMap() {
    const { data } = this.props;
    let { features } = ChinaProvince;
    features = features.map((feature: any) => {
      const { properties } = feature;
      const matchData = data.find(
        (item: any) =>
          properties.id === item.id || item.name === properties.name
      );
      if (matchData) {
        feature = {
          ...matchData,
          ...feature,
          properties: {
            ...properties,
          },
        };
      }
      return feature;
    });
    return new DataSet.View().source(
      {
        ...ChinaProvince,
        features,
      },
      {
        type: "GeoJSON",
      }
    );
  }

  render() {
    let { data, chart = {}, className = "" } = this.props;
    const geoData = this.interceptMap();
    chart = this.preprocessConfig(chart);
    data = this.preprocessData(geoData);
    return (
      <div
        ref={(ele: HTMLDivElement) => this.refCallback(ele)}
        onContextMenu={(evt) => this.onContextMenu(evt)}
        className={`lst-chart-map ${className}`}
      >
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
          {this.getToolTip()}
          {this.getLegend()}
          {this.getGeom()}
          {this.getGuide()}
        </Chart>
      </div>
    );
  }
}

export default Map;
