export interface AuthenticateOptions {
  onLogin: (keycloak: Keycloak.KeycloakInstance) => void;
  realm: string;
  clientId: string;
  mode?: 'login-required' | 'check-sso';
  authEndpoint?: string;
}
