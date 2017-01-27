const { assertTransform } = require('./common');

assertTransform(
  '<div />;',
  '<div />;'
);
assertTransform(
  '<div block="block" />;',
  '<div className={_bem("block")} />;'
);
assertTransform(
  '<div block="block" className="name" />;',
  '<div block="block" className="name" />;'
);
assertTransform(
  '<div block="block" elem="element" />;',
  '<div className={_bem("block", "element")} />;'
);
assertTransform(
  '<div block="block" elem="element" mods="mod" />;',
  '<div className={_bem("block", "element", "mod")} />;'
);
assertTransform(
  '<div block="block" elem="element" mods={ cbmod() } />;',
  '<div className={_bem("block", "element", cbmod())} />;'
);
assertTransform(
  '<div block="block" elem="element" mix="mix" />;',
  '<div className={_bem("block", "element", null, "mix")} />;'
);
assertTransform(
  '<div block="block" mix={ ["mix1", "mix2"] } />;',
  '<div className={_bem("block", null, null, ["mix1", "mix2"])} />;'
);
