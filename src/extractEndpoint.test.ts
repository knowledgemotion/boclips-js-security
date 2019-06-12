import { extractEndpoint } from './extractEndpoint';

test('extracts login endpoint for testing', () => {
  expect(extractEndpoint('educators.testing-boclips.com', 'login')).toEqual(
    'https://login.testing-boclips.com',
  );
});

test('extracts login endpoint for staging', () => {
  expect(extractEndpoint('educators.staging-boclips.com', 'api')).toEqual(
    'https://api.staging-boclips.com',
  );
});

test('extracts login endpoint for production', () => {
  expect(extractEndpoint('boclips.com', 'foo')).toEqual(
    'https://foo.boclips.com',
  );
});

test('localhost becomes staging, so we can develop against staging', () => {
  expect(extractEndpoint('localhost:123123', 'login')).toEqual(
    'https://login.staging-boclips.com',
  );
});

test('0.0.0.0 becomes staging, so we can develop against staging', () => {
  expect(extractEndpoint('0.0.0.0', 'hello')).toEqual(
    'https://hello.staging-boclips.com',
  );
});

test('127.0.0.1 becomes staging, so we can develop against staging', () => {
  expect(extractEndpoint('127.0.0.1', 'hello')).toEqual(
    'https://hello.staging-boclips.com',
  );
});

test('defaults to staging, so we can develop against staging', () => {
  expect(extractEndpoint('123_garbage', 'hello')).toEqual(
    'https://hello.staging-boclips.com',
  );
});
