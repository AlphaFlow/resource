import taskController from '../internals/taskController';

export type MutationType = {
  label: string;
  (): Promise<any>;
};

const describeMutation = (
  label: string,
  runner: (...args: any[]) => any,
): MutationType => {
  // ensure mutations are async
  const mutation = (...args: any[]) => Promise.resolve(runner(...args));

  mutation.label = label;

  // thread resolve/reject control into taskController so that users can expect normal promise behavior
  const runMutation = (...callWith: any[]) =>
    new Promise((resolve, reject) => {
      taskController.acceptMutation({ mutation, callWith, resolve, reject });
    });

  return runMutation as MutationType;
};

export default describeMutation;
