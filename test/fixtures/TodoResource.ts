import describeResource from '../../src/describe/resource';
import getTodo from './getTodo';

const TodoResource = describeResource('TodoResource', {
  get: getTodo,
});

export default TodoResource;
