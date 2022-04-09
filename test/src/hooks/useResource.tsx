import { jest } from '@jest/globals';
import { unmountComponentAtNode, render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import TodoResource from '../../fixtures/TodoResource';
import waitFor from '../../util/waitFor';

let container: null | HTMLDivElement = null;

beforeEach(() => {
  jest.clearAllMocks();
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  if (container) {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  }
});

let runnerResult: any;
const Runner = ({ Resource, identity }: { Resource: any; identity?: any }) => {
  runnerResult = Resource.use(identity);
  return null;
};

test('returns array of current data and get error, success case', async () => {
  act(() => {
    render(<Runner Resource={TodoResource} identity={1} />, container);
  });
  act(() => {
    waitFor(() => {
      expect(runnerResult).toEqual([
        {
          id: 1,
          title: 'Todo 1',
          isCompleted: false,
        },
        undefined,
      ]);
    });
  });
});

test('returns array of current data and get error, error case', async () => {
  act(() => {
    render(<Runner Resource={TodoResource} />, container);
  });
  act(() => {
    waitFor(() => {
      expect(runnerResult[0]).toBeUndefined();
      expect(runnerResult[1]).toEqual(new Error('Missing id'));
    });
  });
});

test('does nothing when passed `null` identity', async () => {
  const spy = jest.spyOn(TodoResource, 'get');
  act(() => {
    render(<Runner Resource={TodoResource} identity={null} />, container);
  });
  act(() => {
    waitFor(() => {
      expect(runnerResult[0]).toBeUndefined();
      expect(runnerResult[1]).toBeUndefined();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});

// // TODO: these are a little hard to test, not sure how to get the dataStore in a state where it
// // has data ready without doing a lot of messy setup and teardown and measure first render vs subsequent.
// test.todo('synchronously returns data when available');
// test.todo('does not return stale data when identity changes');
// test.todo('bails out render when identity changes but passes equality');
// test.todo('does not respond to subscription changes on stale identity');

// test.skip('handles edge case where resource changes but identities are equal', async () => {
//   // const hookArgs = {
//   //   Resource: TestResource,
//   //   identity: 1,
//   // };

//   // const nextHookArgs = {
//   //   Resource: AltTestResource,
//   //   identity: 1,
//   // };

//     act(async () => {
//     // render(<Runner passToHook={hookArgs} />, container);
//   });

//   expect(lastResourceResult[0]).toBe(testResourceGetResult);

//     act(async () => {
//     // render(<Runner passToHook={nextHookArgs} />, container);
//   });

//   expect(lastResourceResult[0]).toBe(altTestResourceGetResult);
// });
