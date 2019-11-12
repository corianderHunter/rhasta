
const postcss = require('postcss');

const lessRegx = /\.less/;
const sassRegx = /\.(scss|sass)/;
const deepRegx = /\/deep\//;
const deepRegxG = /\/deep\//g;
const skipRegx = /\/skip\//g;

module.exports = async function (source) {
  const { resourceQuery, resourcePath } = this;
  const hash = resourceQuery.split('=').pop();

  let newSource;
  if (sassRegx.test(resourcePath)) {
    newSource = await postcss([require('postcss-node-sass')]).process(source)
  } else if (lessRegx.test(resourcePath)) {
    const less = require('postcss-less-engine');
    newSource = await postcss([
      less({})
    ]).process(source, { parser: less.parser });
  } else {
    newSource = source;
  }
  const root = postcss.parse(newSource);
  const scopedHash = `[data-v-${hash}]`;
  root.walkRules(rule => {
    if (skipRegx.test(rule.selector)) {
      rule.selector = rule.selector.replace(skipRegx, '');
      return;
    }
    if (deepRegx.test(rule.selector)) {
      rule.selector = rule.selector.replace(deepRegx, scopedHash);
      deepRegx.test(rule.selector) ? rule.selector = rule.selector.replace(deepRegxG, '') : null;
    } else {
      rule.selector = rule.selector + scopedHash;
    }
  })
  return root.toResult().css;
}; 
