import React from "react";
import styles from "./index.module.scss";

const iconMap = {
  color: "",
  size: "",
  label: "",
  angle: "",
};

export default (props: any) => {
  const { type, title, children } = props;
  return (
    <>
      <div className={styles.attr}>
        <div>
          {iconMap[type]}
          {title}
        </div>
      </div>
      {children}
    </>
  );
};
