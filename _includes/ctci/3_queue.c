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
// ------------------- QUEUE API ----------------------

typedef struct Queue {
  Node* front;
  Node* back;
} Queue;

int dequeue(Queue* queue) {
  Node* front = queue->front;
  if (front == NULL) return -1;
  int x = front->val;
  queue->front = front->next;
  if (queue->front == NULL) queue->back = NULL;
  free(front);
  return x;
}

void enqueue(Queue* queue, int x) {
  Node* node = new_node(x, NULL);
  if (queue->back == NULL) {
    queue->front = node;
  } else {
    queue->back->next = node;
  }
  queue->back = node;
}

Queue* new_queue() {
  return calloc(1, sizeof(Queue));
}

void delete_queue(Queue* queue) {
  while(dequeue(queue) != -1);
  free(queue);
}

// ----------------------------------------------------
// --------------------- TESTS ------------------------

int main(int argc, char** argv) {
  Queue* queue = new_queue();
  assert(dequeue(queue) == -1);
  enqueue(queue, 1);
  assert(dequeue(queue) == 1);
  assert(dequeue(queue) == -1);
  enqueue(queue, 1);
  enqueue(queue, 2);
  enqueue(queue, 3);
  assert(dequeue(queue) == 1);
  assert(dequeue(queue) == 2);
  assert(dequeue(queue) == 3);
  assert(dequeue(queue) == -1);
  assert(dequeue(queue) == -1);
  delete_queue(queue);
}