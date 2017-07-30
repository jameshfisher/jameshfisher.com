---
title: "Pattern jokes via WordNet/NLTK"
justification: "It's Sophie's birthday. This is a silly present"
---

Facebook "Messenger Platform" lets you make bots which can talk on Facebook Messenger. I want to make a bot which makes "pattern jokes": it listens to the conversation, and occasionally responds with a "pattern joke" based on something someone said. Here's an example of a "pattern joke":

> Jim: That's so predictable.
>
> Sophie: predicchair
>
> Sophie: predicwardrobe

The joke here is to see the word "table" in the word "predictable", and replace it with another piece of furniture like "chair" or "wardrobe". In general, a pattern joke works on a word *W*, decomposes it into *a + w + z* where *w* is another word, then finds a category *C* in which *w* belongs, then finds another *w' != w* in *C*, and finally responds with *a + w' + z*. Here are some more examples:

* "predictable -> "pblueictable" ("red" and "blue" are colors)
* "category" -> "dogegory" ("cat" and "dog" are pet animals)
* "soldering" -> "shistoryering" ("older" and "history" are words to describe time)

The whole process is mechanical enough that we can code it up as a chatbot. There are two parts to this: the pattern-joke logic described above, for which we'll use WordNet and NLTK; and the chatbot interface, for which we'll use the Facebook Messenger Platform.

For the pattern-joke logic, the important semantic steps are provided by [WordNet](https://wordnet.princeton.edu/), which has a Python interface via NLTK. The important features of WordNet are _synsets_, which organize words into synonyms, and _hypernym_/_hyponym_ relations, which give us the categorical relationships we want.

A WordNet "synset" is basically a _concept_, as distinct from the words which we humans use to refer to these concepts. The word "table" is overloaded, and the dictionary gives many definitions. We can use WordNet to list the definitions of "table":

```
$ python
>>> from nltk.corpus import wordnet as wn
>>> for synset in wn.synsets("table"):
...     print(synset.definition())
...
a set of data arranged in rows and columns
a piece of furniture having a smooth flat top that is usually supported by one or more vertical legs
a piece of furniture with tableware for a meal laid out on it
flat tableland with steep edges
a company of people assembled at a table for a meal or game
food or meals in general
hold back to a later time
arrange or enter in tabular form
```

The definition of "table" we were using earlier is "a piece of furniture having a smooth flat top that is usually supported by one or more vertical legs". WordNet refers to this synset as `table.n.01`.

More importantly, WordNet gives us the _hypernym_/_hyponym_ relation between synsets. A hypernym of a synset is another synset which is more general. There is only one listed hypernym of `table.n.01`, which is

```
>>> for hypernym in wn.synsets("table")[1].hypernyms():
...     print(hypernym.name(), hypernym.definition())
...
(u'furniture.n.01', u'furnishings that make a room or other area ready for occupancy')
```

The synset `furniture.n.01` is the category we were using earlier when replacing "table" with "chair". To get to "chair", we use `.holonyms()`. This is the inverse concept of "hypernym": If A is a hypernym of B, then B is a holonym of A. There are lots of holonyms of "furniture". Look around you to find some, or see WordNet's list:

```
>>> furniture = wn.synsets("table")[1].hypernyms()[0]
>>> for other_furniture in furniture.hyponyms():
...     print(other_furniture.name(), other_furniture.definition())
...
(u'baby_bed.n.01', u'a small bed for babies; enclosed by sides to prevent the baby from falling')
(u'bedroom_furniture.n.01', u'furniture intended for use in a bedroom')
(u'bedstead.n.01', u'the framework of a bed')
(u'bookcase.n.01', u'a piece of furniture with shelves for storing books')
(u'buffet.n.01', u'a piece of furniture that stands at the side of a dining room; has shelves and drawers')
(u'cabinet.n.01', u'a piece of furniture resembling a cupboard with doors and shelves and drawers; for storage or display')
(u'chest_of_drawers.n.01', u'furniture with drawers for keeping clothes')
(u'dining-room_furniture.n.01', u'furniture intended for use in a dining room')
(u'etagere.n.01', u'a piece of furniture with open shelves for displaying small ornaments')
(u'fitment.n.01', u'any of the items furnishing or equipping a room (especially built-in furniture)')
(u'hallstand.n.01', u'a piece of furniture where coats and hats and umbrellas can be hung; usually has a mirror')
(u'lamp.n.02', u'a piece of furniture holding one or more electric light bulbs')
(u'lawn_furniture.n.01', u'furniture intended for use on a lawn or in a garden')
(u'nest.n.05', u'furniture pieces made to fit close together')
(u'office_furniture.n.01', u'furniture intended for use in an office')
(u'seat.n.03', u'furniture that is designed for sitting on')
(u'sectional.n.01', u'a piece of furniture made up of sections that can be arranged individually or together')
(u'sheraton.n.01', u'a furniture style that originated in England around 1800; simple in design with straight lines and classical ornamentation')
(u'sleeper.n.07', u'a piece of furniture that can be opened up into a bed')
(u'table.n.02', u'a piece of furniture having a smooth flat top that is usually supported by one or more vertical legs')
(u'table.n.03', u'a piece of furniture with tableware for a meal laid out on it')
(u'wall_unit.n.01', u'a piece of furniture having several units that stands against one wall of a room')
(u'wardrobe.n.01', u'a tall piece of furniture that provides storage space for clothes; has a door and rails or hooks for hanging clothes')
(u'washstand.n.01', u"furniture consisting of a table or stand to hold a basin and pitcher of water for washing: `wash-hand stand' is a British term")
```

At index 15 we have `seat.n.03`, "furniture that is designed for sitting on". We still need to get the word "chair" out of this. To do so, we need WordNet's concept of "lemmas". A lemma is a word with a particular meaning. Here are all the lemmas of `seat.n.03`:

```
>>> seat = furniture.hyponyms()[15]
>>> for lemma in seat.lemmas():
...     print(lemma.name())
...
seat
```

Hmm, where is "chair"? It turns out "chair" is not listed as a _direct_ hyponym of "furniture". Instead it goes indirectly via the synset `chair.n.01`:

```
>>> wn.synsets("chair")[0]
Synset('chair.n.01')
>>> wn.synsets("chair")[0].definition()
u'a seat for one person, with a support for the back'
>>> wn.synsets("chair")[0].hypernyms()[0]
Synset('seat.n.03')
>>> wn.synsets("chair")[0].hypernyms()[0].hypernyms()[0]
Synset('furniture.n.01')
>>> seat.hyponyms()
[Synset('bench.n.01'), Synset('bench.n.07'), Synset('box.n.08'), Synset('box_seat.n.01'), Synset('chair.n.01'), Synset('ottoman.n.03'), Synset('sofa.n.01'), Synset('stool.n.01'), Synset('toilet_seat.n.01')]
```

So, we can get "chair" from "table" via the following incantation:

```
>>> wn.synsets("table")[1].hypernyms()[0].hyponyms()[15].hyponyms()[4].lemmas()[0].name()
u'chair'
```
