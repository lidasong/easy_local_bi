import React from "react";
import styles from "./index.module.scss";
import { database } from "../../databases";
import Model from "../Model";
import { Steps, Button, message } from "antd";
import { Link } from "react-router-dom";
import CreatePage from "../CreatePage";
const { Step } = Steps;

export default class extends React.Component<any, any> {
  state = {
    visible: false,
    config: {} as any,
  };

  constructor(props: any) {
    super(props);
  }

  onTogglePage = () => {
    this.setState({
      visible: !this.state.visible,
    });
  };

  render() {
    const { config, visible } = this.state;
    return (
      <div className={styles.wrapper}>
        <Steps
          className={styles.steps}
          progressDot
          current={3}
          size="default"
          direction="vertical"
        >
          <Step title="上传excel数据" description={<Model />} />
          <Step
            title="新建页面"
            description={<Button onClick={this.onTogglePage}>新建</Button>}
          />
          <Step
            title="为页面添加图表"
            description={<Link to="/add">去添加图表</Link>}
          />
        </Steps>
        {visible && <CreatePage onClose={this.onTogglePage} />}
        <Button
          onClick={() => {
            database.clear();
            message.info("数据已清空");
            location.reload();
          }}
        >
          清空所有数据
        </Button>
      </div>
    );
  }
}
