import { jest } from '@jest/globals';
import taskController from '../../../src/internals/taskController';

test('provides expected API', () => {
  expect(typeof taskController.acceptMutation).toBe('function');
  expect(typeof taskController.acceptSurfaceChange).toBe('function');
  expect(typeof taskController.getIsRunning).toBe('function');
});

test('accurately reports running status', async () => {
  expect(taskController.getIsRunning()).toBe(false);

  taskController.acceptMutation({
    mutation: async () => {},
    callWith: [],
    resolve: jest.fn(),
  });
  expect(taskController.getIsRunning()).toBe(true);
});

test.todo('runs provided tasks in order');

test.todo('after stopping, starts when new task added');

test.todo('wraps mutations with store reporting, calls resolve');

test.todo('does not duplicate get runs');

test.todo('handles successful get');

test.todo('handles unsuccessful get');
