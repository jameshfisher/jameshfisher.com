---
title: Inline quizzes
tags:
  - blog
---

Stop and think of the last article you read
and recite three facts from it.
No?
That article poured pearls of wisdom onto you,
but they all rolled away.
The article gave, but you could not even summon the effort to take.

Most of what I have learned has been through activity:
exercises at school and university,
problem-solving at work,
writing blog posts at home.
Effective writing encourages "active reading".
Our school textbooks knew how:
every page is a mixture of description and exercises.
The textbook gives a little, and asks a little in return.
It's a reciprocal, healthy relationship.
In contrast,
articles are pornography:
attractive, short-term entertainment,
asking for nothing,
after which you feel empty.

The textbook's paper is passive,
unable to hide its secrets.
But our webpages are active,
and we can demand a little from our readers.
At the start of this post,
I asked you to recall the last article you read.
Did you actually do it?
<span class="answer">No, I don't believe you did!
But I don't blame you.
Nothing stopped you skipping over the question to my conclusion!</span>

That above redacted text is an example of an _inline quiz_.
You'll need to click it to see the answer.
You can drop an inline quiz into most explanatory text.
The following is an example of use,
beginning an explanation of RSA.

> An RSA private key consists of two primes, _p_ and _q_.
> Its corresponding public key, _n_, is _p_ &times; _q_.
> For example, if _p_=5 and _q_=7, then the public key is <span class="answer">5&times;7=35</span>.
> Given the public key _n_, it's hard to compute _p_ and _q_.
> For example, if Alice's public key _n_=143, what are _p_ and _q_?
> <span class="answer">11 and 13, because 11&times;13=143.
> Even with these tiny numbers, this should have taken some thought!</span>
> Alice also chooses a public exponent _e_, e.g. 7,
> then sends (_n_, _e_) to Bob,
> so her full public key is (_n_=143, _e_=7).
> Now Bob wants to send Alice the secret number _m_=42.
> To do so, Bob calculates ciphertext _c_=pow(_m_,_e_), modulo _n_.
> What ciphertext _c_ should Bob send to Alice?
> <span class="answer">81. pow(42,7) = 230539333248, but modulo 143, <i>c</i>=81.</span>
> ...

I believe the inline questions make the explanation more immersive.
Even you didn't answer all the questions yourself,
you still had to participate to reveal the text.
I'm going to try including these inline quizzes in most explanatory text I write on this blog.

These inline quizzes are implemented with:

```html
What are <i>p</i> and <i>q</i>? <span class="answer">11 and 13.</span>
```

```js
document.addEventListener("DOMContentLoaded", () =>
  Array.prototype.forEach.call(
    document.getElementsByClassName("answer"),
    el => el.addEventListener("click", () => el.classList.add("revealed"))));
```

```css
.answer {
  border-color: #8ec58e;
  padding: 0 0.3rem;
  border-radius: 3px; border: 2px solid #8585d0;
}
.answer:not(.revealed) {
  color: rgba(0,0,0,0);
  background-image: url(/assets/question-mark.svg);
  cursor: pointer;
}
```
