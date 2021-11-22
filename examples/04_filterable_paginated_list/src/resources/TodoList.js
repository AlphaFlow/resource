import { isEqual } from 'lodash-es';
import { describeResource } from '../../../../build/development/index.js';
import { getTodos } from '../services';

export const applyIdentityFilter = ({
  identity: { matchText = '', matchChecked, pageIndex = 0, pageSize = 0 },
  list,
}) =>
  list.filter(({ text, isChecked }) => {
    if (matchChecked !== undefined && matchChecked !== isChecked) return false;
    return text.toLowerCase().includes(matchText.toLowerCase());
  });

const TodoListResource = describeResource('TodoList', {
  get: async identity => {
    console.log('TodoListResource.get');
    let list = (await getTodos()) || [];
    list = applyIdentityFilter({ list, identity });
    return {
      totalCount: list.length,
      list: list.slice(
        identity.pageIndex * identity.pageSize,
        (identity.pageIndex + 1) * identity.pageSize,
      ),
    };
  },
  areIdentitiesEqual: isEqual,
});

export default TodoListResource;
