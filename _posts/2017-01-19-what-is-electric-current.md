---
title: What is electric current?
tags:
  - electricity
  - physics
taggedAt: '2024-03-26'
---

So we saw what "electric charge" means: it measures _net protons_ of an object, i.e. the number of protons minus the number of electrons. We measure it in elementary charges, _e_.

"Electric current" measures _change in charge across a boundary_. If we have a wire, we can define a boundary by drawing a line through the wire:

```
---------------|---------------
       A       |       B
---------------|---------------
```

On each side of this line is an "object"; we can call the two sides A and B. Both sides contain protons and electrons. Let's say at time _t_, it breaks down like this:

```
          #protons  #electrons
========= ========= ==========
Side A    45        67
Side B    78        23
========= ========= ==========
Total     123       90
```

Where we have a number of electrons and a number of protons, we can measure charge. We can measure the charge of each side, and the charge of the entire wire:

```
          #protons  #electrons  charge
========= ========= =========== ======
Side A    45        67          -22e
Side B    78        23           55e
========= ========= ==========  ======
Total     123       90           33e
```

Let's say one second later, things have moved around. A net ten electrons moved from Side A to Side B, and one net proton moved from Side B to Side A. The split now looks like this:

```
          #protons  #electrons  charge
========= ========= =========== ======
Side A    46        57          -11e
Side B    77        33           44e
========= ========= ==========  ======
Total     123       90           33e
```

Some electrons crossed the boundary, and some protons crossed the boundary. We don't know how many; we just know the net amount of each. Each time a proton or electron crosses the boundary, the charge of both sides changes: one is incremented; the other decremented.

The charge of the entire wire stays constant, but the charge of each side has changed. Side A has increased by 11e, and Side B has decreased by 11e. If the wire is a closed system, these two numbers must be the same (electrons and protons cannot disappear elsewhere).

"Electric current" measures this change in charge. Here, we can say the current at the boundary was _11e per second_. But notice that the sign of the current depends on whether we're talking about net movement _from A to B_, or _from B to A_. Here, we can say current from A to B was _-11e per second_, or that current from B to A was _11e per second_.

Unfortunately, again, we don't usually measure current in _net elementary charges per second_. Instead, we measure it in _coulombs per second_. Again, the coulomb is 6.24 * 10^18 e.

"Coulombs per second" is usually shortened to "ampere". So a charge of "1A" from Side A to Side B means that 6.24 * 10^18 net elementary charges are flowing across the boundary each second.
