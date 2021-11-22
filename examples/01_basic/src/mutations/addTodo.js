import { describeMutation } from '../../../../build/development/index.js';
import TodoListResource from '../resources/TodoList.js';
import { addTodo as addTodoService } from '../services';

const addTodo = describeMutation('addTodo', async text => {
  try {
    const newTodo = await addTodoService(text);
    await TodoListResource.yield(undefined, (identity, list) => [
      newTodo,
      ...list,
    ]);
    return true;
  } catch (error) {
    console.error('addTodoService failed', error);
    return false;
  }
});

export default addTodo;
