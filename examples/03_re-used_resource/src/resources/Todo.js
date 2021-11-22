import { describeResource } from '../../../../build/development/index.js';
import { getTodoById } from '../services';

const TodoResource = describeResource('Todo', {
  get: async identity => (await getTodoById(identity)) || null,
});

export default TodoResource;
