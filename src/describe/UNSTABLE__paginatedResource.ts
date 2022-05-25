import UNSTABLE__yieldWholePaginatedResource from 'internals/UNSTABLE__yieldWholePaginatedResource';
import { uniqueId } from 'lodash-es';
import makeResourceGet from 'make/resourceGet';
import UNSTABLE__usePaginatedResource from 'hooks/UNSTABLE__usePaginatedResource';

export type PaginatedResourceType<IdentityType, ResourceDataType> = {
  key: string;
  label: string;
  areProvidedIdentitiesEqual: (a: IdentityType, b: IdentityType) => boolean;
  areIdentitiesEqual: (a: IdentityType, b: IdentityType) => boolean;
  get: (
    identity: IdentityType,
    startIndex: number,
    endIndex: number,
  ) => Promise<ResourceDataType>;
  getListFromGetResponse: (response: any) => ResourceDataType[];
  getCountFromGetResponse: (response: any) => number;
  UNSTABLE__getFromStoreOrGet: (
    identity: IdentityType,
  ) => Promise<ResourceDataType>;
  UNSTABLE__clearImmediate: boolean;
  use: (
    identity: IdentityType | null | never,
    startIndex: number,
    endIndex: number,
  ) => [(ResourceDataType | undefined | null)[], number | undefined, any];

  UNSTABLE__useWithSuspense: (identity: IdentityType) => IdentityType;
  yield: (identity?: IdentityType, body?: any) => any;
  refresh: (identity: IdentityType) => Promise<ResourceDataType>;
  isPaginatedResource: boolean;
};

export type AreIdentitiesEqualArgumentType<IdentityType> = {
  startIndex: number;
  endIndex: number;
  providedIdentity: IdentityType;
};

const UNSTABLE__describePaginatedResource = <IdentityType, ResourceDataType>(
  label = 'AnonymousPaginatedResource',
  {
    get,
    getListFromGetResponse,
    getCountFromGetResponse,
    areIdentitiesEqual = Object.is,
    UNSTABLE__clearImmediate = false,
  }: {
    get: (
      identity: IdentityType,
      startIndex?: number,
      endIndex?: number,
    ) => Promise<any>;
    getListFromGetResponse: (response: any) => ResourceDataType;
    getCountFromGetResponse: (response: any) => number;
    areIdentitiesEqual?: (a: IdentityType, b: IdentityType) => boolean;
    UNSTABLE__clearImmediate?: boolean;
  },
): PaginatedResourceType<IdentityType, ResourceDataType> => {
  const Resource = {
    key: uniqueId(label),
    label,
    // for use within paginated paradigm
    areProvidedIdentitiesEqual: areIdentitiesEqual,
    // for use outside, e.g. makeDataStoreKey
    areIdentitiesEqual: (
      a: AreIdentitiesEqualArgumentType<IdentityType>,
      b: AreIdentitiesEqualArgumentType<IdentityType>,
    ) => {
      if (a?.startIndex !== b?.startIndex) return false;
      if (a?.endIndex !== b?.endIndex) return false;
      return areIdentitiesEqual(a?.providedIdentity, b?.providedIdentity);
    },
    getListFromGetResponse,
    getCountFromGetResponse,
    UNSTABLE__clearImmediate,
    isPaginatedResource: true,
  } as Record<string, any>;

  Resource.get = makeResourceGet({ externalGet: get });

  // fix Resource to core methods for convenience
  Resource.use = (
    identity: IdentityType,
    startIndex: number,
    endIndex: number,
  ) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    UNSTABLE__usePaginatedResource<IdentityType, ResourceDataType>({
      // @ts-expect-error TODO: I can't figure out how to let this function accept an incomplete resource
      // type. The resource type will be complete any time the function actually runs.
      Resource,
      identity,
      startIndex,
      endIndex,
    });

  Resource.yieldWholeResource = (body: any) =>
    UNSTABLE__yieldWholePaginatedResource<IdentityType, ResourceDataType>({
      // @ts-expect-error TODO: I can't figure out how to let this function accept an incomplete resource
      // type. The resource type will be complete any time the function actually runs.
      Resource,
      body,
    });

  Resource.refresh = async (refreshIdentity: IdentityType) => {
    return UNSTABLE__yieldWholePaginatedResource<
      IdentityType,
      ResourceDataType
    >({
      // @ts-expect-error TODO: I can't figure out how to let this function accept an incomplete resource
      // type. The resource type will be complete any time the function actually runs.
      Resource,
      body: (identity, startIndex, endIndex, data) => {
        if (refreshIdentity === undefined)
          return Resource.get(identity, startIndex, endIndex);

        if (!Resource.areIdentitiesEqual(refreshIdentity, identity))
          return data;

        return Resource.get(refreshIdentity, startIndex, endIndex);
      },
    });
  };

  return Resource as PaginatedResourceType<IdentityType, ResourceDataType>;
};

export default UNSTABLE__describePaginatedResource;
