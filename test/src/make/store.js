import { jest } from '@jest/globals';
import makeStore from 'src/make/store';

test('calling returns redux store with expected API', () => {
  const store = makeStore();

  expect(store.dispatch).toBeInstanceOf(Function);
  expect(store.getState).toBeInstanceOf(Function);
});

test('redux store sets up devtools if available', () => {
  const spy = jest.fn();
  global.window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = spy;

  makeStore();
  expect(spy).toHaveBeenCalledTimes(1);

  delete global.window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
});
