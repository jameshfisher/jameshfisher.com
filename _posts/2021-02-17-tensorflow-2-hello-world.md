---
title: "TensorFlow 2 'hello world'"
tags: ["tensorflow", "programming", "ml"]
---

The following program finds out the cost of chocolate per gram using TensorFlow 2.
It takes as input some example chocolate bars,
each with a weight and a price.

```python
import tensorflow as tf

NUM_EXAMPLES = 100
TRUE_DOLLARS_PER_GRAM = 0.1
weight_grams = tf.cast(tf.linspace(10, 70, NUM_EXAMPLES), tf.float32)
price_dollars = weight_grams*TRUE_DOLLARS_PER_GRAM + tf.random.normal([NUM_EXAMPLES])

model_dollars_per_gram = tf.Variable(5., name='dollars_per_gram')

optimizer = tf.keras.optimizers.SGD(learning_rate=0.0001)

for i in range(30):
  with tf.GradientTape() as tape:
    loss = tf.reduce_mean(tf.square(model_dollars_per_gram*weight_grams - price_dollars))
  grads = tape.gradient(loss, [model_dollars_per_gram])
  optimizer.apply_gradients(zip(grads, [model_dollars_per_gram]))

print("Final cost per gram: $%s" % model_dollars_per_gram.value().numpy())
```

[I wrote the same thing in 2017 using TensorFlow 1](/2017/04/23/tensorflow-helloworld).
TensorFlow 2 is really quite different.
The biggest difference seems to be the introduction of _automatic differentiation_.
Instead of building an explicit computation graph,
we use ordinary Python operators, like `*` and `-`.
Instead of a static graph,
you can use whatever complex Python control flow you like.
The autodiff "tape" is made explicit,
and lets you ask for gradients to pass to the optimizer.

(I should do a post explaining autodiff soon.
It's just marvelous.)