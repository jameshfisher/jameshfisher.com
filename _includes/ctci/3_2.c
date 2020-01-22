#include <stdlib.h>
#include <assert.h>

typedef struct Node {
  int val;
  int min;
  struct Node * next;
} Node;

Node* new_node(int val, int min, Node* next) {
  Node* node = malloc(sizeof(Node));
  node->val = val;
  node->min = min;
  node->next = next;
  return node;
}

int minimum(int a, int b) {
  return (a < b ? a : b);
}

// ----------------------------------------------------
// ------------------- STACK API ----------------------

typedef struct Stack {
  Node* top;
} Stack;

int pop(Stack* stack) {
  Node* top = stack->top;
  if (top == NULL) return -1;
  stack->top = top->next;
  int x = top->val;
  free(top);
  return x;
}

void push(Stack* stack, int x) {
  int new_min = stack->top != NULL ? 
    minimum(stack->top->min, x) : 
    x;
  stack->top = new_node(x, new_min, stack->top);
}

int min(Stack* stack) {
  return stack->top == NULL ? -1 : stack->top->min;
}

Stack* new_stack() {
  return calloc(1, sizeof(struct Stack));
}

void destroy_stack(Stack* stack) {
  while(pop(stack) != -1);
  free(stack);
}

// ----------------------------------------------------
// --------------------- TESTS ------------------------

int main(int argc, char** argv) {
  Stack* stack = new_stack();
  assert(pop(stack) == -1);
  assert(min(stack) == -1);
  push(stack, 1);
  assert(min(stack) == 1);
  assert(pop(stack) == 1);
  assert(min(stack) == -1);
  assert(pop(stack) == -1);
  assert(min(stack) == -1);
  push(stack, 1);
  assert(min(stack) == 1);
  push(stack, 2);
  assert(min(stack) == 1);
  push(stack, 3);
  assert(min(stack) == 1);
  push(stack, -10);
  assert(min(stack) == -10);
  assert(pop(stack) == -10);
  assert(min(stack) == 1);
  assert(pop(stack) == 3);
  assert(min(stack) == 1);
  assert(pop(stack) == 2);
  assert(min(stack) == 1);
  assert(pop(stack) == 1);
  assert(min(stack) == -1);
  assert(pop(stack) == -1);
  assert(pop(stack) == -1);
  assert(min(stack) == -1);
  destroy_stack(stack);
}