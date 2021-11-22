import { PaginatedResourceType } from 'describe/UNSTABLE__paginatedResource';
import { ResourceType } from 'describe/resource';
import { DataStoreType } from 'internals/stores/data';
import makeDataStoreKey from '../../make/dataStoreKey';

const readResourceGetDidStart =
  (snapshot: DataStoreType) =>
  <IdentityType, ResourceDataType>({
    Resource,
    identity,
  }: {
    Resource:
      | ResourceType<IdentityType, ResourceDataType>
      | PaginatedResourceType<IdentityType, ResourceDataType>;
    identity: IdentityType;
  }): boolean =>
    Boolean(
      (
        (snapshot.data[makeDataStoreKey({ Resource, identity })] || {}).get ||
        {}
      ).didStart,
    );

export default readResourceGetDidStart;
