import faker from 'faker';

const KEY = 'resource.examples.filterable_paginated_list';

const FIXED_TODOS = new Array(450).fill(null).map((nothing, index) => ({
  id: index,
  text: faker.lorem.words(),
  isChecked: Math.random() > 0.3,
}));

const latency = () =>
  new Promise(resolve => {
    const timeout = Math.random() * (1000 - 100) + 100;
    setTimeout(resolve, timeout);
  });

const read = async () => {
  await latency();

  const data = JSON.parse(localStorage.getItem(KEY) || 'null') || FIXED_TODOS;

  return data;
};

const write = async makeToWrite => {
  const toWrite = JSON.stringify(makeToWrite(await read()));

  localStorage.setItem(KEY, toWrite);
};

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
  };

  await write(last => [newTodo, ...last]);

  return newTodo;
};

export const setTodoIsChecked = async ({ todoId, isChecked }) => {
  await write(last =>
    last.map(todo => (todo.id === todoId ? { ...todo, isChecked } : todo)),
  );
};
