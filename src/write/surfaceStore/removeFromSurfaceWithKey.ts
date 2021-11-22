import { SurfaceStoreType } from 'internals/stores/surface';
import makeWrite from '../../make/write';

const writeRemoveFromSurfaceWithKey = makeWrite(
  'removeFromSurfaceWithKey',
  ({ key }) =>
    (state: SurfaceStoreType) =>
      state.filter(element =>
        element.key === undefined ? true : element.key !== key,
      ),
);

export default writeRemoveFromSurfaceWithKey;
