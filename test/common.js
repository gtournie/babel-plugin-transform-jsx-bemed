"use strict"

const tap = require('tap'),
      babel = require('babel-core');

if (require.main === module) {
  tap.pass('common test file');
  return;
}

const transform = (code, opts) => babel.transform(code, {
  plugins: [[__dirname + '/..', opts]]
}).code.split("\n\n");

module.exports = {
  assertBody: (source, body, opts) => tap.equal(
    transform(source, opts)[1],
    body
  ),
  assertHeader: (header, opts) => tap.equal(
    transform('', opts)[0],
    header
  )
};
