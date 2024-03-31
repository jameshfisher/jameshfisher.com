---
title: Auto-summarizing my blog posts
tags:
  - llm
  - machine-learning
summary: >-
  Summarizing my blog posts using Claude Haiku. The benefits of providing business context. The benefits of iterating.
---

I've added a summary to each of my ~600 blog posts,
which [you can see on the homepage](/).
An LLM generates an initial summary, then I edit it til I'm happy.
The prompt I ended up with was:

> You are given an excerpt of a post from jameshfisher.com, Jim Fisher's blog.
> You respond with a TL;DR of 1 or 2 sentences.
> The TL;DR will be added to the post front-matter.
> The TL;DR is shown beneath links to the post.
> You are Jim Fisher, and write using the style and vocabulary of the examples and the post.
> Paraphrase the content directly.
> Never mention 'the post'.
> Be extremely concise, even using sentence fragments.
> Do not duplicate info from the title.
> Only include information from the post.
> Use Markdown for formatting.
> Excellent examples of TL;DRs from other posts:
>
> - TL;DR: A method for calculating a bounding circle around a head, using facial landmarks from BlazeFace. Plus a live demo that you can run on your own face.
> - TL;DR: `const` is a type qualifier in C that makes a variable unassignable, except during initialization.
> - ...

Notice how much _business context_ I gave to the LLM.
I told it where the input came from,
and what will be done with its output,
with some examples of what the site looks like.
Without this specific business context,
the LLM will assume a superposition of all summarization contexts, such as:

- Bob is reading this post. He asked me for a "summary" to help understand the post. I should guess what Bob's difficulties were in understanding, and re-explain those.
- Jane is writing an essay that criticizes the arguments in this post. She asked me for a "summary" that she'll scan for the post's main weak points.
- A search system wants to index this page. It asked me for a "summary" that it will scan for keywords for indexing.

I initially used the word "summary" in the prompt, but replaced it with "TL;DR".
I had found that "summary" output often mentioned "the post", and made meta-comments _about_ the post.
By contrast, the "TL;DR" summary was a direct paraphrasing of the post.
"TL;DR" also helped the model understand that the output was by the same author as the post, rather than an external commentary.

Iterating was important.
I started by running the script on one post at a time,
manually editing the output each time.
Whenever the model's output was particularly bad,
I added my fixed version to the list of examples in the prompt.
This iteration method helps find a minimal set of examples targeted at fixing the model's misunderstandings.

The LLM is [Claude 3 Haiku](https://www.anthropic.com/news/claude-3-haiku).
I spent only 40 cents in total!
Despite its cheapness, Haiku was better than GPT 3.5.
I was particularly impressed by Haiku's lack of bullshitting.
GPT-3.5 loves to go beyond the source material, even when specifically instructed not to.
