const tap = require('tap'),
      babel = require('babel-core');

if (require.main === module) {
  tap.pass('common test file');
  return;
}

const transform = (code) => babel.transform(code, {
  plugins: [__dirname + '/..']
}).code;

const head = "var _bem = require(\"bem\").default({});\n\n";

module.exports = {
  assertTransform: (before, after) => tap.equal(
    transform(before),
    head + after
  )
};
