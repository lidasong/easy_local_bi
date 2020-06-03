export default ({ getState, dispatch }) => (next) => {
  return (payload) => {
    return next(payload);
  };
};
