import { describeResource } from '../../../../build/development/index.js';
import { getTodos } from '../services';

const TodoListResource = describeResource('TodoList', {
  get: async () => (await getTodos()) || [],
});

export default TodoListResource;
