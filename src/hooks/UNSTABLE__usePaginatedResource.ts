import { PaginatedResourceType } from 'describe/UNSTABLE__paginatedResource';
import dataStore from 'internals/stores/data';
import surfaceStore from 'internals/stores/surface';
import { noop, uniqueId } from 'lodash-es';
import { useState, useEffect, useMemo } from 'react';
import readResourceData from 'read/dataStore/resourceData';
import readResourceGetError from 'read/dataStore/resourceGetError';
import writeAddToSurface from 'write/surfaceStore/addToSurface';
import writeRemoveFromSurface from 'write/surfaceStore/removeFromSurface';
import { SurfaceElementType } from './../internals/stores/surface';

const makeArrayOfLength = <FillType = undefined>(
  length: number,
  fillWith?: FillType,
): FillType[] => new Array(length).fill(fillWith);

const getEmptyState = <IdentityType, ResourceDataType>({
  Resource,
  identity,
}: {
  Resource: PaginatedResourceType<IdentityType, ResourceDataType>;
  identity: IdentityType;
}) => {
  const result = {
    identity,
    Resource,
    paginationRangeRequirementsData: {} as Record<string, any>,
  };

  return result;
};

const getDoesPaginationRequirementMatchSurfaceElement = ({
  paginationRequirementStartIndex,
  paginationRequirementEndIndex,
  paginationRequirementResource,
  paginationRequirementIdentity,
  surfaceElement,
}: {
  paginationRequirementStartIndex: number;
  paginationRequirementEndIndex: number;
  paginationRequirementResource: PaginatedResourceType<any, any>;
  paginationRequirementIdentity: any;
  surfaceElement: any;
}) => {
  if (surfaceElement.identity.startIndex !== paginationRequirementStartIndex)
    return false;
  if (surfaceElement.identity.endIndex !== paginationRequirementEndIndex)
    return false;

  if (surfaceElement.Resource !== paginationRequirementResource) return false;
  if (
    !paginationRequirementResource.areProvidedIdentitiesEqual(
      paginationRequirementIdentity,
      surfaceElement.identity.providedIdentity,
    )
  )
    return false;

  return true;
};

const UNSTABLE__usePaginatedResource = <IdentityType, ResourceDataType>({
  Resource: ProvidedResource,
  identity: providedIdentity,
  startIndex = 0,
  endIndex = 0,
}: {
  Resource: PaginatedResourceType<IdentityType, ResourceDataType>;
  identity: IdentityType;
  startIndex: number;
  endIndex: number;
}): [
  (ResourceDataType | undefined | null)[] | undefined,
  number | undefined,
  any | undefined,
] => {
  // composite internal hook state
  const [
    { identity, Resource, paginationRangeRequirementsData },
    setHookState,
  ] = useState(() =>
    getEmptyState({
      Resource: ProvidedResource,
      identity: providedIdentity,
    }),
  );

  useEffect(() => {
    setHookState(last => {
      // bail out changes which don't require work
      if (
        last.Resource === ProvidedResource &&
        last.Resource.areProvidedIdentitiesEqual(
          last.identity,
          providedIdentity,
        )
      )
        return last;

      return getEmptyState({
        Resource: ProvidedResource,
        identity: providedIdentity,
      });
    });
  }, [ProvidedResource, providedIdentity]);

  // pagination params

  const [paginationRangeRequirements, setPaginationRangeRequirements] =
    useState({
      identity,
      Resource,
      ranges: [] as { startIndex: number; endIndex: number }[],
    });

  useEffect(() => {
    if (identity === null)
      setPaginationRangeRequirements({ identity, Resource, ranges: [] });
    // TODO: ignore if range is already required
    else
      setPaginationRangeRequirements(last => {
        if (
          last.Resource === Resource &&
          last.Resource.areProvidedIdentitiesEqual(last.identity, identity)
        ) {
          const ascendingOverlap = last.ranges
            .map(lastRange => ({
              startIndex: Math.max(startIndex, lastRange.startIndex),
              endIndex: Math.min(endIndex, lastRange.endIndex),
            }))
            .filter(({ startIndex, endIndex }) => endIndex >= startIndex)
            .sort((a, b) => a.startIndex - b.startIndex)
            .reduce((acc, item) => {
              const lastItem = acc[acc.length - 1];
              if (!lastItem) return [item];

              if (item.startIndex <= lastItem.endIndex)
                return [
                  ...acc.slice(0, acc.length - 1),
                  {
                    startIndex: item.startIndex,
                    endIndex: item.endIndex,
                  },
                ];

              return [...acc, item];
            }, [] as { startIndex: number; endIndex: number }[]);

          const rangesToAdd: { startIndex: number; endIndex: number }[] = [];

          let i = startIndex;
          while (i <= endIndex) {
            const overlapRange = ascendingOverlap.find(
              range => range.startIndex <= i && range.endIndex >= i,
            );

            if (overlapRange) {
              i = overlapRange.endIndex + 1;
            } else {
              if (i === rangesToAdd[rangesToAdd.length - 1]?.endIndex + 1) {
                rangesToAdd[rangesToAdd.length - 1].endIndex = i;
              } else {
                rangesToAdd.push({
                  startIndex: i,
                  endIndex: i,
                });
              }
              i++;
            }
          }

          return {
            ...last,
            ranges: [...last.ranges, ...rangesToAdd],
          };
        }

        return {
          identity,
          Resource,
          ranges: [{ startIndex, endIndex }],
        };
      });
  }, [Resource, identity, startIndex, endIndex]);

  // surface interaction

  const baseSubscriptionKey = useMemo(uniqueId, []);

  const [surfaceElements, setSurfaceElements] = useState<
    SurfaceElementType<PaginatedResourceType<IdentityType, ResourceDataType>>[]
  >([]);

  useEffect(() => {
    setSurfaceElements(last => {
      const filteredLast = last.filter(surfaceElement =>
        paginationRangeRequirements.ranges.find(({ startIndex, endIndex }) =>
          getDoesPaginationRequirementMatchSurfaceElement({
            paginationRequirementStartIndex: startIndex,
            paginationRequirementEndIndex: endIndex,
            paginationRequirementResource: paginationRangeRequirements.Resource,
            paginationRequirementIdentity: paginationRangeRequirements.identity,
            surfaceElement,
          }),
        ),
      );

      const toAdd = paginationRangeRequirements.ranges
        .filter(
          ({ startIndex, endIndex }) =>
            !filteredLast.find(surfaceElement =>
              getDoesPaginationRequirementMatchSurfaceElement({
                paginationRequirementStartIndex: startIndex,
                paginationRequirementEndIndex: endIndex,
                paginationRequirementResource:
                  paginationRangeRequirements.Resource,
                paginationRequirementIdentity:
                  paginationRangeRequirements.identity,
                surfaceElement,
              }),
            ),
        )
        .map(({ startIndex, endIndex }) => {
          const surfaceElementKey = uniqueId();

          return {
            __internalKey: baseSubscriptionKey,
            Resource: paginationRangeRequirements.Resource,
            identity: {
              providedIdentity: paginationRangeRequirements.identity,
              startIndex,
              endIndex,
            },
            onChange: ({
              resourceData,
              resourceGetError,
            }: {
              resourceData: ResourceDataType | undefined;
              resourceGetError: any;
            }) => {
              setHookState(last => ({
                ...last,
                paginationRangeRequirementsData: {
                  ...last.paginationRangeRequirementsData,
                  [surfaceElementKey]: {
                    startIndex,
                    endIndex,
                    resourceData,
                    resourceGetError,
                  },
                },
              }));
            },
            clearData: () => {
              setHookState(
                ({
                  paginationRangeRequirementsData: {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    [surfaceElementKey]: omit,
                    ...paginationRangeRequirementsData
                  },
                  ...last
                }) => ({
                  ...last,
                  paginationRangeRequirementsData,
                }),
              );
            },
          };
        });

      return [...filteredLast, ...toAdd];
    });
  }, [paginationRangeRequirements, baseSubscriptionKey]);

  useEffect(() => {
    const currentSurface = surfaceStore.getState();
    currentSurface.forEach(surfaceElement => {
      if (
        !surfaceElements.includes(surfaceElement) &&
        surfaceElement.__internalKey === baseSubscriptionKey
      ) {
        // TODO: this is hacky, need to make sure this onChange is not called while
        // we're waiting to get this fn out of the surface
        surfaceElement.clearData?.();
        surfaceElement.onChange = noop;
        surfaceStore.dispatch(writeRemoveFromSurface(surfaceElement));
      }
    });

    surfaceElements.forEach(surfaceElement => {
      if (!currentSurface.includes(surfaceElement)) {
        const dataStoreSnapshot = dataStore.getState();
        surfaceElement.onChange({
          resourceData: readResourceData(dataStoreSnapshot)({
            Resource: surfaceElement.Resource,
            identity: surfaceElement.identity,
          }),
          resourceGetError: readResourceGetError(dataStoreSnapshot)({
            Resource: surfaceElement.Resource,
            identity: surfaceElement.identity,
          }),
        });
        surfaceStore.dispatch(writeAddToSurface(surfaceElement));
      }
    });
  }, [surfaceElements, baseSubscriptionKey]);

  useEffect(() => {
    // DEV: this is preventing crazy long yields for paginated resources
    // which are not currently being used. Would not be needed if we were
    // dumping out-of-range rows. Another option would be to let users explicitly
    // say "what's in the cache here is useless to me", and let follow up gets
    // for resources we still need happen after the mutation is done.
    return () => {
      surfaceStore.getState().forEach(surfaceElement => {
        if (surfaceElement.__internalKey === baseSubscriptionKey) {
          // TODO: this is hacky, need to make sure this onChange is not called while
          // we're waiting to get this fn out of the surface
          surfaceElement.onChange({
            resourceData: undefined,
            resourceGetError: undefined,
          });
          surfaceElement.onChange = noop;
          surfaceStore.dispatch(writeRemoveFromSurface(surfaceElement));
        }
      });
    };
  }, [baseSubscriptionKey]);

  // collect hook data

  const providedIdentityDoesMatchRender = useMemo(
    () =>
      Resource === ProvidedResource &&
      Resource.areProvidedIdentitiesEqual(identity, providedIdentity),
    [Resource, ProvidedResource, identity, providedIdentity],
  );

  const paginationRangeRequirementsDataEndIndex = useMemo(
    () =>
      Object.values(paginationRangeRequirementsData).reduce(
        (acc, { endIndex }) => Math.max(acc, endIndex),
        0,
      ),
    [paginationRangeRequirementsData],
  );

  const resourceListData = useMemo(
    () =>
      Object.values(paginationRangeRequirementsData).reduce(
        (acc, { startIndex, endIndex, resourceData }) => {
          // TODO: use get metadata to determine if active fetch
          const resourceListData = resourceData
            ? Resource.getListFromGetResponse(resourceData)
            : makeArrayOfLength(
                Math.max(0, endIndex + 1 - startIndex),
                // indicate loading item with undefined
                undefined,
              );

          // TODO: figure out best policy for handling disagreements btw data length
          // and index range
          const lengthSafeResourceData = [
            ...resourceListData,
            ...makeArrayOfLength(
              Math.max(
                0,
                endIndex - startIndex - (resourceListData.length - 1),
              ),
              // indicate intentional blank space with null
              null,
            ),
          ];

          return [
            ...acc.slice(0, startIndex),
            ...lengthSafeResourceData,
            ...acc.slice(endIndex + 1),
          ];
        },
        makeArrayOfLength(
          paginationRangeRequirementsDataEndIndex + 1,
          // indicate intentional blank space with null
          null,
        ),
      ),
    [
      paginationRangeRequirementsData,
      paginationRangeRequirementsDataEndIndex,
      Resource,
    ],
  );

  const resourceCountData = useMemo(
    // TODO: subsequent gets may return different totals because of off-client
    // creates or deletes, we will need to handle this
    // also maybe not a great policy to take the first valid value we find.
    () => {
      const lastData = Object.values(paginationRangeRequirementsData).find(
        value => value,
      )?.resourceData;

      // TODO: use get metadata
      if (!lastData) return;

      return Resource.getCountFromGetResponse(lastData);
    },
    [paginationRangeRequirementsData, Resource],
  );

  const resourceGetError = useMemo(
    () =>
      Object.values(paginationRangeRequirementsData).find(
        ({ resourceGetError }) => resourceGetError,
      )?.resourceGetError,
    [paginationRangeRequirementsData],
  );

  if (providedIdentityDoesMatchRender)
    return [resourceListData, resourceCountData, resourceGetError];

  return [undefined, undefined, undefined];
};

export default UNSTABLE__usePaginatedResource;
