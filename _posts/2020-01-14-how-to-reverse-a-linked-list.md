---
title: "How to reverse a linked list"
tags: ["programming", "c"]
---

To reverse a linked list,
think of it as a stack.
Repeatedly `pop` an item off the stack,
then `push` it onto a second stack.
The second stack will accumulate a reversed list of items.

Here's an implementation in C:

```c
{% include ctci/2_7_1.c %}
```

And here's a version that does the pointer manipulation directly,
without calling out to `pop` and `push` functions:

```c
Node* reverse_list(Node* head) {
  Node* reversed_head = NULL;
  while (head != NULL) {
    Node* next = head->next;
    head->next = reversed_head;
    reversed_head = head;
    head = next;
  }
  return reversed_head;
}
```