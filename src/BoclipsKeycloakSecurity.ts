import axios from 'axios';
import * as Keycloak from 'keycloak-js';
import { KeycloakInitOptions } from 'keycloak-js';
import * as querystring from 'querystring';
import {
  AuthenticateOptions,
  BoclipsSecurity,
  LogoutOptions,
  SsoLoginOptions,
} from './BoclipsSecurity';
import { extractEndpoint } from './extractEndpoint';
import { getKeycloakToken } from './getKeycloakToken';
import { isDevelopmentAddress } from './isDevelopmentAddress';
import { KeycloakTokenRequestOptions } from './KeycloakTokenRequestOptions';

const LOGIN_REQUIRED = 'login-required';

interface ConstructorArg {
  options: AuthenticateOptions;
  configureAxios?: boolean;
  host?: string;
}

export class BoclipsKeycloakSecurity implements BoclipsSecurity {
  private readonly keycloakInstance: Keycloak.KeycloakInstance = null;
  private readonly mode: AuthenticateOptions['mode'];

  public constructor({
    options,
    configureAxios = true,
    host = window.location.hostname,
  }: ConstructorArg) {
    this.mode = options.mode || LOGIN_REQUIRED;
    const url =
      options.authEndpoint || extractEndpoint(host, 'login') + '/auth';

    this.keycloakInstance = Keycloak({
      url,
      realm: options.realm,
      clientId: options.clientId,
    });

    const checkLoginIframe = !isDevelopmentAddress(host);

    if (options.username && options.password) {
      const tokenRequestOptions = this.getTokenRequestOptions(
        options,
        url,
      );
      getKeycloakToken(tokenRequestOptions).then((response) => {
        const {
          access_token: token,
          refresh_token: refreshToken,
          id_token: idToken,
        } = response.data;
        this.initialiseKeycloak(
          { onLoad: this.mode, checkLoginIframe, token, refreshToken, idToken },
          options,
        );
      });
    } else {
      this.initialiseKeycloak({ onLoad: this.mode, checkLoginIframe }, options);
    }
    if (configureAxios) {
      this.configureAxios();
    }
  }

  private initialiseKeycloak = (
    initOptions: KeycloakInitOptions,
    authOptions: AuthenticateOptions,
  ) => {
    this.keycloakInstance.init(initOptions).then(
      (authenticated) => {
        if (authenticated) {
          authOptions.onLogin(this.keycloakInstance);
        } else {
          authOptions.onFailure && authOptions.onFailure();
        }
      },
      (error) => {
        console.error('An error occurred trying to login', error);
        authOptions.onFailure && authOptions.onFailure();
      },
    );
  };

  private getTokenRequestOptions = (
    options: AuthenticateOptions,
    url: string,
  ): KeycloakTokenRequestOptions => ({
    client_id: options.clientId,
    realm: options.realm,
    authEndpoint: url,
    username: options.username,
    password: options.password,
    grant_type: 'password',
    scope: 'openid',
  });

  public isAuthenticated = () => {
    return !!(
      this.keycloakInstance.authenticated && this.keycloakInstance.token
    );
  };

  public configureAxios = async () => {
    const tokenFactory = this.getTokenFactory(5);
    axios.interceptors.request.use(async (config) => {
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
        (_error) => {
          if (this.mode === LOGIN_REQUIRED) {
            this.keycloakInstance.login();
          }

          reject(false);
        },
      );
    });

  public getKeycloakInstance = () => this.keycloakInstance;
}
