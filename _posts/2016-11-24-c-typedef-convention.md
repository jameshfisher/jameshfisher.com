---
title: A C typedef convention for complex types
tags:
  - types
  - c
  - programming
taggedAt: '2024-03-26'
---

C type syntax is maddening to read and write. The only sensible way to proceed is to force yourself to only ever express composite types in a `typedef`.

An example from [cdecl.org](http://cdecl.org/):

```c
// declare foo as pointer to function (void) returning pointer to array 3 of int
int (*(*foo)(void ))[3];
```

Maybe you can read this, but I can't. How might we more sensibly write this? First let's re-use the common formal syntax for generics to describe such types:

```
foo : ptr<fn<void,ptr<arr<int,3>>>>
```

We have the type language:

```
type ::= ptr<type>
       | fn<type, type>
       | arr<type, int>
       | ...
       ;
```

It is difficult to embed this language in a single token, because of the nested `<>`. Instead, let's use a "reverse Polish notation":

```
void int 3 arr ptr fn ptr
```

The words above represent instructions to build a type. We keep a *stack* as we read through the words, and at the end, we expect to have a single type on the stack. So as we read through, our stack is:

```
INSTRUCTION  STACK
===========  ==============================
void         void
int          void, int
3            void, int, 3
arr          void, arr<int,3>
ptr          void, ptr<arr<int,3>>
fn           fn<void, ptr<arr<int,3>>>
ptr          ptr<fn<void, ptr<arr<int,3>>>>
```

This language is easily embeddable in a token:

```
void_int_3_arr_ptr_fn_ptr
```

We then gradually construct these types using `typedef`:

```c
typedef int int_3_arr[3];
typedef int_3_arr* int_3_arr_ptr;
typedef int_3_arr_ptr (*void_int_3_arr_ptr_fn)(void);
typedef void_int_3_arr_ptr_fn* void_int_3_arr_ptr_fn_ptr;

void_int_3_arr_ptr_fn_ptr foo;
```

Unfortunately, this `fn` rule can't deal with multiple parameters. As a practical concession, we introduce `fn0`, `fn1`, `fn2`, etc., which specify how many parameters there are. For functions with parameter `void`, we use `fn0`. So we now have:

```
int_3_arr_ptr_fn0_ptr
```

We can read this in reverse: "a pointer to a function which takes 0 arguments and returns a pointer to an array of 3 integers."

Now let's try a real-world example:

```c
extern void (*signal(int, void(*)(int)))(int);
```

How could this be more clearly written? To quote [this SO answer](http://stackoverflow.com/a/1591492/229792), "it's a function that takes two arguments, an integer and a pointer to a function that takes an integer as an argument and returns nothing, and it (signal()) returns a pointer to a function that takes an integer as an argument and returns nothing."

We can write this in our formal language as `fn2<int,ptr<fn1<int,void>>,ptr<fn1<int,void>>>`, and then convert this to:

```c
typedef void (*int_void_fn1)(int);
typedef int_void_fn1* int_void_fn1_ptr;
typedef int_void_fn1_ptr (*int_int_void_fn1_ptr_int_void_fn1_ptr_fn2)(int, int_void_fn1_ptr);

extern int_int_void_fn1_ptr_int_void_fn1_ptr_fn2 signal;
```

We can no longer read this purely in reverse, but at least the rules to understand it are simple. This is not great, but it's at least decipherable. For the C type syntax, I need a cup of coffee and a syntax reference.

We could embed the nested syntax more obviously by substituting some characters for `<`, `,` and `>`, but the set of valid characters in identifiers is pretty small. We can't do much better than `C`, `a`, and `D`:

```
fn2_C_int_a_ptr_C_fn1_C_int_a_void_D_D_a_ptr_C_fn1_C_int_a_void_D_D_D
```

... but this looks terribly mangled.
