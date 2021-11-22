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
  },
  2: {
    name: 'Elliot',
    imageUrl: 'https://react.semantic-ui.com/images/avatar/small/elliot.jpg',
  },
  3: {
    name: 'Helen',
    imageUrl: 'https://react.semantic-ui.com/images/avatar/small/helen.jpg',
  },
};

const getRandomUserId = () =>
  Object.keys(fixedUsers)[
    Math.floor(Math.random() * Object.keys(fixedUsers).length)
  ];

export const getTodoById = async id => {
  const data = await read();
  return data.find(item => item.id === id);
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
  await latency();
  return fixedUsers[id];
};
