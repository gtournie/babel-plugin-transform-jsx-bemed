var B = require('b_').B;
var b = B({
  tailSpace: ' ',
  elementSeparator: '-',
  modSeparator: '--',
  modValueSeparator: '-',
  classSeparator: ' '
});

const mods = ["b", "e", "m"];

module.exports = function({ types: t }) {
  return {
    visitor: {
      JSXOpeningElement(path) {        
        const params = [],
              pIndexes = [],
              scope = path.scope,
              attributes = path.node.attributes;
        
              
        if (attributes.length === 0) return;
        
        if (scope.block && scope.block.type === 'ArrowFunctionExpression' && scope.parentBlock && scope.parentBlock.type === 'VariableDeclarator') {
          params[0] = scope.parentBlock.id.name;
        } else if (scope.parent && scope.parent.block && scope.parent.block.type === 'ClassDeclaration') {
          params[0] = scope.parent.block.id.name;
        }
        
        let classNameValue, classNameIndex = null;
        for (let i = 0; i < attributes.length; i++) {
          let name = attributes[i].name.name,
              value = attributes[i].value.value,
              pIndex = mods.indexOf(name);

          if (pIndex !== -1) {
            params[pIndex] = value;
            pIndexes.push(pIndex);
          } else if (name === "className") {
            classNameValue = value;
            classNameIndex = i;
          }
        }
        const bem = b.apply(null, params);
        
        if (classNameIndex === null) {
          path.pushContainer('attributes', t.JSXAttribute(t.JSXIdentifier('className'), t.StringLiteral(bem)));
        } else {
          path.get('attributes.' + classNameIndex + '.value').replaceWith(t.StringLiteral(bem + classNameValue));
        }
        pIndexes.forEach((i) => path.get('attributes.' + i).remove());
      }
    }
  }
}
