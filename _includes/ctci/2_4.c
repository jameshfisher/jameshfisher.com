#include <stdlib.h>
#include <assert.h>
#include <stdarg.h>

typedef struct Node {
  int val;
  struct Node * next;
} Node;

Node* partition(int x, Node* list) {
  if (list == NULL) return NULL;
  Node* head = list;
  Node* tail = list;
  Node* n = list->next;
  list->next = NULL;
  while (n != NULL) {
    Node* next = n->next;
    if (n->val < x) {
      n->next = head;
      head = n;
    } else {
      n->next = NULL;
      tail->next = n;
      tail = n;
    }
    n = next;
  }

  return head;
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
    partition(5,  mk_list(7,    2,6,3,7,5,3,6)), 
                  mk_list(7,    3,3,2,6,7,5,6));

  assert_lists_eq(
    partition(1,  mk_list(7,    2,6,3,7,5,3,6)), 
                  mk_list(7,    2,6,3,7,5,3,6));

  assert_lists_eq(
    partition(42, mk_list(7,    2,6,3,7,5,3,6)), 
                  mk_list(7,    6,3,5,7,3,6,2));

  assert_lists_eq(
    partition(5,  mk_list(0)), 
                  mk_list(0));

  return 0;
}