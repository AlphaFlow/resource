import { describeMutation } from '@alphaflow/resource';
import TodoListResource from './TodoListResource';
import { setTodoIsChecked } from './services';

const setTodoIsCheckedMutation = describeMutation(
  'setTodoIsChecked',
  async ({ todoId, isChecked }) => {
    await TodoListResource.yield(todoId, (last = {}) => ({
      ...last,
      isChecked,
    }));

    try {
      await setTodoIsChecked({ todoId, isChecked });
    } catch (error) {
      console.error('setTodoIsChecked failed', error);
    }
  },
);

export default setTodoIsCheckedMutation;
