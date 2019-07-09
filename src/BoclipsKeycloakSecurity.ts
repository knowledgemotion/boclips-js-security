import axios from 'axios';
import {
  AuthenticateOptions,
  BoclipsSecurity,
  LogoutOptions,
} from './BoclipsSecurity';
import * as Keycloak from 'keycloak-js';
import { extractEndpoint } from './extractEndpoint';

const LOGIN_REQUIRED = 'login-required';

export class BoclipsKeycloakSecurity implements BoclipsSecurity {
  private readonly keycloakInstance: Keycloak.KeycloakInstance = null;
  private readonly mode: AuthenticateOptions['mode'];

  public constructor(
    options: AuthenticateOptions,
    configureAxios: boolean = true,
  ) {
    this.mode = options.mode || LOGIN_REQUIRED;
    const url =
      options.authEndpoint ||
      extractEndpoint(window.location.host, 'login') + '/auth';

    this.keycloakInstance = Keycloak({
      url,
      realm: options.realm,
      clientId: options.clientId,
    });

    this.keycloakInstance.init({ onLoad: this.mode }).success(authenticated => {
      if (authenticated) {
        options.onLogin(this.keycloakInstance);
      }
    });

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

    axios.interceptors.request.use(config => {
      return new Promise(resolve => {
        tokenFactory()
          .then(token => {
            config.headers.Authorization = `Bearer ${token}`;

            resolve(config);
          })
          .catch(() => {
            resolve(config);
          });
      });
    });
  };

  public logout = (options: LogoutOptions) => {
    this.keycloakInstance.logout(options);
  };

  public getTokenFactory = (minValidity: number) => () => {
    return new Promise<string>((resolve, reject) => {
      this.keycloakInstance
        .updateToken(minValidity)
        .success(() => {
          return resolve(this.keycloakInstance.token);
        })
        .error(() => {
          if (this.mode === LOGIN_REQUIRED) {
            this.keycloakInstance.login();
          }

          reject(false);
        });
    });
  };

  public getKeycloakInstance = () => this.keycloakInstance;
}
