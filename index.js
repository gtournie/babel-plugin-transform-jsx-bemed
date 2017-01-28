module.exports = function({ types: t }) {
  const ast = (obj) => {
    switch (typeof obj) {
      case 'string':
        return t.StringLiteral(obj);
      case 'object':
        if (Array.isArray(obj)) {
          return t.arrayExpression(obj.map(ast));
        }
        return t.ObjectExpression(
          Object.keys(obj).filter((k) => obj[k] !== undefined).map((k) => t.ObjectProperty(t.Identifier(k), ast(obj[k])))
        );
    }
  };

  const requireBem = (bemId, opts) => {
    opts = ast(opts || {});

    return t.VariableDeclaration(
      'var',
      [
        t.VariableDeclarator(
          bemId,
          t.MemberExpression(
            t.CallExpression(
              t.MemberExpression(
                t.CallExpression(
                    t.Identifier('require'),
                    [
                        t.StringLiteral('bem')
                    ]
                ),
                t.Identifier('default')
              ),
              [ opts ]
            ),
            t.Identifier('generate')
          )
        )
      ]
    )
  };

  const callBem = (bemId, attrs) => {
    for (let i = 0; i < attrs.length; i++) if (attrs[i] === undefined) {
      attrs[i] = t.NullLiteral();
    }
    return t.JSXAttribute(
      t.JSXIdentifier('className'),
      t.JSXExpressionContainer(
        t.CallExpression(bemId, attrs)
      )
    )
  };

  const scopeName = (scope) => {
    if (scope.block && scope.block.type === 'ArrowFunctionExpression' && scope.parentBlock && scope.parentBlock.type === 'VariableDeclarator') {
      return scope.parentBlock.id.name;
    }
    if (scope.parent && scope.parent.block && scope.parent.block.type === 'ClassDeclaration') {
      return scope.parent.block.id.name;
    }
  }

  const JSXElementVisitor = {
    JSXElement(path) {
      const { bemId, block } = this;
      let sBlock;
      if (!block) {
        sBlock = scopeName(path.scope);
        if (sBlock) {
          sBlock = t.StringLiteral(sBlock);
        }
      }

      const paths = [],
            attrs = [ block || sBlock ],
            attributes = path.node.openingElement.attributes;

      for (let i = 0; i < attributes.length; i++) {
        let name = attributes[i].name.name,
            value = attributes[i].value,
            p = path.get('openingElement.attributes.' + i);

        switch (name) {
          case 'block':
          case 'elem':
            if (!t.isStringLiteral(value)) {
              throw p.buildCodeFrameError("Attribute value must be a string");
            }
            paths.push(p);
            attrs[+(name === 'elem')] = value;
            break;
          case 'mods':
          case 'mix':
            if (t.isJSXExpressionContainer(value)) {
              value = value.expression;
            } else {
              value = value;
            }
            paths.push(p);
            attrs[2 + (name === 'mix')] = value;
            break;
          case 'className':
            return;
        }
      }
      if (!attrs[0]) return;

      path.get('openingElement').pushContainer('attributes', callBem(bemId, attrs));
      paths.forEach((path) => path.remove());

      if (!block) {
        path.traverse(JSXElementVisitor, { bemId, block: attrs[0] });
      }
    }
  }

  return {
    visitor: {
      Program(path, state) {
        const bemId = path.scope.generateUidIdentifier('bem');
        const { separators } = state.opts;
        path.traverse(JSXElementVisitor, { bemId });
        path.unshiftContainer('body', requireBem(bemId, { separators }));
      }
    },
    inherits: require('babel-plugin-syntax-jsx')
  }
}
