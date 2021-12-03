import { useState, useCallback, useLayoutEffect, Fragment } from 'react';
import Modal from 'react-modal';
import addTodo from './mutations/addTodo';
import setTodoIsChecked from './mutations/setTodoIsChecked';
import TodoResource from './resources/Todo';
import TodoListResource from './resources/TodoList';
import TodoListStatsResource from './resources/TodoListStats';

const TodoStats = () => {
  const [stats] = TodoListStatsResource.use();
  if (!stats) return 'Loading...';

  return stats.map(({ label, value }) => `${label}: ${value}`).join(' | ');
};

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
    if (!todoList.totalCount) return 'No todos.';
    else
      return (
        <div>
          <p>Total: {todoList.totalCount}</p>
          {todoList.list.map(({ id, text, isChecked }) => (
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

  const [matchText, setMatchText] = useState();
  const [matchChecked, setMatchChecked] = useState();
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 15;

  useLayoutEffect(() => {
    setPageIndex(0);
  }, [matchText, matchChecked]);

  const [todoList, error] = TodoListResource.use({
    matchText,
    matchChecked,
    pageIndex,
    pageSize,
  });

  const [focusedTodoId, setFocusedTodoId] = useState();
  const [showStats, setShowStats] = useState(false);

  return (
    <div>
      <h1>Fake Todo App</h1>
      <Modal
        isOpen={focusedTodoId !== undefined}
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
      <div>
        <input
          type="text"
          placeholder="Filter todos..."
          onChange={event => {
            setMatchText(event.target.value);
          }}
          value={matchText || ''}
        />
        {matchChecked !== true && (
          <button
            onClick={() => {
              setMatchChecked(true);
            }}
          >
            Completed only
          </button>
        )}
        {matchChecked !== false && (
          <button
            onClick={() => {
              setMatchChecked(false);
            }}
          >
            Not completed only
          </button>
        )}
        {matchChecked !== undefined && (
          <button
            onClick={() => {
              setMatchChecked(undefined);
            }}
          >
            All
          </button>
        )}
      </div>
      <hr />
      <div>
        Statistics:{' '}
        {showStats ? (
          <>
            <TodoStats />{' '}
            <button
              onClick={() => {
                setShowStats(false);
              }}
            >
              Hide
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setShowStats(true);
            }}
          >
            Show
          </button>
        )}
      </div>
      <hr />
      <div>
        Page:{' '}
        {(() => {
          const result = [];

          if (todoList && todoList.totalCount) {
            let nextIndex = 0;
            const maxIndex = Math.ceil(todoList.totalCount / pageSize);
            while (nextIndex < maxIndex) {
              result.push(nextIndex);
              nextIndex++;
            }
          }

          return result;
        })().map(pageIndexOption => (
          <button
            key={pageIndexOption}
            onClick={() => {
              setPageIndex(pageIndexOption);
            }}
            style={
              pageIndexOption === pageIndex
                ? {
                    color: 'white',
                    background: 'black',
                  }
                : {}
            }
          >
            {pageIndexOption + 1}
          </button>
        ))}
      </div>
      <hr />
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
