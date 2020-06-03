import React, { useCallback, useState } from "react";
import { Modal, Input, message } from "antd";
import { database, DEFAULT_OPTIONS } from "../../databases/index";
import { useHistory } from "react-router-dom";

export default (props: any) => {
  const { onClose } = props;
  const history = useHistory();
  const [value, setValue] = useState("");
  const onOk = async () => {
    if (value.trim()) {
      const parent = "pages";
      const id = Math.random().toString().slice(2);
      try {
        await database.createTable(DEFAULT_OPTIONS.pages, [
          "id",
          "name",
          "components",
        ]);
        await database.insert(DEFAULT_OPTIONS.pages, [
          id,
          value,
          encodeURIComponent(JSON.stringify([])),
        ]);
        const navs: any = await database.query(
          `select left from ${DEFAULT_OPTIONS.nav}`
        );
        let left = navs[0]?.left;
        left = JSON.parse(decodeURIComponent(left));
        left = {
          ...left,
          map: {
            ...left.map,
            pages: [...(left.map.pages || []), { key: id, title: value }],
          },
        };
        await database.update(DEFAULT_OPTIONS.nav, {
          left: encodeURIComponent(JSON.stringify(left)),
        });
        history.push(`/pages/${id}`);
      } catch (err) {
        message.error(err.message);
      }
    }
  };
  return (
    <Modal title="新建页面" visible={true} onOk={onOk} onCancel={onClose}>
      <span>页面名称：</span>
      <Input
        value={value}
        onChange={(e: any) => setValue(e.target.value)}
        placeholder="请输入页面名称"
      />
    </Modal>
  );
};
