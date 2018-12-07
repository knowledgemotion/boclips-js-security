import getGlobalKeycloak from './helpers/getGlobalKeycloak';
import { LogoutOptions } from './LogoutOptions';

export function logout(options?: LogoutOptions) {
  const keycloakInstance = getGlobalKeycloak();
  if (keycloakInstance) {
    keycloakInstance.logout(options);
    return;
  }
  console.error('Cannot logout if user is not authenticated first');
}
