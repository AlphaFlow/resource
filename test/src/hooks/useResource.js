import { jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-hooks';
import useResource from '../../../src/hooks/useResource';
import TodoResource from '../../fixtures/TodoResource';
import TodoSummaryResource from '../../fixtures/TodoSummaryResource';

test('success case', async () => {
  const { result, waitForNextUpdate } = renderHook(() => TodoResource.use(1));

  expect(result.current[0]).toBeUndefined();
  expect(result.current[1]).toBeUndefined();

  await waitForNextUpdate();

  expect(result.current[0]).toEqual({
    id: 1,
    title: 'Todo 1',
    isCompleted: false,
  });
  expect(result.current[1]).toBeUndefined();
});

test('error case', async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    TodoResource.use(false),
  );

  expect(result.current[0]).toBeUndefined();
  expect(result.current[1]).toBeUndefined();

  await waitForNextUpdate();

  expect(result.current[0]).toBeUndefined();
  expect(result.current[1]).toEqual(new Error('Missing id'));
});

test('does nothing when passed `null` identity', async () => {
  const getSpy = jest.spyOn(TodoResource, 'get');

  const { result } = renderHook(() => TodoResource.use(null));

  expect(result.current[0]).toBeUndefined();
  expect(result.current[1]).toBeUndefined();

  await new Promise(resolve => setTimeout(resolve, 100));

  expect(result.current[0]).toBeUndefined();
  expect(result.current[1]).toBeUndefined();
  expect(getSpy).not.toHaveBeenCalled();
});

test('handles case where resource changes but identities are equal', async () => {
  const { result, rerender, waitForNextUpdate } = renderHook(
    args => useResource(args),
    {
      initialProps: { Resource: TodoResource, identity: 1 },
    },
  );

  expect(result.current[0]).toEqual({
    id: 1,
    title: 'Todo 1',
    isCompleted: false,
  });

  rerender({
    Resource: TodoSummaryResource,
    identity: 1,
  });

  await waitForNextUpdate();
  expect(result.current[0]).toBe('Todo 1');
});

// // TODO: these are a little hard to test, not sure how to get the dataStore in a state where it
// // has data ready without doing a lot of messy setup and teardown and measure first render vs subsequent.
// test.todo('synchronously returns data when available');
// test.todo('does not return stale data when identity changes');
// test.todo('bails out render when identity changes but passes equality');
// test.todo('does not respond to subscription changes on stale identity');
