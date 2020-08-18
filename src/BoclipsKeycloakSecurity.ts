import axios from 'axios';
import * as Keycloak from 'keycloak-js';
import { KeycloakInitOptions } from 'keycloak-js';
import {
  AuthenticateOptions,
  BoclipsSecurity,
  LogoutOptions,
  SsoLoginOptions,
} from './BoclipsSecurity';
import { extractEndpoint } from './extractEndpoint';
import { getKeycloakToken } from './getKeycloakToken';

interface ConstructorArg {
  options: AuthenticateOptions;
  configureAxios?: boolean;
  host?: string;
}

export class BoclipsKeycloakSecurity implements BoclipsSecurity {
  private readonly keycloakInstance: Keycloak.KeycloakInstance = null;
  private readonly requireLoginPage: boolean;

  public constructor({
    options,
    configureAxios = true,
    host = window.location.hostname,
  }: ConstructorArg) {
    const url =
      options.authEndpoint || extractEndpoint(host, 'login') + '/auth';

    this.requireLoginPage = options.requireLoginPage;
    this.keycloakInstance = Keycloak({
      url,
      realm: options.realm,
      clientId: options.clientId,
    });

    options.username && options.password
      ? this.initialiseKeycloakWithCredentials(url, options, host)
      : this.initialiseKeycloak({}, options, host);

    if (configureAxios) {
      this.configureAxios();
    }
  }

  private initialiseKeycloakWithCredentials = (
    authEndpoint: string,
    options: AuthenticateOptions,
    host?: string,
  ) => {
    getKeycloakToken({
      client_id: options.clientId,
      realm: options.realm,
      authEndpoint,
      username: options.username,
      password: options.password,
      grant_type: 'password',
      scope: 'openid',
    })
      .then(
        ({
          data: {
            access_token: token,
            refresh_token: refreshToken,
            id_token: idToken,
          },
        }) => {
          this.initialiseKeycloak(
            { token, refreshToken, idToken },
            options,
            host,
          );
        },
      )
      .catch(() => {
        options.onFailure && options.onFailure();
      });
  };

  private initialiseKeycloak = (
    extraInitOptions: KeycloakInitOptions,
    { onLogin, onFailure, checkLoginIframe = true }: AuthenticateOptions,
    host: string,
  ) => {
    this.keycloakInstance
      .init({
        onLoad: 'check-sso',
        checkLoginIframe,
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
        ...extraInitOptions,
      })
      .then(
        (authenticated) => {
          if (authenticated) {
            onLogin(this.keycloakInstance);
          } else {
            onFailure && onFailure();
            if (this.requireLoginPage) {
              this.keycloakInstance.login();
            }
          }
        },
        (error) => {
          console.error('An error occurred trying to login', error);
          onFailure && onFailure();
        },
      );
  };

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
          if (this.requireLoginPage) {
            this.keycloakInstance.login();
          }

          reject(false);
        },
      );
    });

  public getKeycloakInstance = () => this.keycloakInstance;
}
