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

test('localhost defaults to testing', () => {
  expect(extractEndpoint('localhost:123123', 'login')).toEqual(
    'https://login.testing-boclips.com',
  );
});

test('anything defaults to testing', () => {
  expect(extractEndpoint('123_garbage', 'hello')).toEqual(
    'https://hello.testing-boclips.com',
  );
});
