// import useResource from 'src/hooks/useResource';
import { jest } from '@jest/globals';
import {
  // render,
  unmountComponentAtNode,
} from 'react-dom';
import { act } from 'react-dom/test-utils';
import {
  // TestResource,
  testResourceGet,
  testResourceGetResult, // TestBadGetResource,
  testBadGetError, // AltTestResource,
  altTestResourceGetResult,
} from '../../../config/testData';

let lastResourceResult;

// const Runner = ({ passToHook, children = null }) => {
//   lastResourceResult = useResource(passToHook);
//   return children;
// };

let container;

beforeEach(() => {
  jest.clearAllMocks();
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

test.skip('returns array of current data and get error, success case', async () => {
  // const hookArgs = {
  //   Resource: TestResource,
  //   identity: 1,
  // };

  await act(async () => {
    // render(<Runner passToHook={hookArgs} />, container);
  });

  expect(lastResourceResult).toEqual([testResourceGetResult, undefined]);
});

test.skip('returns array of current data and get error, error case', async () => {
  // const hookArgs = {
  //   Resource: TestBadGetResource,
  //   identity: 1,
  // };

  await act(async () => {
    // render(<Runner passToHook={hookArgs} />, container);
  });

  expect(lastResourceResult).toEqual([undefined, testBadGetError]);
});

test.skip('does nothing when passed `null` identity', () => {
  // const hookArgs = {
  //   Resource: TestResource,
  //   identity: null,
  // };

  act(() => {
    // render(<Runner passToHook={hookArgs} />, container);
  });

  expect(testResourceGet).not.toHaveBeenCalled();
  expect(lastResourceResult).toEqual([undefined, undefined]);
});

// TODO: these are a little hard to test, not sure how to get the dataStore in a state where it
// has data ready without doing a lot of messy setup and teardown and measure first render vs subsequent.
test.todo('synchronously returns data when available');
test.todo('does not return stale data when identity changes');
test.todo('bails out render when identity changes but passes equality');
test.todo('does not respond to subscription changes on stale identity');

test.skip('handles edge case where resource changes but identities are equal', async () => {
  // const hookArgs = {
  //   Resource: TestResource,
  //   identity: 1,
  // };

  // const nextHookArgs = {
  //   Resource: AltTestResource,
  //   identity: 1,
  // };

  await act(async () => {
    // render(<Runner passToHook={hookArgs} />, container);
  });

  expect(lastResourceResult[0]).toBe(testResourceGetResult);

  await act(async () => {
    // render(<Runner passToHook={nextHookArgs} />, container);
  });

  expect(lastResourceResult[0]).toBe(altTestResourceGetResult);
});
