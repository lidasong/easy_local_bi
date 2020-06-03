import React from "react";
import { Row, Col } from "antd";
import styles from "./index.module.scss";

const axisType = {
  row: "X轴",
  column: "Y轴",
};

export default (props: any) => {
  const { type, children } = props;
  return (
    <Row className={styles.axis}>
      <Col flex="64px" className={styles.type}>
        {axisType[type]}
      </Col>
      <Col flex="1" className={styles.fields}>
        {children}
      </Col>
    </Row>
  );
};
