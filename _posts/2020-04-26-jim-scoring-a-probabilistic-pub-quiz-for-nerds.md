---
title: "Jim scoring: a probabilistic pub quiz for nerds"
tags: ["mathematics", "betting"]
---

The typical pub quiz has a "true or false" round.
You know the game:
the quizmaster tries to trick you
with statements that are often believed to be true,
but which are in fact false.
In this game,
you're rewarded for accuracy, 
but not for your confidence --
and that's unfortunate, because 
drunk people just _love_ high-stakes gambling!
In this post,
I show the "Jim scoring" system,
a simple way to inject risk and alcoholic overconfidence 
into your "true or false" quiz round.

As a refresher,
here's a traditional "true or false" question:

<div class="question-box">
  <div class="question">Sydney is the capital of Australia. True or false?</div>
  <div>
    <div><input type="radio" name="ans_traditional" id="ans_traditional_1" value="true" /><label for="ans_traditional_1">True</label><span class="score score-wrong">Wrong; it's Canberra. 0 pts.</span></div>
    <div><input type="radio" name="ans_traditional" id="ans_traditional_2" value="false" /><label for="ans_traditional_2">False</label><span class="score score-right">Right! 1 pt.</span></div>
  </div>
</div>

If you answer right, you get a point.
If you answer wrong, you get no points.
If you don't know the answer,
just have a punt,
because you can't lose anything.
But now consider the following variant,
and consider it carefully:

<div class="question-box">
  <div class="question">Philadelphia is the capital of Pennsylvania. How likely is this?</div>
  <div>
    <div><input type="radio" name="ans_prob" id="ans_prob_5" value="80-100" /><label for="ans_prob_5">80-100% likely</label><span class="score score-vwrong">It's Harrisburg! -7 pts.</span></div>
    <div><input type="radio" name="ans_prob" id="ans_prob_4" value="60-80" /><label for="ans_prob_4">60-80% likely</label><span class="score score-wrong">It's Harrisburg. -3 pts. </span></div>
    <div><input type="radio" name="ans_prob" id="ans_prob_3" value="40-60" /><label for="ans_prob_3">40-60% likely</label><span class="score score-neutral">It's Harrisburg. 0 pts.</span></div>
    <div><input type="radio" name="ans_prob" id="ans_prob_2" value="2-40" /><label for="ans_prob_2">20-40% likely</label><span class="score score-right">Right. 2 pts.</span></div>
    <div><input type="radio" name="ans_prob" id="ans_prob_1" value="0-20" /><label for="ans_prob_1">0-20% likely</label><span class="score score-vright">Such confidence! 3 pts.</span></div>
  </div>
</div>

Instead of asking for a black-and-white answer,
this asks you for your level of confidence.
Now, you're rewarded based on two things:
your correctness, and your level of confidence.
The scoring system is as follows:

<table class="scoring-table">
  <thead>
    <tr>
      <th></th>
      <th>True</th>
      <th>False</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>80-100% likely</th>
      <td><span class="score score-vright">3 pts</span></td>
      <td><span class="score score-vwrong">-7 pts</span></td>
    </tr>
    <tr>
      <th>60-80% likely</th>
      <td><span class="score score-right">2 pts</span></td>
      <td><span class="score score-wrong">-3 pts</span></td>
    </tr>
    <tr>
      <th>40-60% likely</th>
      <td><span class="score score-neutral">0 pts</span></td>
      <td><span class="score score-neutral">0 pts</span></td>
    </tr>
    <tr>
      <th>20-40% likely</th>
      <td><span class="score score-wrong">-3 pts</span></td>
      <td><span class="score score-right">2 pts</span></td>
    </tr>
    <tr>
      <th>0-20% likely</th>
      <td><span class="score score-vwrong">-7 pts</span></td>
      <td><span class="score score-vright">3 pts</span></td>
    </tr>
  </tbody>
</table>
<style>
  .scoring-table tr > *:nth-child(2) { text-align: right; }
  .scoring-table tr > *:nth-child(3) { text-align: right; }
</style>

The Jim scoring system sure looks odd at first glance!
There's a "magic sequence" of numbers: 3, 2, 0, -3, -7.
Stare at it for a few seconds, and you might spot a pattern.
But why is this a "good" scoring system?

It turns out the Jim scoring system has a very nice property:
_the optimal strategy is to choose the option that matches your true belief_.
You can't "cheat" by pretending to be more confident than you truly are
in order to gain points.
To see why this scoring system rewards true reporting,
think about your _expected score_ given your belief.
I'll explain with another example:

<div class="question-box">
  <div class="question">Approximately ⅓ of human bones are in the feet. How likely is this?</div>
</div>

Perhaps you've heard something like this before --
but was it ⅓ of bones, or ¼, or ½ ..?
Was it the feet, or one foot, or the hands ..?
Let's say you think it's 70% likely that "Approximately ⅓ of human bones are in the feet".
Then your _expected score_ for picking "60-80% likely" is calculated as
(70% × <span class="score score-right">2 pts</span>) + 
(30% × <span class="score score-wrong">-3 pts</span>).
This expected score comes out at 0.5,
which is higher than your expected score for any other answer.
Here's a plot of your expected score, 
given your belief and your answer:

<img style="border: 0" src="{% link /assets/2020-04-26/chart.svg %}" alt="expected score vs. belief" />

Notice that the "0-20% likely answer" is optimal 
precisely in the range 0-20%, and so on.
Now you've had time to think about it,
and you know the theory,
you can have a go:

<div class="question-box">
  <div class="question">Approximately ⅓ of human bones are in the feet. How likely is this?</div>
  <div>
    <div><input type="radio" name="ans_prob" id="ans_prob_5" value="80-100" /><label for="ans_prob_5">80-100% likely</label><span class="score score-vwrong">Overconfident!! -7 pts.</span></div>
    <div><input type="radio" name="ans_prob" id="ans_prob_4" value="60-80" /><label for="ans_prob_4">60-80% likely</label><span class="score score-wrong">No, it's false. -3 pts. </span></div>
    <div><input type="radio" name="ans_prob" id="ans_prob_3" value="40-60" /><label for="ans_prob_3">40-60% likely</label><span class="score score-neutral">It's false. 0 pts.</span></div>
    <div><input type="radio" name="ans_prob" id="ans_prob_2" value="2-40" /><label for="ans_prob_2">20-40% likely</label><span class="score score-right">Yep, it's false. 2 pts.</span></div>
    <div><input type="radio" name="ans_prob" id="ans_prob_1" value="0-20" /><label for="ans_prob_1">0-20% likely</label><span class="score score-vright">Such confidence! 3 pts.</span></div>
  </div>
</div>

The Jim scoring system is discrete:
it asks you to put your belief into one of five categories.
But if you're a real nerd,
you can use a continuous scoring system.
Here is one such system:

* You enter an answer _a_ between 0 and 1 (that is, "0% likely" to "100% likely").
* If the statement is true, your score is log(_a_).
* If the statement is false, your score is log(1 - _a_).

If you want to see why this works,
consider that your believed probability is _p_.
Then your expected score is _p_×log(_a_) + (1 - _p_) × log(1 - _a_).
It turns out that to maximize this expected score,
you should set _a_=_p_ --
that is, you should answer with your true believed probability.

But people in pubs don't like logarithms --
they like quizzes and gambling.
The Jim scoring system
adds some fun gambling to the quiz.
It's funny to see the effects of alcohol:
alcohol biases your confidence as well as your accuracy,
resulting in drunk people scoring many -7 points.
Observe the confidence ratings become more extreme towards the end of the quiz.

Try it out in your next family quiz over Zoom.
But in the mean time,
I'll leave you to test your confidence on this 10-question quiz.
Post your final score on Twitter or Hacker News:

<div id="end_quiz">
</div>
<script type="module">
  import { h, Component, render } from 'https://unpkg.com/preact?module';

  const quiz = [
    { question: "An emu cannot fly.", answer: true },
    { question: "Wyoming is on the Canadian border of the USA.", answer: false },
    { question: "Quaker is another name for a Mormon.", answer: false },
    { question: "Silly mid on is a fielding position in cricket.", answer: true },
    { question: "Spartacus was a great Roman general.", answer: false },
    { question: "Edinburgh is further East than Carlisle.", answer: false },
    { question: "Kangaroos are only an inch long at birth.", answer: true },
    { question: "George Washington's body was preserved in a barrel of Whiskey for 32 years.", answer: false },
    { question: "The can-opener was not invented until 45 years after the tin can.", answer: true },
    { question: "President Theodore Roosevelt's son was called Kermit.", answer: true },
  ];

  const scores = {
    true: {0: -7, 20: -3, 40: 0, 60: 2, 80: 3},
    false: {0: 3, 20: 2, 40: 0, 60: -3, 80: -7}
  };
  const labels = {
    true: {0: "Noo!! -7 pts", 20: "No, it's true. -3 pts", 40: "It's true. 0 pts", 60: "Yep, it's true. 2 pts", 80: "Confidence! 3 pts"},
    false: {0: "Confidence! 3 pts", 20: "Yep, it's false. 2 pts", 40: "It's false. 0 pts", 60: "No, it's false. -3 pts", 80: "Noo!! -7 pts"}
  };
  const cssClass = {
    true: {0:'vwrong', 20:'wrong', 40:'neutral', 60:'right', 80:'vright'},
    false: {0:'vright', 20:'right', 40:'neutral', 60:'wrong', 80:'vwrong'}
  };

  class QuizApp extends Component {
    state = {};

    render() {
      return h('div', null, [
        quiz.map((q,i) => h('div', {class: 'question-box'}, [
          h('div', { class: 'question' }, q.question + ' How likely is this?'),
          h('div', null, [80,60,40,20,0].map(p => h('div', null, [
            h('input', { 
              type: 'radio', 
              name: 'q'+i, 
              id: 'q'+i+'_'+p, 
              value: p,
              disabled: this.state.hasOwnProperty('q'+i),
              onInput: () => {
                this.setState({ ['q'+i]: p });
              }
            }, []),
            h('label', { for: 'q'+i+'_'+p }, p+'-'+(p+20)+'% likely'),
            h('span', { class: 'score score-' + cssClass[q.answer][p] }, labels[q.answer][p])
          ])))
        ])),
        h('div', {class: 'final-score'}, [
          "Your score: " + quiz.map((q,i) => scores[q.answer][this.state.hasOwnProperty('q'+i) ? this.state['q'+i] : 40]).reduce(((acc, x) => acc+x), 0)
        ])
      ]);
    }
  }

  render(h(QuizApp, null, []), document.getElementById("end_quiz"));
</script>

<style>
  span.score {
    color: white;
    border-radius: 0.2em;
    padding: 0 0.2em;
  }
  span.score-vwrong  { background-color: hsl(  0,100%,30%); }
  span.score-wrong   { background-color: hsl(  0, 30%,30%); }
  span.score-neutral { background-color: hsl(  0,  0%,30%); }
  span.score-right   { background-color: hsl(120, 30%,30%); }
  span.score-vright  { background-color: hsl(120,100%,30%); }

  .question-box span.score {
    display: none;
    margin-left: 1em;
  }
  input[type=radio]:checked + label + span.score {
    display: inline;
  }

  .final-score {
    text-align: center;
    font-weight: bold;
    font-size: 2em;
    color: blue;
    margin: 2em 0;
  }
  .question-box {
    border: 6px double black;
    margin: 1em auto;
    padding: 0.7em;
    max-width: 40em;
  }
  .question {
    font-weight: bold;
  }
</style>
