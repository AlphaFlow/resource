import makeDataStoreKey from '../../../../src/make/dataStoreKey';
import readResourceData from '../../../../src/read/dataStore/resourceData';
import TodoResource from '../../../fixtures/TodoResource';

test('reads resource data', () => {
  const identity = 1;
  const data = {};
  const store = {
    data: {
      [makeDataStoreKey({ Resource: TodoResource, identity })]: { data },
    },
  };

  const result = readResourceData(store)({ Resource: TodoResource, identity });
  expect(result).toBe(data);
});

test('handles empty path', () => {
  const identity = 1;
  const store = {
    data: {},
  };

  const result = readResourceData(store)({ Resource: TodoResource, identity });
  expect(result).toBe(undefined);
});
