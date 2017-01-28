"use strict"

const { assertBody } = require('./common');

assertBody(
  '<div />;',
  '<div />;'
);
assertBody(
  '<div block="block" />;',
  '<div className={_bem("block")} />;'
);
assertBody(
  '<div block="block" className="name" />;',
  '<div block="block" className="name" />;'
);
assertBody(
  '<div block="block" elem="element" />;',
  '<div className={_bem("block", "element")} />;'
);
assertBody(
  '<div block="block" elem="element" mods="mod" />;',
  '<div className={_bem("block", "element", "mod")} />;'
);
assertBody(
  '<div block="block" elem="element" mods={ cbmod() } />;',
  '<div className={_bem("block", "element", cbmod())} />;'
);
assertBody(
  '<div block="block" elem="element" mix="mix" />;',
  '<div className={_bem("block", "element", null, "mix")} />;'
);
assertBody(
  '<div block="block" mix={ ["mix1", "mix2"] } />;',
  '<div className={_bem("block", null, null, ["mix1", "mix2"])} />;'
);
