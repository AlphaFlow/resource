import { isEqual } from 'lodash-es';
import { UNSTABLE__describePaginatedResource } from '@alphaflow/resource';
import { getTodos } from '../services';

export const applyIdentityFilter = ({
  identity: { matchText = '', matchChecked, pageIndex = 0, pageSize = 0 },
  list,
}) =>
  list.filter(({ text, isChecked }) => {
    if (matchChecked !== undefined && matchChecked !== isChecked) return false;
    return text.toLowerCase().includes(matchText.toLowerCase());
  });

const TodoListResource = UNSTABLE__describePaginatedResource('TodoList', {
  get: async (identity, startIndex, endIndex) => {
    let list = (await getTodos()) || [];
    list = applyIdentityFilter({ list, identity });
    return {
      totalCount: list.length,
      list: list.slice(startIndex, endIndex),
    };
  },
  getListFromGetResponse: getResponse => (getResponse || {}).list,
  getCountFromGetResponse: getResponse => (getResponse || {}).totalCount,
  areIdentitiesEqual: isEqual,
});

export default TodoListResource;
