#include <stdlib.h>
#include <assert.h>

// ----------------------------------------------------
// -------------------- LIST API ----------------------

typedef struct Node {
  int val;
  struct Node * next;
} Node;

Node* new_node(int val, Node* next) {
  Node* node = malloc(sizeof(Node));
  node->val = val;
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

Stack* new_stack() {
  return calloc(1, sizeof(struct Stack));
}

int stack_pop(Stack* stack) {
  Node* top = stack->top;
  if (top == NULL) return -1;
  stack->top = top->next;
  int x = top->val;
  free(top);
  return x;
}

void stack_push(Stack* stack, int x) {
  stack->top = new_node(x, stack->top);
}

void destroy_stack(Stack* stack) {
  while(stack_pop(stack) != -1);
  free(stack);
}

// ----------------------------------------------------
// ----------------- MINSTACK API ---------------------

typedef struct MinStack {
  Stack* values;
  Stack* mins;
  Stack* counters;
} MinStack;

MinStack* new_minstack() {
  MinStack* ret = calloc(1, sizeof(struct MinStack));
  ret->values = new_stack();
  ret->mins = new_stack();
  ret->counters = new_stack();
  return ret;
}

void minstack_push(MinStack* min_stack, int x) {
  stack_push(min_stack->values, x);
  if (
    min_stack->mins->top == NULL || 
    x < min_stack->mins->top->val
  ) {
    stack_push(min_stack->mins, x);
    stack_push(min_stack->counters, 1);
  } else {
    min_stack->counters->top->val++;
  }
}

int minstack_pop(MinStack* min_stack) {
  int ret = stack_pop(min_stack->values);
  if (ret != -1) {
    if (min_stack->counters->top->val == 1) {
      stack_pop(min_stack->mins);
      stack_pop(min_stack->counters);
    } else {
      min_stack->counters->top->val--;
    }
  }
  return ret;
}

int minstack_min(MinStack* min_stack) {
  if (min_stack->mins->top == NULL) return -1;
  return min_stack->mins->top->val;
}

void destroy_minstack(MinStack* min_stack) {
  destroy_stack(min_stack->values);
  destroy_stack(min_stack->mins);
  destroy_stack(min_stack->counters);
}

// ----------------------------------------------------
// --------------------- TESTS ------------------------

int main(int argc, char** argv) {
  MinStack* stack = new_minstack();
  assert(minstack_pop(stack) == -1);
  assert(minstack_min(stack) == -1);
  minstack_push(stack, 1);
  assert(minstack_min(stack) == 1);
  assert(minstack_pop(stack) == 1);
  assert(minstack_min(stack) == -1);
  assert(minstack_pop(stack) == -1);
  assert(minstack_min(stack) == -1);
  minstack_push(stack, 1);
  assert(minstack_min(stack) == 1);
  minstack_push(stack, 2);
  assert(minstack_min(stack) == 1);
  minstack_push(stack, 3);
  assert(minstack_min(stack) == 1);
  minstack_push(stack, -10);
  assert(minstack_min(stack) == -10);
  assert(minstack_pop(stack) == -10);
  assert(minstack_min(stack) == 1);
  assert(minstack_pop(stack) == 3);
  assert(minstack_min(stack) == 1);
  assert(minstack_pop(stack) == 2);
  assert(minstack_min(stack) == 1);
  assert(minstack_pop(stack) == 1);
  assert(minstack_min(stack) == -1);
  assert(minstack_pop(stack) == -1);
  assert(minstack_pop(stack) == -1);
  assert(minstack_min(stack) == -1);
  destroy_minstack(stack);
}