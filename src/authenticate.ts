import axios from "axios";
import * as Keycloak from "keycloak-js";
import extractAuthEndpoint from "./helpers/extractAuthEndpoint";
import getGlobalKeycloak from "./helpers/getGlobalKeycloak";
import setGlobalKeycloak from "./helpers/setGlobalKeycloak";

const LOGIN_REQUIRED = "login-required";

export function authenticate(
  onLogin: (keycloak: Keycloak.KeycloakInstance) => void,
  realm: string,
  clientId: string,
  mode: "login-required" | "check-sso" = LOGIN_REQUIRED,
  defaultAuthEndpoint?: string
) {
  const url = defaultAuthEndpoint || extractAuthEndpoint(window.location.host);
  const keycloakInstance = Keycloak({ url, realm, clientId });

  setGlobalKeycloak(keycloakInstance);
  getGlobalKeycloak().init({ onLoad: mode })
    .success(authenticated => {
      if (authenticated) {
        onLogin(getGlobalKeycloak());
      }
    });

  addAxiosInterceptor(mode);
}

export function isAuthenticated() {
  return getGlobalKeycloak().authenticated && getGlobalKeycloak().token;
}

function addAxiosInterceptor(mode: "login-required" | "check-sso") {
  axios.interceptors.request.use(config => {
    const keycloakInstance = getGlobalKeycloak();

    return keycloakInstance.updateToken(5)
      .then(() => {
        if (isAuthenticated()) {
          config.headers.Authorization = `Bearer ${keycloakInstance.token}`;
        } else {
          delete config.headers.Authorization;
        }
        return Promise.resolve(config);
      })
      .catch(() => {
        if (mode === LOGIN_REQUIRED) {
          keycloakInstance.login();
        } else {
          return Promise.resolve(config);
        }
      });
  });
}
