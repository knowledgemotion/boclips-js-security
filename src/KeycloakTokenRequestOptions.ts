export interface KeycloakTokenRequestOptions {
  authEndpoint: string;
  realm: string;
  client_id: string;
  username: string;
  password: string;
  grant_type: string;
  scope: string;
}
