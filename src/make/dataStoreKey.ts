import { PaginatedResourceType } from 'describe/UNSTABLE__paginatedResource';
import { ResourceType } from 'describe/resource';
import { uniqueId } from 'lodash-es';

export type KeyType = string;

type KeyRecordType = {
  key: KeyType;
  Resource: any;
  identity: any;
};

const keyRecords: KeyRecordType[] = [];

// serialize each unique combination of Resource + identity
const makeDataStoreKey = <IdentityType, ResourceDataType>({
  Resource,
  identity,
}: {
  Resource:
    | ResourceType<IdentityType, ResourceDataType>
    | PaginatedResourceType<IdentityType, ResourceDataType>;
  identity: IdentityType;
}): KeyType => {
  const existing = keyRecords.find(record => {
    if (record.Resource !== Resource) return false;
    if (!Resource.areIdentitiesEqual(record.identity, identity)) return false;

    return true;
  });

  if (existing) return existing.key;

  const newKey = uniqueId();

  keyRecords.push({
    key: newKey,
    Resource,
    identity,
  });

  return newKey;
};

export const getAllKeysForResource = <IdentityType, ResourceDataType>(
  Resource:
    | ResourceType<IdentityType, ResourceDataType>
    | PaginatedResourceType<IdentityType, ResourceDataType>,
): KeyType[] =>
  keyRecords.filter(item => item.Resource === Resource).map(({ key }) => key);

export const getKeyRecord = (key: KeyType): KeyRecordType | undefined =>
  keyRecords.find(recordItem => recordItem.key === key);

export default makeDataStoreKey;
