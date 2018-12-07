import Keycloak = require('keycloak-js');

export default function setGlobalKeycloak(keycloak: Keycloak.KeycloakInstance) {
  window.keycloak = keycloak;
}
