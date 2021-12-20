import { describeMutation } from '@alphaflow/resource';
import TodoDetailsResource from './TodoDetailsResource';
import TodoListResource from './TodoListResource';
import { setTodoIsChecked } from './services';

const setTodoIsCheckedMutation = describeMutation(
  'setTodoIsChecked',
  async ({ todoId, isChecked }) => {
    try {
      await setTodoIsChecked({ todoId, isChecked });
      await TodoListResource.refresh();
      await TodoDetailsResource.refresh(todoId);
    } catch (error) {
      console.error('setTodoIsChecked failed', error);
    }
  },
);

export default setTodoIsCheckedMutation;
