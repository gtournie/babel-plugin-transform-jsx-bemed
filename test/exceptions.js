"use strict"

const c = require('./common');

c.assertException(
  '<div block={ block } />'
);
c.assertException(
  '<div mods="mod" />'
);
c.assertException(
  '<div block="block"><div mods="mod" /></div>'
);
