import Keycloak = require('keycloak-js');

export default function setGlobalKeycloak(keycloak: Keycloak.KeycloakInstance) {
  (window as any).keycloak = keycloak;
}
