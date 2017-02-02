# babel-plugin-transform-jsx-bemed

[![Build Status](https://travis-ci.org/Ximik/babel-plugin-transform-jsx-bemed.svg?branch=master)](https://travis-ci.org/Ximik/babel-plugin-transform-jsx-bemed)

[Babel](https://babeljs.io/) plugin for [BEM](https://en.bem.info/) class names generation in [JSX](https://facebook.github.io/react/docs/introducing-jsx.html). 
It was developed for using in [React](https://facebook.github.io/react/) in combination with [postcss plugin](https://github.com/Ximik/postcss-bemed).

## Install
Just require it as any other babel plugin and add `bemed` package to your `dependencies` (so Webpack/Brunch.io/etc. can use it for frontend).

```bash
$ npm install babel-plugin-transform-jsx-bemed --save-dev
$ npm install bemed --save
```

```js
{
  presets: ['es2015'],
  plugins: ['transform-jsx-bemed']
}
```

## Usage
Just add BEM properties into your tag and plugin will construct `className` for you.
`className` will be a JavaScript expression which calls function from `bemed`. Header will have this function definition, so it just works out of the box by 
default.
If `className` is already in tag then nothing will be done (for back-compatibility).


### Properties
**block**
Block property. Must be a string.

**elem**
Element property. Must be a string.

**mods**
Modifier property. Can be a string or JavaScript expressions (inside `{` `}`). Expression must return string, array or object.

**mix**
Mixin property. Can be a string or JavaScript expressions (inside `{` `}`). Expression must return string or array.

### Scopes
`block` property creates a scope and should be used only for top-level JSX tag. Can be omitted if JSX is placed inside class or named arrow function.

### Examples
Base usage
  
**Input**
```js
<div block="Main" mix="panel" mods={{ warning: true }}>
  <div elem="header" mods="header">Title</div>
  <div elem="body">Text</div>
</div>
```
**Output**
```js
<div className={_bem("Main", null, { warning: true }, "panel")}>
  <div className={_bem("Main", "header", "header")}>Title</div>
  <div className={_bem("Main", "body")}>Text</div>
</div>
```
  
**Input**
```js
const Message = ({ type, title, text}) => {
  return <div mods={{ type }} >
    <div elem="header">{ title }</div>
    <div elem="body">{ text }</div>
  </div>
}
```
**Output**
```js
const Message = ({ type, title, text }) => {
  return <div className={_bem("Message", null, { type })}>
    <div className={_bem("Message", "header")}>{title}</div>
    <div className={_bem("Message", "body")}>{text}</div>
  </div>;
};
```
  
**Input**
```js
class Message extends Component {
  ...
  render() {
    ...
    return <div mods={this.getMods()}>
      <div elem="header">{ title }</div>
      <div elem="body">{ text }</div>
    </div>
  }
}
```
**Output**
```js
class Message extends Component {
  ...
  render() {
    ...
    return <div className={_bem("Message", null, this.getMods())}>
      <div className={_bem("Message", "header")}>{title}</div>
      <div className={_bem("Message", "body")}>{text}</div>
    </div>;
  }
}
```

## Options

### rules

Set custom properties naming. Default is
```js
properties: {
  block: 'block',
  element: 'elem',
  modifiers: 'mods',
  mixin: 'mix'
}
```

### separators

Set custom bem separators. Default is
```js
separators: {
  element: '__',
  modifier: '--',
  value: '-'
}
```
