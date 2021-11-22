import { DataStoreType } from 'internals/stores/data';
import { getAllKeysForResource } from '../../make/dataStoreKey';
import makeWrite from '../../make/write';

const writeWholeResource = makeWrite(
  'writeWholeResource',
  ({ Resource, body = {} }) =>
    (snapshot: DataStoreType) => {
      const toWrite = {} as Record<string, any>;
      getAllKeysForResource(Resource).forEach(key => {
        toWrite[key] = {
          ...(snapshot.data[key] || {}),
          data: body[key],
        };
      });

      return {
        ...snapshot,
        data: {
          ...snapshot.data,
          ...toWrite,
        },
      };
    },
);

export default writeWholeResource;
