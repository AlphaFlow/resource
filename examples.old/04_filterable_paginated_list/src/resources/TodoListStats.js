import { describeResource } from '../../../../build/development/index.js';
import { getTodos } from '../services';
import { applyIdentityFilter } from './TodoList.js';

const TodoListStatsResource = describeResource('TodoListStats', {
  get: async () => {
    console.log('TodoListStatsResource.get');
    const list = (await getTodos()) || [];
    return [
      {
        label: 'Total count',
        value: list.length,
      },
      {
        label: 'Completed',
        value: applyIdentityFilter({
          identity: {
            matchChecked: true,
          },
          list,
        }).length,
      },
      {
        label: 'Uncompleted',
        value: applyIdentityFilter({
          identity: {
            matchChecked: false,
          },
          list,
        }).length,
      },
    ];
  },
});

export default TodoListStatsResource;
