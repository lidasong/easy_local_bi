import React from "react";
import Base from "./base";
import { Chart } from "bizcharts";
import { IProps } from "../interfaces/Chart";
class Pie extends Base {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    let { data, chart = {}, className = "" } = this.props;
    chart = this.preprocessConfig(chart);
    data = this.preprocessData(data);
    return (
      <div
        ref={(ele: HTMLDivElement) => this.refCallback(ele)}
        onContextMenu={(evt) => this.onContextMenu(evt)}
        className={`lst-chart-pie ${className}`}
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
          {this.getCoord("pie")}
          {this.getToolTip()}
          {this.getLegend()}
          {this.getGeom()}
          {this.getGuide()}
        </Chart>
      </div>
    );
  }
}

export default Pie;
