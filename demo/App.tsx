import axios from 'axios';
import * as React from 'react';
import { Component } from 'react';
import * as ReactDom from 'react-dom';
import { authenticate } from '../src/authenticate';
import { logout } from '../src/logout';

authenticate({
  onLogin: () => {
    ReactDom.render(<Body />, document.getElementById('content'));
  },
  realm: 'boclips',
  clientId: 'teachers',
  mode: 'login-required',
  authEndpoint: 'https://login.testing-boclips.com/auth',
});

interface State {
  authWorks: boolean;
}

class Body extends Component<{}, State> {
  constructor(props) {
    super(props);
    this.state = { authWorks: false };
  }

  public render(): React.ReactNode {
    return (
      this.state.authWorks && (
        <section>
          <div>
            <strong>WORKS</strong>
          </div>
          <br />
          <button id="logout" onClick={() => logout()}>
            LOGOUT
          </button>
        </section>
      )
    );
  }

  public componentWillMount() {
    axios
      .get('https://api.testing-boclips.com/v1/videos?query=hi')
      .then(() => {
        this.setState({ authWorks: true });
      }).catch((e) => console.error(e));
  }
}
