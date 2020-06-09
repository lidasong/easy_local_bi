class ResetBaseUri {
  constructor(options) {
    this.options = options;
  }
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  apply(compiler) {
    compiler.hooks.compilation.tap("resetBaseUri", (compilation) => {
      compilation.hooks.finishModules.tap("resetBaseUri", (modules) => {
        Object.values(modules).forEach((module) => {
          const source = module._source && module._source._value;
          const reg = /('|")((?:\/[\w:]*)+)\1/g;
          const isSrc = /\/easy_local_bi\/src/.test(module.userRequest);
          if (isSrc && reg.test(source)) {
            module._source._value = source.replace(reg, "/mugong/bi$2");
          }
        });
      });
    });
  }
}

module.exports = ResetBaseUri;
