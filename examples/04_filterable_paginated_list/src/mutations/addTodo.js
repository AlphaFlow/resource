import { describeMutation } from '../../../../build/development/index.js';
import TodoListResource from '../resources/TodoList.js';
import TodoListStatsResource from '../resources/TodoListStats.js';
import { addTodo as addTodoService } from '../services';

const addTodo = describeMutation('addTodo', async text => {
  let newTodo;
  try {
    newTodo = await addTodoService(text);
  } catch (error) {
    console.error('addTodoService failed', error);
    return false;
  }

  await TodoListResource.yield(undefined, async (identity, list) => {
    if (!list) return list;
    return await TodoListResource.get(identity);
  });

  await TodoListStatsResource.refresh();
  return newTodo;
});

export default addTodo;
