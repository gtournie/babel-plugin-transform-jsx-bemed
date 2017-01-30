"use strict"

const tap = require('tap'),
      babel = require('babel-core');

if (require.main === module) {
  tap.pass('common test file');
  return;
}

module.exports = {
  defaultHeader: "import _bemed from \"bemed\";\nconst _bem = _bemed({});",
  transform: function (code, opts) {
    return babel.transform(code, {
      plugins: [[__dirname + '/..', opts]]
    }).code.replace(/\n+/, "\n");
  },
  assertCode: function (source, code, opts) {
    tap.equal(
      this.transform(source, opts),
      code
    );
  },
  assertBody: function (source, body, opts) {
    this.assertCode(source, this.defaultHeader + "\n\n" + body, opts);
  },
  assertException: function (source, opts) {
    tap.throws(
      () => this.transform(source, opts)
    );
  }
};
