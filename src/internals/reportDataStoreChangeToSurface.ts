import { DataStoreType } from 'internals/stores/data';
import surfaceStore from 'internals/stores/surface';
import readResourceData from '../read/dataStore/resourceData';
import readResourceGetError from '../read/dataStore/resourceGetError';

// we should never modify the stores or task queue here, this is a "reporting" fn

let lastState: DataStoreType | undefined;

const reportDataStoreChangeToSurface = (currentState: DataStoreType): void => {
  const surfaceSnapshot = surfaceStore.getState();

  surfaceSnapshot.forEach(({ Resource, identity, onChange }) => {
    const lastStateData = lastState
      ? readResourceData(lastState)({ Resource, identity })
      : null;
    const currentStateData = readResourceData(currentState)({
      Resource,
      identity,
    });

    const dataDidChange = !Object.is(lastStateData, currentStateData);

    const lastErrorData = lastState
      ? readResourceGetError(lastState)({ Resource, identity })
      : null;
    const currentErrorData = readResourceGetError(currentState)({
      Resource,
      identity,
    });

    const errorDidChange = !Object.is(lastErrorData, currentErrorData);

    if (dataDidChange || errorDidChange)
      onChange({
        resourceData: currentStateData,
        resourceGetError: currentErrorData,
      });
  });

  lastState = currentState;
};

export default reportDataStoreChangeToSurface;
