import makeDataStoreKey from '../../../../src/make/dataStoreKey';
import readResourceGetDidStart from '../../../../src/read/dataStore/resourceGetDidStart';
import TodoResource from '../../../fixtures/TodoResource';

test('reads resource get did start', () => {
  const identity = 1;
  const didStart = true;
  const store = {
    data: {
      [makeDataStoreKey({ Resource: TodoResource, identity })]: {
        get: { didStart },
      },
    },
  };

  const result = readResourceGetDidStart(store)({
    Resource: TodoResource,
    identity,
  });
  expect(result).toBe(didStart);
});
