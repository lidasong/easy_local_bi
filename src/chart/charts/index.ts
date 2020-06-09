import Custom from "./custom";
import Pie from "./pie";
import Auto from "./auto";
import Loadable from "react-loadable";

export default {
  line: Auto,
  bar: Auto,
  barStack: Auto,
  barAlign: Auto,
  point: Auto,
  area: Auto,
  areaStack: Auto,
  duplex: Auto,
  auto: Auto,
  pie: Pie,
  ring: Pie,
  map: Loadable({
    loader: () => import("./map"),
    loading: () => null,
  }),
  custom: Custom,
};
