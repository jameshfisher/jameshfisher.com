---
title: "What are lvalue and rvalue in C?"
---

**TL;DR: "lvalue" either means "expression which can be placed on the left-hand side of the assignment operator", or means "expression which has a memory address". "rvalue" is defined as "all other expressions".**

What does the following program do?

```c
int foo() { return 4; }
int main(void) {
  foo() = 3;
  return 0;
}
```

The program doesn't _do_ anything because it doesn't mean't mean anything. It doesn't make sense to assign a value to `foo()`. Function calls are one-way: domain in, range out. We can't assign to a function's range.

Thus, your C compiler will give you a compile error:

```
% clang test.c
test.c:3:9: error: expression is not assignable
  foo() = 3;
  ~~~~~ ^
1 error generated.
```

Clang tells me that the "expression is not assignable". This seems clear, but other compilers will use different terminology, e.g. "need lvalue as target of assignment".

This terminology, "lvalues" and "rvalues", is talking about the same thing. The terminology derives from whether the value can/must be on the _left_ or _right_ of an assignment. In the BNF for C, we might write:

```bnf
assignment_expr ::= lvalue "=" (lvalue | rvalue) ;
lvalue ::= var | dereference | array_lookup | ... ;
rvalue ::= function_call | constant | ... ;
```

This divides up all _expressions_ into two disjoint sets:

* _lvalues_ are "left values": expressions that can be assigned to, which can be on the _left_ of an assignment
* _rvalues_ are "right values": everything else, which must be on the _right_ of an assignment

But there's an alternative definition. [Eli Bendersky](http://eli.thegreenplace.net/2011/12/15/understanding-lvalues-and-rvalues-in-c-and-c) redefines _lvalue_ as a "locator value", and says

> An _lvalue_ (_locator value_) represents an object that occupies some identifiable location in memory (i.e. has an address).

> _rvalues_ are defined by exclusion, by saying that every expression is either an _lvalue_ or an _rvalue_. Therefore, from the above definition of _lvalue_, an _rvalue_ is an expression that does not represent an object occupying some identifiable location in memory.

This definition is nicer, because it accounts for another place where we refer to lvalues and rvalues: referencing and dereferencing. This program generates an error:

```c
int foo() { return 4; }
int main(void) {
  int* f = &foo();
  return 0;
}
```

Clang now decides to use the `rvalue` terminology!:

```
% clang lvalue.c
lvalue.c:3:12: error: cannot take the address of an rvalue of type 'int'
  int* f = &foo();
           ^~~~~~
1 error generated.
```

Because rvalues are ones which do "not represent an object occupying some identifiable location in memory", we cannot use the `&` (addressof) operator on them.

But wait ... what about this program?

```c
int main(void) {
  void* f = &"some string";
  return 0;
}
```

It turns out this one is just fine, because ... string literals are lvalues! When we write `"foo"`, we reserve memory for that string in an addressable location.
