#include <stdlib.h>
#include <assert.h>

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

// ----------------------------------------------------
// ------------------- STACK API ----------------------

typedef Node** Stack;

int pop(Stack stack) {
  Node* top = *stack;
  if (top == NULL) return -1;
  *stack = top->next;
  int x = top->val;
  free(top);
  return x;
}

void push(Stack stack, int x) {
  *stack = new_node(x, *stack);
}

Stack new_stack() {
  return calloc(1, sizeof(Node*));
}

void destroy_stack(Stack stack) {
  while(pop(stack) != -1);
  free(stack);
}

// ----------------------------------------------------
// --------------------- TESTS ------------------------

int main(int argc, char** argv) {
  Stack stack = new_stack();
  assert(pop(stack) == -1);
  push(stack, 1);
  assert(pop(stack) == 1);
  assert(pop(stack) == -1);
  push(stack, 1);
  push(stack, 2);
  push(stack, 3);
  assert(pop(stack) == 3);
  assert(pop(stack) == 2);
  assert(pop(stack) == 1);
  assert(pop(stack) == -1);
  assert(pop(stack) == -1);
  destroy_stack(stack);
}