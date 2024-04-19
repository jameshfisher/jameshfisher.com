---
title: "What is the Metropolis algorithm?"
tags: []
---

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js" crossorigin="anonymous" onload="renderMath()"></script>
<script>
  function renderMath() {
    renderMathInElement(document.body,{
              delimiters: [
                  {left: "\\[", right: "\\]", display: true},
                  {left: "$", right: "$", display: false},
              ]
    });
  }
</script>

We could estimate Bob's lunch tomorrow
by counting the previous lunches you've seen him eating in the cafeteria:

| Lunch  | Count |
| ------ | ----- |
| Apple  | 2     |
| Banana | 3     |

Now we want to simulate Bob's future lunches.
Assume Bob randomly picks a lunch each morning,
with the relative proportions you've observed.
Then we can simulate Bob's lunch with:

```ts
type Meal = "Apple" | "Banana";

function sample(): Meal {
  return Math.random() < 2 / 5 ? "Apple" : "Banana";
}
```

$\tfrac25$ of the samples will be `Apple`,
and $\tfrac35$ will be `Banana`.

The Metropolis algorithm gives a different way
to get samples with those correct proportions.
It looks like this:

```ts
function nextMeal(currentMeal: Meal): Meal {
  if (currentMeal === "Apple") {
    return "Banana";
  } else {
    if (Math.random() < 2 / 3) {
      return "Apple";
    } else {
      return "Banana";
    }
  }
}

class Chain {
  currentMeal: Meal;

  constructor() {
    this.currentMeal = "Apple";
  }

  sample(): Meal {
    const current = this.currentMeal;
    this.currentMeal = nextMeal(current);
    return current;
  }
}
```

Yes:
this algorithm is more complicated and performs worse!
But the underlying technique can help us sample from more complex distributions.
So let's see what it's doing here, and why it works at all.

Instead of each `sample` call being independent,
the Metropolis algorithm initializes a `Chain`
which maintains a "current meal".
Each call to `sample` sets the next meal.

Here's one run of one chain:

```ts
const chain = new Chain();
for (let i = 0; i < 10; i++) {
  console.log(`Day ${i}: `, chain.sample());
}
```

```
Day 0:  Apple
Day 1:  Banana
Day 2:  Apple
Day 3:  Banana
Day 4:  Banana
Day 5:  Apple
Day 6:  Banana
Day 7:  Banana
Day 8:  Apple
Day 9:  Banana
```

Notice Bob's first meal is always `Apple`.
And if Bob's current meal is `Apple`,
the next meal is always `Banana`,
so Bob's second meal is always `Banana`.
Here are two problems with the Metropolis algorithm:
the first few samples are not in the correct distribution,
samples are dependent on the previous samples.

Let's run $10{,}000$ chains,
and then log the distribution of apples on each day:

```ts
const chains: Chain[] = [];
for (let i = 0; i < 10000; i++) chains.push(new Chain());

for (let i = 0; i < 10; i++) {
  const samples = chains.map((chain) => chain.sample());
  const numApples = samples.filter((sample) => sample === "Apple").length;
  console.log(`Num apples on day ${i}:`, numApples);
}
```

```
Num apples on day 0: 0
Num apples on day 1: 6673
Num apples on day 2: 2202
Num apples on day 3: 5186
Num apples on day 4: 3184
Num apples on day 5: 4563
Num apples on day 6: 3600
Num apples on day 7: 4255
Num apples on day 8: 3846
Num apples on day 9: 4041
```

By day $9$, approximately $4{,}000$ of the $10{,}000$ chains have apples.
This is the correct proportion of $\tfrac25$.
But the number bounces around before reaching this equilibrium.

This is called _convergence_.
To analyze this more mathematically,
we can instead simulate the _distribution_ of chains for the current meal,
and calculate the distribution for the next meal:

```ts
type MealDist = [number, number];
function nextMealDist(currentMealDist: MealDist): MealDist {
  const [numApples, numBananas] = currentMealDist;

  // Consider those eating apples today. What will they eat tomorrow?
  let a2a = numApples * 0; // None will eat apples.
  let a2b = numApples * 1; // All will eat bananas.

  // Then consider those eating bananas today. What will they eat tomorrow?
  let b2a = numBananas * (2 / 3); // Two-thirds will eat apples.
  let b2b = numBananas * (1 / 3); // The rest will eat bananas.

  const numApplesTomorrow = a2a + b2a;
  const numBananasTomorrow = a2b + b2b;

  return [numApplesTomorrow, numBananasTomorrow];
}

// To start, all 10,000 chains are eating apples.
let currentMealDist: MealDist = [10_000, 0];

for (let i = 0; i < 10; i++) {
  currentMealDist = nextMealDist(currentMealDist);
  console.log(`Num apples on day ${i}: ${currentMealDist[0].toFixed(3)}`);
}
```

Again, we see that by day $9$,
around $\tfrac25$ of the chains are eating apples:

```
Num apples on day 0: 0.000
Num apples on day 1: 6666.667
Num apples on day 2: 2222.222
Num apples on day 3: 5185.185
Num apples on day 4: 3209.877
Num apples on day 5: 4526.749
Num apples on day 6: 3648.834
Num apples on day 7: 4234.111
Num apples on day 8: 3843.926
Num apples on day 9: 4104.049
```

Actually, we don't need to start the distribution at `[10_000, 0]`.
We can just start with `[1, 0]`.
This is then a probability distribution,
because the sum of the two numbers is $1$.
Then the output is the probability distribution of the each meal:

```ts
let currentMealDist: MealDist = [1, 0];

for (let i = 0; i < 10; i++) {
  currentMealDist = nextMealDist(currentMealDist);
  console.log(
    `Probability of apples on day ${i}: ${currentMealDist[0].toFixed(3)}`,
  );
}
```

```
Probability of apples on day 0: 0.000
Probability of apples on day 1: 0.667
Probability of apples on day 2: 0.222
Probability of apples on day 3: 0.519
Probability of apples on day 4: 0.321
Probability of apples on day 5: 0.453
Probability of apples on day 6: 0.365
Probability of apples on day 7: 0.423
Probability of apples on day 8: 0.384
Probability of apples on day 9: 0.410
```

After 93 days, the probability of apples reaches a stable state,
at least in 64-bit floating-point.
And that stable state is the correct distribution:
$\tfrac25$ apple and $\tfrac35$ banana.

Because the first samples are not in the correct distribution,
it's common to discard them.
This is called _burn-in_.

The precise claim of the Metroplis algorithm is that,
the correct distribution of is a stable distribution.
To prove this,
evaluate `nextMealDist([2/5, 3/5])`,
and you'll see that it's `[2/5, 3/5]`.
How many will eat `Apple` for the next meal?
None of the $\tfrac25$ currently eating apples will eat apples tomorrow.
Of the $\tfrac35$ currently eating bananas,
$\tfrac23$ will eat apples tomorrow.
for a total of $\tfrac35 \times \tfrac23 = \tfrac25$.
And so the probability of $\tfrac25$ is maintained.

The example algorithm above was hard-coded
to generate the stable state $\tfrac25$ and $\tfrac35$.
But time passes,
after which we've counted $3$ apple meals, and $6$ banana meals.
Let's update the algorithm to work with any counts:

```ts
// Our observed counts.
// We want to generate more meals in this proportion.
const A = 3; // Count of apples
const B = 6; // Count of bananas

function nextMeal(currentMeal: Meal): Meal {
  if (currentMeal === "Apple") {
    return "Banana";
  } else {
    if (Math.random() < A / B) {
      return "Apple";
    } else {
      return "Banana";
    }
  }
}
```

Let's show that, for any counts $A$ and $B$,
this converges to the correct probability distribution,
$\tfrac{A}{A+B}$ and $\tfrac{B}{A+B}$.

<p>
  \[
  \begin{aligned}
    \texttt{numApples} &= \tfrac{A}{A+B} \\
    \texttt{numBananas} &= \tfrac{B}{A+B} \\
    \\
    \texttt{a2a} &= 0 \\
    \texttt{b2a} &= \texttt{numBananas} \times \tfrac{A}{B} \\
                 &= \tfrac{B}{A+B} \times \tfrac{A}{B} \\
                 &= \tfrac{BA}{(A+B)B} \\
                 &= \tfrac{A}{A+B} \\
    \\
    \texttt{numApplesTomorrow} &= \texttt{a2a} + \texttt{b2a} \\
                               &= 0 + \tfrac{A}{A+B} \\
                               &= \tfrac{A}{A+B} \\
  \end{aligned}
  \]
</p>

So far, we've only observed Bob eating `Apple` or `Banana`.
But then one day Bob's in the cafeteria eating `Chips`!
We need to handle more states.
We can record our observed frequencies with a function `f`:

```ts
function f(meal: Meal): number {
  return {
    Apple: 3,
    Banana: 6,
    Chips: 1,
  }[meal];
}
```

The true Metropolis `sample` algorithm actually starts by _proposing_ a new meal.
Then it decides whether to change to that meal,
or eat the current meal again.
Here's a proposal function
that picks from possible meals with uniform probability:

```ts
function proposeMeal(): Meal {
  const meals: Meal[] = ["Apple", "Banana", "Chips"];
  const i = Math.floor(Math.random() * 3);
  return meals[i]!;
}
```

Then the true `nextMeal` function looks like:

```ts
function nextMeal(currentMeal: Meal): Meal {
  const proposedMeal = proposeMeal();

  const proposedMealFreq = f(proposedMeal);
  const currentMealFreq = f(currentMeal);

  // The key line!
  const transitionProb = Math.min(proposedMealFreq / currentMealFreq);

  if (Math.random() < transitionProb) {
    return proposedMeal;
  } else {
    return currentMeal;
  }
}
```

This works, but _why_ does it work?
The key point in the proof is that,
for any two states $A$ and $B$ in the steady state,
the probability mass transferred from $A$ to $B$ is
the same as the probability mass transferred from $B$ to $A$.

Let's prove that.
If we're in steady state,
every state $S$ has mass proportional to $f(S)$.
For simplicity, just say the mass at $S$ is $f(S)$.
Without loss of generality, let's assume $f(A) \leq f(B)$.

How much mass is transferred from state $A$ to $B$?
With our uniform proposal function,
$\tfrac1N^{th}$ of the mass at $A$ is proposed to move to $B$.
The probability of accepting this proposal is $\text{min}(1,\tfrac{f(B)}{f(A)})$.
Since $f(A) \leq f(B)$, this is $1$, i.e. the proposal is always accepted.
So the mass moving from $A$ to $B$ is $\tfrac{f(A)}{N}$.

How much mass is transferred from state $B$ to $A$?
Again, $\tfrac1N^{th}$ of the mass at $B$ is proposed to move to $A$.
The probability of accepting this proposal is $\text{min}(1,\tfrac{f(A)}{f(B)})$.
Since $f(A) \leq f(B)$, this is $\tfrac{f(A)}{f(B)}$.
So the mass moving from $B$ to $A$ is $\tfrac{f(B)}{N} \times \tfrac{f(A)}{f(B)} = \tfrac{f(A)}{N}$.

The same amount of mass, $\tfrac{f(A)}{N}$, is transferred from $A$ to $B$ as from $B$ to $A$.
This condition is called _detailed balance_,
and it implies that we are in a steady state.

The `proposeMeal` function above just picks a meal uniformly at random.
But we want to propose meals in proportion to their frequency.
The only requirement is that the proposal function
is _symmetric_: the probability of proposing $A$ from $B$
is the same as the probability of proposing $B$ from $A.
(Try to prove that this results in detailed balance.)

So far, we've been using discrete states.
But the Metropolis algorithm is most useful for continuous distributions.
Here's a weird distribution over the real numbers:

```ts
function sinFreq(x: number): number {
  if (0 < x && x < Math.PI * 2) {
    return Math.abs(Math.sin(x));
  }
  return 0;
}
```

We can sample from this distribution
using the Metropolis algorithm in its full generality:

```ts
class Chain<State> {
  constructor(
    // Initial state
    private state: State,

    // Function to calculate the frequency of any state
    private f: (state: State) => number,

    // Function to propose a new state - must be symmetric
    private propose: (state: State) => State,

    // Number of initial samples to discard
    burnIn = 1000,
  ) {
    for (let i = 0; i < burnIn; i++) {
      this.sample();
    }
  }

  sample(): State {
    const current = this.state;
    const proposed = this.propose(current);
    const prob = Math.min(1, this.f(proposed) / this.f(current));
    const next = Math.random() < prob ? proposed : current;
    this.state = next;
    return current;
  }
}

function propose(currentState: number): number {
  return currentState + (Math.random() - 0.5);
}

const chain = new Chain(0.5, sinFreq, propose);

const numSamples = 1000000;

const buckets: Record<number, number> = {};
for (let i = 0; i < numSamples; i++) {
  const sample = chain.sample();
  const bucket = Math.floor(sample * 10);
  buckets[bucket] = (buckets[bucket] ?? 0) + 1;
}

for (const bucket in buckets) {
  buckets[bucket] /= numSamples;
}

for (const bucket in buckets) {
  const len = Math.floor(buckets[bucket]! * 1000);
  console.log("#".repeat(len));
}
```

Sure enough,
here's that weird lumpy distribution:

```
#
###
######
########
##########
#############
##############
################
##################
####################
######################
#######################
########################
########################
#########################
#########################
#########################
#########################
########################
#######################
######################
#####################
###################
##################
################
##############
############
#########
#######
####
##

##
#####
#######
#########
###########
##############
###############
#################
###################
#####################
######################
#######################
########################
########################
#########################
########################
########################
########################
#######################
######################
#####################
###################
#################
################
##############
############
##########
#######
#####
###
```