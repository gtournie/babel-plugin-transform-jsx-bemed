"use strict"

const c = require('./common');

c.assertBody(
`<div block="message">
  <h1 elem="title">{ title }</h1>
  <div elem="message" mods={{ error }}>{ message }</div>
</div>;`,
`<div className={_bem("message")}>
  <h1 className={_bem("message", "title")}>{title}</h1>
  <div className={_bem("message", "message", { error })}>{message}</div>
</div>;`
);

c.assertBody(
`<div block="time">
  <span></span>
  { time }
</div>;`,
`<div className={_bem("time")}>
  <span></span>
  {time}
</div>;`
);
