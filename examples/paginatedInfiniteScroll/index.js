import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  Fragment,
  Suspense,
} from 'react';
import ReactDom from 'react-dom';
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import addTodo from './mutations/addTodo';
import setTodoIsChecked from './mutations/setTodoIsChecked';
import TodoResource from './resources/Todo';
import TodoListResource from './resources/TodoList';

const TodoDetails = ({ todoId }) => {
  const todo = TodoResource.UNSTABLE__useWithSuspense(todoId);

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

const TodoList = ({
  todoList,
  todoCount,
  error,
  onFocusTodo,
  getIsRowHandledByResources,
  handleRequestLoadMore,
}) => {
  if (error)
    return (
      <div>
        <p>Sorry, we were unable to retrieve todos.</p>
        <pre>{error.message}</pre>
      </div>
    );

  if (todoList)
    if (todoCount === 0) return 'No todos.';
    else
      return (
        <div>
          <p>Total: {todoCount}</p>
          <InfiniteLoader
            isItemLoaded={getIsRowHandledByResources}
            itemCount={todoCount}
            loadMoreItems={handleRequestLoadMore}
          >
            {({ onItemsRendered, ref }) => (
              <FixedSizeList
                height={500}
                width={700}
                itemSize={30}
                itemCount={todoCount}
                itemKey={index => `${index}${(todoList[index] || {}).id || ''}`}
                onItemsRendered={onItemsRendered}
                ref={ref}
              >
                {({ index, style }) => {
                  const item = todoList[index];
                  if (!item) return <div style={style}>Loading...</div>;

                  const { id, text, isChecked } = item;
                  return (
                    <div style={{ opacity: item.isSaving ? 0.5 : 1, ...style }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={event => {
                          const { checked } = event.target;
                          setTodoIsChecked({ todoId: id, isChecked: checked });
                        }}
                      />
                      {text}&ensp;{id}&ensp;
                      <button
                        onClick={() => {
                          onFocusTodo(id);
                        }}
                      >
                        Open
                      </button>
                    </div>
                  );
                }}
              </FixedSizeList>
            )}
          </InfiniteLoader>
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

  const [activeListWindow, setActiveListWindow] = useState({
    startIndex: 0,
    endIndex: 30,
  });

  const identity = useMemo(
    () => ({
      matchText,
      matchChecked,
    }),
    [matchText, matchChecked],
  );

  useEffect(() => {
    setActiveListWindow({ startIndex: 0, endIndex: 30 });
  }, [identity]);

  const [todoList, todoCount, error] = TodoListResource.use(
    identity,
    activeListWindow.startIndex,
    activeListWindow.endIndex,
  );

  const [focusedTodoId, setFocusedTodoId] = useState();

  const getIsRowHandledByResources = useCallback(
    index => index >= 0 && index < activeListWindow.endIndex,
    [activeListWindow],
  );

  const handleRequestLoadMore = useCallback(async (startIndex, endIndex) => {
    setActiveListWindow({
      startIndex,
      endIndex,
    });
  }, []);

  return (
    <div>
      <h1>Todo App</h1>
      {focusedTodoId !== undefined && (
        <div>
          <h2>Todo Details</h2>
          <Suspense fallback="Loading...">
            <TodoDetails todoId={focusedTodoId} />
          </Suspense>
          <hr />
          <button
            onClick={() => {
              setFocusedTodoId();
            }}
          >
            Close
          </button>
        </div>
      )}
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
          todoCount={todoCount}
          error={error}
          onFocusTodo={setFocusedTodoId}
          getIsRowHandledByResources={getIsRowHandledByResources}
          handleRequestLoadMore={handleRequestLoadMore}
        />
      </div>
    </div>
  );
};

const AppWrapper = () => {
  const [hidePage, setHidePage] = useState(false);

  if (hidePage)
    return (
      <button
        onClick={() => {
          setHidePage(false);
        }}
      >
        Show
      </button>
    );
  return (
    <Fragment>
      <button
        onClick={() => {
          setHidePage(true);
        }}
      >
        Hide
      </button>
      <App />
    </Fragment>
  );
};

ReactDom.render(<AppWrapper />, document.getElementById('root'));
