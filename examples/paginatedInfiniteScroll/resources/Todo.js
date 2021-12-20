import { describeResource } from '@alphaflow/resource';
import { getTodoById } from '../services';

const TodoResource = describeResource('Todo', {
  get: async identity => (await getTodoById(identity)) || null,
});

export default TodoResource;
