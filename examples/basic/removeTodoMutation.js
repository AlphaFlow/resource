import { describeMutation } from '@alphaflow/resource';
import TodoListResource from './TodoListResource';
import { removeTodo } from './services';

const removeTodoMutation = describeMutation('removeTodo', async todoId => {
  try {
    await removeTodo(todoId);
    await TodoListResource.refresh();
  } catch (error) {
    console.error('removeTodo failed', error);
  }
});

export default removeTodoMutation;
