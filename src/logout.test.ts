import { mocked } from 'ts-jest/utils';
import getGlobalKeycloak from './helpers/getGlobalKeycloak';
import { logout } from './logout';

jest.mock('keycloak-js');
jest.mock('./helpers/getGlobalKeycloak');

describe('logout', () => {
  it('will call keycloak logout with options', () => {
    let keycloakInstance = {
      logout: jest.fn(),
    };

    mocked(getGlobalKeycloak).mockReturnValue(keycloakInstance);

    const logoutOptions = {
      redirectUri: 'test-redirect/uri',
    };

    logout(logoutOptions);

    expect(keycloakInstance.logout).toHaveBeenCalledWith(logoutOptions);
  });
});
