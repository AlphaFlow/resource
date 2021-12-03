import { createStore, compose } from 'redux';

// reducer expects a transformStore function which it will call with the current store
const reducer = <StoreType>(
  currentStore: StoreType,
  {
    transformStore,
  }: { transformStore: (currentStore: StoreType) => StoreType },
) => {
  // handle redux's @@INIT action
  if (typeof transformStore !== 'function') return currentStore;

  return transformStore(currentStore);
};

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  }
}

export type StoreType<StoreStateType> = {
  getState: () => StoreStateType;
  subscribe: (listener: () => void) => () => void;
  dispatch: (action: any) => void;
};

const makeStore = <StoreStateType>(
  initialStore: StoreStateType,
): StoreType<StoreStateType> => {
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(
    // @ts-expect-error our reducer type conflicts with what redux expects, disabling this check
    reducer,
    initialStore,
    composeEnhancers(),
  );
  return store as StoreType<StoreStateType>;
};

export default makeStore;
