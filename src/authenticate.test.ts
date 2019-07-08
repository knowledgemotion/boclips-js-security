import axios, { AxiosRequestConfig } from 'axios';
import { mocked } from 'ts-jest/utils';
import { authenticate, isAuthenticated } from './authenticate';
import { AuthenticateOptions } from './AuthenticateOptions';
import getGlobalKeycloak from './helpers/getGlobalKeycloak';
import * as Keycloak from 'keycloak-js';
import { extractEndpoint } from './extractEndpoint';
import setGlobalKeycloak from './helpers/setGlobalKeycloak';

jest.mock('keycloak-js');
jest.mock('./extractEndpoint');
jest.mock('./helpers/getGlobalKeycloak');
jest.mock('./helpers/setGlobalKeycloak');

describe('authenticate', () => {
  it('can set the global keycloak instance', () => {
    const options: AuthenticateOptions = {
      authEndpoint: 'test.boclips/auth',
      mode: 'login-required',
      clientId: '10',
      realm: 'testRealm',
      onLogin: jest.fn(),
    };
    authenticate(options);

    const keycloakInstance = mocked(Keycloak).mock.results[0].value;
    expect(setGlobalKeycloak).toHaveBeenCalledWith(keycloakInstance);
  });

  it('configures keycloak with the options provided', () => {
    const options: AuthenticateOptions = {
      authEndpoint: 'test.boclips/auth',
      mode: 'login-required',
      clientId: '10',
      realm: 'testRealm',
      onLogin: jest.fn(),
    };
    authenticate(options);

    expect(Keycloak).toHaveBeenCalledWith({
      url: options.authEndpoint,
      realm: options.realm,
      clientId: options.clientId,
    });

    const keycloakInstance = mocked(Keycloak).mock.results[0].value;
    expect(keycloakInstance.init).toHaveBeenCalledWith({
      onLoad: options.mode,
    });
  });

  it('determines the correct endpoint when not provided via config', () => {
    mocked(extractEndpoint).mockReturnValue('not-test.boclips');

    authenticate({} as any);

    expect(Keycloak).toHaveBeenCalledWith({
      url: 'not-test.boclips/auth',
      realm: undefined,
      clientId: undefined,
    });
  });

  it('uses the default login-required mode when not provided', () => {
    authenticate({} as any);

    const keycloakInstance = mocked(Keycloak).mock.results[0].value;
    expect(keycloakInstance.init).toHaveBeenCalledWith({
      onLoad: 'login-required',
    });
  });

  describe('it takes an onLogin function', () => {
    let authenticatedSuccess = null;
    let options: AuthenticateOptions;
    let keycloakInstance = null;

    beforeEach(() => {
      options = {
        onLogin: jest.fn(),
      } as any;
      authenticate(options);
      keycloakInstance = mocked(Keycloak).mock.results[0].value;
      expect(keycloakInstance.init).toHaveBeenCalled();

      mocked(getGlobalKeycloak).mockReturnValue(keycloakInstance);

      const initPromise = keycloakInstance.init.mock.results[0].value;
      authenticatedSuccess = initPromise.success.mock.calls[0][0];
    });

    it('calls the onLogin function once authentication has succeeded', () => {
      authenticatedSuccess(true);
      expect(options.onLogin).toHaveBeenCalledWith(keycloakInstance);
    });

    it(' does not call the onLogin function if authentication fails', () => {
      authenticatedSuccess(false);
      expect(options.onLogin).not.toHaveBeenCalledWith(keycloakInstance);
    });
  });
});

describe('isAuthenicated', () => {
  const testData = [
    {
      message: 'authenticated with a token',
      data: {
        authenticated: true,
        token: 'token123',
      },
      expectation: true,
    },
    {
      message: 'authenticated with a token',
      data: {
        authenticated: false,
      },
      expectation: false,
    },
    {
      message: 'authenticated with a token',
      data: {
        authenticated: true,
      },
      expectation: false,
    },
  ];

  testData.forEach(({ message, data, expectation }) => {
    it(`returns ${expectation}, when ${message}`, () => {
      mocked(getGlobalKeycloak).mockReturnValue(data);

      expect(isAuthenticated()).toEqual(expectation);
    });
  });
});

describe('axios interceptor', () => {
  it('can install an axios interceptor', () => {
    const options: Partial<AuthenticateOptions> = {
      mode: 'check-sso',
    };
    authenticate(options as AuthenticateOptions);

    expect(axios.interceptors.request.use).toHaveBeenCalled();
  });

  describe('interceptor behaviour with login-required', () => {
    let updateTokenPromise = null;
    let interceptorPromise = null;
    let keycloakInstance = null;

    beforeEach(() => {
      const options: Partial<AuthenticateOptions> = {
        mode: 'login-required',
      };

      keycloakInstance = Keycloak();
      keycloakInstance.token = 'test-token-123';

      mocked(getGlobalKeycloak).mockReturnValue(keycloakInstance);

      authenticate(options as AuthenticateOptions);

      const interceptor = mocked(axios.interceptors.request.use).mock
        .calls[0][0] as any;

      interceptorPromise = interceptor({ headers: {} });

      expect(keycloakInstance.updateToken).toHaveBeenCalled();

      updateTokenPromise = mocked(keycloakInstance.updateToken).mock
        .results[0].value;
    });

    it('resolves config with authorization header when updateToken was successful', () => {
      const successCallback = updateTokenPromise.success.mock.calls[0][0];

      successCallback();

      return interceptorPromise.then(resolvedConfig => {
        expect(resolvedConfig.headers.Authorization).toEqual(
          'Bearer test-token-123',
        );
      });
    });

    it('calls the keycloak.login function when updateToken failed', () => {
      const errorCallback = updateTokenPromise.error.mock.calls[0][0];

      errorCallback();

      expect(keycloakInstance.login).toHaveBeenCalled();
    });
  });

  it('if check-sso mode, and token refresh fails then config does not change', () => {
    const options: Partial<AuthenticateOptions> = {
      mode: 'check-sso',
    };

    const keycloakInstance = Keycloak();
    keycloakInstance.token = 'test-token-123';

    mocked(getGlobalKeycloak).mockReturnValue(keycloakInstance);

    authenticate(options as AuthenticateOptions);

    const interceptor = mocked(axios.interceptors.request.use).mock
      .calls[0][0] as any;

    const interceptorPromise = interceptor({
      headers: { Authorization: 'expired-token' },
    });

    let updateTokenPromise = mocked(keycloakInstance.updateToken).mock
      .results[0].value;

    const errorCallback = updateTokenPromise.error.mock.calls[0][0];

    errorCallback();

    return interceptorPromise.then(resolvedConfig => {
      expect(resolvedConfig.headers.Authorization).toEqual('expired-token');
    });
  });
});
