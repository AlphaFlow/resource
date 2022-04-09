import { jest } from '@jest/globals';
import { unmountComponentAtNode, render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import TodoResource from '../../fixtures/TodoResource';

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

const Runner = ({ Resource, identity }: { Resource: any; identity: any }) => {
  const result = Resource.use(identity);
  return null;
};

test('returns array of current data and get error, success case', async () => {
  act(() => {
    render(<Runner Resource={TodoResource} identity={1} />, container);
  });

  // expect(lastResourceResult).toEqual([testResourceGetResult, undefined]);
});

// test.skip('returns array of current data and get error, error case', async () => {
//   // const hookArgs = {
//   //   Resource: TestBadGetResource,
//   //   identity: 1,
//   // };

//   await act(async () => {
//     // render(<Runner passToHook={hookArgs} />, container);
//   });

//   expect(lastResourceResult).toEqual([undefined, testBadGetError]);
// });

// test.skip('does nothing when passed `null` identity', () => {
//   // const hookArgs = {
//   //   Resource: TestResource,
//   //   identity: null,
//   // };

//   act(() => {
//     // render(<Runner passToHook={hookArgs} />, container);
//   });

//   expect(testResourceGet).not.toHaveBeenCalled();
//   expect(lastResourceResult).toEqual([undefined, undefined]);
// });

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

//   await act(async () => {
//     // render(<Runner passToHook={hookArgs} />, container);
//   });

//   expect(lastResourceResult[0]).toBe(testResourceGetResult);

//   await act(async () => {
//     // render(<Runner passToHook={nextHookArgs} />, container);
//   });

//   expect(lastResourceResult[0]).toBe(altTestResourceGetResult);
// });
