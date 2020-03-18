import axios from 'axios';
import * as React from 'react';
import { Component } from 'react';
import * as ReactDom from 'react-dom';
import BoclipsSecurity, { AuthenticateOptions } from '../src/BoclipsSecurity';

class Demo extends Component {
  public render(): React.ReactNode {
    return (
      security.isAuthenticated() && (
        <section>
          <div>
            <strong>WORKS</strong>
          </div>
          <br />
          <button
            id="logout"
            onClick={() =>
              security.logout({
                redirectUri: window.location.href,
              })
            }
          >
            LOGOUT
          </button>
        </section>
      )
    );
  }

  public componentWillMount() {
    axios
      .get(
        'https://api.staging-boclips.com/v1/videos?query=query-from-boclips-js-security',
      )
      .then(console.log)
      .catch(console.error);
  }
}

const authOptions: AuthenticateOptions = {
  realm: 'boclips',
  clientId: 'teachers',
  mode: 'login-required',
  authEndpoint: 'https://login.staging-boclips.com/auth',
  onLogin: () => {
    ReactDom.render(<Demo />, document.getElementById('content'));
  },
};

const security = BoclipsSecurity.createInstance(authOptions);
