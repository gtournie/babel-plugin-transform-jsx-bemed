"use strict"

const c = require('./common');

c.assertHeader('var _bem = require("bemed").default({}).generate;');

c.assertHeader(
`var _bem = require("bemed").default({
  separators: {
    element: "___"
  }
}).generate;`
, { separators: { element: '___' } });

c.assertBody(
  '<div block="block" element="element" />;',
  '<div className={_bem("block", "element")} />;',
  { properties: { element: 'element' } }
);
