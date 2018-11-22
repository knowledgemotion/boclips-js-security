import axios from 'axios';
import * as Keycloak from 'keycloak-js';

let keycloak;

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
  keycloak = Keycloak({url, realm, clientId});
  const token = localStorage.getItem('kc_token') || undefined;
  const refreshToken = localStorage.getItem('kc_refreshToken') || undefined;

  keycloak.init({onLoad: mode, token, refreshToken, checkLoginIframe: false})
    .success(authenticated => {
      if (authenticated) {
        updateLocalStorage();
        onLogin(keycloak);
      }
    });


  axios.interceptors.request.use(config => {
    // @ts-ignore
    return keycloak.updateToken(5).then(() => {
      updateLocalStorage();
      if (keycloak.authenticated && keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      } else {
        delete config.headers.Authorization;
      }
      return Promise.resolve(config);
    })
      .catch(() => {
        if (mode === 'login-required') {
          keycloak.login();
        } else {
          return Promise.resolve(config);
        }
      });
  });

  const updateLocalStorage = () => {
    localStorage.setItem('kc_token', keycloak.token!);
    localStorage.setItem('kc_refreshToken', keycloak.refreshToken!);
  };

}

export interface LogoutOptions {
  redirectUri: string
}

export function logout(options?: LogoutOptions) {
  if( !keycloak ) {
    console.error("Cannot logout if user is not authenticated first")
  }
  keycloak.logout(options)
}