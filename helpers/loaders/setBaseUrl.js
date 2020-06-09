// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function setBaseUri(content) {
  const reg = /('|")((?:\/[\w:]*)+)\1/g;
  if (reg.test(content)) {
    return content.replace(reg, '"/mugong/bi$2"');
  }
  return content;
}

module.exports = setBaseUri;
