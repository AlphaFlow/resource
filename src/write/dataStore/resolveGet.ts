import { DataStoreType } from 'internals/stores/data';
import makeDataStoreKey from '../../make/dataStoreKey';
import makeWrite from '../../make/write';

const writeResolveGet = makeWrite(
  'writeResolveGet',
  ({ Resource, identity, resolvedWith }) =>
    (snapshot: DataStoreType) => {
      const key = makeDataStoreKey({ Resource, identity });

      return {
        ...snapshot,
        data: {
          ...snapshot.data,
          [key]: {
            ...(snapshot.data[key] || {}),
            data: resolvedWith,
            get: {
              ...((snapshot.data[key] || {}).get || {}),
              didResolve: true,
            },
          },
        },
      };
    },
);

export default writeResolveGet;
