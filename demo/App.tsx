import axios from "axios";
import * as React from "react";
import { Component } from "react";
import * as ReactDom from "react-dom";
import { authenticate } from "../src/authenticate";
import { logout } from "../src/logout";

authenticate(() => {
    ReactDom.render(
      <Body/>, document.getElementById("content")
    );
  },
  "teachers",
  "educators",
  "login-required",
  "https://login.testing-boclips.com/auth");

class Body extends Component {
  constructor(props) {
    super(props);
    this.state = { authWorks: false };
  }

  render(): React.ReactNode {
    return this.state["authWorks"] && <section>
      <div><strong>WORKS</strong></div>
      <br/>
      <button id="logout" onClick={() => logout()}>LOGOUT</button>
    </section>;
  }

  componentWillMount() {
    axios.get("https://video-service.testing-boclips.com/v1/videos").then(() => {
      this.setState({ authWorks: true });
    });
  }
}