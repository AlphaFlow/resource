import describeResource from '../../src/describe/resource';

const TodoResource = describeResource('TodoResource', {
  get: async id => ({
    id,
    title: `Todo ${id}`,
  }),
});

export default TodoResource;
