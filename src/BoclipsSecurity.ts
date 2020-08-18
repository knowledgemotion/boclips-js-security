import * as Keycloak from 'keycloak-js';
import { BoclipsKeycloakSecurity } from './BoclipsKeycloakSecurity';

export interface AuthenticateOptions {
  onLogin: (keycloak: Keycloak.KeycloakInstance) => void;
  onFailure?: () => void;
  requireLoginPage: boolean;
  realm: string;
  clientId: string;
  checkLoginIframe?: boolean;
  authEndpoint?: string;
  username?: string;
  password?: string;
}

export interface LogoutOptions {
  redirectUri: string;
}

export interface SsoLoginOptions {
  idpHint: string;
  redirectUri: string;
}

export interface BoclipsSecurity {
  isAuthenticated: () => boolean;
  logout: (options: LogoutOptions) => void;
  getTokenFactory: (validityTime: number) => () => Promise<string>;
  configureAxios: () => void;
  ssoLogin: (options: SsoLoginOptions) => void;
}

let instance = null;

export default {
  getInstance: (): BoclipsSecurity => instance,
  createInstance: (
    options: AuthenticateOptions,
    configureAxios: boolean = true,
  ): BoclipsSecurity => {
    instance = new BoclipsKeycloakSecurity({ options, configureAxios });
    return instance;
  },
};
