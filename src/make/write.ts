// convenience wrapper for dispatching acceptable actions to the store

const makeWrite =
  (name: string, makeTransformStore: (...args: any[]) => any): any =>
  (...args: any[]) => ({
    type: name,
    transformStore: makeTransformStore(...args),
  });

export default makeWrite;
