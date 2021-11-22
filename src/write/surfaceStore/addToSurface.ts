import { SurfaceStoreType } from 'internals/stores/surface';
import makeWrite from '../../make/write';

const writeAddToSurface = makeWrite(
  'addToSurface',
  surfaceElement => (state: SurfaceStoreType) => [...state, surfaceElement],
);

export default writeAddToSurface;
