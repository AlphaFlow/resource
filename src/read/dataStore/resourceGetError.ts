import { PaginatedResourceType } from 'describe/UNSTABLE__paginatedResource';
import { ResourceType } from 'describe/resource';
import { DataStoreType } from 'internals/stores/data';
import makeDataStoreKey from '../../make/dataStoreKey';

const readResourceGetError =
  (snapshot: DataStoreType) =>
  <IdentityType, ResourceDataType>({
    Resource,
    identity,
  }: {
    Resource:
      | ResourceType<IdentityType, ResourceDataType>
      | PaginatedResourceType<IdentityType, ResourceDataType>;
    identity: IdentityType;
  }): boolean | undefined | unknown => {
    const { rejectedWith, didReject } =
      (snapshot.data[makeDataStoreKey({ Resource, identity })] || {}).get || {};

    return rejectedWith || (didReject ? true : undefined);
  };

export default readResourceGetError;
