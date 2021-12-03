import { describeMutation } from '../../../../build/development/index.js';
import TodoResource from '../resources/Todo.js';
import { forceTodoGetError as forceTodoGetErrorService } from '../services';

const forceTodoGetError = describeMutation(
  'forceTodoGetError',
  async ({ todoId }) => {
    forceTodoGetErrorService({ todoId });
    await TodoResource.refresh();
  },
);

export default forceTodoGetError;
