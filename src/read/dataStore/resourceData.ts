import { PaginatedResourceType } from 'describe/UNSTABLE__paginatedResource';
import { ResourceType } from 'describe/resource';
import { DataStoreType } from 'internals/stores/data';
import makeDataStoreKey from '../../make/dataStoreKey';

const readResourceData =
  (snapshot: DataStoreType) =>
  <IdentityType, ResourceDataType>({
    Resource,
    identity,
  }: {
    Resource:
      | ResourceType<IdentityType, ResourceDataType>
      | PaginatedResourceType<IdentityType, ResourceDataType>;
    identity: IdentityType;
  }): undefined | ResourceDataType =>
    snapshot.data[makeDataStoreKey({ Resource, identity })]?.data;

export default readResourceData;
