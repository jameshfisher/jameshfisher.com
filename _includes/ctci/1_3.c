#include <stdlib.h>
#include <stdbool.h>
#include <assert.h>

void char_distrib(char* s, int distrib[]) {
  for (int i = 0; s[i] != '\0'; i++) {
    distrib[s[i]]++;
  }
}

bool is_permutation(char* a, char* b) {
  int* a_distrib = calloc(255, sizeof(int));
  int* b_distrib = calloc(255, sizeof(int));
  char_distrib(a, a_distrib);
  char_distrib(b, b_distrib);
  for (int i = 0; i < 256; i++) {
    if (a_distrib[i] != b_distrib[i]) return false;
  }
  return true;
}

void test(char* a, char* b, bool output) {
  assert(is_permutation(a,b) == output);
}

int main(int argc, char** argv) {
  test("hello", "ehlol", true);
  test("hell", "ehlol", false);
  test("", "", true);
  return 0;
}