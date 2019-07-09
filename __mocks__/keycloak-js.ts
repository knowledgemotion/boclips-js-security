import { KeycloakPromise } from 'keycloak-js';

const Promise = () => {
  const promise = {} as KeycloakPromise<any, any>;

  promise.success = jest.fn().mockReturnValue(promise);
  promise.error = jest.fn().mockReturnValue(promise);

  return promise;
};

module.exports = jest.fn().mockReturnValue({
  init: jest.fn().mockReturnValue(Promise()),
  updateToken: jest.fn().mockReturnValue(Promise()),
  login: jest.fn(),
  logout: jest.fn()
});
