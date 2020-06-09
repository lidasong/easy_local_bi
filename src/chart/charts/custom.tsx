import React, { Component } from "react";

class Custom extends Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { data, className = "", Component, ...config } = this.props;
    if (!Component || typeof Component !== "function") {
      throw new Error("custom Component need to be setted");
    }
    return (
      <div className={`lst-chart-custom ${className}`}>
        <Component data={data} {...config} />
      </div>
    );
  }
}

export default Custom;
