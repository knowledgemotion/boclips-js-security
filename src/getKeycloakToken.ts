import axios from 'axios';
import * as querystring from 'querystring';
import { KeycloakTokenRequestOptions } from './KeycloakTokenRequestOptions';

export const getKeycloakToken = async (
  options: KeycloakTokenRequestOptions,
  url: string,
) =>
  axios.post(url, querystring.stringify(options), {
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  });
