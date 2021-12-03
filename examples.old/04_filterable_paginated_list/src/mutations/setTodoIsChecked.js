import { describeMutation } from '../../../../build/development/index.js';
import TodoResource from '../resources/Todo';
import TodoListResource from '../resources/TodoList';
import TodoListStatsResource from '../resources/TodoListStats.js';
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

    await TodoListResource.yield(undefined, (identity, last) =>
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
                  },
            ),
          },
    );

    try {
      await setTodoIsCheckedService({ todoId, isChecked });
    } catch (error) {
      console.error('setTodoIsCheckedService failed', error);
    }

    await TodoListStatsResource.refresh();
  },
);

export default setTodoIsChecked;
