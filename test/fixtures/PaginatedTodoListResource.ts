import { isEqual } from 'lodash-es';
import { UNSTABLE__describePaginatedResource } from '../../src/index';

const fakeTodos = new Array(500).map((_, index) => ({
  id: index,
  text: `Todo ${index}`,
  isCompleted: false,
}));

const PaginatedTodoListResource = UNSTABLE__describePaginatedResource(
  'PaginatedTodoListResource',
  {
    // @ts-expect-error fix resource typing
    get: async ({ matchText = '', matchCompleted }, startIndex, endIndex) => {
      const allMatching = fakeTodos.filter(({ text, isCompleted }) => {
        if (matchCompleted !== undefined && matchCompleted !== isCompleted)
          return false;
        return text.toLowerCase().includes(matchText.toLowerCase());
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
