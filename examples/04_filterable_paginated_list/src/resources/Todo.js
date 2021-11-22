import { describeResource } from '../../../../build/development/index.js';
import { getTodoById } from '../services';

const TodoResource = describeResource('Todo', {
  get: async identity => {
    console.log('TodoResource.get');
    return (await getTodoById(identity)) || null;
  },
});

export default TodoResource;
