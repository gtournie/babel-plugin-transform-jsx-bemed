'use strict'

const c = require('./common')

c.assertCode('<div />;', '<div />;')
c.assertCode('<div block="block" />;', '<div className="block" />;')
c.assertCode('<div block="block" className="name" />;', '<div block="block" className="name" />;')
c.assertCode('<div block="block" elem="element" />;', '<div className="block__element" />;')
c.assertCode(
  '<div block="block" elem="element" mods="mod" />;',
  '<div className="block__element block__element--mod" />;',
)
c.assertBody(
  '<div block="block" elem="element" mods={ cbmod() } />;',
  '<div className={_bem("block", "element", cbmod())} />;',
)
c.assertCode('<div block="block" elem="element" mix="mix" />;', '<div className="block__element mix" />;')
c.assertCode('<div block="block" mix={ ["mix1", "mix2"] } />;', '<div className="block mix1 mix2" />;')
