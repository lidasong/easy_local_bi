import { createStore, applyMiddleware } from "redux";
import logs from "./middlewares/logs";
import reducer from "./reducers";
import { nav } from "./default";

const store = applyMiddleware(logs)(createStore)(reducer, { nav });

export default store;
