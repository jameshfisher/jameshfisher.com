---
title: Diff views as instructions
tags: []
---

Technical communication about code usually includes code blocks.
Usually, those code blocks contain two distinct things:
the code under discussion,
and some context for that code.
But it's rarely clear which is which.

We can use "diff views" to differentiate the code from the context.
Often, the code under discussion is a modification:
"to implement X, change the code as follows".
For instance,
in [an earlier post about implementing promises](/2017/11/07/promise-implementation/),
this would have been clearer:

> When a callback is registered late,
> we need to check whether the promise is already fulfilled,
> and if so, use the stored value:
>
> ```
>     function JimPromise() {
> +++   this.isFulfilled = false;
>       this.callbacks = [];
>     }
>    
>     JimPromise.prototype.fulfill = function(value) {
> +++   this.isFulfilled = true;
> +++   this.value = value;
>       this.callbacks.forEach(cb => cb(value));
>     };
>    
>     JimPromise.prototype.registerCallback = function(cb) {
> +++   if (this.isFulfilled) {
> +++     cb(this.value);
> +++   } else {
>         this.callbacks.push(cb);
> +++   }
>     };
> ```

The lines prefixed by `+++` are the code under discussion,
and the rest is context.
Programmers will be familiar with this format:
it resembles a "unified diff",
as output by version control tools.

This diff view could be formatted nicely by blogs, documentation, etc.
It could be given syntax highlighting.
The additions and deletions could be different colors.

On my blog, this is not the case, and I don't think there's any easy way to do it.
Our tools are not equipped to manually write diffs.
For example, Markdown (which I'm using to write this post)
does not have a syntax form to express these diffs.

I think this is because
we're used to consuming diffs as outputs,
rather than writing them.
We're used to seeing diffs as _history_ rather than instructions.

This encourages me to move to a blogging system
that allows me to create my own components like this.
I could move to a React/JSX-powered blog,
where `DiffView` would be a component.
