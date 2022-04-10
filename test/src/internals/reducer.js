import makeStore from '../../../src/make/store';

test('reducer blindly runs transformStore', () => {
  const initialStore = 'foo';

  const store = makeStore(initialStore);

  store.dispatch({ type: 'test', transformStore: current => current + 'bar' });
  expect(store.getState()).toBe('foobar');
});

test('reducer handles redux init action', () => {
  const initialStore = {};
  const store = makeStore(initialStore);
  store.dispatch({ type: '@@INIT' });

  expect(store.getState()).toBe(initialStore);
});
