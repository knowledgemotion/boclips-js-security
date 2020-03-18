import axios from 'axios';
import * as Keycloak from 'keycloak-js';
import {
  AuthenticateOptions,
  BoclipsSecurity,
  LogoutOptions,
  SsoLoginOptions,
} from './BoclipsSecurity';
import { extractEndpoint } from './extractEndpoint';
import { isDevelopmentAddress } from './isDevelopmentAddress';

const LOGIN_REQUIRED = 'login-required';

interface ConstructorArg {
  options: AuthenticateOptions;
  configureAxios?: boolean;
  host?: string;
}

export class BoclipsKeycloakSecurity implements BoclipsSecurity {
  private readonly keycloakInstance: Keycloak.KeycloakInstance<'native'> = null;
  private readonly mode: AuthenticateOptions['mode'];

  public constructor({
    options,
    configureAxios = true,
    host = window.location.hostname,
  }: ConstructorArg) {
    this.mode = options.mode || LOGIN_REQUIRED;
    const url =
      options.authEndpoint || extractEndpoint(host, 'login') + '/auth';

    this.keycloakInstance = Keycloak<'native'>({
      url,
      realm: options.realm,
      clientId: options.clientId,
    });

    const checkLoginIframe = !isDevelopmentAddress(host);
    this.keycloakInstance
      .init({ onLoad: this.mode, promiseType: 'native', checkLoginIframe })
      .then(
        authenticated => {
          if (authenticated) {
            options.onLogin(this.keycloakInstance);
          } else {
            options.onFailure && options.onFailure();
          }
        },
        error => {
          console.error('An error occurred trying to login', error);

          options.onFailure && options.onFailure();
        },
      );

    if (configureAxios) {
      this.configureAxios();
    }
  }

  public isAuthenticated = () => {
    return !!(
      this.keycloakInstance.authenticated && this.keycloakInstance.token
    );
  };

  public configureAxios = () => {
    const tokenFactory = this.getTokenFactory(5);

    axios.interceptors.request.use(async config => {
      try {
        const token = await tokenFactory();

        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.warn('Caught error getting fresh token.');
      }

      return config;
    });
  };

  public ssoLogin = (options: SsoLoginOptions) => {
    this.keycloakInstance.login(options);
  };

  public logout = (options: LogoutOptions) => {
    this.keycloakInstance.logout(options);
  };

  public getTokenFactory = (minValidity: number) => () =>
    new Promise<string>((resolve, reject) => {
      this.keycloakInstance.updateToken(minValidity).then(
        () => {
          return resolve(this.keycloakInstance.token);
        },
        _error => {
          if (this.mode === LOGIN_REQUIRED) {
            this.keycloakInstance.login();
          }

          reject(false);
        },
      );
    });

  public getKeycloakInstance = () => this.keycloakInstance;
}
