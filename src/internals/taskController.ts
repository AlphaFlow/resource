import { PaginatedResourceType } from 'describe/UNSTABLE__paginatedResource';
import { MutationType } from 'describe/mutation';
import { ResourceType } from 'describe/resource';
import dataStore from 'internals/stores/data';
import { SurfaceStoreType } from 'internals/stores/surface';
import { differenceWith } from 'lodash-es';
import readResourceData from '../read/dataStore/resourceData';
import readResourceGetDidStart from '../read/dataStore/resourceGetDidStart';
import readResourceGetError from '../read/dataStore/resourceGetError';
import readResourceRequirements from '../read/surfaceStore/resourceRequirements';
import writeRejectGet from '../write/dataStore/rejectGet';
import writeRemoveGet from '../write/dataStore/removeGet';
import writeResolveGet from '../write/dataStore/resolveGet';
import writeStartGet from '../write/dataStore/startGet';

const MUTATION_TIMEOUT_SECONDS = 2 * 60;

let lastSurfaceSnapshot: SurfaceStoreType | null = null;
const runSurfaceRequirementsTask = async (
  surfaceSnapshot: SurfaceStoreType,
) => {
  // collect requirements
  const requirements = readResourceRequirements(surfaceSnapshot)();
  const lastRequirements = lastSurfaceSnapshot
    ? readResourceRequirements(lastSurfaceSnapshot)()
    : null;

  lastSurfaceSnapshot = surfaceSnapshot;

  // catch up
  differenceWith(
    surfaceSnapshot,
    lastSurfaceSnapshot || [],
    // TODO: need to clarify the purpose of a key here. Should this be key
    // matches and resource + identity match?
    (a, b) => a.key === b.key,
  ).forEach(({ onChange, Resource, identity }) => {
    const dataStoreSnapshot = dataStore.getState();

    onChange({
      resourceData: readResourceData(dataStoreSnapshot)({
        Resource,
        identity,
      }),
      resourceGetError: readResourceGetError(dataStoreSnapshot)({
        Resource,
        identity,
      }),
    });
  });

  // write liberally, subscription logic is preventing unnecessary onChange calls
  await Promise.all(
    requirements.map(
      async ({
        Resource,
        identity,
      }: {
        Resource: ResourceType<any, any> | PaginatedResourceType<any, any>;
        identity: any;
      }) => {
        const dataStoreSnapshot = dataStore.getState();
        const resourceGetDidStart = readResourceGetDidStart(dataStoreSnapshot)({
          Resource,
          identity,
        });

        if (resourceGetDidStart) return;
        // TODO: check for multiple identical resource gets, not sure if this is written
        // in time to block repeats
        dataStore.dispatch(writeStartGet({ Resource, identity }));

        try {
          const resolvedWith =
            'isPaginatedResource' in Resource && Resource.isPaginatedResource
              ? await Resource.get(
                  identity.providedIdentity,
                  identity.startIndex,
                  identity.endIndex,
                )
              : await (Resource as ResourceType<any, any>).get(identity);
          dataStore.dispatch(
            writeResolveGet({ Resource, identity, resolvedWith }),
          );
        } catch (rejectedWith) {
          dataStore.dispatch(
            writeRejectGet({ Resource, identity, rejectedWith }),
          );
        }
      },
    ),
  );

  // omit whatever isn't required anymore
  const toRemove = differenceWith(lastRequirements, requirements, (a, b) => {
    if (a.Resource !== b.Resource) return false;
    if (!a.Resource.areIdentitiesEqual(a.identity, b.identity)) return false;

    return true;
  }).filter(({ Resource }) => Resource.UNSTABLE__clearImmediate);

  toRemove.forEach(({ Resource, identity }) => {
    dataStore.dispatch(writeRemoveGet({ Resource, identity }));
  });
};

const runMutationTask = async ({
  mutation,
  callWith = [],
  resolve,
  reject,
}: {
  mutation: MutationType;
  callWith: any[];
  resolve: (result: any) => void;
  reject: (error: any) => void;
}) => {
  const warningMessageTimeout = setTimeout(() => {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: Mutation took ${MUTATION_TIMEOUT_SECONDS} seconds to resolve.`,
      mutation,
      callWith,
    );
  }, MUTATION_TIMEOUT_SECONDS * 1000);

  let result;
  let error;
  try {
    // @ts-expect-error TODO: figure out how to make TS okay with any spread arrays
    result = await mutation(...callWith);
  } catch (caughtWith) {
    error = caughtWith;
  } finally {
    clearTimeout(warningMessageTimeout);
  }
  if (error) return reject(error);
  return resolve(result);
};

type TaskControllerTaskType = {
  isReadTask?: boolean;
  (): Promise<void>;
};

const taskController = (() => {
  let runningTasks: TaskControllerTaskType | null = null;
  let taskQueue: TaskControllerTaskType[] = [];

  const getIsRunning = () => Boolean(runningTasks);
  const getTaskQueue = () => taskQueue;

  // TODO: take a page from react, cancel and re-use active get tasks https://codesandbox.io/s/didact-8-21ost.
  // TODO: this approach means the first get always has to run first. if gets could be merged with whatever get is running,
  // this would be way faster
  const runTask = async (task: TaskControllerTaskType) => {
    let tasksToRun = [task];

    for (const queuedTask of getTaskQueue()) {
      if (queuedTask.isReadTask) tasksToRun = [...tasksToRun, queuedTask];
      else break;
    }

    runningTasks = task;
    await Promise.all(tasksToRun.map(task => task()));

    // clean up, do next

    taskQueue = getTaskQueue().filter(queued => !tasksToRun.includes(queued));

    if (taskQueue.length > 0) {
      runTask(taskQueue[0]);
    } else {
      runningTasks = null;
    }
  };

  const enqueueTask = (task: TaskControllerTaskType) => {
    taskQueue = [...taskQueue, task];
  };

  const push = (task: TaskControllerTaskType) => {
    const handler = getIsRunning() ? enqueueTask : runTask;
    handler(task);
  };

  const acceptSurfaceChange = (surfaceSnapshot: SurfaceStoreType) => {
    const task = () => runSurfaceRequirementsTask(surfaceSnapshot);
    task.isReadTask = true;

    push(task);
  };

  const acceptMutation = ({
    mutation,
    callWith,
    resolve,
    reject,
  }: {
    mutation: MutationType;
    callWith?: any;
    resolve: (result: any) => void;
    reject: (error: any) => void;
  }) => {
    push(() => runMutationTask({ mutation, callWith, resolve, reject }));
  };

  return {
    getIsRunning,
    acceptSurfaceChange,
    acceptMutation,
  };
})();

export default taskController;
