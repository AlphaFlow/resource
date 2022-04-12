import { isEqual } from 'lodash-es';
import { UNSTABLE__describePaginatedResource } from '../../src/index';

const initialFakeTodos = new Array(500).fill(null).map((_, index) => ({
  id: index,
  text: `Todo ${index}`,
  isCompleted: false,
}));

const todoData = { current: initialFakeTodos };

export const resetData = () => {
  todoData.current = initialFakeTodos;
};

export const setData = (
  setter: (last: typeof initialFakeTodos) => typeof initialFakeTodos,
) => {
  todoData.current = setter(todoData.current);
};

const PaginatedTodoListResource = UNSTABLE__describePaginatedResource(
  'PaginatedTodoListResource',
  {
    // @ts-expect-error fix resource typing
    get: async (identity, startIndex: number, endIndex: number) => {
      if (!identity) throw new Error('Missing search parameters');

      const { matchText = '', matchCompleted } = identity;

      const allMatching = todoData.current.filter(({ text, isCompleted }) => {
        if (matchCompleted !== undefined && matchCompleted !== isCompleted)
          return false;

        if (matchText)
          return text.toLowerCase().includes(matchText.toLowerCase());

        return true;
      });

      return {
        count: allMatching.length,
        list: allMatching.slice(startIndex, endIndex),
      };
    },
    getListFromGetResponse: getResponse => getResponse?.list,
    getCountFromGetResponse: getResponse => getResponse?.count,
    areIdentitiesEqual: isEqual,
  },
);

export default PaginatedTodoListResource;
