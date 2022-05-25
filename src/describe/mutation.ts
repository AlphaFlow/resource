import taskController from '../internals/taskController';

export type MutationType<ParametersType extends unknown[], ReturnType> = {
  label: string;
  (...args: ParametersType): Promise<ReturnType>;
};

const describeMutation = <
  ParametersType extends unknown[],
  ReturnType = unknown,
>(
  label: string,
  runner: (...args: ParametersType) => any,
): MutationType<ParametersType, ReturnType> => {
  // ensure mutations are async
  const mutation = (...args: ParametersType) =>
    Promise.resolve(runner(...args));

  mutation.label = label;

  // thread resolve/reject control into taskController so that users can expect normal promise behavior
  const runMutation = (...callWith: ParametersType) =>
    new Promise((resolve, reject) => {
      taskController.acceptMutation({ mutation, callWith, resolve, reject });
    });

  return runMutation as MutationType<ParametersType, ReturnType>;
};

export default describeMutation;
