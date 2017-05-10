---
title: "Simplest neural network: a neuron"
---

The basis of neural networks is the neuron. A neuron has some inputs, and based on those, either _fires_ or doesn't fire. We can interpret the decision to fire as a binary _classification_ of the inputs into two classes.

To neuron whether to fire, the neuron follows a simple procedure: take each input, multiply it by a _weight_, sum those products, then fire if the sum is above a threshold. The specific behavior of a neuron is given by its weights and its threshold.

The following C code shows two neurons at work. One classifies numbers according to whether they are even or odd. Another neuron classifies numbers according to whether they are greater than five. Each is defined by specific weights and threshold.

The neuron only understands inputs as a vector of numbers, so we have to encode our inputs. To encode the natural numbers, I've encoded them in binary.

```c
#include <stdbool.h>
#include <stdio.h>

bool neuron(float weights[4], float threshold, float input[4]) {
  float sum = 0;
  for (size_t i = 0; i < 4; i++) {
    sum += input[i] * weights[i];
  }
  return threshold < sum;
}

float is_odd_weights[]      = { 0, 0, 0, 1 };
float real_number_weights[] = { 8, 4, 2, 1 };

float four[]  = {0, 1, 0, 0};
float five[]  = {0, 1, 0, 1};
float six[]   = {0, 1, 1, 0};
float seven[] = {0, 1, 1, 1};

int main() {
  printf("4 is odd: %d\n", neuron(is_odd_weights, 0, four));
  printf("5 is odd: %d\n", neuron(is_odd_weights, 0, five));
  printf("6 is odd: %d\n", neuron(is_odd_weights, 0, six));
  printf("7 is odd: %d\n", neuron(is_odd_weights, 0, seven));

  printf("4 is greater than 5: %d\n", neuron(real_number_weights, 5, four));
  printf("5 is greater than 5: %d\n", neuron(real_number_weights, 5, five));
  printf("6 is greater than 5: %d\n", neuron(real_number_weights, 5, six));
  printf("7 is greater than 5: %d\n", neuron(real_number_weights, 5, seven));

  return 0;
}
```

What kinds of classifications can this pattern make? For example, it understands _divisibility by two_, but could we find weights which classify according to divisibility by _three_? Find out in a future episode.
