"use strict"

const c = require('./common');

c.assertCode(
'<div block="block" />;',
`import _bemed from "bemed";
const _bem = _bemed({
  separators: {
    element: "___"
  }
}).generate;

<div className={_bem("block")} />;`
, { separators: { element: '___' } });

c.assertBody(
  '<div block="block" element="element" />;',
  '<div className={_bem("block", "element")} />;',
  { properties: { element: 'element' } }
);
