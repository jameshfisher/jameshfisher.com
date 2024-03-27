---
title: What is a McCulloch-Pitts neuron?
tags:
  - programming
  - machinelearning
---

In [their 1943 paper, _A logical calculus of the ideas immanent in nervous activity_](http://www.cse.chalmers.se/~coquand/AUTOMATA/mcp.pdf),
Warren McCulloch and Walter Pitts proposed
a mathematical model of the behavior of neurons.
But the notation is dated. 
Here I show the model in JavaScript.
For the impatient,
here's the model that I'll explain:

```js
const makeNeuron = options => inputs => {
  for (i of options.inhibitory)
    if (inputs[i] === 1) 
      return 0;
  let sum = 0;
  for (i of options.excitatory)
    sum += inputs[i];
  return sum >= options.threshold ? 1 : 0;
}
```

The McCulloch-Pitts neuron 
(also called the M-P neuron,
or the "Threshold Logic Unit")
is modelled as a pure function
with many inputs and one output.
All inputs and outputs are either `0` or `1`.
Here's an example neuron in action:

```js
> mystery([0,1])
0
> mystery([1,1])
1
```

McCulloch-Pitts neurons can have many inputs,
but this one has just two.
Depending on those inputs,
it outputs either `0` or `1`.
In other words, it's a logical binary operator.
We can find out which operator it is
by trying all the inputs:

```js
> mystery([1,0])
0
> mystery([0,0])
0
```

Yes, it's the `AND` operator:
interpreting `1` as true and `0` as false,
it only returns true if both inputs are true.

There are many ways we could implement the `AND` neuron in JavaScript,
but in the McCulloch-Pitts model,
it's implemented as:

```js
const AND = ([x,y]) => x+y >= 2 ? 1 : 0
```

Instead of using an `&&` operator,
we use addition and comparison.
The sum of the two inputs can only be `>= 2`.

This implementation probably looks strange.
But it has two nice properties.
The first nice property is that
we can implement other logical operators
by changing just one number:

```js
const OR = ([x,y]) => x+y >= 1 ? 1 : 0
```

By changing the `2` to a `1`,
we get `OR`.
This number is called the _activation threshold_.
We can pull it out as a separate parameter,
and implement three binary operators:


```js
const makeNeuron = 
  options => 
    ([x,y]) => 
      x+y >= options.threshold ? 1 : 0

const AND   = makeNeuron({threshold: 2})
const OR    = makeNeuron({threshold: 1})
const ON    = makeNeuron({threshold: 0})
```

The second nice property of the McCulloch-Pitts model
is that it resembles how physical neurons work:
the threshold number corresponds to
the neuron's [threshold potential](https://en.wikipedia.org/wiki/Threshold_potential)
measured in _volts_.

So we can make `AND` and `OR`;
what about other operators like `NOR`, or `XOR`?
How would you define `NOR` with the above `makeNeuron` function?

It turns out you can't do it!
To cope with this limitation,
the McCulloch-Pitts model introduces
_inhibitory_ inputs.
So far, if any input is switched from `0` to `1`,
it increases the chance of the neuron outputting `1`,
because it brings it closer to the threshold.
These inputs are _excitatory_.
By contrast, inhibitory inputs
stop the neuron outputting `1`.
If _any_ inhibitory inputs are `1`,
the output will be `0`.

Here's `NOR` with inhibitory inputs:

```js
const makeNeuron = options => inputs => {
  for (i of options.inhibitory)
    if (inputs[i] === 1) 
      return 0;
  let sum = 0;
  for (i of options.excitatory)
    sum += inputs[i];
  return sum >= options.threshold ? 1 : 0;
}

const AND = makeNeuron({threshold: 2, excitatory: [0,1], inhibitory: []});
const OR  = makeNeuron({threshold: 1, excitatory: [0,1], inhibitory: []});
const ON  = makeNeuron({threshold: 0, excitatory: [0,1], inhibitory: []});

// So now we can define ...
const NOR = makeNeuron({threshold: 0, excitatory: [], inhibitory: [0,1]});
```

This `inhibitory` parameter loosely corresponds to 
[inhibitory postsynaptic potential](https://en.wikipedia.org/wiki/Inhibitory_postsynaptic_potential)
in the physical model.
And the addition of this parameter lets us define `NOR`, which is nice.
Now what about `XOR`?
Can we define this, too?

Again, it turns out you can't do it!
There is no combination of `threshold` value and `inhibitory` inputs
that implements `XOR`.
However, if this is a model of the neuron,
this fact is not so much a deficiency
as an observation about neurons.
