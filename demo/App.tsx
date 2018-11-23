import axios from 'axios';
import * as React from 'react';
import { Component } from 'react';
import * as ReactDom from 'react-dom';
import { authenticate, logout } from '../src/authenticate';

authenticate(() => {
  ReactDom.render(<Body/>, document.getElementById('content'));
}, 'backoffice', 'backoffice-ui', 'login-required', 'https://login.testing-boclips.com/auth');

class Body extends Component {

  constructor(props) {
    // Required step: always call the parent class' constructor
    super(props);

    // Set the state directly. Use props if necessary.
    this.state = {authWorks: false};
  }

  render(): React.ReactNode {
    return this.state['authWorks'] && <section>
        <div><strong>WORKS</strong></div>
        <br/>
        <button id="logout" onClick={() => logout()}>LOGOUT</button>
    </section>;
  }

  componentWillMount() {
    axios.get('https://marketing-service.testing-boclips.com/v1/marketing-collections').then(() => {
      this.setState({authWorks: true});
    });
  }
}