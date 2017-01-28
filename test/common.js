const tap = require('tap'),
      babel = require('babel-core');

if (require.main === module) {
  tap.pass('common test file');
  return;
}

const transform = (code, opts) => babel.transform(code, {
  plugins: [[__dirname + '/..', opts]]
}).code;

const head = "var _bem = require(\"bem\").default({}).generate;\n\n";

module.exports = {
  assertTransform: (before, after) => tap.equal(
    transform(before),
    head + after
  ),
  assertTransformOptions: (before, after, opts) => tap.equal(
    transform(before, opts),
    after
  )
};
