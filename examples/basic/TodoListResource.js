import { describeResource } from '@alphaflow/resource';
import { getTodos } from './services';

const TodoListResource = describeResource('TodoList', {
  get: async () => (await getTodos()) || [],
});

export default TodoListResource;
