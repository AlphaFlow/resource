import makeStore from 'make/store';

export type SurfaceElementType<ResourceType = any> = {
  key?: string;
  // TODO: see how resource type can be inferred, each element will have
  // a slightly different type
  Resource: ResourceType;
  identity: any;
  onChange: ({
    resourceData,
    resourceGetError,
  }: {
    resourceData: any;
    resourceGetError: any;
  }) => void;
  __internalKey?: string;
  clearData?: () => void;
};

export type SurfaceStoreType = SurfaceElementType[];

export const initialStore: SurfaceStoreType = [];

const surfaceStore = makeStore<SurfaceStoreType>(initialStore);

export default surfaceStore;
