import makeDataStoreKey from 'src/make/dataStoreKey';
import readResourceGetDidStart from 'src/read/dataStore/resourceGetDidStart';
import { TestResource } from 'config/testData';

test.skip('reads resource get did start', () => {
  const identity = 1;
  const didStart = true;
  const store = {
    data: {
      [makeDataStoreKey({ Resource: TestResource, identity })]: {
        get: { didStart },
      },
    },
  };

  const result = readResourceGetDidStart(store)({
    Resource: TestResource,
    identity,
  });
  expect(result).toBe(didStart);
});
