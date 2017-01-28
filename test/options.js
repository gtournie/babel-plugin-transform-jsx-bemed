const { assertTransformOptions } = require('./common');

assertTransformOptions('',
`var _bem = require("bem").default({
  separators: {
    element: "___"
  }
}).generate;`,
{ separators: { element: '___' } });
