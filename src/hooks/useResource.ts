import { ResourceType } from 'describe/resource';
import { uniqueId, noop } from 'lodash-es';
import { useCallback, useMemo, useState, useEffect } from 'react';
import * as shim from 'use-sync-external-store/shim';
import dataStore from '../internals/stores/data';
import surfaceStore from '../internals/stores/surface';
import readResourceData from '../read/dataStore/resourceData';
import readResourceGetError from '../read/dataStore/resourceGetError';
import writeAddToSurfaceWithKey from '../write/surfaceStore/addToSurfaceWithKey';
import writeRemoveFromSurfaceWithKey from '../write/surfaceStore/removeFromSurfaceWithKey';

const { useSyncExternalStore } = shim;

const getEmptyState = <IdentityType, ResourceDataType>({
  Resource,
  identity,
}: {
  Resource: ResourceType<IdentityType, ResourceDataType>;
  identity: IdentityType;
  resourceData?: ResourceDataType;
  resourceGetError?: any;
}) => {
  const result: {
    Resource: ResourceType<IdentityType, ResourceDataType>;
    identity: IdentityType;
    resourceData?: ResourceDataType;
    resourceGetError?: any;
  } = {
    identity,
    Resource,
    resourceData: undefined,
    resourceGetError: undefined,
  };

  if (identity !== null) {
    const dataStoreSnapshot = dataStore.getState();
    result.resourceData = readResourceData(dataStoreSnapshot)({
      Resource,
      identity,
    });
    result.resourceGetError = readResourceGetError(dataStoreSnapshot)({
      Resource,
      identity,
    });
  }

  return result;
};

const useResource = <IdentityType, ResourceDataType>({
  Resource: ProvidedResource,
  identity: providedIdentity,
}: {
  Resource: ResourceType<IdentityType, ResourceDataType>;
  identity: IdentityType;
}): [ResourceDataType | undefined, any] => {
  // fixed key, tied to parent component, used for replace-only caching
  const subscriptionKey = useMemo(uniqueId, []);

  const [{ identity, Resource }, setHookState] = useState(() => ({
    identity: providedIdentity,
    Resource: ProvidedResource,
  }));

  // flag invocation where providedIdentity does not match internal state
  const providedIdentityDoesMatchRender = useMemo(
    () =>
      Resource === ProvidedResource &&
      Resource.areIdentitiesEqual(identity, providedIdentity),
    [Resource, ProvidedResource, identity, providedIdentity],
  );

  // respond to argument changes
  useEffect(() => {
    setHookState(last => {
      // bail out changes which don't require work
      if (
        last.Resource === ProvidedResource &&
        last.Resource.areIdentitiesEqual(last.identity, providedIdentity)
      )
        return last;

      return getEmptyState({
        Resource: ProvidedResource,
        identity: providedIdentity,
      });
    });
  }, [ProvidedResource, providedIdentity, setHookState]);

  // interface with surfaceStore per identity and Resource
  const onStoreChange = useCallback(
    listener => {
      if (identity === null) return noop;

      let preventChange = false;

      const surfaceElement = {
        Resource,
        identity,
        onChange: () => {
          if (preventChange) return;
          listener();
        },
      };

      surfaceStore.dispatch(
        writeAddToSurfaceWithKey({ key: subscriptionKey, surfaceElement }),
      );

      return () => {
        // dispatch won't resolve immediately, need to ensure "onChange"s are
        // intercepted in the hook
        preventChange = true;

        surfaceStore.dispatch(
          writeRemoveFromSurfaceWithKey({ key: subscriptionKey }),
        );
      };
    },
    [identity, Resource, subscriptionKey],
  );

  const getSnapshot = useCallback(
    () =>
      getEmptyState({
        Resource: ProvidedResource,
        identity: providedIdentity,
      }),
    [ProvidedResource, providedIdentity],
  );

  const { resourceData, resourceGetError } = useSyncExternalStore(
    onStoreChange,
    getSnapshot,
  );

  if (providedIdentityDoesMatchRender) return [resourceData, resourceGetError];

  // synchronously provide data available in the dataStore as a fallback
  const fallbackReturnData = getEmptyState({
    Resource: ProvidedResource,
    identity: providedIdentity,
  });

  return [fallbackReturnData.resourceData, fallbackReturnData.resourceGetError];
};

export default useResource;
