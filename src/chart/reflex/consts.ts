export const CHART_PADDING_MAP = {
  DEFAULT: [20, 20, 40, 80],
  PIE: [20, 40, 20, 40],
};

export const RADIUS = 0.9;

export const DEFAULT_CONFIG = {
  chart: {
    forceFit: true,
    height: 400,
    padding: CHART_PADDING_MAP.DEFAULT,
    scale: {},
  },
  event: {},
  geom: {},
  legend: {
    visible: false,
    marker: "square",
    useHtml: true,
    scroll: true,
    position: "top",
  },
  row: {
    visible: true,
  },
  column: {
    visible: true,
  },
  tooltip: {
    visible: true,
  },
  hooks: {},
  options: {
    axis: {},
  },
};

export const LEGEND_TOP_BOTTOM = {
  offsetY: -8,
  "g2-legend": {
    "max-height": "48px",
  },
};

export const LEGEND_COMMON_STYLE = {
  "g2-legend-title": {
    "margin-bottom": 0,
  },
  "g2-legend-marker": {
    "border-radius": 0,
    "vertical-align": "baseline",
  },
  "g2-legend-list": {
    "text-align": "left",
  },
  "g2-legend-list-item": {
    "margin-right": "8px",
    "margin-bottom": "4px",
  },
};

export const LEGEND_POSITION = {
  top: "top-left",
  bottom: "bottom-left",
  left: "left-center",
  right: "right-center",
};

export const MARGIN_RATIO = 1 / 32;

export const CHART_MAPPING = {
  bar: "interval",
  barStack: "interval",
  barAlign: "interval",
  pie: "intervalStack",
  ring: "intervalStack",
  auto: "interval",
  map: "polygon",
};
