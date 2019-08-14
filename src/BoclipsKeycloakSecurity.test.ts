import axios from 'axios';
import { mocked } from 'ts-jest/utils';
import * as Keycloak from 'keycloak-js';
import { BoclipsKeycloakSecurity } from './BoclipsKeycloakSecurity';
import { extractEndpoint } from './extractEndpoint';
import BoclipsSecurity, { AuthenticateOptions } from './BoclipsSecurity';

jest.mock('keycloak-js');
jest.mock('./extractEndpoint');

describe('authenticate', () => {
  it('configures keycloak with the options provided', () => {
    const options: AuthenticateOptions = {
      authEndpoint: 'test.boclips/auth',
      mode: 'login-required',
      clientId: '10',
      realm: 'testRealm',
      onLogin: jest.fn(),
    };
    const instance = new BoclipsKeycloakSecurity(options);

    expect(Keycloak).toHaveBeenCalledWith({
      url: options.authEndpoint,
      realm: options.realm,
      clientId: options.clientId,
    });

    const keycloakInstance = instance.getKeycloakInstance();

    expect(keycloakInstance.init).toHaveBeenCalledWith({
      onLoad: options.mode,
    });
  });

  it('determines the correct endpoint when not provided via config', () => {
    mocked(extractEndpoint).mockReturnValue('not-test.boclips');

    new BoclipsKeycloakSecurity({} as any);

    expect(Keycloak).toHaveBeenCalledWith({
      url: 'not-test.boclips/auth',
      realm: undefined,
      clientId: undefined,
    });
  });

  it('uses the default login-required mode when not provided', () => {
    const instance = new BoclipsKeycloakSecurity({} as any);

    const keycloakInstance = instance.getKeycloakInstance();
    expect(keycloakInstance.init).toHaveBeenCalledWith({
      onLoad: 'login-required',
    });
  });

  describe('onLogin callback', () => {
    let authenticatedSuccess = null;
    let authenticationError = null;
    let options: AuthenticateOptions;
    let keycloakInstance = null;

    beforeEach(() => {
      options = {
        onLogin: jest.fn(),
      } as any;
      const instance = new BoclipsKeycloakSecurity(options);
      keycloakInstance = instance.getKeycloakInstance();
      expect(keycloakInstance.init).toHaveBeenCalled();

      const initPromise = keycloakInstance.init.mock.results[0].value;
      authenticatedSuccess = initPromise.success.mock.calls[0][0];
      authenticationError = initPromise.error.mock.calls[0][0];
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
      options = {
        onFailure: jest.fn(),
        onLogin: jest.fn(),
      } as any;
      const instance = new BoclipsKeycloakSecurity(options);
      keycloakInstance = instance.getKeycloakInstance();
      expect(keycloakInstance.init).toHaveBeenCalled();

      const initPromise = keycloakInstance.init.mock.results[0].value;
      authenticatedSuccess = initPromise.success.mock.calls[0][0];
      authenticationError = initPromise.error.mock.calls[0][0];
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
      const instance = new BoclipsKeycloakSecurity({} as any);

      // @ts-ignore
      instance.keycloakInstance = data;

      expect(instance.isAuthenticated()).toEqual(expectation);
    });
  });
});

describe('axios interceptor', () => {
  it('does not install axios if passed false in constructor', () => {
    new BoclipsKeycloakSecurity({} as any, false);

    expect(axios.interceptors.request.use).not.toHaveBeenCalled();
  });

  it('does install axios if passed false in constructor but configureAxios is called', () => {
    const instance = new BoclipsKeycloakSecurity({} as any, false);

    expect(axios.interceptors.request.use).not.toHaveBeenCalled();

    instance.configureAxios();

    expect(axios.interceptors.request.use).toHaveBeenCalled();
  });

  it('can install an axios interceptor', () => {
    const options: Partial<AuthenticateOptions> = {
      mode: 'check-sso',
    };

    new BoclipsKeycloakSecurity(options as AuthenticateOptions);

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

      const instance = new BoclipsKeycloakSecurity(
        options as AuthenticateOptions,
      ) as BoclipsKeycloakSecurity;

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
      const successCallback = updateTokenPromise.success.mock.calls[0][0];

      successCallback();

      return expect(interceptorPromise).resolves.toEqual({
        headers: { Authorization: 'Bearer test-token-123' },
      });
    });

    it('calls the keycloak.login function when updateToken failed', () => {
      const errorCallback = updateTokenPromise.error.mock.calls[0][0];

      errorCallback();

      expect(keycloakInstance.login).toHaveBeenCalled();

      return expect(interceptorPromise).resolves.toEqual({
        headers: {},
      });
    });
  });

  it('if check-sso mode, and token refresh fails then config does not change', () => {
    const options: Partial<AuthenticateOptions> = {
      mode: 'check-sso',
    };

    const instance = new BoclipsKeycloakSecurity(
      options as AuthenticateOptions,
    );
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

    const errorCallback = updateTokenPromise.error.mock.calls[0][0];

    errorCallback();

    return expect(interceptorPromise).resolves.toEqual(originalConfig);
  });
});

describe('logout', () => {
  it('will call keycloak logout with options', () => {
    const instance = new BoclipsKeycloakSecurity({} as any);

    const logoutOptions = {
      redirectUri: 'test-redirect/uri',
    };

    instance.logout(logoutOptions);

    const keycloakInstance = instance.getKeycloakInstance();
    expect(keycloakInstance.logout).toHaveBeenCalledWith(logoutOptions);
  });
});

describe('The tokenFactory', () => {
  it('will resolve a token, when keycloak has updated the token', () => {
    const instance = new BoclipsKeycloakSecurity({} as any);

    const keycloakInstance = instance.getKeycloakInstance();

    const tokenFactory = instance.getTokenFactory(5);

    const tokenPromise = tokenFactory();

    expect(keycloakInstance.updateToken).toHaveBeenCalled();
    let updateTokenPromise = mocked(keycloakInstance.updateToken).mock
      .results[0].value;

    const successCallback = updateTokenPromise.success.mock.calls[0][0];

    keycloakInstance.token = 'theToken';
    successCallback();

    expect(tokenPromise).resolves.toEqual('theToken');
  });

  it('will pass the minValidity into keycloak when updating token', () => {
    const instance = new BoclipsKeycloakSecurity({} as any);

    const keycloakInstance = instance.getKeycloakInstance();

    const tokenFactory = instance.getTokenFactory(2345);

    tokenFactory().then(() => {
      expect(keycloakInstance.updateToken).toHaveBeenCalledWith(2345);
    });
  });

  it('will reject, and call keycloak.login if mode is login-required', () => {
    const instance = new BoclipsKeycloakSecurity({
      mode: 'login-required',
    } as any);

    const keycloakInstance = instance.getKeycloakInstance();

    const tokenFactory = instance.getTokenFactory(2345);

    const tokenPromise = tokenFactory();

    expect(keycloakInstance.updateToken).toHaveBeenCalled();
    let updateTokenPromise = mocked(keycloakInstance.updateToken).mock
      .results[0].value;

    const errorCallback = updateTokenPromise.error.mock.calls[0][0];

    errorCallback();

    expect(keycloakInstance.login).toHaveBeenCalled();

    return expect(tokenPromise).rejects.toEqual(false);
  });

  it('will reject, if keycloak is unable to update the token, and is check-sso', () => {
    const instance = new BoclipsKeycloakSecurity({
      mode: 'check-sso',
    } as any);

    const keycloakInstance = instance.getKeycloakInstance();

    const tokenFactory = instance.getTokenFactory(2345);

    const tokenPromise = tokenFactory();

    expect(keycloakInstance.updateToken).toHaveBeenCalled();
    let updateTokenPromise = mocked(keycloakInstance.updateToken).mock
      .results[0].value;

    const errorCallback = updateTokenPromise.error.mock.calls[0][0];

    errorCallback();

    expect(keycloakInstance.login).not.toHaveBeenCalled();

    return expect(tokenPromise).rejects.toEqual(false);
  });
});
