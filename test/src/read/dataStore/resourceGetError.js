import makeDataStoreKey from '../../../../src/make/dataStoreKey';
import readResourceGetError from '../../../../src/read/dataStore/resourceGetError';
import TodoResource from '../../../fixtures/TodoResource';

test('reads resource data', () => {
  const identity = 1;
  const rejectedWith = {};
  const store = {
    data: {
      [makeDataStoreKey({ Resource: TodoResource, identity })]: {
        get: { rejectedWith },
      },
    },
  };

  const result = readResourceGetError(store)({
    Resource: TodoResource,
    identity,
  });
  expect(result).toBe(rejectedWith);
});
