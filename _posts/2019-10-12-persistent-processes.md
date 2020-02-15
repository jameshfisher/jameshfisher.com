---
title: "Persistent processes"
tags: []
draft: true
---

Let's say you want to make an online poker service. 
The service consists of thousands of virtual poker tables. 
It's important that your service is reliable. 
Users will be very unhappy if a virtual table dies, 
taking with it that royal flush.

How do you implement this reliable service? 
A typical solution is that 
you use a database to store the state of each game. 
You might have a table of Tables, 
a table of Players, 
a table of Hands, 
and so on. 
If a web server dies, 
another one can pick up the state of the poker table.

Here's a very different way to do it. 
Each virtual poker table is a process, 
and the process itself is persisted. 
A process being _persistent_
means we are always able to reconstruct its state if it ever dies.

If the process is persistent, 
then the process does not need to deal with persistence itself. 
Its own memory is as safe as anything it sends to a database.

Why use a persistent process 
instead of an ephemeral process on top of persistent storage? 
A major reason is simplicity. 
Much of the complexity of our programs deals with persistence. 
We have to choose a database. 
We have to model our state in the database. 
We have to again model the state in our program. 
We have to write queries to synchronize the two. 
We have to define serialization. 
We have to handle de-serialization errors. 
The program logic is often lost 
in the tedium of transporting state between different parts of the system. 
We have to write schema migrations to deal with program updates.

By contrast, a persistent process can model its state like this:

```js
var deck = shuffle_deck(); 
var players_hands = {};
```

Another reason to just use a persistent process 
is to model program state 
which is not easily modellable using traditional databases. 
For example, how many databases can store a closure for you? 
In the program world, 
we have learned to appreciate functions as values, 
but this is not the case in the database world.

There are multiple ways we might implement persistent processes.