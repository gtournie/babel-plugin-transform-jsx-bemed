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

  const JSXOpeningElementVisitor = {
    JSXOpeningElement(path) {
      const attributes = path.node.attributes;
      if (attributes.length === 0) return;

      let block, element, modifiers, mixins;
      const scope = path.scope;
      if (scope.block && scope.block.type === 'ArrowFunctionExpression' && scope.parentBlock && scope.parentBlock.type === 'VariableDeclarator') {
        block = scope.parentBlock.id.name;
      } else if (scope.parent && scope.parent.block && scope.parent.block.type === 'ClassDeclaration') {
        block = scope.parent.block.id.name;
      }

      let rIndexes = [],
          cIndex = null;
      for (let i = 0; i < attributes.length; i++) {
        let name = attributes[i].name.name,
            value = attributes[i].value;

        switch (name) {
          case 'block':
            t.assertStringLiteral(value);
            rIndexes.push(i);
            block = value.value;
            break;
          case 'elem':
            t.assertStringLiteral(value);
            rIndexes.push(i);
            element = value.value;
            break;
          case 'mods':
            t.assertJSXExpressionContainer(value);
            console.log(value.expression);
            rIndexes.push(i);
            modifiers = value.expression;
            break;
          case 'mix':
            t.assertStringLiteral(value);
            cIndex = i;
            mixins = value.value;
            break;
          case 'className':
            return;
        }
      }
      if (!block) return;
      const bem = t.JSXExpressionContainer(t.CallExpression(
        this.bemId,
        [
          t.StringLiteral(block),
          t.StringLiteral(element),
          modifiers,
          t.StringLiteral(mixins),
        ]
      ));

      if (cIndex === null) {
        path.pushContainer('attributes', t.JSXAttribute(t.JSXIdentifier('className'), bem));
      } else {
        path.get('attributes.' + cIndex + '.value').replaceWith(bem);
      }
      rIndexes.sort().reverse().forEach((i) => path.get('attributes.' + i).remove());
    }
  }

  return {
    visitor: {
      Program(path, state) {
        const bemId = path.scope.generateUidIdentifier('bem');
        path.traverse(JSXOpeningElementVisitor, { bemId });
        path.unshiftContainer('body', requireBem(bemId, state.opts));
      }
    },
    inherits: require('babel-plugin-syntax-jsx')
  }
}
