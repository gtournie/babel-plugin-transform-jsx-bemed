"use strict"

const { assertHeader, assertBody } = require('./common');

assertHeader('var _bem = require("bemed").default({}).generate;');

assertHeader(
`var _bem = require("bemed").default({
  separators: {
    element: "___"
  }
}).generate;`
, { separators: { element: '___' } });

assertBody(
  '<div block="block" element="element" />;',
  '<div className={_bem("block", "element")} />;',
  { properties: { element: 'element' } }
);
