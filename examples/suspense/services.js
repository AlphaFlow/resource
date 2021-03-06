import faker from 'faker';

const KEY = window.location.pathname;

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

export const getTodos = async () => {
  const data = (await read()) || [];
  return data;
};

export const getTodo = async todoId => {
  const todo = (await getTodos()).find(todo => todo.id === todoId);

  if (!todo) return null;

  return {
    ...todo,
    dueDate: faker.date.future(),
    owner: faker.name.firstName(),
  };
};

export const addTodo = async text => {
  const newTodo = {
    id: Date.now(),
    createdAt: Date.now(),
    text,
    isChecked: false,
  };

  await write(last => [newTodo, ...last]);

  return newTodo;
};

export const removeTodo = async todoId => {
  await write(last => last.filter(item => item.id !== todoId));
};

export const setTodoIsChecked = async ({ todoId, isChecked }) => {
  await write(last =>
    last.map(todo => (todo.id === todoId ? { ...todo, isChecked } : todo)),
  );
};
