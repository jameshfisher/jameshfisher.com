#include <string.h>
#include <assert.h>
#include <stdlib.h>

void reverse(char* s) {
  int left = 0;
  
  int len = 0;
  for (; s[len] != '\0'; len++);

  while (len > 1) {
    char left_c = s[left];
    s[left] = s[left+len-1];
    s[left+len-1] = left_c;

    left++;
    len -= 2;
  }
}

void test(char* input, char* output) {
  char* mut_input = strdup(input);
  reverse(mut_input);
  assert(strcmp(mut_input, output) == 0);
  free(mut_input);
}

int main(int argc, char** argv) {
  test("hello", "olleh");
  test("hell", "lleh");
  test("", "");
  return 0;
}