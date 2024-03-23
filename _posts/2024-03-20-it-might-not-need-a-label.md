---
title: It might not need a label
tags:
  - programming
  - design
hnUrl: 'https://news.ycombinator.com/item?id=39766709'
hnUpvotes: 3
---

One hallmark of "programmer UI" is <em>using labels for everything</em>.
Here I show why this is often a design mistake, with some examples.
I suggest how to identify over-labelling, and how to fix it.
Finally I suggest why programmers are biased towards this design mistake.

Recently I built this "card" component showing the details of an event:

<div style="max-width: 25em; padding: 1em; background: #f5f5f5; border-radius: 0.5em; font-size: 0.8em; display: flex; flex-direction: column; gap: 1em">
  <div style="display: flex; justify-content: space-between">
    <div>
      <div><strong>Date:</strong> 11<sup>th</sup> March</div>
      <div><strong>Time:</strong> 17:10</div>
    </div>
    <div style="text-align: right">
      <div><strong>Venue:</strong> Down Lane Park</div>
      <div><strong>Address:</strong> London, N17 9AU</div>
    </div>
  </div>
  <div>
    <div><strong>Description</strong></div>
    <div>Please arrive ten minutes before the game starts. Wear a dark top; bibs are provided.</div>
  </div>
</div>

Note the labels **Date**, **Description**, et cetera.
These indicate my "programmer design".
Now here's an alternative design, which just removes the labels:

<div style="max-width: 25em; padding: 1em; background: #f5f5f5; border-radius: 0.5em; font-size: 0.8em; display: flex; flex-direction: column; gap: 1em">
  <div style="display: flex; justify-content: space-between">
    <div>
      <div><strong>11<sup>th</sup> March</strong></div>
      <div>17:10</div>
    </div>
    <div style="text-align: right">
      <div><strong>Down Lane Park</strong></div>
      <div>London, N17 9AU</div>
    </div>
  </div>
  <div>
    <div>Please arrive ten minutes before the game starts. Wear a dark top; bibs are provided.</div>
  </div>
</div>

This re-design shows that the labels were unnecessary.
We can see that the text "11<sup>th</sup> March" is a date.
And the bottom text does not need to be labelled "Description", because what else could it be?

Worse, the labels were actively distracting.
One argument for labels is to make text _scannable_,
so users can quickly find what they're looking for in the UI.
But users are not scanning for the text "Date",
they're scanning for _something that looks like a date_.
And to find the event details, you don't hunt for text like "Description";
you look for _something that looks like a paragraph_.

Why did I add these labels?
One reason is that I was translating JSON data like this:

```json
{
  "date": "2024-03-11",
  "time": "17:10",
  "venue": "Down Lane Park",
  "address": "London, N17 9AU",
  "description": "Please arrive ..."
}
```

Our code uses labels everywhere.
That JSON object could instead be represented as an array of five strings,
but that would be a horrible data structure!
It's tempting to apply this software design principle to UI, but it often doesn't work.

To be clear, you shouldn't remove all your labels.
Just identify which values are **self-labelling**.
For example, the event date was self-labelling,
because the user knows:

1. That this box represents an event
2. That events have dates
3. What dates look like

Unless you have all three, you should use a label.
