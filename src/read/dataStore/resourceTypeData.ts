import { PaginatedResourceType } from 'describe/UNSTABLE__paginatedResource';
import { ResourceType } from 'describe/resource';
import { DataStoreType } from 'internals/stores/data';
import { getAllKeysForResource, getKeyRecord } from '../../make/dataStoreKey';

const readResourceTypeData =
  (snapshot: DataStoreType) =>
  <IdentityType, ResourceDataType>({
    Resource,
  }: {
    Resource:
      | ResourceType<IdentityType, ResourceDataType>
      | PaginatedResourceType<IdentityType, ResourceDataType>;
  }): {
    key: string;
    identity: IdentityType;
    data: ResourceDataType;
    didStart: boolean;
  }[] =>
    getAllKeysForResource(Resource).map(key => ({
      key,
      identity: getKeyRecord(key)?.identity as IdentityType,
      data: snapshot.data[key]?.data,
      didStart: snapshot.data[key]?.get?.didStart,
    }));

export default readResourceTypeData;
