import React from "react";
import styles from "./index.module.scss";
import {
  PlusOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import Uploader from "../Upload";
import CreatePage from "../CreatePage";

export default class extends React.Component<any, any> {
  state = {
    title: "标题",
    visible: false,
  };

  constructor(props: any) {
    super(props);
  }

  toggleAdd = () => {
    this.setState({
      visible: !this.state.visible,
    });
  };

  render() {
    const { visible } = this.state;
    return (
      <div className={styles.wrapper}>
        <div className={styles.uploader}>
          <div style={{ marginBottom: "16px", fontSize: "16px" }}>
            <ExclamationCircleOutlined
              style={{ marginRight: "8px", color: "#d0d021" }}
            />
            <span>如果还没有上传execel，请先上传；然后再去添加页面</span>
          </div>
          <Uploader />
        </div>
        <div>
          <div style={{ margin: "16px 0", fontSize: "16px" }}>
            <InfoCircleOutlined
              style={{ marginRight: "8px", color: "#13ce4d" }}
            />
            <span>请点击下方新增页面</span>
          </div>
          <div className={styles.add} onClick={this.toggleAdd}>
            <PlusOutlined
              className={styles.iconAdd}
              style={{ fontSize: "48px", color: "#40a9ff" }}
            />
          </div>
        </div>
        {visible && <CreatePage onClose={this.toggleAdd} />}
      </div>
    );
  }
}
