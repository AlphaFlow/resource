import { DataStoreType } from 'internals/stores/data';
import makeDataStoreKey from '../../make/dataStoreKey';
import makeWrite from '../../make/write';

const writeRejectedRefreshGet = makeWrite(
  'writeRejectedRefreshGet',
  ({ Resource, identity, rejectedWith }) =>
    (snapshot: DataStoreType) => {
      const key = makeDataStoreKey({ Resource, identity });

      return {
        ...snapshot,
        data: {
          ...snapshot.data,
          [key]: {
            ...(snapshot.data[key] || {}),
            data: undefined,
            get: {
              ...(snapshot.data[key]?.get || {}),
              didStart: true,
              didResolve: false,
              didReject: true,
              rejectedWith,
            },
          },
        },
      };
    },
);

export default writeRejectedRefreshGet;
