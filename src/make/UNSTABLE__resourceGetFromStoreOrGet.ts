import { ResourceType } from 'describe/resource';
import dataStore from 'internals/stores/data';
import readResourceData from 'read/dataStore/resourceData';
import readResourceGetDidFinish from 'read/dataStore/resourceGetDidFinish';
import readResourceGetDidStart from 'read/dataStore/resourceGetDidStart';

const UNSTABLE__resourceGetFromStoreOrGet = <IdentityType, ResourceDataType>({
  Resource,
}: {
  Resource: ResourceType<IdentityType, ResourceDataType>;
}) => {
  return async (
    identity: IdentityType,
  ): Promise<ResourceDataType | undefined> => {
    try {
      if (
        readResourceGetDidStart(dataStore.getState())<
          IdentityType,
          ResourceDataType
        >({ Resource, identity })
      )
        if (
          readResourceGetDidFinish(dataStore.getState())<
            IdentityType,
            ResourceDataType
          >({ Resource, identity })
        )
          return readResourceData(dataStore.getState())<
            IdentityType,
            ResourceDataType
          >({ Resource, identity });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        'Warning: Resource.UNSTABLE__getFromStoreOrGet failed',
        '\n',
        error,
      );
      throw error;
    }

    return Resource.get(identity);
  };
};

export default UNSTABLE__resourceGetFromStoreOrGet;
