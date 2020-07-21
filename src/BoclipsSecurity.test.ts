import { mocked } from 'ts-jest/utils';
import { BoclipsKeycloakSecurity } from './BoclipsKeycloakSecurity';
import BoclipsSecurity, { AuthenticateOptions } from './BoclipsSecurity';

jest.mock('./BoclipsKeycloakSecurity');

it('returns the same instance that is created', () => {
  const options: AuthenticateOptions = {
    authEndpoint: 'test.boclips/auth',
    requireLoginPage: true,
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
