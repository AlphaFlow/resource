import { SurfaceStoreType } from 'internals/stores/surface';
import makeWrite from '../../make/write';

const writeRemoveFromSurface = makeWrite(
  'removeFromSurface',
  surfaceElement => (snapshot: SurfaceStoreType) =>
    snapshot.filter(item => item !== surfaceElement),
);

export default writeRemoveFromSurface;
