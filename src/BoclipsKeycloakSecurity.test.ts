import axios from 'axios';
import * as KeycloakMock from 'keycloak-js';
import { mocked } from 'ts-jest/utils';
import { BoclipsKeycloakSecurity } from './BoclipsKeycloakSecurity';
import { AuthenticateOptions } from './BoclipsSecurity';
import { extractEndpoint } from './extractEndpoint';

jest.mock('keycloak-js');
jest.mock('./extractEndpoint');

const Keycloak = KeycloakMock as jest.Mock;
const firstCallArg = (mockFn: any) => (mockFn as jest.Mock).mock.calls[0][0];

const opts = (
  options: Partial<AuthenticateOptions> = {},
): AuthenticateOptions => {
  return {
    clientId: 'client-id',
    realm: 'realm',
    onLogin: () => {},
    ...options,
  };
};

describe('authenticate', () => {
  it('configures keycloak with the options provided', () => {
    const options: AuthenticateOptions = {
      authEndpoint: 'test.boclips/auth',
      mode: 'login-required',
      clientId: '10',
      realm: 'testRealm',
      onLogin: jest.fn(),
    };
    const instance = new BoclipsKeycloakSecurity({ options });

    expect(Keycloak).toHaveBeenCalledWith({
      url: options.authEndpoint,
      realm: options.realm,
      clientId: options.clientId,
    });

    const keycloakInstance = instance.getKeycloakInstance();

    expect(keycloakInstance.init).toHaveBeenCalledWith({
      onLoad: options.mode,
      promiseType: 'native',
      checkLoginIframe: false,
    });
  });

  it('determines the correct endpoint when not provided via config', () => {
    mocked(extractEndpoint).mockReturnValue('not-test.boclips');

    new BoclipsKeycloakSecurity({ options: opts({ authEndpoint: undefined }) });

    expect(Keycloak).toHaveBeenCalled();
    expect(Keycloak.mock.calls[0][0].url).toEqual('not-test.boclips/auth');
  });

  it('uses the default login-required mode when not provided', () => {
    const instance = new BoclipsKeycloakSecurity({
      options: opts({ mode: undefined }),
    });
    const keycloakInstance = instance.getKeycloakInstance();
    expect(firstCallArg(keycloakInstance.init).onLoad).toEqual(
      'login-required',
    );
  });

  it('iframe checking is enabled when host is not localhost', () => {
    const instance = new BoclipsKeycloakSecurity({
      options: opts(),
      host: 'boclips.com',
    });

    const keycloakInstance = instance.getKeycloakInstance();
    expect(firstCallArg(keycloakInstance.init).checkLoginIframe).toEqual(true);
  });

  it('iframe checking is disabled when host is localhost', () => {
    const instance = new BoclipsKeycloakSecurity({
      options: opts(),
      host: 'localhost',
    });

    const keycloakInstance = instance.getKeycloakInstance();
    expect(firstCallArg(keycloakInstance.init).checkLoginIframe).toEqual(false);
  });

  describe('onLogin callback', () => {
    let authenticatedSuccess = null;
    let authenticationError = null;
    let options: AuthenticateOptions;
    let keycloakInstance = null;

    beforeEach(() => {
      options = opts({
        onLogin: jest.fn(),
      });
      const instance = new BoclipsKeycloakSecurity({ options });
      keycloakInstance = instance.getKeycloakInstance();
      expect(keycloakInstance.init).toHaveBeenCalled();

      const initPromise = keycloakInstance.init.mock.results[0].value;
      authenticatedSuccess = initPromise.then.mock.calls[0][0];
      authenticationError = initPromise.then.mock.calls[0][1];
    });

    it('calls the onLogin function once authentication has succeeded', () => {
      authenticatedSuccess(true);
      expect(options.onLogin).toHaveBeenCalledWith(keycloakInstance);
    });

    it('does not call the onLogin function if authentication fails', () => {
      authenticatedSuccess(false);
      expect(options.onLogin).not.toHaveBeenCalledWith(keycloakInstance);
    });

    it('does not call onLogin if an error occurs', () => {
      authenticationError({
        error: 'An error occurred',
        error_description: 'Some error description',
      });
      expect(options.onLogin).not.toHaveBeenCalledWith(keycloakInstance);
    });
  });

  describe('onFailure callback', () => {
    let authenticatedSuccess = null;
    let authenticationError = null;
    let options: AuthenticateOptions;
    let keycloakInstance = null;

    beforeEach(() => {
      options = opts({
        onFailure: jest.fn(),
        onLogin: jest.fn(),
      });
      const instance = new BoclipsKeycloakSecurity({ options });
      keycloakInstance = instance.getKeycloakInstance();
      expect(keycloakInstance.init).toHaveBeenCalled();

      const initPromise = keycloakInstance.init.mock.results[0].value;
      authenticatedSuccess = initPromise.then.mock.calls[0][0];
      authenticationError = initPromise.then.mock.calls[0][1];
    });

    it('calls the onFailure function if there was an error authenticating', () => {
      authenticationError({
        error: 'An error occurred',
        error_description: 'Some error description',
      });
      expect(options.onFailure).toHaveBeenCalled();
    });

    it('does call the onFailure function if there was no error, but authentication failed', () => {
      authenticatedSuccess(false);
      expect(options.onFailure).toHaveBeenCalled();
    });

    it('does not call the onFailure function if authentication was successful', () => {
      authenticatedSuccess(true);
      expect(options.onFailure).not.toHaveBeenCalled();
    });
  });
});

describe('isAuthenticated', () => {
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
      const instance = new BoclipsKeycloakSecurity({ options: opts() });

      // @ts-ignore
      instance.keycloakInstance = data;

      expect(instance.isAuthenticated()).toEqual(expectation);
    });
  });
});

describe('axios interceptor', () => {
  it('does not install axios if passed false in constructor', () => {
    new BoclipsKeycloakSecurity({ options: {} as any, configureAxios: false });

    expect(axios.interceptors.request.use).not.toHaveBeenCalled();
  });

  it('does install axios if passed false in constructor but configureAxios is called', () => {
    const instance = new BoclipsKeycloakSecurity({
      options: {} as any,
      configureAxios: false,
    });

    expect(axios.interceptors.request.use).not.toHaveBeenCalled();

    instance.configureAxios();

    expect(axios.interceptors.request.use).toHaveBeenCalled();
  });

  it('can install an axios interceptor', () => {
    const options = opts({
      mode: 'check-sso',
    });

    new BoclipsKeycloakSecurity({ options });

    expect(axios.interceptors.request.use).toHaveBeenCalled();
  });

  describe('interceptor behaviour with login-required', () => {
    let updateTokenPromise = null;
    let interceptorPromise = null;
    let keycloakInstance = null;

    beforeEach(() => {
      const options = opts({
        mode: 'login-required',
      });

      const instance = new BoclipsKeycloakSecurity({ options });

      keycloakInstance = instance.getKeycloakInstance();
      keycloakInstance.token = 'test-token-123';

      const interceptor = mocked(axios.interceptors.request.use).mock
        .calls[0][0] as any;

      interceptorPromise = interceptor({ headers: {} });

      expect(keycloakInstance.updateToken).toHaveBeenCalled();

      updateTokenPromise = mocked(keycloakInstance.updateToken).mock.results[0]
        .value;
    });

    it('resolves config with authorization header when updateToken was successful', () => {
      const successCallback = updateTokenPromise.then.mock.calls[0][0];

      successCallback();

      return expect(interceptorPromise).resolves.toEqual({
        headers: { Authorization: 'Bearer test-token-123' },
      });
    });

    it('calls the keycloak.login function when updateToken failed', () => {
      const errorCallback = updateTokenPromise.then.mock.calls[0][1];

      errorCallback();

      expect(keycloakInstance.login).toHaveBeenCalled();

      return expect(interceptorPromise).resolves.toEqual({
        headers: {},
      });
    });
  });

  it('if check-sso mode, and token refresh fails then config does not change', () => {
    const options = opts({
      mode: 'check-sso',
    });

    const instance = new BoclipsKeycloakSecurity({ options });
    const keycloakInstance = instance.getKeycloakInstance();
    keycloakInstance.token = 'test-token-123';

    const interceptor = mocked(axios.interceptors.request.use).mock
      .calls[0][0] as any;

    const originalConfig = {
      headers: { Authorization: 'expired-token' },
    };

    const interceptorPromise = interceptor(originalConfig);

    let updateTokenPromise = mocked(keycloakInstance.updateToken).mock
      .results[0].value;

    const errorCallback = updateTokenPromise.then.mock.calls[0][1];

    errorCallback();

    return expect(interceptorPromise).resolves.toEqual(originalConfig);
  });
});

describe('logout', () => {
  it('will call keycloak logout with options', () => {
    const instance = new BoclipsKeycloakSecurity({ options: opts() });

    const logoutOptions = {
      redirectUri: 'test-redirect/uri',
    };

    instance.logout(logoutOptions);

    const keycloakInstance = instance.getKeycloakInstance();
    expect(keycloakInstance.logout).toHaveBeenCalledWith(logoutOptions);
  });
});

describe('ssoLogin', () => {
  it('will call keycloak login with options', () => {
    const instance = new BoclipsKeycloakSecurity({ options: opts() });

    const ssoLoginOptions = {
      idpHint: 'google',
      redirectUri: 'test-redirect/uri',
    };

    instance.ssoLogin(ssoLoginOptions);

    const keycloakInstance = instance.getKeycloakInstance();
    expect(keycloakInstance.login).toHaveBeenCalledWith(ssoLoginOptions);
  });
});

describe('The tokenFactory', () => {
  it('will resolve a token, when keycloak has updated the token', () => {
    const instance = new BoclipsKeycloakSecurity({ options: opts() });

    const keycloakInstance = instance.getKeycloakInstance();

    const tokenFactory = instance.getTokenFactory(5);

    const tokenPromise = tokenFactory();

    expect(keycloakInstance.updateToken).toHaveBeenCalled();
    let updateTokenPromise = mocked(keycloakInstance.updateToken).mock
      .results[0].value;

    const successCallback = updateTokenPromise.then.mock.calls[0][0];

    keycloakInstance.token = 'theToken';
    successCallback();

    expect(tokenPromise).resolves.toEqual('theToken');
  });

  it('will pass the minValidity into keycloak when updating token', () => {
    const instance = new BoclipsKeycloakSecurity({ options: opts() });

    const keycloakInstance = instance.getKeycloakInstance();

    const tokenFactory = instance.getTokenFactory(2345);

    tokenFactory().then(() => {
      expect(keycloakInstance.updateToken).toHaveBeenCalledWith(2345);
    });
  });

  it('will reject, and call keycloak.login if mode is login-required', () => {
    const instance = new BoclipsKeycloakSecurity({
      options: opts({ mode: 'login-required' }),
    });

    const keycloakInstance = instance.getKeycloakInstance();

    const tokenFactory = instance.getTokenFactory(2345);

    const tokenPromise = tokenFactory();

    expect(keycloakInstance.updateToken).toHaveBeenCalled();
    let updateTokenPromise = mocked(keycloakInstance.updateToken).mock
      .results[0].value;

    const errorCallback = updateTokenPromise.then.mock.calls[0][1];

    errorCallback();

    expect(keycloakInstance.login).toHaveBeenCalled();

    return expect(tokenPromise).rejects.toEqual(false);
  });

  it('will reject, if keycloak is unable to update the token, and is check-sso', () => {
    const instance = new BoclipsKeycloakSecurity({
      options: opts({ mode: 'check-sso' }),
    });

    const keycloakInstance = instance.getKeycloakInstance();

    const tokenFactory = instance.getTokenFactory(2345);

    const tokenPromise = tokenFactory();

    expect(keycloakInstance.updateToken).toHaveBeenCalled();
    let updateTokenPromise = mocked(keycloakInstance.updateToken).mock
      .results[0].value;

    const errorCallback = updateTokenPromise.then.mock.calls[0][1];

    errorCallback();

    expect(keycloakInstance.login).not.toHaveBeenCalled();

    return expect(tokenPromise).rejects.toEqual(false);
  });
});
