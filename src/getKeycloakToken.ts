import axios from 'axios';
import * as querystring from 'querystring';
import { KeycloakTokenRequestOptions } from './KeycloakTokenRequestOptions';

export const getKeycloakToken = async (options: KeycloakTokenRequestOptions) =>
  axios.post(
    getLoginUrl(options.realm, options.authEndpoint),
    querystring.stringify(options),
    {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    },
  );

const getLoginUrl = (realm: string, authEndpoint: string) =>
  `${authEndpoint}/realms/${realm}/protocol/openid-connect/token`;
