import { describeMutation } from '../../../../build/development/index.js';
import TodoListResource from '../resources/TodoList.js';
import { setTodoIsChecked as setTodoIsCheckedService } from '../services';

const setTodoIsChecked = describeMutation(
  'setTodoIsChecked',
  async ({ todoId, isChecked }) => {
    await TodoListResource.yield(todoId, (last = {}) => ({
      ...last,
      isChecked,
    }));

    try {
      await setTodoIsCheckedService({ todoId, isChecked });
    } catch (error) {
      console.error('setTodoIsCheckedService failed', error);
    }
  },
);

export default setTodoIsChecked;
