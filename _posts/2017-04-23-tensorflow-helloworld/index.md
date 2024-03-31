---
title: How to write 'hello world' in TensorFlow
tags:
  - machine-learning
summary: >-
  Two ways to calculate the cost per gram of chocolate: one without machine learning, and another using TensorFlow to learns a linear model.
---

The following program finds out the cost of chocolate per gram. It takes as input some example chocolate bars: each one with a weight and a price.

```python
import tensorflow as tf
import numpy as np

TRUE_DOLLARS_PER_GRAM = 0.1
weight_grams = np.linspace(10, 70, 10)
price_dollars = TRUE_DOLLARS_PER_GRAM*weight_grams + np.random.randn(*weight_grams.shape)*0.33

input_grams_tensor = tf.placeholder(tf.float32)
true_dollars_tensor = tf.placeholder(tf.float32)
dollars_per_gram_tensor = tf.Variable(0.0)  # train to find the best value here
predicted_dollars_tensor = tf.multiply(input_grams_tensor, dollars_per_gram_tensor)  # to improve this prediction
error_in_dollars_tensor = tf.square(true_dollars_tensor - predicted_dollars_tensor)  # i.e. to minimize this error

train_op = tf.train.GradientDescentOptimizer(0.0001).minimize(error_in_dollars_tensor)

with tf.Session() as sess:
	tf.global_variables_initializer().run()
	for _ in range(1000):
		for (example_weight_grams, example_price_dollars) in zip(weight_grams, price_dollars):
			sess.run(train_op, feed_dict={
				input_grams_tensor: example_weight_grams,
				true_dollars_tensor: example_price_dollars
			})
	print("Final cost per gram: $%s" % sess.run(dollars_per_gram_tensor))
```

I say the program "finds the cost of chocolate per gram", rather than "learns to predict the price of chocolate bars based on their weight". The program is only able to consider linear "models" of price, and this linear model is decided by you, the programmer.

There are other ways to calculate this cost per gram. You could divide the total cost by the total weight. This program is much simpler:

```python
import numpy as np
TRUE_DOLLARS_PER_GRAM = 0.1
weight_grams = np.linspace(0, 50, 10)
price_dollars = TRUE_DOLLARS_PER_GRAM*weight_grams + np.random.randn(*weight_grams.shape)*0.33
print("Final cost per gram: $%s" % (np.sum(price_dollars) / np.sum(weight_grams)))
```

The "machine learning" approach becomes useful with more complex, non-linear models. Chocolate bars aren't actually priced linearly by weight: they get comparatively cheaper as they get bigger. The price is not just influenced by weight: it's also influenced by the type of chocolate, the brand, the location it's sold in. Solving for a "cost per gram" doesn't work in such models.
