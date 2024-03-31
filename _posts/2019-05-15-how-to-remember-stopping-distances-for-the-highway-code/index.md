---
title: How to remember stopping distances for the Highway Code
tags: []
summary: >-
  Formulas to calculate stopping distances for different speeds, using
  thinking and braking distances, instead of memorizing a table.
---

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.2/dist/katex.min.css" crossorigin="anonymous">

<script defer src="https://cdn.jsdelivr.net/npm/katex@0.10.2/dist/katex.min.js" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.10.2/dist/contrib/auto-render.min.js" crossorigin="anonymous" onload="renderMath()"></script>
<script>
  function renderMath() {
    renderMathInElement(document.body,{
              delimiters: [
                  {left: "\\[", right: "\\]", display: true},
                  {left: "$", right: "$", display: false},
              ]
    });
  }
</script>

The Highway Code makes you learn [this complicated table](https://assets.publishing.service.gov.uk/media/559afb11ed915d1595000017/the-highway-code-typical-stopping-distances.pdf) by rote.
But it's significantly less effort to learn the following formulas:

<div>
  \[
  \begin{aligned}
  s(n) &= \text{stopping distance at } 10n \text{ mph} \\
  t(n) &= \text{thinking distance at } 10n \text{ mph} \\
  b(n) &= \text{braking distance at } 10n \text{ mph} \\
  s(n) &= t(n) + b(n) \\
  t(n) &= 3n \text{ meters} \\
  b(n) &= \frac{3n^2 + n}{2} - 1 \text{ meters} \\
  \end{aligned}
  \]
</div>

Working through one example, stopping at 60 mph:

<div>
  \[
  \begin{aligned}
  \text{stopping distance at } 60 \text{ mph} &= s(6) \\
  &= t(6) + b(6) \\
  &= 18 \text{ meters} + 56 \text{ meters} \\
  &= 74 \text{ meters} \\
  t(6)  &= 3 \times 6 = 18 \text{ meters} \\
  b(6)  &= \frac{3 \times 6^2 + 6}{2} - 1 = 56 \text{ meters} \\
  \end{aligned}
  \]
</div>

The answer is off by one meter in some cases.
But the theory test is multiple-choice,
so just pick the answer that's closest.
