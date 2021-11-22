import { DataStoreType } from 'internals/stores/data';
import makeDataStoreKey from '../../make/dataStoreKey';
import makeWrite from '../../make/write';

const writeResolvedRefreshGet = makeWrite(
  'writeResolvedRefreshGet',
  ({ Resource, identity, data }) =>
    (snapshot: DataStoreType) => {
      const key = makeDataStoreKey({ Resource, identity });

      return {
        ...snapshot,
        data: {
          ...snapshot.data,
          [key]: {
            ...(snapshot.data[key] || {}),
            data,
            get: {
              ...(snapshot.data[key]?.get || {}),
              didStart: true,
              didResolve: true,
              didReject: false,
              rejectedWith: undefined,
            },
          },
        },
      };
    },
);

export default writeResolvedRefreshGet;
