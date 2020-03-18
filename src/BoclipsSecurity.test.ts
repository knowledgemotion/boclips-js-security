import { mocked } from 'ts-jest/utils';
import { BoclipsKeycloakSecurity } from './BoclipsKeycloakSecurity';
import BoclipsSecurity, { AuthenticateOptions } from './BoclipsSecurity';

jest.mock('./BoclipsKeycloakSecurity');

it('passes the createInstance options to the KeycloakSecurity constructor', () => {
  const options = {
    authEndpoint: 'test.boclips/auth',
    mode: 'login-required',
    clientId: '10',
    realm: 'testRealm',
    onLogin: jest.fn(),
  } as AuthenticateOptions;

  BoclipsSecurity.createInstance(options);

  expect(BoclipsKeycloakSecurity).toHaveBeenCalledWith({
    options,
    configureAxios: true,
  });
});

it('returns the same instance that is created', () => {
  const options: AuthenticateOptions = {
    authEndpoint: 'test.boclips/auth',
    mode: 'login-required',
    clientId: '10',
    realm: 'testRealm',
    onLogin: jest.fn(),
  };

  // @ts-ignore
  mocked(BoclipsKeycloakSecurity).mockImplementation(() => ({
    test: 'mockedinstance',
  }));

  BoclipsSecurity.createInstance(options);

  expect(BoclipsSecurity.getInstance()).toEqual({ test: 'mockedinstance' });
});
