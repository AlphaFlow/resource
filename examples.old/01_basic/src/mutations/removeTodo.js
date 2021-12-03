import { describeMutation } from '../../../../build/development/index.js';
import TodoListResource from '../resources/TodoList.js';
import { removeTodo as removeTodoService } from '../services';

const removeTodo = describeMutation('removeTodo', async todoId => {
  try {
    await removeTodoService(todoId);
    await TodoListResource.yield(undefined, (identity, list) =>
      list.filter(item => item.id !== todoId),
    );
    return true;
  } catch (error) {
    console.error('removeTodoService failed', error);
    return false;
  }
});

export default removeTodo;
