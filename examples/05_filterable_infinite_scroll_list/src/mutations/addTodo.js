import { describeMutation } from '../../../../build/development/index.js';
import TodoListResource from '../resources/TodoList.js';
import { addTodo as addTodoService } from '../services';

const addTodo = describeMutation('addTodo', async text => {
  let newTodo;
  try {
    newTodo = await addTodoService(text);
  } catch (error) {
    console.error('addTodoService failed', error);
    return false;
  }

  await TodoListResource.yieldWholeResource(
    async (identity, startIndex, endIndex, last) => {
      return await TodoListResource.get(identity, startIndex, endIndex);
    },
  );
  return newTodo;
});

export default addTodo;
