#include <stdlib.h>
#include <stdarg.h>
#include <assert.h>

typedef struct Node {
  int val;
  struct Node * next;
} Node;

Node* pop(Node** list) {
  Node* head = *list;
  if (head == NULL) return NULL;
  *list = head->next;
  return head;
}

void push(Node* head, Node** list) {
  head->next = *list;
  *list = head;
}

Node* reverse_list(Node* head) {
  Node* reversed = NULL;
  Node* node;
  while ((node = pop(&head))) push(node, &reversed);
  return reversed;
}

// ----------------------------------------------------
// --------------------- TESTS ------------------------

Node* mk_node(int val, Node* next) {
  Node* node = malloc(sizeof(Node));
  node->val = val;
  node->next = next;
  return node;
}

void assert_lists_eq(Node* actual, Node* expected) {
  while (actual != NULL) {
    assert(expected != NULL);
    assert(actual->val == expected->val);
    actual = actual->next;
    expected = expected->next;
  }
  assert(expected == NULL);
}

Node* mk_list(int len, ...) {
  Node* list_start = NULL;
  Node* list_end = NULL;
  va_list argp;
  va_start(argp, len);
  for (int i = 0; i < len; i++) {
    Node* node = mk_node(va_arg(argp, int), NULL);
    if (list_start == NULL) {
      list_start = node;
      list_end = node;
    } else {
      list_end->next = node;
      list_end = node;
    }
  }
  va_end(argp);
  return list_start;
}

int main(int argc, char** argv) {
  assert_lists_eq(
    reverse_list(mk_list(5,    1,2,3,4,5)), 
                 mk_list(5,    5,4,3,2,1));

  assert_lists_eq(
    reverse_list(mk_list(1,    42)), 
                 mk_list(1,    42));

  assert_lists_eq(
    reverse_list(mk_list(0)), 
                 mk_list(0));

  return 0;
}