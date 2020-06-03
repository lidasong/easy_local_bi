import React from "react";
import styles from "./index.module.scss";
import Chart from "../../chart";
import Upload from "../Upload";
import { database } from "../../databases";
import { ExclamationCircleOutlined } from "antd";

export default class extends React.Component<any, any> {
  state = {
    count: 1,
    config: {} as any,
  };

  constructor(props: any) {
    super(props);
  }

  onClick = () => {
    this.setState({
      count: this.state.count + 1,
    });
  };

  render() {
    return (
      <div className={styles.wrapper}>
        {/* <div style={{ marginBottom: "16px", fontSize: "16px" }}>
          <ExclamationCircleOutlined
            style={{ marginRight: "8px", color: "#d0d021" }}
          />
          <span>如果还没有上传execel，请先上传；然后再去添加页面</span>
        </div> */}
        <Upload />
      </div>
    );
  }
}
