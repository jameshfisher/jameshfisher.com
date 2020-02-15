---
title: "Modular multiplication"
draft: true
---

How about multiplication?
If you multiply _n_ by 5 on a clock-face,
is there an inverse which undoes this?
Yes: multiply by 5 again!
Try it:  (4&times;5)&times;5 = 4 (mod 12).
Try it again: (9&times;5)&times;5 = <span class="answer">9 (mod 12)</span>.

Why does this work?
Consider that multiplying by 5 twice is multiplying by 25.
Multiplying by 25 is an identity on the 12-hour clock-face:
it does nothing.
Similarly, multiplying by 7 undoes itself, because &times;49 is an identity,
and &times;11 undoes itself, because <span class="answer">&times;121 is an identity</span>.

1, 25, 49, 121 - all these numbers are ≡ 1 (mod 12).
25 = 2&times;12+1, 49 = 4&times;12+1, et cetera.
So, &times;_a_ is the inverse of &times;b if _ab_ ≡ 1.
Since _ab_ ≡ _ba_, these inverses are paired up.

It's coincidence that the inverses are squares for mod-12.
For mod-10, &times;3 and &times;7 are inverses,
because 3&times;7 ≡ 1 (mod 10).


If the modulus is _pq_, what inverses exist?
For example, if _p_ = 7 and _q_ = 5,




i.e. if _ab_ = _kn_ + 1.


What numbers are congruent to 1 in mod-12?
1, 13, 25, 37,



3
