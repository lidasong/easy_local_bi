import React from "react";
import styles from "./index.module.scss";
import { database, DEFAULT_OPTIONS } from "../../databases";
import { decode } from "../../utils";
import { Tree, Row, Col } from "antd";

export default class extends React.Component<any, any> {
  state = {
    nav: {} as any,
    topSelected: "",
    leftSelected: "",
  };

  constructor(props: any) {
    super(props);
    this.fetch();
  }

  async fetch() {
    const data = await database.query(
      `SELECT top, left FROM ${DEFAULT_OPTIONS.nav} limit 1`
    );
    const { top, left } = (data && data[0]) || {};
    this.setState({
      nav: {
        top: decode(top),
        left: decode(left),
      },
    });
  }

  onRightClickTop = ({ node }: any) => {
    const { key } = node;
  };

  selectTopMenu = (keys, info) => {
    this.setState({
      topSelected: keys[0],
    });
  };

  selectLeftMenu = (keys, info) => {
    this.setState({
      leftSelected: keys[0],
    });
  };

  render() {
    const { left = {}, top = {} } = this.state.nav;
    const { topSelected } = this.state;
    const { menus = [] } = top;
    const { map = {} } = left;
    const leftMenus = map[topSelected] || [];
    return (
      <div className={styles.wrapper}>
        <Row>
          <Col>
            <Tree
              onRightClick={this.onRightClickTop}
              onSelect={this.selectTopMenu}
              treeData={[
                {
                  title: "顶部导航栏",
                  key: "0",
                  children: menus.map((item) => ({ key: "random", ...item })),
                },
              ]}
            />
          </Col>
          <Col offset={2}>
            <Tree
              onSelect={this.selectLeftMenu}
              treeData={[
                {
                  title: "左侧导航栏",
                  key: "0",
                  children: leftMenus.map((item) => ({
                    key: "random",
                    ...item,
                  })),
                },
              ]}
            />
          </Col>
        </Row>
      </div>
    );
  }
}
