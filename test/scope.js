"use strict"

const c = require('./common');

c.assertBody(
`class Message extends React.Component {
  render() {
    const { title, message, error } = this.props;
    return <div>
      <h1 elem="title">{ title }</h1>
      <div elem="message" mods={{ error }}>{ message }</div>
    </div>;
  }
}`,
`class Message extends React.Component {
  render() {
    const { title, message, error } = this.props;
    return <div className={_bem("Message")}>
      <h1 className={_bem("Message", "title")}>{title}</h1>
      <div className={_bem("Message", "message", { error })}>{message}</div>
    </div>;
  }
}`
);

c.assertBody(
`const Message = ({ title, message, error }) => {
  return <div>
    <h1 elem="title">{ title }</h1>
    <div elem="message" mods={{ error }}>{ message }</div>
  </div>;
};`,
`const Message = ({ title, message, error }) => {
  return <div className={_bem("Message")}>
    <h1 className={_bem("Message", "title")}>{title}</h1>
    <div className={_bem("Message", "message", { error })}>{message}</div>
  </div>;
};`
);

c.assertBody(
`const Time = ({ time }) => {
  return <div>
    <span></span>
    {time}
  </div>;
};`,
`const Time = ({ time }) => {
  return <div className={_bem("time")}>
    <span></span>
    {time}
  </div>;
};`
);


