const GET_TIMEOUT_SECONDS = 2 * 60;

const makeResourceGet = <IdentityType, ResourceDataType>({
  externalGet,
}: {
  externalGet: (
    identity: IdentityType,
    startIndex?: number,
    endIndex?: number,
  ) => Promise<ResourceDataType>;
}): ((
  identity: IdentityType,
  startIndex?: number,
  endIndex?: number,
) => Promise<ResourceDataType | undefined>) => {
  return async (
    identity: IdentityType,
    startIndex?: number,
    endIndex?: number,
  ) => {
    const timeout = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.warn(
        `Warning: Resource.get took ${GET_TIMEOUT_SECONDS} seconds to resolve.`,
        externalGet,
        identity,
        startIndex,
        endIndex,
      );
    }, GET_TIMEOUT_SECONDS * 1000);

    let result;
    let error;

    try {
      result = await Promise.resolve(
        externalGet(identity, startIndex, endIndex),
      );
    } catch (caughtWith) {
      error = caughtWith;
      // eslint-disable-next-line no-console
      console.error('Warning: Resource.get failed', '\n', caughtWith);
    } finally {
      clearTimeout(timeout);
    }

    if (error) throw error;

    return result;
  };
};

export default makeResourceGet;
