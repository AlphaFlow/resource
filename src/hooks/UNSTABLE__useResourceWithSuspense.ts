import { ResourceType } from 'describe/resource';
import { noop, uniqueId } from 'lodash-es';
import readResourceGetDidFinish from 'read/dataStore/resourceGetDidFinish';
import dataStore from '../internals/stores/data';
import surfaceStore from '../internals/stores/surface';
import readResourceGetError from '../read/dataStore/resourceGetError';
import writeAddToSurfaceWithKey from '../write/surfaceStore/addToSurfaceWithKey';
import writeRemoveFromSurfaceWithKey from '../write/surfaceStore/removeFromSurfaceWithKey';
import useResource from './useResource';

const fetcher = <IdentityType, ResourceDataType>({
  Resource,
  identity,
}: {
  Resource: ResourceType<IdentityType, ResourceDataType>;
  identity: IdentityType;
}) => {
  const dataStoreSnapshot = dataStore.getState();
  const resourceGetError = readResourceGetError(dataStoreSnapshot)({
    Resource,
    identity,
  });
  const resourceGetDidFinish = readResourceGetDidFinish(dataStoreSnapshot)({
    Resource,
    identity,
  });

  if (resourceGetError) throw resourceGetError;

  if (resourceGetDidFinish) return true;

  const surfaceElement = {
    Resource,
    identity,
    onChange: noop,
  };

  const key = uniqueId();

  surfaceStore.dispatch(writeAddToSurfaceWithKey({ key, surfaceElement }));

  throw new Promise<void>(resolve => {
    const unsubscribeRef: { current?: any } = {};
    unsubscribeRef.current = dataStore.subscribe(() => {
      const dataStoreSnapshot = dataStore.getState();
      const resourceGetDidFinish = readResourceGetDidFinish(dataStoreSnapshot)({
        Resource,
        identity,
      });
      if (resourceGetDidFinish) {
        resolve();
        surfaceStore.dispatch(writeRemoveFromSurfaceWithKey({ key }));
        unsubscribeRef.current();
      }
    });
  });
};

const UNSTABLE__useResourceWithSuspense = <IdentityType, ResourceDataType>({
  Resource,
  identity,
}: {
  Resource: ResourceType<IdentityType, ResourceDataType>;
  identity: IdentityType;
}): ResourceDataType | undefined => {
  fetcher<IdentityType, ResourceDataType>({ Resource, identity });
  // TODO: need to figure out whether it's absolutely safe to hand off
  // like this - could the resource get wiped after the fetcher removes its key?
  return useResource<IdentityType, ResourceDataType>({ Resource, identity })[0];
};

export default UNSTABLE__useResourceWithSuspense;
