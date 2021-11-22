import UserResource from './resources/User';

const KEY = 'resource.examples.re-used-resource';

const latency = () =>
  new Promise(resolve => {
    const timeout = Math.random() * (1000 - 100) + 100;
    setTimeout(resolve, timeout);
  });

const read = async () => {
  await latency();

  const data = JSON.parse(localStorage.getItem(KEY) || '[]');

  return data;
};

const write = async makeToWrite => {
  const toWrite = JSON.stringify(makeToWrite(await read()));

  localStorage.setItem(KEY, toWrite);
};

const fixedUsers = {
  1: {
    name: 'Jenny',
    imageUrl: 'https://react.semantic-ui.com/images/avatar/small/jenny.jpg',
    email: 'jenny@alphaflow.com',
  },
  2: {
    name: 'Elliot',
    imageUrl: 'https://react.semantic-ui.com/images/avatar/small/elliot.jpg',
    email: 'elliot@alphaflow.com',
  },
  3: {
    name: 'Helen',
    imageUrl: 'https://react.semantic-ui.com/images/avatar/small/helen.jpg',
    email: 'helen@alphaflow.com',
  },
};

const getRandomUserId = () =>
  Object.keys(fixedUsers)[
    Math.floor(Math.random() * Object.keys(fixedUsers).length)
  ];

export const getTodoById = async id => {
  const data = (await read()).find(todo => todo.id === id);
  // "show" action includes user object
  data.assignedToUser = await UserResource.UNSTABLE__getFromStoreOrGet(
    data.assignedToUserId,
  );

  return data;
};

export const getTodos = async () => {
  const data = (await read()) || [];
  return data;
};

export const addTodo = async text => {
  const newTodo = {
    id: Date.now(),
    text,
    isChecked: false,
    assignedToUserId: getRandomUserId(),
  };

  await write(last => [newTodo, ...last]);

  return newTodo;
};

export const setTodoIsChecked = async ({ todoId, isChecked }) => {
  await write(last =>
    last.map(todo => (todo.id === todoId ? { ...todo, isChecked } : todo)),
  );
};

export const getUserById = async id => {
  // eslint-disable-next-line no-console
  console.count(`user ${id} calls count`);

  await latency();
  return fixedUsers[id];
};
