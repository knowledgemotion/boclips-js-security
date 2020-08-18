import * as React from 'react';
import { Component } from 'react';
import * as ReactDom from 'react-dom';
import BoclipsSecurity, {
  BoclipsSecurity as BoclipsSecurityInstance,
} from '../../src/BoclipsSecurity';

interface State {
  message: string;
  security: BoclipsSecurityInstance
}

class Demo extends Component<{}, State> {
  private readonly username;
  private readonly password;

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
    this.state = { message: 'Not entered yet', security: undefined };
    this.username = React.createRef<HTMLInputElement>();
    this.password = React.createRef<HTMLInputElement>();
  }

  public render(): React.ReactNode {
    return (
      <>
        <form onSubmit={this.handleSubmit}>
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
    this.state.security.logout({redirectUri: ''});
  }

  handleSubmit(event) {
    event.preventDefault();

    BoclipsSecurity.createInstance({
      username: this.username.current.value,
      password: this.password.current.value,
      realm: 'boclips',
      clientId: 'teachers',
      requireLoginPage: false,
      checkLoginIframe: false,
      authEndpoint: 'https://login.staging-boclips.com/auth',
      onLogin: (_) => {
        this.setState({
          ...this.state,
          message: 'Successful authentication!',
        });
      },
      onFailure: () => {
        this.setState({
          ...this.state,
          message: 'Authentication failure!',
        });
      },
    });
  }
}

ReactDom.render(<Demo />, document.getElementById('content'));
