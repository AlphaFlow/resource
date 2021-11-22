import refreshResource from 'internals/refreshResource';
import yieldResource from 'internals/yieldResource';
import { uniqueId } from 'lodash-es';
import UNSTABLE__makeResourceGetFromStoreOrGet from 'make/UNSTABLE__resourceGetFromStoreOrGet';
import makeResourceGet from 'make/resourceGet';
import UNSTABLE__useResourceWithSuspense from 'hooks/UNSTABLE__useResourceWithSuspense';
import useResource from 'hooks/useResource';

export type ResourceType<IdentityType, ResourceDataType> = {
  key: string;
  label: string;
  areIdentitiesEqual: (a: IdentityType, b: IdentityType) => boolean;
  get: (identity: IdentityType) => Promise<ResourceDataType>;
  UNSTABLE__getFromStoreOrGet: (
    identity: IdentityType,
  ) => Promise<ResourceDataType>;
  UNSTABLE__clearImmediate: boolean;
  use: (identity: IdentityType) => [IdentityType | undefined, any];
  UNSTABLE__useWithSuspense: (identity: IdentityType) => IdentityType;
  yield: (identity?: IdentityType, body?: any) => any;
  refresh: (identity: IdentityType) => Promise<ResourceDataType>;
};

const describeResource = <IdentityType, ResourceDataType>(
  label = 'AnonymousResource',
  {
    get,
    areIdentitiesEqual = Object.is,
    UNSTABLE__clearImmediate = false,
  }: {
    get: (identity: IdentityType) => Promise<ResourceDataType>;
    areIdentitiesEqual?: (a: IdentityType, b: IdentityType) => boolean;
    UNSTABLE__clearImmediate?: boolean;
  },
): ResourceType<IdentityType, ResourceDataType> => {
  const Resource = {
    key: uniqueId(label),
    label,
    areIdentitiesEqual,
    UNSTABLE__clearImmediate,
    get: makeResourceGet<IdentityType, ResourceDataType>({
      externalGet: get,
    }),
  } as Record<string, any>;

  Resource.UNSTABLE__getFromStoreOrGet =
    UNSTABLE__makeResourceGetFromStoreOrGet<IdentityType, ResourceDataType>({
      // @ts-expect-error TODO: I can't figure out how to let this function accept an incomplete resource
      // type. The resource type will be complete any time the function actually runs.
      Resource,
    });

  // fix Resource to core methods for convenience
  Resource.use = (identity: IdentityType) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useResource<IdentityType, ResourceDataType>({
      // @ts-expect-error TODO: I can't figure out how to let this function accept an incomplete resource
      // type. The resource type will be complete any time the function actually runs.
      Resource,
      identity,
    });
  Resource.UNSTABLE__useWithSuspense = (identity: IdentityType) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    UNSTABLE__useResourceWithSuspense<IdentityType, ResourceDataType>({
      // @ts-expect-error TODO: I can't figure out how to let this function accept an incomplete resource
      // type. The resource type will be complete any time the function actually runs.
      Resource,
      identity,
    });

  Resource.yield = (identity: IdentityType, body: any) =>
    yieldResource<IdentityType, ResourceDataType>({
      // @ts-expect-error TODO: I can't figure out how to let this function accept an incomplete resource
      // type. The resource type will be complete any time the function actually runs.
      Resource,
      identity,
      body,
    });

  Resource.refresh = (identity: IdentityType) =>
    refreshResource<IdentityType, ResourceDataType>({
      // @ts-expect-error TODO: I can't figure out how to let this function accept an incomplete resource
      // type. The resource type will be complete any time the function actually runs.
      Resource,
      identity,
    });

  return Resource as ResourceType<IdentityType, ResourceDataType>;
};

export default describeResource;
