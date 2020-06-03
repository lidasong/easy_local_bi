import React from "react";
import styles from "./index.module.scss";
import { DownOutlined } from "@ant-design/icons";
import { Row, Col, Menu, Dropdown } from "antd";

const typeMap = {
  string: "abc",
  number: "num",
  date: "date",
};

const aggr = {
  sum: "聚合",
  avg: "平均值",
  count: "计数",
  countd: "去重计数",
};

export default (props: any) => {
  const { field, dataType, type, dropdown, onChooseAggr } = props;
  return (
    <div className={`${styles.field} ${styles[type]}`}>
      <Row>
        <Col
          flex="1 0"
          style={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          <span style={{ marginRight: "4px" }}>
            {typeMap[dataType] || "und"}
          </span>
          <span>{field}</span>
        </Col>
        {dropdown && (
          <Col flex="16px">
            <Dropdown
              trigger="click"
              overlay={
                <Menu onClick={onChooseAggr}>
                  {Object.keys(aggr).map((key: string) => {
                    return <Menu.Item key={key}>{aggr[key]}</Menu.Item>;
                  })}
                </Menu>
              }
            >
              <DownOutlined />
            </Dropdown>
          </Col>
        )}
      </Row>
    </div>
  );
};
