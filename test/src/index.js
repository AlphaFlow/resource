import * as libraryExports from 'src/index';

test('exposes expected exports', () => {
  const {
    describeResource,
    UNSTABLE__describePaginatedResource,
    describeMutation,
  } = libraryExports;

  expect(describeResource).toBeInstanceOf(Function);
  expect(describeMutation).toBeInstanceOf(Function);
  expect(UNSTABLE__describePaginatedResource).toBeInstanceOf(Function);
});
