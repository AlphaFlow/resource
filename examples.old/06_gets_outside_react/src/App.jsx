import { useState, useCallback, Fragment } from 'react';
import addTodo from './mutations/addTodo';
import setTodoIsChecked from './mutations/setTodoIsChecked';
import TodoResource from './resources/Todo';
import TodoListResource from './resources/TodoList';
import UserResource from './resources/User';

const User = ({ id }) => {
  const [user, error] = UserResource.use(id);

  if (error) return '-';
  if (user)
    return (
      <span>
        <img
          style={{ height: 12, width: 12, borderRadius: 6 }}
          src={user.imageUrl}
          alt={user.name}
        />{' '}
        {user.name}
      </span>
    );

  return '...';
};

const TodoDetails = ({ focusedTodoId, setFocusedTodoId }) => {
  const [todo, error] = TodoResource.use(focusedTodoId);

  if (error)
    return (
      <div>
        <p>Sorry, we were unable to retrieve todos.</p>
        <pre>{error.message}</pre>
      </div>
    );

  if (!todo) return 'Loading...';

  const { id, text, assignedToUser, isChecked } = todo;

  return (
    <div>
      <h2>
        ℹ️ Todo Details{' '}
        <span
          onClick={() => {
            setFocusedTodoId(null);
          }}
        >
          ❎
        </span>
      </h2>
      <p>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={event => {
            const { checked } = event.target;
            setTodoIsChecked({ todoId: id, isChecked: checked });
          }}
        />
        {text}
      </p>
      <h3>Assignee</h3>
      <p>
        <img
          style={{ height: 12, width: 12, borderRadius: 6 }}
          src={assignedToUser.imageUrl}
          alt={assignedToUser.name}
        />{' '}
        {assignedToUser.name}
      </p>
      <p>{assignedToUser.email}</p>
    </div>
  );
};

const TodoList = ({ todoList, error, setFocusedTodoId, focusedTodoId }) => {
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
          {todoList.map(({ id, text, assignedToUserId, isChecked }) => (
            <div
              key={id}
              onClick={() => {
                setFocusedTodoId(id);
              }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={event => {
                  const { checked } = event.target;
                  setTodoIsChecked({ todoId: id, isChecked: checked });
                }}
              />
              {focusedTodoId === id && 'ℹ️'}
              {text}&ensp;
              <span>
                (assigned to <User id={assignedToUserId} />)
              </span>
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

  const [focusedTodoId, setFocusedTodoId] = useState(null);

  return (
    <div>
      <h1>Todo App</h1>
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
      {Boolean(focusedTodoId) && (
        <div>
          <TodoDetails
            focusedTodoId={focusedTodoId}
            setFocusedTodoId={setFocusedTodoId}
          />
          <hr />
        </div>
      )}
      <div>
        <TodoList
          todoList={todoList}
          error={error}
          setFocusedTodoId={setFocusedTodoId}
          focusedTodoId={focusedTodoId}
        />
      </div>
    </div>
  );
};

export default App;
