export default function (state: any, action: any) {
  const { type, payload } = action;
  switch (type) {
    case "SET_TOP_NAV":
      return {
        ...state,
        nav: {
          ...state.nav,
          top: {
            ...state.nav.top,
            current: payload.current,
          },
        },
      };
    case "RESET_NAV":
      return {
        ...state,
        nav: payload,
      };
  }
  return {
    ...state,
  };
}
