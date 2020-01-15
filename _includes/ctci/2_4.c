#include <stdlib.h>
#include <assert.h>
#include <stdarg.h>
#include <stdio.h>

typedef struct Node {
  int val;
  struct Node * next;
} Node;

Node* partition(int x, Node* list) {
  Node* lt_head = NULL;
  Node* lt_tail = NULL;
  Node* gte_head = NULL;

  Node* n = list;
  while (n != NULL) {
    if (n->val < x) {
      Node* next = n->next;
      n->next = lt_head;
      if (lt_tail == NULL) lt_tail = n;
      lt_head = n;
      n = next;
    } else {
      Node* next = n->next;
      n->next = gte_head;
      gte_head = n;
      n = next;
    }
  }

  if (lt_tail == NULL) {
    return gte_head;
  } else {
    lt_tail->next = gte_head;
    return lt_head;
  }
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

void print_list(Node* list) {
  while (list != NULL) {
    printf("%d ", list->val);
    list = list->next;
  }
  printf("\n");
}

int main(int argc, char** argv) {
  assert_lists_eq(
    partition(5,  mk_list(7,    2,6,3,7,5,3,6)), 
                  mk_list(7,    3,3,2,6,5,7,6));

  assert_lists_eq(
    partition(1,  mk_list(7,    2,6,3,7,5,3,6)), 
                  mk_list(7,    6,3,5,7,3,6,2));

  assert_lists_eq(
    partition(42, mk_list(7,    2,6,3,7,5,3,6)), 
                  mk_list(7,    6,3,5,7,3,6,2));
                  
  assert_lists_eq(
    partition(5,  mk_list(0)), 
                  mk_list(0));

  return 0;
}