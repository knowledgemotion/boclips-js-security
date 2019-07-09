# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New `BoclipsSecurity` export for singleton management
- Internal `BoclipsKeycloakSecurity` module for managing authentication 
- Changelog

### Changed
- Axios interceptors are no longer configured automatically.

### Removed
- *BREAKING* [`authenticate`, `isAuthenticated`, `logout` functions removed from export](./CHANGELOG.md#simplified-boclipssecurity-exports)