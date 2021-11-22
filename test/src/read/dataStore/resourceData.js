import makeDataStoreKey from 'src/make/dataStoreKey';
import readResourceData from 'src/read/dataStore/resourceData';
import { TestResource } from 'config/testData';

test.skip('reads resource data', () => {
  const identity = 1;
  const data = {};
  const store = {
    data: {
      [makeDataStoreKey({ Resource: TestResource, identity })]: { data },
    },
  };

  const result = readResourceData(store)({ Resource: TestResource, identity });
  expect(result).toBe(data);
});

test.skip('handles empty path', () => {
  const identity = 1;
  const store = {
    data: {},
  };

  const result = readResourceData(store)({ Resource: TestResource, identity });
  expect(result).toBe(undefined);
});
