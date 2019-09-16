import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import { Switch, Route, Link, BrowserRouter as Router } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { createStore } from "redux";
import { Provider, KeepAlive } from "../../es";
import A from "./views/A";
import B from "./views/B";
import C from "./views/C";

function App() {
  const [toggle, setToggle] = useState(true);
  return (
    <div>
      <ul>
        <li>
          <Link to="/a">a</Link>
        </li>
        <li onClick={() => setToggle(true)}>
          <Link to="/b">b</Link>
        </li>
        <li onClick={() => setToggle(false)}>
          <Link to="/c">c</Link>
        </li>
      </ul>

      <div>
        <button onClick={() => setToggle(!toggle)}>
          toggle({toggle.toString()})
        </button>
      </div>

      <Switch>
        <Route
          path="/a"
          render={() => (
            <KeepAlive name="Test" disabled={!toggle}>
              <A />
            </KeepAlive>
          )}
        />
        <Route
          path="/b"
          render={props => (
            <KeepAlive name="A" extra={props}>
              <B />
              <B />
            </KeepAlive>
          )}
        />
        <Route
          path="/c"
          render={() => (
            <KeepAlive name="B">
              <C />
            </KeepAlive>
          )}
        />
      </Switch>
    </div>
  );
}

const store = createStore(function counter(state = 0, action) {
  switch (action.type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    default:
      return state;
  }
});

ReactDOM.render(
  <ReduxProvider store={store}>
    <Router>
      <Provider>
        <App />
      </Provider>
    </Router>
  </ReduxProvider>,
  document.getElementById("root"),
);

console.log(
  "no ssr content",
  ReactDOMServer.renderToString(
    <ReduxProvider store={store}>
      <Router>
        <Provider>
          <App />
        </Provider>
      </Router>
    </ReduxProvider>,
  ),
);

function useReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}
const Example = () => {
  const isReady = useReady();
  const [name, setName] = useState("Hello");
  const child = useMemo(() => {
    return <div>{name}</div>;
  }, [name]);
  return (
    <div>
      <button
        onClick={() => setName(old => (old === "Hello" ? "world" : "Hello"))}
      >
        Toggle
      </button>
      <Provider>
        {!isReady ? (
          child
        ) : (
          <KeepAlive name={name} key={name}>
            {child}
          </KeepAlive>
        )}
      </Provider>
    </div>
  );
};

const domStr = ReactDOMServer.renderToString(<Example></Example>);
console.log("render immediate at first time", domStr);
document.querySelector(".example").innerHTML = domStr;

ReactDOM.hydrate(<Example></Example>, document.querySelector(".example"));
