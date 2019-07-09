# Upgrading
All notable manual upgrade steps are listed in this file.

## [Unreleased]

### Simplified `BoclipsSecurity` Exports

In order to provide an easier to consume API, the following have now been merged into a single module that provides singleton behaviour without mutating the global state of the application.

- `authenticate`
- `isAuthenticated`
- `logout`

The previous behaviour of `authenticate` occurs now when the `BoclipsSecurity` instance is created.

You must manually invoke the axios configuration, if you require automatic header mutation. 

Before
```typescript
import { authenticate, isAuthenticated, logout } from 'boclips-js-security';

authenticate({
    onLogin: keycloak => {
      dispatch(userLoggedIn(keycloak));
    },
    realm: 'boclips',
    clientId: 'my-clientid',
    authEndpoint: defaultAuthEndpoint,
});

if (isAuthenticated()) {
  alert('Hurrah');
  
  setTimeout(() => {
    logout();
  }, 2000);
}
```

After
```typescript
import BoclipsSecurity from 'boclips-js-security';

const security = BoclipsSecurity.createInstance({
    onLogin: keycloak => {
      dispatch(userLoggedIn(keycloak));
    },
    realm: 'boclips',
    clientId: 'my-clientid',
    authEndpoint: defaultAuthEndpoint,
});

security.configureAxios();

if (security.isAuthenticated()) {
  alert('Hurrah');
  
  setTimeout(() => {
    BoclipsSecurity.getInstance().logout();
  }, 2000);
}
```