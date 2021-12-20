import { describeResource } from '@alphaflow/resource';
import { getTodo } from './services';

const TodoDetailsResource = describeResource('TodoDetails', {
  get: async todoId => await getTodo(todoId),
});

export default TodoDetailsResource;
