#include <stdlib.h>
#include <assert.h>

typedef struct Node {
  int val;
  struct Node * next;
} Node;

Node* kth_last_element(int k, Node* list) {
  Node* trailing = list;
  Node* leading = list;
  for (int i = 0; i <= k; i++) {
    if (leading == NULL) return NULL;
    leading = leading->next;
  }
  while (leading != NULL) {
    leading = leading->next;
    trailing = trailing->next;
  }
  return trailing;
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
  // Indexing empty list should always return NULL
  assert(kth_last_element(0, NULL) == NULL);
  assert(kth_last_element(3, NULL) == NULL);

  // List nodes contain their indexes: 9,8,7,6,5,4,3,2,1,0
  Node* test_list = mk_test_list(10);

  // 0th element from right contains 0, etc
  assert(kth_last_element(0, test_list)->val == 0);
  assert(kth_last_element(5, test_list)->val == 5);

  // Out-of-bounds should return NULL
  assert(kth_last_element(15, test_list) == NULL);

  return 0;
}