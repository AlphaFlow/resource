import makeDataStoreKey from 'src/make/dataStoreKey';
import { TestResource } from 'config/testData';
import readResourceGetError from '../../../../src/read/dataStore/resourceGetError';

test.skip('reads resource data', () => {
  const identity = 1;
  const rejectedWith = {};
  const store = {
    data: {
      [makeDataStoreKey({ Resource: TestResource, identity })]: {
        get: { rejectedWith },
      },
    },
  };

  const result = readResourceGetError(store)({
    Resource: TestResource,
    identity,
  });
  expect(result).toBe(rejectedWith);
});
