import { useState, useCallback, Fragment, Suspense } from 'react';
import { ErrorBoundary } from '@alphaflow/components';
import addTodo from './mutations/addTodo';
import forceTodoGetError from './mutations/forceTodoGetError';
import setTodoIsChecked from './mutations/setTodoIsChecked';
import TodoResource from './resources/Todo';
import TodoListResource from './resources/TodoList';
import UserResource from './resources/User';

const User = ({ id }) => {
  const user = UserResource.UNSTABLE__useWithSuspense(id);

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
};

const TodoDetails = ({ focusedTodoId, setFocusedTodoId }) => {
  const todo = TodoResource.UNSTABLE__useWithSuspense(focusedTodoId);

  const { id, text, isChecked } = todo;

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
    </div>
  );
};

const TodoList = ({ matchText, setFocusedTodoId, focusedTodoId }) => {
  const todoList = TodoListResource.UNSTABLE__useWithSuspense({
    matchText,
  });

  if (!todoList.length) return 'No todos.';
  return (
    <div>
      {todoList.map(({ id, text, assignedToUserId, isChecked }) => (
        <div key={id}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={event => {
              const { checked } = event.target;
              setTodoIsChecked({ todoId: id, isChecked: checked });
            }}
          />
          <button
            onClick={() => {
              setFocusedTodoId(id);
            }}
          >
            {focusedTodoId !== id && 'ℹ'}
          </button>
          {text}{' '}
          <span>
            (assigned to <User id={assignedToUserId} />)
          </span>{' '}
          <span
            style={{ color: 'red' }}
            onClick={() => {
              forceTodoGetError({ todoId: id });
            }}
          >
            Click to error
          </span>
        </div>
      ))}
    </div>
  );
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
          <ErrorBoundary fallback={<>Something went wrong.</>}>
            <Suspense fallback="Loading...">
              <TodoDetails
                focusedTodoId={focusedTodoId}
                setFocusedTodoId={setFocusedTodoId}
              />
            </Suspense>
          </ErrorBoundary>
          <hr />
        </div>
      )}
      <div>
        <Suspense fallback="Loading...">
          <TodoList
            matchText={matchText}
            setFocusedTodoId={setFocusedTodoId}
            focusedTodoId={focusedTodoId}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default App;
