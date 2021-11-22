import makeStore from 'make/store';

export type DataStoreType = {
  data: {
    // TODO: see if there's a way of using the return type of make date store key here
    [key: string]: {
      data: any;
      get: {
        didStart: boolean;
        didResolve: boolean;
        didReject: boolean;
        rejectedWith: any;
      };
    };
  };
};

export const initialStore: DataStoreType = {
  data: {},
};

const dataStore = makeStore<DataStoreType>(initialStore);

export default dataStore;
