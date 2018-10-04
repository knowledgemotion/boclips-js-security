import { authenticate } from '../index';

test('authenticate is a function', () => {
  expect(typeof authenticate).toEqual('function');
});