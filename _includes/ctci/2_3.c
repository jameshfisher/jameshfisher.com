#include <stdlib.h>
#include <assert.h>

typedef struct Node {
  int val;
  struct Node * next;
} Node;

// Precondition: node != NULL && node->next != NULL
void delete_node_middle(Node* node) {
  Node* next = node->next;
  node->val = next->val;
  node->next = next->next;
  free(next);
}

Node* mk_node(int val, Node* next) {
  Node* node = malloc(sizeof(Node));
  node->val = val;
  node->next = next;
  return node;
}

Node* mk_test_list(int length) {
  if (length <= 0) return NULL;
  return mk_node(length-1, mk_test_list(length-1));
}

int main(int argc, char** argv) {
  // List nodes contain their indexes: 4,3,2,1,0
  Node* test_list = mk_test_list(5);

  delete_node_middle(test_list->next->next);

  assert(test_list->val                   == 4);
  assert(test_list->next->val             == 3);
  assert(test_list->next->next->val       == 1);
  assert(test_list->next->next->next->val == 0);
  assert(test_list->next->next->next->next == NULL);

  return 0;
}