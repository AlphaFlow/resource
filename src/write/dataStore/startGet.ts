import { DataStoreType } from 'internals/stores/data';
import makeDataStoreKey from '../../make/dataStoreKey';
import makeWrite from '../../make/write';

const writeStartGet = makeWrite(
  'writeStartGet',
  ({ Resource, identity }) =>
    (snapshot: DataStoreType) => {
      const key = makeDataStoreKey({ Resource, identity });

      return {
        ...snapshot,
        data: {
          ...snapshot.data,
          [key]: {
            ...(snapshot.data[key] || {}),
            get: {
              ...(snapshot.data[key]?.get || {}),
              didStart: true,
              didResolve: false,
              didReject: false,
              rejectedWith: undefined,
            },
          },
        },
      };
    },
);

export default writeStartGet;
