---
title: "A job queue in two lines of JS"
tags: []
---

If you need a job queue in JS,
you can do it in two lines:

```ts
type Job = () => Promise<unknown>;

let chain = Promise.resolve();
const enqueue = (job: Job) => chain = chain.then(job, job);
```

For example, if your app makes API requests,
you may need requests to be processed in the order they were dispatched:

```js
function setDone(id: string, done: boolean) {
  enqueue(() => fetch(`/todos/${id}`, {
    method: "POST",
    body: JSON.stringify({ done }),
  }));
}
```

Note that `chain.then(job)` is probably not what you want,
because any rejection in the `chain` will cause the `job` to never run.
Instead you want `chain.then(job, job)`,
which will run `job` when the `chain` either rejects or resolves.
