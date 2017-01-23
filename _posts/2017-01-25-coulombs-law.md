---
title: "What is Coulomb's law?"
---

In previous posts I described _electric charge_ and _electric current_. Electric charge is a thing carried by fundamental particles: electrons and protons. Electrons carry 1e of charge, and protons carry -1e of charge. When we talk of the "charge" of an aggregate object, we're measuring the sum of these charges. When we talk of "current" over a boundary, we mean the net flow of these charges across this boundary. Equivalently, the current across a boundary is the number of electrons crossing one way, minus the number of protons crossing in the same direction.

But why do we talk of charges cancelling out? Why do we talk of _net_ flow? What is it that _causes_ this "current"?

To see, let's set up an imaginary experiment. We have two electrons, `A` and `B`, and we put them in space, with nothing else around. We then find that they start to move away from each other! What's going on here?

By observation, we see that they move away from each other very quickly when they are close, but less quickly when they are far away. It seems the force depends on the distance. When we set the electrons one meter apart, `A` flies from `B` with acceleration of about 253 m/s^2. When set further apart, the acceleration is less strong.

Placing the electrons two meters apart, they experience only half the acceleration; around 126 m/s^2. At four meters apart, half again: around 63 m/s^2. It seems the force follows an _inverse square law_. We draw up this proportion:

```
acc ∝ 1/(dist^2)
```

Here, `acc` is the acceleration of the electron, and `dist` is the distance from the other electron. The units don't matter here, but let's get specific: the acceleration is in m/s^2, and the distance `d` is in meters. Now we can try to find an exact equation with a coefficient:

```
acc = K/(dist^2)
```

What is `K`? This can be found experimentally: set the distance to one meter, and measure the acceleration. We've already done so, and found the acceleration to be 253 m/s^2. Then `K` is 253.

Now we do the same experiments, but with protons. We find the same behavior, but much more sluggish: at one meter apart, the protons accelerate away from each other at about 14 cm/s^2. For protons, `K` is `0.14`; around 1800 times slower.

It turns out we know the mass of electrons and protons. A proton has the mass of about 1800 electrons. The sluggishness is simply proportional to the amount of mass. Because protons are much more massive than electrons, they accelerate much more slowly.

We decide that in both cases - for electrons and protons - the particles must be imparting a "force" on each other. Force is mass times acceleration (`F=ma`). For a fixed force, increasing the mass results in decreased acceleration. We saw that increasing the mass (from an electron's to a proton's) resulted in decreased acceleration, and decided from this that the _force_ was constant. We can substitute `F=ma` into our equation to get:

```
F = (K*mass)/(dist^2)
```

We measure mass in kilograms, and force in "newtons". One newton is "the force required to accelerate one kilogram by 1 m/s every second". We know the mass of an electron to be 9.1 * 10^-31 kilograms, and we can substitute this in to get:

```
F = (2.3 * 10^-28) / (dist^2)
```

For the protons we get the same equation. The same law covers the interaction of electrons among themselves and protons among themselves.

Now it gets interesting. We set up a new experiment, placing an electron and a proton one meter apart. Now they start moving _towards_ each other! While electrons repel each other, and protons repel each other, an electron-proton pair seem to _attract_ each other. You could think of them as male and female.

We see the same accelerations. The electron accelerates towards the proton at about 253 m/s^2, and the proton accelerates towards the electron at about 14 cm/s^2. When electron-proton pairs are involved, it seems the same equation applies, but inverted:

```
F = (-2.3 * 10^-28) / (dist^2)   // Note the negative!
```

Now, with a simple mathematical trick, we can unify these two equations into one. We assign the proton a charge of `1e`, and we assign the electron a charge of `-1e`. The idea here is that multiplying similar signs (`1 * 1`, or `-1 * -1`) results in `1`, but multiplying dissimilar signs (`-1 * 1`) results in `-1`. By multiplying the charges of the particles, we get the correct coefficient to use in the equation. So now we can write:

```
F = (2.3 * 10^-28 * q1 * q2) / (dist^2)
```

Here, `q1` and `q2` are the charges of the particles (either `-1` or `1`). We've just "discovered" a new unit: the _elementary charge_. The proton has 1 elementary charge; the electron has -1. The assignment here is arbitrary; we would see the same forces if we had decided that the electron were positive and the proton negative.

More traditionally, we measure charge in _coulombs_. A coulomb is 6.242 * 10^18 elementary charges. So one elementary charge is 1.602 * 10^-19 coulombs. If we put that into our equation, we get the force between objects with more than one particle, with charges measured in coulombs:

```
F = (8.99*10^9 * q1 * q2) / (dist^2)
```

This equation is "Coulomb's law".
