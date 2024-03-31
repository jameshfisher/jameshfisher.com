---
title: Operational Transformations hello world
tags: []
draft: true
---

```ts
type InsertOp = { type: "insert", at: number, char: string };
type DeleteOp = { type: "delete", at: number };
type NoOp = { type: "noop" };
type Op = InsertOp | DeleteOp | NoOp;
```

```ts
function apply_ins(ins: InsertOp, to: string): string {
  return to.slice(0, ins.at) + ins.char + to.slice(ins.at);
}

function apply_del(del: DeleteOp, to: string): string {
  return to.slice(0, ins.at) + to.slice(ins.at + 1);
}

function apply(op: Op, to: string): string {
  if (op.type === "noop") return to;
  else if (op.type === "insert") return apply_ins(op, to);
  else if (op.type === "delete") return apply_del(op, to);
  else throw new Error("Unexpected op");
}
```


```ts
function transform_ins_by_ins(ins: InsertOp, by: InsertOp): InsertOp {
  if (by.at < ins.at) {
    // We inserted a char before the insertion point
    return { ...ins, at: ins.at + 1 };
  } else {
    // We inserted a char after the insertion point
    return ins;
  }
}

function transform_ins_by_del(ins: InsertOp, by: DeleteOp): InsertOp {
  if (by.at < ins.at) {
    // We deleted a char before the insertion point
    return { ...ins, at: ins.at - 1 };
  } else {
    // We deleted a char after the insertion point
    return ins;
  }
}

function transform_del_by_ins(del: DeleteOp, by: InsertOp): DeleteOp {
  if (by.at <= del.at) {
    // We inserted a char before the char to delete
    return { ...del, at: del.at + 1 };
  } else {
    // We inserted a char after the char to delete
    return del;
  }
}

function transform_del_by_del(del: DeleteOp, by: DeleteOp): DeleteOp {
  if (by.at === del.at) {
    // Someone else deleted this char!
    return { type: "noop" };
  } else if (by.at < del.at) {
    // We deleted a char before the char to delete
    return { ...del, at: del.at - 1 };
  } else {
    // We deleted a char after the char to delete
    return del;
  }
}

function transform(op: Op, by: Op): Op {
  if (op.type === "noop" || by.type === "noop") return op;
  else if (op.type === "insert" && by.type === "insert") return transform_ins_by_ins(op, by);
  else if (op.type === "insert" && by.type === "delete") return transform_ins_by_del(op, by);
  else if (op.type === "delete" && by.type === "insert") return transform_del_by_ins(op, by);
  else if (op.type === "delete" && by.type === "delete") return transform_del_by_del(op, by);
  else throw new Error("Unexpected ops");
}
```

```ts

```


Some subtleties:

We could have each operation work on single characters,
so "insert `hello`" is five sequential operations,
and "delete `hello`" is another five sequential operations.

But one thing we want is the ability to represent a "no-op".


The `DeleteOp` has a `content`, but this is redundant.
It could just have a `length`.
But this allows for _inversion_.
Inversion is important for undoing operations.

