import reportDataStoreChangeToSurface from './reportDataStoreChangeToSurface';
import dataStore from './stores/data';
import surfaceStore from './stores/surface';
import taskController from './taskController';

// arrange subscribers

dataStore.subscribe(() => {
  reportDataStoreChangeToSurface(dataStore.getState());
});

surfaceStore.subscribe(() => {
  taskController.acceptSurfaceChange(surfaceStore.getState());
});
