#include <stdlib.h>
#include <stdarg.h>
#include <assert.h>

typedef struct Node {
  int val;
  struct Node * next;
} Node;

Node* find_middle(Node* head) {
  Node* fast = head;
  Node* slow = head;
  while (fast != NULL && fast->next != NULL) {
    fast = fast->next->next;
    slow = slow->next;
  }
  if (fast == NULL) {
    // Even number of nodes, so no middle node
    return NULL;
  }
  return slow;
}

// ----------------------------------------------------
// --------------------- TESTS ------------------------

Node* mk_node(int val, Node* next) {
  Node* node = malloc(sizeof(Node));
  node->val = val;
  node->next = next;
  return node;
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
  assert(find_middle(mk_list(0))== NULL);
  assert(find_middle(mk_list(1, 42))->val == 42);
  assert(find_middle(mk_list(4, 1,2,3,4)) == NULL);
  assert(find_middle(mk_list(5, 1,2,3,4,5))->val == 3);

  return 0;
}