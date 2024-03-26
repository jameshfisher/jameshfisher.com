---
title: "Predicting earth radius"
tags:
  - ml
draft: true
---

TODO: this was an attempt at round-earth vs. flat-earth
using empirical data about travel times
to predict curvature

Bahrain, Munich, Vladivostok, Astana


Munich-Bahrain: 4135 km
Bahrain-Vladivostok: 7410 km
Vladivostok-Munich: 8308 km
Munich-Astana: 4202 km
Bahrain-Astana: 3300 km
Vladivostok-Astana: 4529 km

Arbitrarily fix Astana at (0,0).
Arbitrarily fix Munich's latitude at 0.
Then we find:
  long for Munich (1 var),
  lat/long for Bahrain and Vladivostok (4 vars).
to minimize error in predicted distance between all places.

There's only one curvature which can make all these distances consistent. We first try with a flat earth and see what minimum error we get.


earth radius (1 var).

If the earth is flat, all these distances would be consistent.

Let's start by driving from Astana to Munich. We find the distance to be 4202 kilometers. Starting with this, we can begin to model our flat world.

```python
import tensorflow as tf
astana_lat = tf.constant(0., tf.float32) # Since the origin is arbitrary,
astana_lon = tf.constant(0., tf.float32) # we fix Astana there to reduce variables.
munich_lat = tf.constant(0., tf.float32) # Since rotation is arbitrary, we fix Munich at 0 latitude.
munich_lon = tf.Variable(10., tf.float32)
def distance_flat_earth(a_lat, a_lon, b_lat, b_lon):
    return tf.sqrt(tf.square(a_lat - b_lat) + tf.square(a_lon - b_lon))
astana_munich_distance_prediction = distance_flat_earth(astana_lat, astana_lon, munich_lat, munich_lon)
DISTANCE_KM_ASTANA_MUNICH = 4202
loss = tf.square(astana_munich_distance_prediction - DISTANCE_KM_ASTANA_MUNICH)
train_step = tf.train.GradientDescentOptimizer(0.1).minimize(loss)
with tf.Session() as sess:
    tf.global_variables_initializer().run()
    for _ in range(100):
        sess.run(train_step)
    print("Final Munich lon: %s" % sess.run(munich_lon))
    print("Final Error: %s" % sess.run(loss))
```
