#include <stdlib.h>
#include <string.h>
#include <assert.h>

void replace_spaces(char* s, int true_length) {
  int new_true_length = 0;
  for (int i = 0; i < true_length; i++) {
    new_true_length += ((s[i] == ' ') ? 3 : 1);
  }

  int end = true_length - 1;
  int new_end = new_true_length - 1;

  for (; end >= 0; end--) {
    if (s[end] == ' ') {
      s[new_end] = '0';
      s[new_end-1] = '2';
      s[new_end-2] = '%';
       new_end -= 3;
    } else {
      s[new_end] = s[end];
      new_end--;
    }
  }
}

void test(char* input, int true_length, char* expected) {
  char* input2 = strdup(input);
  replace_spaces(input2, true_length);
  assert(strcmp(input2, expected) == 0);
  free(input2);
}

int main(int argc, char** argv) {
  test("hello", 5, "hello");
  test("hello  ", 5, "hello  ");
  test("hello world  ", 11, "hello%20world");
  test("      ", 2, "%20%20");
  test("", 0, "");
  return 0;
}