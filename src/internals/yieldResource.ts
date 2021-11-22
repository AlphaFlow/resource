import { ResourceType } from 'describe/resource';
import readResourceData from '../read/dataStore/resourceData';
import readResourceGetDidStart from '../read/dataStore/resourceGetDidStart';
import readResourceGetError from '../read/dataStore/resourceGetError';
import readResourceTypeData from '../read/dataStore/resourceTypeData';
import writeOneResource from '../write/dataStore/oneResource';
import writeWholeResource from '../write/dataStore/wholeResource';
import dataStore from './stores/data';

type CallableBodyType<ResourceDataType> = (
  resourceData: ResourceDataType,
) => ResourceDataType;

type WholeResourceCallableBodyType<IdentityType, ResourceDataType> = (
  identity: IdentityType,
  resourceData: ResourceDataType,
) => ResourceDataType;

const yieldResource = async <IdentityType, ResourceDataType>({
  Resource,
  identity,
  body,
}: {
  Resource: ResourceType<IdentityType, ResourceDataType>;
  identity?: IdentityType;
  body:
    | ResourceDataType
    | CallableBodyType<ResourceDataType>
    | WholeResourceCallableBodyType<IdentityType, ResourceDataType>;
}): Promise<void> => {
  const isScopedToIdentity = identity !== undefined;
  const bodyIsFunction = typeof body === 'function';
  const dataStoreSnapshot = dataStore.getState();

  let writeAction;

  // operates on one resource
  if (isScopedToIdentity)
    if (bodyIsFunction) {
      // using didStartGet as a proxy for "do we have this data", since actions are run in order
      // we never risk not having what we need
      const didGetResource = readResourceGetDidStart(dataStoreSnapshot)({
        Resource,
        identity: identity as IdentityType,
      });
      const resourceGetError = readResourceGetError(dataStoreSnapshot)({
        Resource,
        identity: identity as IdentityType,
      });
      if (!didGetResource || resourceGetError) return;
      const resourceData = readResourceData(dataStoreSnapshot)({
        Resource,
        identity: identity as IdentityType,
      });
      writeAction = writeOneResource({
        Resource,
        identity,
        body: await Promise.resolve(
          (body as CallableBodyType<ResourceDataType>)(
            resourceData as ResourceDataType,
          ),
        ),
      });
    } else
      writeAction = writeOneResource({
        Resource,
        identity,
        body,
      });
  // operates on a whole resource type
  else if (bodyIsFunction) {
    const resourceTypeData = readResourceTypeData(dataStoreSnapshot)<
      IdentityType,
      ResourceDataType
    >({
      Resource,
    }).filter(
      ({ identity }) =>
        readResourceGetDidStart(dataStoreSnapshot)({ Resource, identity }) &&
        !readResourceGetError(dataStoreSnapshot)({ Resource, identity }),
    );
    const newBody = (
      await Promise.all(
        resourceTypeData.map(async ({ key, identity, data }) => ({
          key,
          newData: await Promise.resolve(
            (
              body as WholeResourceCallableBodyType<
                IdentityType,
                ResourceDataType
              >
            )(identity, data),
          ),
        })),
      )
    ).reduce(
      (acc, { key, newData }) => ({
        ...acc,
        [key]: newData,
      }),
      {},
    );

    writeAction = writeWholeResource({
      Resource,
      body: newBody,
    });
  } else
    writeAction = writeWholeResource({
      Resource,
      body,
    });

  await dataStore.dispatch(writeAction);
};

export default yieldResource;
