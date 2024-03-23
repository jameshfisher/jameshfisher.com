---
title: The golden rule of PR reviews
tags:
  - programming
hnUrl: 'https://news.ycombinator.com/item?id=38079321'
hnUpvotes: 2
---

You're reviewing Jane's pull request.
It fixes a bug that stops many customers using your software.
Unfortunately, her variable names look strange.
Do you "Approve" her PR, or do you "Request changes"?
Your choice here is between two product variants:

<div>
  <table>
    <thead>
    <tr>
      <th></th>
      <th>Product A</th>
      <th>Product B</th>
    </tr>
    </thead>
    <tbody>
      <tr>
        <th>Usability</th>
        <td>❌ Some customers can't use it</td>
        <td>🎉 Customers can use it</td>
      </tr>
      <tr>
        <th>Variable names</th>
        <td>😐 No changes</td>
        <td>🤔 Some questionable names</td>
      </tr>
    </tbody>
  </table>
</div>

If you had to choose between Product A and Product B,
which would you choose?
The bugfix clearly outweighs the variable name choices.
Therefore, you should approve Jane's pull request.
This is The Golden Rule of PR Review:
**If It's An Improvement, Approve It.**

With the decision framed this way,
no reasonable person would choose Product A.
And yet in my experience, many reviewers would not approve Jane's PR!
This is usually because they're not following the Golden Rule,
but instead following some other incorrect rule.
Let's see some examples.

John hit "Request changes" on this PR, writing:
"I would have written this loop functionally. You can use a `map` function here."
In doing so, John was implicitly answering the question:
**"Is this a change _I_ would have made?"**
But this is the wrong question:
you're different people, and there's more than one way to do it!
Perhaps John was influenced by the possibility that he might be blamed for approving Jane's review.
(And perhaps John was influenced by the unfortunate name "_code_ review",
which wrongly emphasizes "code" as the thing that matters.)
As a response to John's review policy,
Jane will instead request review from team members
that she believes would have implemented the change similarly.

Alex hit "Request changes", writing:
"All PRs should maintain or improve coverage. Please add unit tests before merging."
In doing so, Alex was implicitly answering the question:
**"Is _every aspect_ of this PR an improvement?"**
But this too is a wrong question:
almost everything is an engineering trade-off!
Perhaps Alex was influenced by all those CI metrics (coverage, code size, bundle size, build time),
which wrongly emphasize aspects that are easily measurable,
and which imply that there is no trade-off amongst them.
As a response to Alex's review policy,
Jane will not bother submitting future improvements,
because the cost of submitting a change is too high.

Bob hit "Request changes", writing:
"The page looks bad on mobile. Please use a responsive design."
In doing so, Bob is implicitly answering the question:
**"Is this the ideal implementation?"**
But this is yet another wrong question:
product development is iterative.
Perhaps Bob was influenced by [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow),
an antiquated style in which
"developers create a feature branch and delay merging it to the main trunk branch until the feature is complete."
As a response to Bob's review policy,
changes will pile up on long-running "feature" branches,
leading to [slower software delivery](https://cloud.google.com/architecture/devops/devops-tech-trunk-based-development).

Sometimes people complain about reviewers being "petty tyrants",
drunk on the small amount of power that this task gives them.
I don't think this is the main reason for overly strict reviews.
Rather, I think the primary cause is that reviewers are not taught the Golden Rule:
**If It's An Improvement, Approve It.**
