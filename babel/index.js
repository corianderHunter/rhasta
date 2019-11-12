const md5File = require('md5-file');

const scopedPrefix = 'data-v-';

const getFileHash = (filename) => {
  let hash = md5File.sync(filename);
  return hash.slice(-6, hash.length);
}

module.exports = function ({ types: t }) {
  return {
    inherits: require("@babel/plugin-syntax-jsx").default,
    visitor: {
      ImportDeclaration(path, state) {
        const { value: importValue } = path.node.source;
        const scopedCss = /\.scoped.(css|scss|sass|less)/;
        const isCssImport = scopedCss.test(importValue);
        if (!isCssImport) return;
        const { filename } = state;
        const hash = getFileHash(filename);
        path.node.source.value = importValue + `?hash=${hash}`;
      },
      JSXElement(path, state) {
        const { filename } = state;
        const hash = getFileHash(filename)
        const openingElement = path.node.openingElement;
        if (openingElement.name.name !== 'Fragment')
          openingElement.attributes.push(t.jsxAttribute(t.jsxIdentifier(scopedPrefix + hash), t.stringLiteral('')));
      },

    }
  };
};