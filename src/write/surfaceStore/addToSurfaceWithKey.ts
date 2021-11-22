import { SurfaceStoreType } from 'internals/stores/surface';
import makeWrite from '../../make/write';

const writeAddToSurfaceWithKey = makeWrite(
  'addToSurfaceWithKey',
  ({ key, surfaceElement }) =>
    (state: SurfaceStoreType) =>
      [
        ...state.filter(element =>
          element.key === undefined ? true : element.key !== key,
        ),
        { key, ...surfaceElement },
      ],
);

export default writeAddToSurfaceWithKey;
