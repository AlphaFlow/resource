import { jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-hooks';
import PaginatedTodoListResource from '../../fixtures/PaginatedTodoListResource';

test('success case', async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    PaginatedTodoListResource.use(
      { matchText: '', matchCompleted: false },
      0,
      3,
    ),
  );

  expect(result.current[0]).toEqual([
    undefined,
    undefined,
    undefined,
    // TODO: need to fix this but clients may have implemented workarounds for this behavior
    undefined,
  ]);
  expect(result.current[1]).toBeUndefined();
  expect(result.current[2]).toBeUndefined();

  await waitForNextUpdate();

  expect(result.current[0]).toEqual([
    { id: 0, text: 'Todo 0', isCompleted: false },
    { id: 1, text: 'Todo 1', isCompleted: false },
    { id: 2, text: 'Todo 2', isCompleted: false },
    // TODO: need to fix this but clients may have implemented workarounds for this behavior
    null,
  ]);
  expect(result.current[1]).toBe(500);
  expect(result.current[2]).toBeUndefined();
});

test('error case', async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    PaginatedTodoListResource.use(false, 0, 3),
  );

  expect(result.current[0]).toEqual([
    undefined,
    undefined,
    undefined,
    // TODO: need to fix this but clients may have implemented workarounds for this behavior
    undefined,
  ]);
  expect(result.current[1]).toBeUndefined();
  expect(result.current[2]).toBeUndefined();

  await waitForNextUpdate();

  expect(result.current[0]).toEqual([
    undefined,
    undefined,
    undefined,
    // TODO: need to fix this but clients may have implemented workarounds for this behavior
    undefined,
  ]);
  expect(result.current[1]).toBe(undefined);
  expect(result.current[2]).toEqual(new Error('Missing search parameters'));
});

test('does nothing when passed `null` identity', async () => {
  const getSpy = jest.spyOn(PaginatedTodoListResource, 'get');

  const { result } = renderHook(() =>
    PaginatedTodoListResource.use(null, 0, 30),
  );

  expect(result.current[0]).toBeUndefined();
  expect(result.current[1]).toBeUndefined();
  expect(result.current[2]).toBeUndefined();

  await new Promise(resolve => setTimeout(resolve, 100));

  expect(result.current[0]).toBeUndefined();
  expect(result.current[1]).toBeUndefined();
  expect(result.current[2]).toBeUndefined();
  expect(getSpy).not.toHaveBeenCalled();
});

test('updates count after refetch case', async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    PaginatedTodoListResource.use(
      { matchText: '', matchCompleted: false },
      0,
      3,
    ),
  );

  await waitForNextUpdate();
  await PaginatedTodoListResource.refresh();
  await waitForNextUpdate();

  expect(result.current[0]).toEqual([
    { id: 0, text: 'Todo 0', isCompleted: false },
    { id: 1, text: 'Todo 1', isCompleted: false },
    { id: 2, text: 'Todo 2', isCompleted: false },
    // TODO: need to fix this but clients may have implemented workarounds for this behavior
    null,
  ]);
  expect(result.current[1]).toBe(500);
  expect(result.current[2]).toBeUndefined();
});
