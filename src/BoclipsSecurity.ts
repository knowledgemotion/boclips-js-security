import * as Keycloak from 'keycloak-js';
import { BoclipsKeycloakSecurity } from './BoclipsKeycloakSecurity';

export interface AuthenticateOptions {
  onLogin: (keycloak: Keycloak.KeycloakInstance<'native'>) => void;
  onFailure?: () => void;
  realm: string;
  clientId: string;
  mode?: 'login-required' | 'check-sso';
  authEndpoint?: string;
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
