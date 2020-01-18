#include <stdlib.h>
#include <stdbool.h>
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

void reverse_onto(Node** from_list, Node** to_list) {
  Node* node;
  while ((node = pop(from_list))) push(node, to_list);
}

bool lists_eq(Node* a, Node* b) {
  while (a != NULL) {
    if (b == NULL) return false;
    if (a->val != b->val) return false;
    a = a->next;
    b = b->next;
  }
  return b == NULL;
}

bool is_palindrome(Node* head) {
  Node* fast = head;
  Node* slow = head;
  Node* reversed = NULL;
  while (fast != NULL && fast->next != NULL) {
    fast = fast->next->next;
    push(pop(&slow), &reversed);
  }
  bool ret = lists_eq(
    fast == NULL ? slow : slow->next,
    reversed);
  reverse_onto(&reversed, &slow); // reset list pointers
  return ret;
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

Node* copy_list(Node* head) {
  if (head == NULL) return NULL;
  return mk_node(head->val, copy_list(head->next));
}

void test_is_palindrome(Node* input, bool expected) {
  Node* prev = copy_list(input);
  assert(is_palindrome(input) == expected);
  assert(lists_eq(input, prev));
}

int main(int argc, char** argv) {
  test_is_palindrome(mk_list(0), true);
  test_is_palindrome(mk_list(1, 1), true);
  test_is_palindrome(mk_list(2, 1,1), true);
  test_is_palindrome(mk_list(2, 1,2), false);
  test_is_palindrome(mk_list(3, 1,2,1), true);
  test_is_palindrome(mk_list(3, 1,2,2), false);
  test_is_palindrome(mk_list(4, 1,2,2,1), true);
  test_is_palindrome(mk_list(4, 1,2,3,2), false);
  test_is_palindrome(mk_list(5, 1,2,3,2,1), true);
  test_is_palindrome(mk_list(5, 1,2,3,2,2), false);

  return 0;
}