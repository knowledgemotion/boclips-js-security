import axios from 'axios';
import * as Keycloak from 'keycloak-js';


export function authenticate(
  onLogin: (keycloak: Keycloak.KeycloakInstance) => void,
  realm: string,
  clientId: string,
  mode: 'login-required' | 'check-sso' = 'login-required',
  keycloakUrl?: string,
) {

  const parts = window.location.host.split('.');
  const domain = parts.length > 1 ? [parts[parts.length - 2], parts[parts.length - 1]].join('.') : 'staging-boclips.com';
  const url = keycloakUrl || `https://login.${domain}/auth`;

  // @ts-ignore
  setKeycloak(Keycloak({url, realm, clientId}));

  getKeycloak().init({onLoad: mode})
    .success(authenticated => {
      if (authenticated) {
        onLogin(getKeycloak());
      }
    });

  axios.interceptors.request.use(config => {
    return getKeycloak().updateToken(5)
      .then(() => {
        if (getKeycloak().authenticated && getKeycloak().token) {
          config.headers.Authorization = `Bearer ${getKeycloak().token}`;
        } else {
          delete config.headers.Authorization;
        }
        return Promise.resolve(config);
      })
      .catch(() => {
        if (mode === 'login-required') {
          getKeycloak().login();
        } else {
          return Promise.resolve(config);
        }
      });
  });
}

function setKeycloak(keycloak: Keycloak.KeycloakInstance) {
  window['keycloak'] = keycloak; // but forgive for we have sinned
}

function getKeycloak() {
  return window['keycloak'];
}

export interface LogoutOptions {
  redirectUri: string
}

export function logout(options?: LogoutOptions) {
  if (!getKeycloak()) {
    console.error('Cannot logout if user is not authenticated first');
  }
  getKeycloak().logout(options);
}