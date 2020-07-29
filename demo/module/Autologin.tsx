import axios from 'axios';
import * as React from 'react';
import { Component } from 'react';
import * as ReactDom from 'react-dom';
import BoclipsSecurity, {
  AuthenticateOptions,
} from '../../src/BoclipsSecurity';

class Demo extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
    this.state = { message: 'Not entered yet' };
    this.username = React.createRef();
    this.password = React.createRef();
  }

  public render(): React.ReactNode {
    return (
      <>
        <form id="kc-form-login" onSubmit={this.handleSubmit}>
          <p>
            <label>
              Username
              <input id="username" ref={this.username} autoFocus />
            </label>
          </p>

          <p>
            <label>
              Password
              <input id="password" ref={this.password} type="password" />
            </label>
          </p>

          <p>
            <input type="submit" />
          </p>
        </form>

        <p id="message">{this.state.message}</p>

        <button onClick={this.handleLogOut}>Log out</button>
      </>
    );
  }

  handleLogOut() {
    BoclipsSecurity.createInstance({
      realm: 'boclips',
      clientId: 'teachers',
      requireLoginPage: false,
      authEndpoint: 'https://login.staging-boclips.com/auth',
    }).logout();
  }

  handleSubmit(event) {
    event.preventDefault();

    BoclipsSecurity.createInstance({
      username: this.username.current.value,
      password: this.password.current.value,
      realm: 'boclips',
      clientId: 'teachers',
      requireLoginPage: false,
      authEndpoint: 'https://login.staging-boclips.com/auth',
      onLogin: (authenticated) => {
        this.setState({
          message: 'Successful authentication!',
        });
      },
      onFailure: (error) => {
        this.setState({
          message: 'Authentication failure!',
        });
      },
    });
  }
}

ReactDom.render(<Demo />, document.getElementById('content'));
