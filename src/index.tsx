import React from "react";
import ReactDom from "react-dom";
import App from "./components/App";
import "./index.scss";
import store from "./contexts/index";
import { Provider } from "react-redux";

export default {
  start: () =>
    ReactDom.render(
      <Provider store={store}>
        <App />
      </Provider>,
      document.getElementById("app")
    ),
};
