import { useState, useCallback, Suspense } from 'react';
import ReactDom from 'react-dom';
import TodoDetailsResource from './TodoDetailsResource';
import TodoListResource from './TodoListResource';
import addTodoMutation from './addTodoMutation';
import removeTodoMutation from './removeTodoMutation';
import setTodoIsCheckedMutation from './setTodoIsCheckedMutation';
import './style.css';

const TodoDetails = ({ todoId }) => {
  const todoDetails = TodoDetailsResource.UNSTABLE__useWithSuspense(todoId);

  return (
    <div>
      <hr />
      <pre>{JSON.stringify(todoDetails, null, 2)}</pre>
      <hr />
    </div>
  );
};

const TodoList = () => {
  const todoList = TodoListResource.UNSTABLE__useWithSuspense();
  const [activeId, setActiveId] = useState(null);

  if (todoList)
    if (!todoList.length) return 'No todos.';
    else
      return (
        <div>
          {todoList.map(({ id, text, isChecked }) => (
            <div key={id}>
              <div>
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
                    setActiveId(activeId === id ? null : id);
                  }}
                >
                  {activeId === id ? 'hide' : 'show'} details
                </button>
                <button
                  onClick={() => {
                    removeTodoMutation(id);
                  }}
                >
                  x
                </button>
              </div>
              <Suspense fallback="Loading...">
                {activeId === id && <TodoDetails todoId={id} />}
              </Suspense>
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
      <h1>Basic Todo App</h1>
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
      <Suspense fallback="Loading...">
        <TodoList />
      </Suspense>
    </div>
  );
};

ReactDom.render(<App />, document.getElementById('root'));
