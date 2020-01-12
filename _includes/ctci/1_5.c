#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <assert.h>

int run_length(char* s) {
  char c = s[0];
  if (c == '\0') return 0;
  int length = 1;
  for(; s[length] == c; length++);
  return length;
}

int strlen_i(int i) {
  return snprintf(NULL, 0, "%i", i);
}

int rle_len(char* s) {
  int len = 0;
  int rl = run_length(s);
  while (rl > 0) {
    len += 1 + strlen_i(rl);
    s += rl;
    rl = run_length(s);
  }
  return len;
}

char* rle(char* s) {
  int old_len = strlen(s);
  int new_len = rle_len(s);

  if (old_len <= new_len) {
    return strdup(s); // provides free()able copy
  }

  char* out = malloc((new_len+1) * sizeof(char));

  int out_next = 0;
  int rl = run_length(s);
  while (rl > 0) {
    out_next += sprintf(&out[out_next], "%c%i", s[0], rl);
    s += rl;
    rl = run_length(s);
  }
  out[out_next] = '\0';

  return out;
}

void test_rle_len(char* input, int expected) {
  assert(rle_len(input) == expected);
}

void test_rle(char* input, char* expected) {
  char* output = rle(input);
  assert(strcmp(output, expected) == 0);
  free(output);
}

int main(int argc, char** argv) {
  test_rle_len("aabcccccaaa", 8);
  test_rle_len("aaaaaaaaaabbbbbbbbbbbbbbbbbbbb", 6);
  test_rle_len("", 0);
  test_rle("aabcccccaaa", "a2b1c5a3");
  test_rle("aaaaaaaaaabbbbbbbbbbbbbbbbbbbb", "a10b20");
  test_rle("", "");
  test_rle("abcd", "abcd");
  return 0;
}