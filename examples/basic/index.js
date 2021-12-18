import { useState } from 'react';
import ReactDom from 'react-dom';
import { describeResource, describeMutation } from '@alphaflow/resource';
import { getTodos, addTodo, removeTodo, setTodoIsChecked } from './services';
import './style.css';

const TodoListResource = describeResource('TodoList', {
  get: async () => (await getTodos()) || [],
});

const addTodoMutation = describeMutation('addTodo', async text => {
  try {
    const newTodo = await addTodo(text);
    await TodoListResource.refresh();
    return newTodo;
  } catch (error) {
    console.error('addTodo failed', error);
  }
});

const removeTodoMutation = describeMutation('removeTodo', async todoId => {
  try {
    await removeTodo(todoId);
    await TodoListResource.refresh();
  } catch (error) {
    console.error('removeTodo failed', error);
  }
});

const setTodoIsCheckedMutation = describeMutation(
  'setTodoIsChecked',
  async ({ todoId, isChecked }) => {
    await TodoListResource.yield(todoId, (last = {}) => ({
      ...last,
      isChecked,
    }));

    try {
      await setTodoIsChecked({ todoId, isChecked });
    } catch (error) {
      console.error('setTodoIsChecked failed', error);
    }
  },
);

const TodoList = () => {
  const [todoList, error] = TodoListResource.use();

  if (error)
    return (
      <div>
        <p>Sorry, we were unable to retrieve todos.</p>
        <pre>{error.message}</pre>
      </div>
    );

  if (todoList)
    if (!todoList.length) return 'No todos.';
    else
      return (
        <div>
          {todoList.map(({ id, text, isChecked }) => (
            <div key={id}>
              <input
                type="checkbox"
                defaultChecked={isChecked}
                onChange={event => {
                  setTodoIsCheckedMutation({
                    todoId: id,
                    isChecked: event.target.checked,
                  });
                }}
              />
              {text}
              <button
                onClick={() => {
                  removeTodoMutation(id);
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      );

  return 'Loading...';
};

const App = () => {
  const [newInputText, setNewInputText] = useState('');

  const [isAddingTodo, setIsAddingTodo] = useState(false);

  const handleAddTodo = useCallback(async () => {
    if (!newInputText) return;
    setIsAddingTodo(true);
    const newTodo = await addTodoMutation(newInputText);
    setIsAddingTodo(false);

    if (newTodo) setNewInputText('');
  }, [newInputText, setIsAddingTodo]);

  return (
    <div>
      <h1>Todo App</h1>
      <p>
        {isAddingTodo ? (
          'Adding...'
        ) : (
          <>
            <input
              placeholder="Add a todo..."
              type="text"
              value={newInputText}
              onChange={event => {
                setNewInputText(event.target.value);
              }}
            />
            <button onClick={handleAddTodo}>Add</button>
          </>
        )}
      </p>
      <TodoList />
    </div>
  );
};

ReactDom.render(<App />, document.getElementById('root'));
