import { describeMutation } from '../../../../build/development/index.js';
import TodoResource from '../resources/Todo.js';

const forceTodoGet = describeMutation('forceTodoGet', async () => {
  await TodoResource.refresh();
});

export default forceTodoGet;
