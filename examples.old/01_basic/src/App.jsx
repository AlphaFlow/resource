import { useState, useCallback, Fragment } from 'react';
import addTodo from './mutations/addTodo';
import removeTodo from './mutations/removeTodo';
import setTodoIsChecked from './mutations/setTodoIsChecked';
import TodoListResource from './resources/TodoList';

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
                  const { checked } = event.target;
                  setTodoIsChecked({ todoId: id, isChecked: checked });
                }}
              />
              {text}
              <button
                onClick={() => {
                  removeTodo(id);
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
    const didSucceed = await addTodo(newInputText);
    setIsAddingTodo(false);

    if (didSucceed) setNewInputText('');
  }, [newInputText, setIsAddingTodo]);

  return (
    <div>
      <h1>Todo App</h1>
      <p>
        {isAddingTodo ? (
          'Adding...'
        ) : (
          <Fragment>
            <input
              placeholder="Add a todo..."
              type="text"
              value={newInputText}
              onChange={event => {
                const { value } = event.target;
                setNewInputText(value);
              }}
            />
            <button onClick={handleAddTodo}>Add</button>
          </Fragment>
        )}
      </p>
      <div>
        <TodoList />
      </div>
    </div>
  );
};

export default App;
