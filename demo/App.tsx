import * as React from "react";
import * as ReactDom from 'react-dom';
import { authenticate, logout } from '../src/authenticate';

authenticate(() => {
  ReactDom.render(<section>
    <div><strong> I see it</strong> keycloak is the beast, and I am logged in</div>
    <button id="logout" onClick={() => logout()}>LOGOUT</button>
  </section>, document.getElementById('content'));
}, 'backoffice', 'backoffice-ui', 'https://login.testing-boclips.com/auth');
