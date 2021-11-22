import { ResourceType } from 'describe/resource';
import readResourceTypeData from '../read/dataStore/resourceTypeData';
import readResourceRequirements from '../read/surfaceStore/resourceRequirements';
import writeRejectedRefreshGet from '../write/dataStore/rejectedRefreshGet';
import writeRemoveGet from '../write/dataStore/removeGet';
import writeResolvedRefreshGet from '../write/dataStore/resolvedRefreshGet';
import dataStore from './stores/data';
import surfaceStore from './stores/surface';

const refreshResource = async <IdentityType, ResourceDataType>({
  Resource,
  identity,
}: {
  Resource: ResourceType<IdentityType, ResourceDataType>;
  identity: IdentityType;
}): Promise<void> => {
  const isScopedToIdentity = identity !== undefined;

  const dataStoreSnapshot = dataStore.getState();

  let dataStoreRecordsToGet = readResourceTypeData(dataStoreSnapshot)({
    Resource,
  });

  if (isScopedToIdentity)
    dataStoreRecordsToGet = dataStoreRecordsToGet.filter(item =>
      Resource.areIdentitiesEqual(item.identity, identity),
    );

  const surfaceStoreSnapshot = surfaceStore.getState();
  const resourceRequirements = readResourceRequirements(surfaceStoreSnapshot)();

  // clear identities which aren't being used in surface
  dataStoreRecordsToGet.forEach(({ identity }) => {
    if (
      !resourceRequirements.find(
        requirement =>
          requirement.Resource === Resource &&
          (isScopedToIdentity
            ? Resource.areIdentitiesEqual(identity, requirement.identity)
            : true),
      )
    )
      dataStore.dispatch(writeRemoveGet({ Resource, identity }));
  });

  dataStoreRecordsToGet = dataStoreRecordsToGet.filter(
    ({ didStart, identity }) =>
      didStart &&
      resourceRequirements.find(
        requirement =>
          requirement.Resource === Resource &&
          (isScopedToIdentity
            ? Resource.areIdentitiesEqual(identity, requirement.identity)
            : true),
      ),
  );

  const identitiesToGet = dataStoreRecordsToGet.map(({ identity }) => identity);

  const getResults = await Promise.all(
    identitiesToGet.map(async identity => {
      let data;
      let error;

      try {
        data = await Resource.get(identity);
      } catch (caughtWith) {
        error = caughtWith;
      }

      return {
        identity,
        data,
        error,
      };
    }),
  );

  await Promise.all(
    getResults.map(async ({ identity, data, error }) => {
      if (error)
        return await dataStore.dispatch(
          writeRejectedRefreshGet({ Resource, identity, rejectedWith: error }),
        );
      else
        return await dataStore.dispatch(
          writeResolvedRefreshGet({ Resource, identity, data }),
        );
    }),
  );
};

export default refreshResource;
