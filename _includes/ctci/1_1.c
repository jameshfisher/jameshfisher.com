#include <stdbool.h>
#include <assert.h>

bool has_all_unique_characters(char* s) {
  char head = s[0];
  if (head == '\0') {
    return true;
  } else {
    for (int i = 1; s[i] != '\0'; i++) {
      if (s[i] == first) return false;
    }
    return has_all_unique_characters(s+1);
  }
}

int main(int argc, char** argv) {
  assert(!has_all_unique_characters("hello"));
  assert(!has_all_unique_characters("abracadabra"));
  assert( has_all_unique_characters("world"));
  assert( has_all_unique_characters(""));
  return 0;
}