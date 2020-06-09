import React from "react";

export default function (props: {
  height?: number;
  placeholder?: React.ReactNode;
}) {
  const { height = 300, placeholder = "没有对应的图表类型" } = props;
  return (
    <div
      style={{
        height: `${height}px`,
        lineHeight: `${height}px`,
        textAlign: "center",
        color: "#999",
        fontSize: "16px",
      }}
    >
      {placeholder}
    </div>
  );
}
