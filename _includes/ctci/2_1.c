#include <stdlib.h>
#include <stdio.h>
#include <assert.h>

typedef struct Node {
  int val;
  struct Node * next;
} Node;

Node* mk_node(int val, Node* next) {
  Node* node = malloc(sizeof(Node));
  node->val = val;
  node->next = next;
  return node;
}

Node* rm_vals(int val, Node* list) {
  if (list != NULL) {
    list->next = rm_vals(val, list->next);
    if (list->val == val) {
      Node* ret = list->next;
      free(list);
      return ret;
    } else {
      return list;
    }
  } else {
    return NULL;
  }
}

Node* rm_dups(Node* list) {
  if (list != NULL) {
    list->next = rm_vals(list->val, list->next);
    list->next = rm_dups(list->next);
    return list;
  }
  return list;
}

int main(int argc, char** argv) {
  Node* node_5 = mk_node(5, NULL);
  Node* node_4 = mk_node(3, node_5);
  Node* node_3 = mk_node(2, node_4);
  Node* node_2 = mk_node(5, node_3);
  Node* node_1 = mk_node(5, node_2);

  node_1 = rm_dups(node_1);

  assert(node_1->val == 5);
  assert(node_1->next->val == 2);
  assert(node_1->next->next->val == 3);
  assert(node_1->next->next->next == NULL);

  assert(rm_dups(NULL) == NULL);

  return 0;
}