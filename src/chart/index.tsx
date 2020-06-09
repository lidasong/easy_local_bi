import React, { PureComponent } from "react";
import chartMap from "./charts";
import Register from "./register";
import reflex from "./reflex";
import { IProps } from "./interfaces/Chart";
import ErrorBoundary from "./auxiliary/ErrorBoundary";
import Placeholder from "./auxiliary/ErrorBoundary/Placeholder";
import BizCharts, { G2 } from "bizcharts";
import im from "./utils/im";
import WithoutChart from "./auxiliary/WithoutChart";

const register = new Register();

class Chart extends PureComponent<IProps, {}> {
  static setTheme: (_: any) => void;
  static register = register;

  afterRender() {
    let hooks: any;
    const { config } = this.props;
    hooks = (config && config.hooks) || {};
    hooks.afterRender && hooks.afterRender(config);
  }

  componentDidUpdate() {
    this.afterRender();
  }

  componentDidMount() {
    this.afterRender();
  }

  beforeRender() {
    let hooks: any;
    const { config } = this.props;
    hooks = (config && config.hooks) || {};
    hooks.beforeRender && hooks.beforeRender(config);
  }

  render() {
    const { type: registerType, config } = this.props;
    const { type, ...wrapConfig } = !registerType
      ? reflex.wrapReflex(config)
      : this.props;
    try {
      const chartType: any = (chartMap as any)[type];
      const Chart = chartType || register.get(registerType || type);
      if (!Chart) {
        return <WithoutChart height={im.get(wrapConfig, "chart.height")} />;
      }
      this.beforeRender();
      return (
        <ErrorBoundary>
          <Chart type={type || registerType} {...wrapConfig} />
        </ErrorBoundary>
      );
    } catch (e) {
      return <Placeholder height={im.get(wrapConfig, "chart.height")} />;
    }
  }
}

Object.assign(Chart, {
  ...BizCharts,
});

Chart.setTheme({
  tooltip: {
    "g2-tooltip": {
      backgroundColor: "rgba(0, 0, 0, 0.65)",
      color: "#fff",
      top: 0,
      left: 0,
    },
  },
});

export default Chart;
