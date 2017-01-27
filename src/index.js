module.exports = function({ types: t }) {
  return {
    visitor: {
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

        let bem;
        element = element ? block + '__' + element : block;
        if (modifiers) {
          bem = t.CallExpression(
                  t.Identifier('bem'),
                  [
                    t.StringLiteral(element),
                    modifiers,
                    t.StringLiteral('--')
                  ]
                );
          if (mixins) {
            bem = t.BinaryExpression('+', bem, t.StringLiteral(mixins));
          }
        } else {
          bem = t.StringLiteral(element + ' ' + mixins);
        }
        bem = t.JSXExpressionContainer(bem);

        if (cIndex === null) {
          path.pushContainer('attributes', t.JSXAttribute(t.JSXIdentifier('className'), bem));
        } else {
          path.get('attributes.' + cIndex + '.value').replaceWith(bem);
        }
        rIndexes.sort().reverse().forEach((i) => path.get('attributes.' + i).remove());
      }
    },
    inherits: require("babel-plugin-syntax-jsx")
  }
}
