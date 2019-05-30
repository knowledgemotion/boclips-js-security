import axios from 'axios';
import * as Keycloak from 'keycloak-js';
import extractEndpoint from './extractEndpoint';
import getGlobalKeycloak from './helpers/getGlobalKeycloak';
import setGlobalKeycloak from './helpers/setGlobalKeycloak';
import { AuthenticateOptions } from './AuthenticateOptions';

const LOGIN_REQUIRED = 'login-required';

export function authenticate(options: AuthenticateOptions) {
  const mode = options.mode || LOGIN_REQUIRED;
  const url = options.authEndpoint || extractEndpoint(window.location.host) + '/auth';
  const keycloakInstance = Keycloak({
    url,
    realm: options.realm,
    clientId: options.clientId,
  });

  setGlobalKeycloak(keycloakInstance);
  getGlobalKeycloak()
    .init({ onLoad: mode })
    .success(authenticated => {
      if (authenticated) {
        options.onLogin(getGlobalKeycloak());
      }
    });

  addAxiosInterceptor(mode);
}

export function isAuthenticated() {
  return getGlobalKeycloak().authenticated && getGlobalKeycloak().token;
}

function addAxiosInterceptor(mode: 'login-required' | 'check-sso') {
  axios.interceptors.request.use(config => {
    const keycloakInstance = getGlobalKeycloak();

    return new Promise(resolve => {
      keycloakInstance
        .updateToken(5)
        .success(() => {
          if (isAuthenticated()) {
            config.headers.Authorization = `Bearer ${keycloakInstance.token}`;
          } else {
            delete config.headers.Authorization;
          }
          return resolve(config);
        })
        .error(() => {
          if (mode === LOGIN_REQUIRED) {
            keycloakInstance.login();
          } else {
            return resolve(config);
          }
        });
    });

  });
}
