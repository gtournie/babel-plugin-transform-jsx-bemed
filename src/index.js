module.exports = function({ types: t }) {
  const requireBem = (bemId, opts) => {
    opts = t.ObjectExpression([
      t.ObjectProperty(t.Identifier('elementSeparator'), t.StringLiteral('--')),
      t.ObjectProperty(t.Identifier('modSeparator'), t.StringLiteral('-')),
      t.ObjectProperty(t.Identifier('modValueSeparator'), t.StringLiteral('-'))
    ]);

    return t.VariableDeclaration(
      'var',
      [
        t.VariableDeclarator(
          bemId,
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
          )
        )
      ]
    )
  };

  const callBem = (bemId, attrs) => {
    return t.JSXAttribute(
      t.JSXIdentifier('className'),
      t.JSXExpressionContainer(
        t.CallExpression(bemId, attrs.map((a) => a || t.NullLiteral()))
      )
    )
  };

  const JSXElementVisitor = {
    JSXElement(path) {
      const { bemId, block } = this;
      let sBlock;
      if (!block) {
        const scope = path.scope;
        if (scope.block && scope.block.type === 'ArrowFunctionExpression' && scope.parentBlock && scope.parentBlock.type === 'VariableDeclarator') {
          sBlock = scope.parentBlock.id.name;
        } else if (scope.parent && scope.parent.block && scope.parent.block.type === 'ClassDeclaration') {
          sBlock = scope.parent.block.id.name;
        }
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
        path.traverse(JSXElementVisitor, { bemId });
        path.unshiftContainer('body', requireBem(bemId, state.opts));
      }
    },
    inherits: require('babel-plugin-syntax-jsx')
  }
}
