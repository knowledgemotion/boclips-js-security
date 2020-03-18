import { KeycloakPromise } from 'keycloak-js';

const Promise = () => {
  const promise = {} as Promise<any>;

  promise.then = jest.fn().mockReturnValue(promise);
  promise.catch = jest.fn().mockReturnValue(promise);

  return promise;
};

module.exports = jest.fn().mockReturnValue({
  init: jest.fn().mockReturnValue(Promise()),
  updateToken: jest.fn().mockReturnValue(Promise()),
  login: jest.fn(),
  logout: jest.fn(),
});
