module.exports = function({ types: t }) {
  const requireBem = (bemVar) => {
    t.VariableDeclaration(
      'const',
      [
        t.VariableDeclarator(
          bemVar,
          t.MemberExpression(
            t.CallExpression(
                t.Identifier('require'),
                [
                    t.stringLiteral('bem')
                ]
            ),
            t.Identifier('default')
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
          case "b":
            t.assertStringLiteral(value);
            rIndexes.push(i);
            block = value.value;
            break;
          case "e":
            t.assertStringLiteral(value);
            rIndexes.push(i);
            element = value.value;
            break;
          case "m":
            t.assertJSXExpressionContainer(value);
            rIndexes.push(i);
            modifiers = value.expression;
            break;
          case "className":
            t.assertStringLiteral(value);
            cIndex = i;
            mixins = value.value;
            break;
        }
      }
      if (!block) return;
      const bem = t.JSXExpressionContainer(t.CallExpression(
        this.bemVar,
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
      Program(path) {
        const bemVar = path.scope.generateUidIdentifier('bem');
        path.unshiftContainer('body', requireBem(bemVar));
        path.traverse(JSXOpeningElementVisitor, { bemVar });
      }
    },
    inherits: require("babel-plugin-syntax-jsx")
  }
}
