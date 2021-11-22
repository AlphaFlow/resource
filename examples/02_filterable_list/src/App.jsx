import { useState, useCallback, Fragment } from 'react';
import Modal from 'react-modal';
import addTodo from './mutations/addTodo';
import setTodoIsChecked from './mutations/setTodoIsChecked';
import TodoResource from './resources/Todo';
import TodoListResource from './resources/TodoList';

const TodoDetails = ({ todoId }) => {
  const [todo, error] = TodoResource.use(todoId);

  if (error) return 'Error loading todo.';

  if (todo)
    return (
      <div>
        <p>Text: {todo.text}</p>
        <input
          type="checkbox"
          checked={todo.isChecked}
          onChange={event => {
            const { checked } = event.target;
            setTodoIsChecked({ todoId: todo.id, isChecked: checked });
          }}
        />
      </div>
    );

  return 'Loading...';
};

const TodoList = ({ todoList, error, onFocusTodo }) => {
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
                checked={isChecked}
                onChange={event => {
                  const { checked } = event.target;
                  setTodoIsChecked({ todoId: id, isChecked: checked });
                }}
              />
              {text}&ensp;
              <button
                onClick={() => {
                  onFocusTodo(id);
                }}
              >
                Open
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

  const [matchText, setMatchText] = useState('');

  const [todoList, error] = TodoListResource.use({ matchText });

  const [focusedTodoId, setFocusedTodoId] = useState();

  return (
    <div>
      <h1>Todo App</h1>
      <Modal
        isOpen={Boolean(focusedTodoId)}
        onRequestClose={() => {
          setFocusedTodoId();
        }}
        ariaHideApp={false}
      >
        <h2>Todo Details</h2>
        <TodoDetails todoId={focusedTodoId} />
        <br />
        <button
          onClick={() => {
            setFocusedTodoId();
          }}
        >
          Close
        </button>
      </Modal>
      <p>
        <input
          type="text"
          placeholder="Filter todos..."
          onChange={event => {
            setMatchText(event.target.value);
          }}
          value={matchText}
        />
      </p>
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
        <TodoList
          todoList={todoList}
          error={error}
          onFocusTodo={setFocusedTodoId}
        />
      </div>
    </div>
  );
};

export default App;
