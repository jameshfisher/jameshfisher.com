---
title: Array vs. dictionary pagination
tags: []
---

You operate an HTTP API with a resource called `/words`.
It returns a list of words and their definitions, in alphabetical order.
For example:

```
[
  { "word": "aardvark", "definition": "a species of burrowing mammal native to Africa"},
  ...
  { "word": "zymurgy", "definition": "The branch of chemistry dealing with fermentation"}
]
```

Unfortunately this list is very big,
so returning the entire list is expensive for everyone involved.
To fix this, you decide to _paginate_ the API:
a single HTTP response may only return _some_ of the results.
When the client makes an HTTP request, the client must provide some "page" identifier,
which the server will use to determine which items to serve this time around.

There are two fundamental ways to identify the page:
**array indexing** and **dictionary indexing**.
Considering your word list as an array,
each word has a unique numeric index.
Considering your word list as a dictionary,
each word has a unique string identifier.
If your API returns just one word per response.
you could use the word's array index, e.g. `GET /words?word_pos=73462`,
or you could use the word's dictionary index, e.g. `GET /words?word=zygote`.

Both approaches generalize to multi-item responses.
Open a physical dictionary on a random page.
There are two ways to identify that page.
You can use the page number, such as "page 547".
Or you can use the first item on the page, such as "the page beginning with 'zygote'".
Your API could use the page's array index, e.g. `GET /words?page_number=547`,
or your API could use the page's dictionary index, e.g. `GET /words?first_word=zygote`.

There are many ways to determine a page using array indexing,
e.g. `GET /words?first_word_pos=73462&num_words=500`.
There are also many ways to determine a page using dictionary indexing,
e.g. `GET /words?last_word_seen=zygote&stop_at_word=zygomatic`.
The decisions here are not important
compared to the decision between array vs. dictionary indexing.

Which is better, array or dictionary indexing?
It depends!
Here are some tradeoffs:

* Array indexing suffers from shifting page boundaries.
  Insertions and deletions change where the page boundaries fall between words.
  Clients may see duplicated or omitted words due to this.
  This only applies if items in the underlying list can move;
  e.g. immutable or append-only lists do not suffer here.
* Array indexing is easy to parallelize.
  Fire off a request for page 1, page 2, page 3, etc., all at the same time.
  Dictionary indexing usually requires waiting for a response
  before sending the next request,
  because the next page index is determined by the previous response.
* Dictionary indexing assumes an ordering,
  such as lexicographic order on strings.
  If your ordering is more dynamic,
  such the current items on reddit.com/r/all,
  dictionary indexing may result in worse duplicates/omissions than array indexing.
