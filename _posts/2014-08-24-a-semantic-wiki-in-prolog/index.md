---
title: A semantic wiki in Prolog
original_url: "https://medium.com/@MrJamesFisher/a-semantic-wiki-in-prolog-cf24fd53a4a"
tags:
  - prolog
  - semantic-web
  - wiki
  - programming
  - knowledge-management
taggedAt: "2024-03-26"
summary: >-
  Prolog as a better alternative to "semantic triples" and SPARQL.
---

Semantic wikis allow pages to make their facts ‘machine-readable.’
These machine-readable facts are encoded as ‘tagged’ wiki links.
Let’s say you are writing a page called ‘The Roman Empire’, and you write

```
... the capital city was [[Constantinople]] ...
```

Human readers will understand this to mean that
‘the capital city of the Roman Empire was Constantinople’.
However, it is not easy for a machine to understand this fact when written in the above form.
What we need to do is *encode* this fact.

The semantic web community tells us we can encode all facts as ‘triples’.
A triple is just a sentence of the form ‘subject predicate object’.
In the above example, the subject is ‘The Roman Empire’,
the predicate is ‘had the capital city’, and the object is ‘Constantinople’.
Once you have recorded lots of triples in this way, you have a knowledge database.
You can then write interesting queries,
such as ‘What was the capital city of The Roman Empire?’,
or ‘What was Constantinople the capital city of?’

A semantic wiki allows you to encode such a triple by tagging the link:

```
... the capital city was [[had_capital::Constantinople]] ...
```

Using this notation does two things:
it generates a hyper-link just as before,
but additionally silently generates a triple.
The subject of the generated triple
is the current page name ‘The Roman Empire’,
the predicate is ‘had_capital’,
and the object is ‘Constantinople’.

A wiki with facts encoded in this way
yields a lot of triples which we can ask queries about.
Further on in the wiki article,
you might also encode the fact that
‘Rome was the capital city of The Roman Empire’,
and ‘Ravenna was the capital city of The Roman Empire’.
You could then ask the database,
‘What was the capital of the Roman Empire?’,
and you would receive three answers:
‘Rome’, ‘Constantinople’, and ‘Ravenna’.

# Beyond the triple

Did the previous example seem odd to you?
How can the Roman Empire have had *three* capital cities?
As you might have guessed,
this is because the capital city moved around.
It started in Rome,
but was moved to Constantinople by Constantine in the 330s;
it then moved to Milan and to Ravenna.

This ‘temporal’ information gets lost in our current encoding.
Can we encode such temporal information in our ‘triples’
so that we can ask questions like,
‘What was the capital of the Roman Empire in 350 AD?’
Unfortunately, such temporal information cannot be easily encoded in a ‘triple’.
One way would be to change the predicate to ‘had_capital_in_350_AD’,
but then the predicate is not machine-readable.
Another way would be to change the subject to ‘The Roman Empire in 350 AD’,
but this suffers from the same problem.

It is more natural to encode this ‘timestamped’ fact
as a ‘quadruple’ like ‘subject predicate object timestamp’,
or even as a quintuple like ‘subject predicate object from_timestamp to_timestamp’.
As well as being more natural,
these encodings are much more ‘queryable’:
we can ask ‘What was the capital of the Roman Empire in 350 AD?’
and have the query engine use only the facts that were true in 350 AD.

There are also kinds of fact that require *less* than a triple to encode.
For example, how do we encode the fact ‘Michael Jackson is dead’?
The subject is certainly ‘Michael Jackson’,
and the natural predicate seems to be ‘is dead’.
But what is the ‘object’?
The problem is that ‘being dead’ is an intransitive property;
there is no object.
Another triple representation might use ‘is’ as the predicate,
and ‘dead’ as the object,
but this strikes me as quite unnatural.
Another representation might be ‘Michael Jackson died_in 2009’,
but this is only possible where we have such information.

In short, the ‘subject predicate object’ schema
can’t capture all the kinds of facts that we might want to represent.
The universe of facts unfortunately has facts of many different arities.
We must generalize from these 3-tuples to *N*-tuples.

Notice also that most triples can be encoded in two ways:
we can write ‘The Roman Empire had as its capital city Ravenna’,
or we can write ‘Ravenna was the capital city of The Roman Empire’.
Each form is natural in different contexts.
The triple does not provide any associated semantics
that lets a query engine deduce that
*had_capital* is the inverse of *was_capital_of*;
we must either avoid one of these,
or the query writer must be aware of both when writing a query.

# Facts are more general than triples

Anyone who has played with Prolog
would recognize a ‘triple’
as being naturally encoded as a ‘binary predicate.’
In Prolog, we can write predicates with any number of parameters, such as:

```prolog
had_capital('The Roman Empire', 'Constantinople').
capital_from_until('The Roman Empire', 'Ravenna', 402, 476).
is_dead('Michael Jackson').
```

Why can’t we write such facts in our wiki syntax?
A starting point would be to use *named parameters* in our predicates, e.g.

```prolog
capital_from_until(
 state='The Roman Empire',
 capital_city='Ravenna',
 from=402, to=476).
```

Then on the *Ravenna* page,
we might write something like:

```
{capital_from_until} {capital_city=Ravenna} was the capital of {state=[[the Roman Empire]]} from {from=402} until {to=476}.{/capital_from_until}
```

This would generate a Prolog predicate,
and evaluate to the normal wiki-text:

```
Ravenna was the capital of [[the Roman Empire]] from 402 until 476.
```

There may well be a cleaner syntax,
but this isn’t the issue here.
The point is that,
just as a ‘semantic wiki’ page evaluates to a set of *triples*
and some presentational HTML,
my suggested generalized syntax above evaluates to a set of *Prolog facts*,
and some presentational HTML.

# Prolog is the query engine

In Prolog, we define the semantics for our facts using *rules*.
A simple rule might be:

```prolog
had_capital(State, Capital) :-
 capital_from_until(State, Capital, _, _).
```

This rule merely says that
if we know that a state had a particular capital
_during some given particular time period_,
we know that that state had that particular capital at some point in the past.
Such a rule allows us to throw away information
that we are not interested in for a particular problem.

Another rule might tell us that two predicates are opposites:

```prolog
was_capital_of(Capital, State) :- had_capital(State, Capital).
```

Given a bunch of facts, and optionally some rules too, we can write queries.
This query asks which state Ravenna was a capital of:

```prolog
was_capital_of('Ravenna', X).
```

to which we should receive the answer:

```prolog
X='The Roman Empire'.
```

(The semantic web guys seem to have
all kinds of crazy query languages for their triples, e.g. ‘SPARQL’.
As far as I know, SPARQL is more complicated and less expressive than Prolog.
It might be similar to Datalog in expressivity.)

# Let the wiki define Prolog rules, too

The triple/SPARQL enterprise seems to enforce
a very clear separation between *facts* and *rules*.
The wiki authors are exclusively responsible
for defining passive data in the form of billions of triples.
The data analyst is exclusively responsible
for interpreting that data by writing queries in SPARQL.
The queries are always written *outside the wiki*.

In Prolog, there is less contrast.
A Prolog *fact* is actually just a particular kind of Prolog *rule*.
This fact:

```prolog
had_capital('The Roman Empire', 'Constantinople').
```

is really just syntactic sugar for this rule:

```prolog
had_capital('The Roman Empire', 'Constantinople') :- true.
```

What I have suggested so far is a wiki system that lets users define facts,
and a query system which is simply written in Prolog.
But what if we allowed the wiki to define those rules, too?
A trivial way to allow this would be
to define rules in invisible comments in the wiki page.

The concepts that are are being used by the wiki — ‘states’, ‘capitals’, et cetera —
are specific to that wiki.
A ‘chemistry’ wiki you will have highly technical facts about chemicals;
the wiki must define what those facts mean by defining rules that use them.
An enterprise wiki about a software product
will have domain-specific facts about systems, subsystems, bugs, tasks, and so on;
the wiki must define the rules for how to query them.

As another example, let’s say your enterprise wiki tracks issues as pages in the wiki.
Then the wiki can define facts like ‘this issue depends on this other issue’.
Part of the semantics of ‘dependencies’ is that dependencies are *transitive*;
if *A* depends on *B* and *B* depends on *C*,
then *A* depends on *C*.
The wiki could define a rule which encodes this,
allowing users to easily query for
the set of all issues which a particular issue blocks,
or for the set of all issues which are blocked by a particular issue.

# Display-time querying

Here’s where it gets really interesting.
If the wiki is allowed to define facts and rules,
then why not allow the wiki to also execute *queries* over those facts and rules?
What I mean is:
at any point in the rendering of a page,
a Prolog query can be executed,
and the results of that query can then be used
to render the next portion of the page.

For example, the page on The Roman Empire
might have a table of capital cities.
Instead of writing this table out by hand,
it could instead query for all known capital cities of the Roman Empire,
loop through the results,
and print them out as table rows.

As another example, Wikipedia has a ‘categorization’ feature.
Pages declare a list of categories to which they belong.
Each category then has its own page which shows all pages that are in that category.
Categories themselves can be subcategories of larger categories,
which defines a transitive inclusion rule.
The categorization logic is a hard-coded feature of MediaWiki.
But using Prolog, the concept of ‘category’ and its associated semantics
could be defined entirely within the particular wiki.

Another example:
the enterprise wiki that defines ‘issues’ with ‘depends on’ relationships
could print out all its transitive dependents and dependencies
when displaying any particular issue.

As usual, I haven’t actually *implemented* anything.
But I think the idea is interesting enough,
and the implementation details are clear enough,
that I would like the pursue it if anyone else is interested in it.
Let me know if someone else has already done the same thing.
Or let me know why it wouldn’t work, or why it’s a stupid idea!
