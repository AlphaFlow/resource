# @alphaflow/resource

`@alphaflow/resource` is a library for connecting user interfaces to remote data sources.

<details>
  <summary>Why do I need a library for that?</summary>

The task of communicating with a remote data source starts out incredibly simple. If you just need to fetch some data, which lives in one part of app state, which doesn't need to persist changes, you don't need a library.

But, once you have a more complex app, you'll probably have to answer the following questions:

- How are we going to ensure what the user sees on their screen matches what's in the database?
- How do we handle cases where that's impossible?
- How do we keep our app responsive while we're waiting for remote operations?
- How and when are we going to initiate a fetch from the user interface?
- What are we going to show the user when fetch requests are pending, successful, or failed?
- How are we going to avoid re-fetching data which as already been fetched?
- How are we going to share the result of fetch with other components which depend on the same data?
- How are we going to write changes?
- What are we going to show the user when write requests are pending, successful, or failed?
- How are we going to ensure writes are reflected in all components which depend on the same data?
- How can we avoid or manage potential race conditions?
- How can we establish stable code patterns that are maintainable and intelligible to new contributors?

This changes things. `@alphaflow/resource` offers a methodology for reasoning about all of this and exposes an API which reflects that methodology.

</details>

<details>
  <summary>Why not Redux?</summary>

If you use Redux in your stack, you don't _just_ use Redux. Typically, you'll need use it with Redux Sagas or Redux Thunk because Redux doesn't offer a first-class way of handling async operations. That's because Redux is a solution to the problem of predictable state management, which is only part of the problem we're solving here.

A more complex app will likely include a wide file layout for Redux interactions - including actions, action names, reducers, and (hopefully) a strategy for managing race conditions. Beside the uncertainty and inconvenience of making changes in this ecosystem, we end up thinking in terms of action types and payloads instead of UI data requirements.

`@alphaflow/resource` was designed based on patterns that emerged in Redux/REST projects. These patterns offered guidance toward abstractable optimizations (e.g. a caching strategy). They also revealed an alternative conceptual model for the way we draw data into our apps, present it to the user, and pass it around. Really, the answer to this question comes down to which conceptual model works best for you and your team.

</details>

## Installation and Usage

Install with your package manager of choice.

```
yarn add @alphaflow/resource
```

### I want to use remote data in a React component.

First, we'll need to describe the data as a resource.

```js
// src/resources/ToDo.js

import toDoServices from 'src/services/ToDo';
import { describeResource } from '@alphaflow/resource';

const ToDoResource = describeResource('ToDo', {
  get: toDoId => services.getById(toDoId),
});

export default ToDoResource;
```

The first argument to `describeResource` is the name of our resource. The second is a configuration object with one required param: `get`.

`get` is a sync or async function which returns the resource matching a given `identity`, in this case, we've chosen `toDoId`. If we were building a list of to dos, we might choose an object of search parameters.

Now, we're ready to do something with our to do data in React.

```jsx
// src/components/ToDoCard.jsx

import ToDoResource from "src/resources/ToDo";

const ToDoCard = ({ toDoId }) => {
  const [toDo, toDoFetchError] = ToDoResource.use(toDoId);

  if (toDoFetchError)
    return <div className="ToDoCard --error">Oh no! Something went wrong.</div>;

  if (toDo)
    return (
      <div className="ToDoCard">
        <h3>{toDo.title}</h3>
        <p>{toDo.description}</p>
      </div>
    );

  return <div className="ToDoCard">Loading...</div>;
};

export default ToDoCard;
```

Here, we have a simple hook on our `ToDoResource` which takes one argument: an `identity`.

> Keep in mind, if our `identity` was an object literal, we'd want to memoize it before passing it into the hook (or pass some configuration to the resource, check out the API ref for more on that).

The framework handles fetching data as they're needed and gives us convenient access to both the data and any errors thrown during fetch. If this component unmounts and remounts, the already-fetched to do data will be cached and available synchronously on remount.

### I want to write changes to remote data.

"Writing a change" has two parts: we want to give instructions to our remote data source and we want to reflect the change in the client. We're going to co-ordinate all of this within a mutation.

```js
// src/resources/setToDoIsCheckedMutation.js

import toDoServices from 'services/ToDo';
import { describeMutation } from '@alphaflow/resource';

const setToDoIsCheckedMutation = describeMutation(
  'setToDoIsChecked',
  async ({ toDoId, isChecked }) => {
    const toDoAfterUpdate = await toDoServices.setIsChecked({
      toDoId,
      isChecked,
    });
    await ToDoResource.yield(toDoId, toDoAfterUpdate);
  },
);

export default setToDoIsCheckedMutation;
```

We can use this directly within our component.

```jsx
// src/components/ToDoCard.jsx

import ToDoResource from "src/resources/ToDo";
import setToDoIsCheckedMutation from "src/resources/setToDoIsCheckedMutation";

const ToDoCard = ({ toDoId }) => {
  const [toDo, toDoFetchError] = ToDoResource.use(toDoId);

  if (toDoFetchError)
    return <div className="ToDoCard --error">Oh no! Something went wrong.</div>;

  if (toDo)
    return (
      <div className="ToDoCard">
        <h3>
          <label>
            <input
              type="checkbox"
              checked={toDo.isChecked}
              onChange={event => {
                setToDoIsCheckedMutation({
                  toDoId: toDo.id,
                  isChecked: event.target.checked,
                });
              }}
            />
            {toDo.title}
          </label>
        </h3>
        <p>{toDo.description}</p>
      </div>
    );

  return <div className="ToDoCard">Loading...</div>;
};

export default ToDoCard;
```

The resource library should have an answer to whatever you're trying to do. This repo includes some more in-depth examples in the `examples` directory.

If you'd like to see an example added or a use case supported, please open an issue.

## API Reference

### `describeResource()`

```js
const MyResource = describeResource(name, {
  get,
  areIdentitiesEqual,
});
```

Returns a resource.

`name` is a required string used for logging and keying internally.

`get` is a required async function of an identity which returns the matching resource.

`areIdentitiesEqual` is an optional function used for determining if two identities are equal. `Object.is` is used in its absence.

> If your identity is an object literal, you might want to supply something like `lodash.isEqual`. This will make it easier to retrieve resources by identity in mutations and to avoid memoizing identities in React component bodies.

#### `Resource.use()`

```js
const [resourceData, resourceFetchError] = Resource.use(identity);
```

A React hook which returns remote data.

`resourceData` is either the result of `Resource.get` (plus changes from any mutations which have been applied) or `undefined`.

`resourceFetchError` is any error thrown in the fetch operation or `undefined`.

`identity` is any value. It will be used in `Resource.get`. If it is called with `null`, it will not perform any action.

> If your identity is an object literal and you have not supplied your own `areIdentitiesEqual`, make sure you memoize the identity higher up in the component to avoid an infinite re-get loop.

> Calling with `null` is helpful for cases where higher-up resource fetch operations need to resolve before you can construct an accurate identity. Imagine an array of `recentCommentIds` on a post, we might need to wait for them before our `CommentResource.use` could do any work.

#### `Resource.yield()`

```js
// ...
await Resource.yield(identity, writeWith);
// ...
```

Within a mutation, write changes to the resource store.

`identity` is an optional value for specifying which resource to write to. If `undefined`, all data within the resource can be written.

`writeWith` is an async function of resource data which returns their next value. If `identity` is defined, the signature is `writeWith(resourceData)`. If `identity` is `undefined`, the signature is `writeWith(identityForResourceData, resourceData)`.

> `writeWith` will not be called if resource data matching `identity` has not been fetched or the resource get matching `identity` threw an error. This stops partial optimistic updates from hanging around in the store, which can cause confusion and bugs. It also assumes that `Resource.get` will have the most current data whenever it is called.

#### `Resource.refresh()`

```js
// ...
await Resource.refresh(identity);
// ...
```

Within a mutation, force a re-get of a whole or single resource.

`identity` is an optional value for specifying which resource to refresh. If `undefined`, all data within the resource will be refreshed.

> `refresh` works by calling `Resource.get` under the hood. `Resource.get` will not be called if resource data matching `identity` has not been fetched.

### `describeMutation() => mutation`

```js
const myMutation = describeMutation(name, runner);
```

Returns a mutation. Mutations are regular functions that can be called anywhere in your app, except within another mutation.

> Because the library ensures one mutation has finished before the next starts, a wrapper mutation will be caught waiting for a child mutation. The child cannot start because the parent isn't finished, and the parent can't run because the child can't start.

`name` is a required string used for logging and keying internally.

`runner` is a required async function which executes your mutation. It will likely include one or more service, `Resource.yield`, and `Resource.refresh` calls.

### Debugging

This library is build on top of Redux, actions you take will be dispatched in a recognizable fashion within the internal store - use the [Redux Devtools](https://github.com/zalmoxisus/redux-devtools-extension) to walk through changes.

### Caching Behavior

Figuring out a caching behavior which is intuitive and helpful without clogging the client with unneeded data is an ongoing process.

At the moment, we have a replace-only policy when in comes to caching. That is - a component un-mounting does not mean we should dump its data, but when the identity passed to its hook does, we can dump the old data in favor of that matching the new identity.

### API Design

The aim of this library is to reduce cognitive load and repeated work around the topic of interactions with external services. Its internal API is central to achieving that. The library must export the minimum possible "constructs" in order to remain helpful.

The core constructs are:

A **resource**, the basic organizing principle. It's a wrapper around conceptually related information.

A **mutation**, a description of how activity within the client affects change to internal state and external services.

Developers may also become aware of the **store** which handles storing the resource state at any given time.

Functions exposed by the library should maintain similar call/response signatures.

```js
// export is verb/construct
import { describeResource } from '@alphaflow/resource';

/ called with a label and a function
/ the arguments of the function are 100% under the developer's control
const NamedResource = describeResource('Named', identity => get(identity));
```

## Contributing

Start tests in watch mode with `yarn start`.

It may be helpful to use an example app to test your changes. Run `yarn buildAndWatch` in this directory. In another tab, navigate to your example app and run `yarn start`.

### Architecture

There are a few assumptions built into this implementation:

- Writes to the `dataStore` happen in order. Mutations must run in order.
- Only the `taskController` can originate writes to the `dataStore`.
- Subscriptions on the `dataStore` may not write to other internals, they are only used for communicating with the client.

---

The library stores data in two stores:

The `surfaceStore` is a record of every resource and identity the client is using. This is pretty closely tied to hooks at the moment, but it's a simple subscription pattern, so it could be expanded.

The `dataStore` contains information about active processes and the actual data delivered to users.

---

Here's how it all works together:

Whenever the `surfaceStore` changes, it schedules fetch operations which are queued and run by `taskController`.

When users invoke mutations, they are also placed in the `taskController` and run in order.

The `taskController`, in turn, conducts async actions and writes back to the `dataStore`.

Whenever the `dataStore` changes, it walks through `surfaceStore` and calls change reporters within the surface. It's key that this does not directly lead to changes in any of the order stores, or we'd end up with infinite loops.
