import React from "react";

export default (props: any = {}) => {
  const { height } = props;
  return (
    <div style={{ height, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          margin: "auto",
          height: "92px",
        }}
      >
        <h1 style={{ fontSize: "20px", padding: "16px 0" }}>初始化出错</h1>
        <p>请检查配置项是否正确</p>
      </div>
    </div>
  );
};
