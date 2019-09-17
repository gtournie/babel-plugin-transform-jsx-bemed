'use strict'

const bemed = require('bemed')

const PRIMITIVE_TYPES = ['NullLiteral', 'BooleanLiteral', 'NumericLiteral', 'StringLiteral']

module.exports = function(base) {
  const t = base.types

  const ast = obj => {
    switch (typeof obj) {
      case 'string':
        return t.StringLiteral(obj)
      case 'object':
        if (Array.isArray(obj)) {
          return t.arrayExpression(obj.map(ast))
        }
        return t.ObjectExpression(
          Object.keys(obj)
            .filter(k => obj[k] !== undefined)
            .map(k => t.ObjectProperty(t.Identifier(k), ast(obj[k]))),
        )
    }
  }

  const requireBem = (bemId, bemedId, opts) => {
    opts = ast(opts || {})

    return [
      t.ImportDeclaration([t.ImportDefaultSpecifier(bemedId)], t.StringLiteral('bemed')),
      t.VariableDeclaration('const', [
        t.VariableDeclarator(bemId, t.MemberExpression(t.CallExpression(bemedId, [opts]), t.Identifier('generate'))),
      ]),
    ]
  }

  const extractArgs = attrs => {
    let onRuntime = false
    const args = attrs.map(attr => {
      let values
      switch (attr.type) {
        case 'NullLiteral':
          return null
        case 'BooleanLiteral':
        case 'NumericLiteral':
        case 'StringLiteral':
          return attr.value
        case 'ArrayExpression':
          return attr.elements.map(e => (PRIMITIVE_TYPES.includes(e.type) ? e.value : (onRuntime = true)))
        case 'ObjectExpression':
          let h = {}
          attr.properties.forEach(prop => {
            if (prop.type === 'ObjectProperty' && prop.key && prop.value && PRIMITIVE_TYPES.includes(prop.value.type)) {
              h[prop.key.name] = prop.value.value
            } else {
              onRuntime = true
            }
          })
          return h
      }
      onRuntime = true
    })
    return onRuntime ? { onRuntime } : { onRuntime, args }
  }

  const callBem = (bemId, attrs, bem, use) => {
    for (let i = 0; i < attrs.length; i++)
      if (attrs[i] === undefined) {
        attrs[i] = t.NullLiteral()
      }

    const values = extractArgs(attrs)
    if (values.onRuntime) {
      use.flag = true
      return t.JSXAttribute(t.JSXIdentifier('className'), t.JSXExpressionContainer(t.CallExpression(bemId, attrs)))
    }
    return t.JSXAttribute(t.JSXIdentifier('className'), t.stringLiteral(bem.apply(null, values.args)))
  }

  const getScopeName = scope => {
    if (
      scope.block &&
      scope.block.type === 'ArrowFunctionExpression' &&
      scope.parentBlock &&
      scope.parentBlock.type === 'VariableDeclarator'
    ) {
      return scope.parentBlock.id.name
    }
    if (scope.parent && scope.parent.block && scope.parent.block.type === 'ClassDeclaration') {
      return scope.parent.block.id.name
    }
  }

  const readAttributes = (path, properties) => {
    const paths = [],
      attrs = [],
      attributes = path.node.openingElement.attributes

    for (let i = 0; i < attributes.length; i++) {
      let name = (attributes[i].name || {}).name,
        value = attributes[i].value,
        p = path.get('openingElement.attributes.' + i)

      switch (name) {
        case properties.block:
        case properties.element:
          if (!t.isStringLiteral(value)) {
            throw p.buildCodeFrameError('Attribute value must be a string')
          }
          paths.push(p)
          attrs[+(name === properties.element)] = value
          break
        case properties.modifiers:
        case properties.mixin:
          if (t.isJSXExpressionContainer(value)) {
            value = value.expression
          } else {
            value = value
          }
          paths.push(p)
          attrs[2 + (name === properties.mixin)] = value
          break
        case 'className':
          return null
      }
    }
    return { paths, attrs }
  }

  const mutateAttributes = (path, attributes, bemId, bem, use) => {
    path.get('openingElement').pushContainer('attributes', callBem(bemId, attributes.attrs, bem, use))
    attributes.paths.forEach(path => path.remove())
  }

  const JSXChildElementVisitor = {
    JSXElement(path) {
      const properties = this.properties
      const attributes = readAttributes(path, properties)
      if (attributes === null || !attributes.attrs.length) return

      const attrs = attributes.attrs
      if (attrs[0]) {
        throw path.buildCodeFrameError('Block definition must be in the root JSXElement')
      }
      if (!attrs[1]) {
        throw path.buildCodeFrameError('Element must be specified')
      }
      attrs[0] = this.block
      mutateAttributes(path, attributes, this.bemId, this.bem, this.use)
    },
  }

  const JSXRootElementVisitor = {
    JSXElement(path) {
      if (t.isJSXElement(path.parent)) return

      const properties = this.properties
      const attributes = readAttributes(path, properties)
      if (attributes === null) return

      const attrs = attributes.attrs
      if (!attrs[0]) {
        const sname = getScopeName(path.scope)
        if (sname) {
          attrs[0] = t.StringLiteral(sname)
        } else {
          if (attrs.length) {
            throw path.buildCodeFrameError('Block must be specified')
          }
          return
        }
      }

      const bemId = this.bemId,
        bem = this.bem,
        use = this.use

      mutateAttributes(path, attributes, bemId, bem, use)
      path.traverse(JSXChildElementVisitor, { bemId, properties, block: attrs[0], bem, use })
    },
  }

  return {
    visitor: {
      Program(path, state) {
        const bemId = path.scope.generateUidIdentifier('bem'),
          bemedId = path.scope.generateUidIdentifier('bemed')
        const separators = state.opts.separators,
          properties = Object.assign(
            {
              block: 'block',
              element: 'elem',
              modifiers: 'mods',
              mixin: 'mix',
            },
            state.opts.properties || {},
          )
        const use = { flag: false }
        const bem = bemed({ separators }).generate
        path.traverse(JSXRootElementVisitor, { bemId, properties, use, bem })
        if (use.flag) {
          path.unshiftContainer('body', requireBem(bemId, bemedId, { separators }))
        }
      },
    },
    inherits: require('babel-plugin-syntax-jsx'),
  }
}
