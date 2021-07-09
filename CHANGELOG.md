# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [7.0.0] - 2021-03-25

- Upgrade to Keycloak 14.0.0

## [6.1.1] - 2021-03-25

- hasRole can handle a user's roles being null

## [6.1.0] - 2021-03-22

- Add hasRole to check if user has a given keycloak realm role

## [6.0.0] - 2021-02-18

- Upgrade to Keycloak 12.0.3

## [5.0.0] - 2020-12-16

- Upgrade to Keycloak 11.0.3

## [4.0.2] - 2020-10-09

- Upgrade vulnerable dependencies

## [4.0.1] - 2020-08-18

- `checkLoginIframe` is configurable when creating a BoclipsSecurity instance

## [4.0.0] - 2020-07-21

### Added 

- Use silent check-sso feature of Keycloak library
- `requireLoginPage` option: set to true when you want to redirect users to login 

### Removed

- `mode` option which leaked the Keycloak interface

## [3.4.3] - 2020-06-04

- Disable `checkLoginIframe` when initialising Keycloak the first time after user registers

## [3.4.2] - 2020-06-04

- Support initialisation with username/password to enable auto-login after registration

## [3.4.1] - 2020-04-28

- Expose a minified bundle build under /dist/min

## [3.4.0] - 2020-04-27

- Upgrade to support keycloak 9.0.3

## [3.3.1] - 2020-03-18

### Added

- Fix redirect loop in Chrome 80 also for URLs with port

## [3.3.0] - 2020-03-18

### Added

- Fix redirect loop in Chrome 80 et al

## [3.2.2] - 2020-03-09

### Added

- Support for Keycloak 9.0.0
- Upgrade dependencies

## [3.2.1] - 2019-08-27

### Added

- Support for Keycloak 8.0.1

## [3.2.0] - 2019-08-27

### Added

- `ssoLogin` function added to login with identity provider

## [3.1.0] - 2019-08-14

### Added

- `onFailure` callback for when authentication fails, or an error occurs

## [3.0.1] - 2019-07-15

### Security

- Bump `mixin-deep` for https://www.npmjs.com/advisories/1013 - only `package-lock.json`
- Bump `set-value` for https://www.npmjs.com/advisories/1012 - only `package-lock.json`

## [3.0.0] - 2019-07-09

### Added

- New `BoclipsSecurity` export for singleton management
- Internal `BoclipsKeycloakSecurity` module for managing authentication
- Changelog

### Removed

- _BREAKING_ [`authenticate`, `isAuthenticated`, `logout` functions removed from export](./CHANGELOG.md#simplified-boclipssecurity-exports)
