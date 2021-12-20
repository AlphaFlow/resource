import { describeMutation } from '@alphaflow/resource';
import TodoListResource from './TodoListResource';
import { addTodo } from './services';

const addTodoMutation = describeMutation('addTodo', async text => {
  try {
    const newTodo = await addTodo(text);
    await TodoListResource.refresh();
    return newTodo;
  } catch (error) {
    console.error('addTodo failed', error);
  }
});

export default addTodoMutation;
