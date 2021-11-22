import { PaginatedResourceType } from 'describe/UNSTABLE__paginatedResource';
import { ResourceType } from 'describe/resource';
import { DataStoreType } from 'internals/stores/data';
import makeDataStoreKey from 'make/dataStoreKey';

const resourceGetDidFinish =
  (snapshot: DataStoreType) =>
  <IdentityType, ResourceDataType>({
    Resource,
    identity,
  }: {
    Resource:
      | ResourceType<IdentityType, ResourceDataType>
      | PaginatedResourceType<IdentityType, ResourceDataType>;

    identity: IdentityType;
  }): boolean => {
    const key = makeDataStoreKey<IdentityType, ResourceDataType>({
      Resource,
      identity,
    });
    return Boolean(
      snapshot.data[key]?.get?.didResolve || snapshot.data[key]?.get?.didReject,
    );
  };

export default resourceGetDidFinish;
