"use strict"

const tap = require('tap'),
      babel = require('babel-core');

if (require.main === module) {
  tap.pass('common test file');
  return;
}

const transform = (code, opts) => babel.transform(code, {
  plugins: [[__dirname + '/..', opts]]
}).code.replace("\n\n", "\n");

module.exports = {
  assertCode: (source, code, opts) => tap.equal(
    transform(source, opts),
    code
  ),
  assertBody: (source, body, opts) => tap.equal(
    transform(source, opts).split("\n\n")[1],
    body
  ),
  assertHeader: (header, opts) => tap.equal(
    transform('<div block="block" />', opts).split("\n\n")[0],
    header
  ),
  assertSyntaxError: function (source, opts) {
    tap.throws(
      () => transform(source, opts),
      SyntaxError
    );
  }
};
