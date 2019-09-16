'use strict'

const c = require('./common')

c.assertCode('<div block="block" elem="element" />;', '<div className="block___element" />;', {
  separators: { element: '___' },
})

c.assertCode('<div block="block" element="element" />;', '<div className="block__element" />;', {
  properties: { element: 'element' },
})
