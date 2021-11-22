import { isEqual } from 'lodash-es';
import { describeResource } from '../../../../build/development/index.js';
import { getTodos } from '../services';

export const applyIdentityFilter = ({ identity: { matchText = '' }, list }) =>
  list.filter(({ text }) =>
    text.toLowerCase().includes(matchText.toLowerCase()),
  );

const TodoListResource = describeResource('TodoList', {
  get: async identity => {
    let list = (await getTodos()) || [];
    list = applyIdentityFilter({ list, identity });
    return list;
  },
  areIdentitiesEqual: isEqual,
});

export default TodoListResource;
