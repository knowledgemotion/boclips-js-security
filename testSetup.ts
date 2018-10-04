import { JSDOM } from 'jsdom';

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .reduce(
      (result, prop) => ({
        ...result,
        [prop]: Object.getOwnPropertyDescriptor(src, prop),
      }),
      {},
    );
  Object.defineProperties(target, props);
}

// @ts-ignore
global['window'] = window;
// @ts-ignore
global['document'] = window.document;
// @ts-ignore
global['navigator'] = {
  userAgent: 'node.js',
};
// @ts-ignore
copyProps(window, global);
