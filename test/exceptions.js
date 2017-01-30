"use strict"

const c = require('./common');

c.assertSyntaxError(
  '<div block={ block } />'
);
c.assertSyntaxError(
  '<div block="block"><div mods="mod" /></div>'
);
c.assertSyntaxError(
  '<div block="block"><div block="element"></div></div>'
);
