import { ResourceType } from 'describe/resource';
import readResourceGetDidStart from '../read/dataStore/resourceGetDidStart';
import readResourceTypeData from '../read/dataStore/resourceTypeData';
import writeWholeResource from '../write/dataStore/wholeResource';
import dataStore from './stores/data';

type WholeResourceCallableBodyType<IdentityType, ResourceDataType> = (
  identity: IdentityType,
  startIndex: number,
  endIndex: number,
  resourceData: ResourceDataType,
) => ResourceDataType;

const UNSTABLE__yieldWholePaginatedResource = async <
  IdentityType,
  ResourceDataType,
>({
  Resource,
  body,
}: {
  Resource: ResourceType<IdentityType, ResourceDataType>;
  body:
    | ResourceDataType
    | WholeResourceCallableBodyType<IdentityType, ResourceDataType>;
}): Promise<void> => {
  const bodyIsFunction = typeof body === 'function';
  const dataStoreSnapshot = dataStore.getState();

  let writeAction;

  if (bodyIsFunction) {
    const resourceTypeData = readResourceTypeData(dataStoreSnapshot)({
      Resource,
    }).filter(({ identity }) =>
      readResourceGetDidStart(dataStoreSnapshot)({ Resource, identity }),
    );

    const newBody = (
      await Promise.all(
        resourceTypeData.map(
          async ({
            key,
            identity,
            data,
          }: {
            key: string;
            // TODO: restructure paginated vs regular to use consistent identity types
            identity: any;
            data: ResourceDataType;
          }) => ({
            key,
            newData: await Promise.resolve(
              (
                body as WholeResourceCallableBodyType<
                  IdentityType,
                  ResourceDataType
                >
              )(
                identity.providedIdentity,
                identity.startIndex,
                identity.endIndex,
                data,
              ),
            ),
          }),
        ),
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
  } else {
    writeAction = writeWholeResource({
      Resource,
      body,
    });
  }

  await dataStore.dispatch(writeAction);
};

export default UNSTABLE__yieldWholePaginatedResource;
