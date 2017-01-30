"use strict"

const c = require('./common');

c.assertCode(
  '<div />;',
  '<div />;'
);
c.assertBody(
  '<div block="block" />;',
  '<div className={_bem("block")} />;'
);
c.assertBody(
  '<div block="block" className="name" />;',
  '<div block="block" className="name" />;'
);
c.assertBody(
  '<div block="block" elem="element" />;',
  '<div className={_bem("block", "element")} />;'
);
c.assertBody(
  '<div block="block" elem="element" mods="mod" />;',
  '<div className={_bem("block", "element", "mod")} />;'
);
c.assertBody(
  '<div block="block" elem="element" mods={ cbmod() } />;',
  '<div className={_bem("block", "element", cbmod())} />;'
);
c.assertBody(
  '<div block="block" elem="element" mix="mix" />;',
  '<div className={_bem("block", "element", null, "mix")} />;'
);
c.assertBody(
  '<div block="block" mix={ ["mix1", "mix2"] } />;',
  '<div className={_bem("block", null, null, ["mix1", "mix2"])} />;'
);
