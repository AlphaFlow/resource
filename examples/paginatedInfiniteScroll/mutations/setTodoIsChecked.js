import { describeMutation } from '@alphaflow/resource';
import TodoResource from '../resources/Todo';
import TodoListResource from '../resources/TodoList';
import { setTodoIsChecked as setTodoIsCheckedService } from '../services';

const setTodoIsChecked = describeMutation(
  'setTodoIsChecked',
  async ({ todoId, isChecked }) => {
    await TodoResource.yield(todoId, last =>
      !last
        ? last
        : {
            ...last,
            isChecked,
          },
    );

    await TodoListResource.yieldWholeResource(
      (identity, startIndex, endIndex, last) =>
        !last
          ? last
          : {
              ...last,
              list: last.list.map(last =>
                last.id !== todoId
                  ? last
                  : {
                      ...last,
                      isChecked,
                      isSaving: true,
                    },
              ),
            },
    );

    try {
      await setTodoIsCheckedService({ todoId, isChecked });
      await TodoListResource.yieldWholeResource(
        async (identity, startIndex, endIndex, list) => {
          if (!list) return list;
          return await TodoListResource.get(identity, startIndex, endIndex);
        },
      );
    } catch (error) {
      console.error('setTodoIsCheckedService failed', error);
    }
  },
);

export default setTodoIsChecked;
