import { describeResource } from '../../src/index';

const TodoSummaryResource = describeResource('TodoSummaryResource', {
  get: async (id: any) => {
    if (!id) throw new Error('Missing id');
    return `Todo ${id}`;
  },
});

export default TodoSummaryResource;
