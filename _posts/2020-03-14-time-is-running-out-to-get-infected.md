---
title: "Two weeks left to catch COVID-19"
tags: ["programming", "epidemiology"]
---

Your best chance for survival is to _catch COVID-19 now_.
But the window of opportunity is closing!
In approximately two weeks,
the rational strategy will switch from _catch it now_
to _avoid it forever_.
In this post, I show a compartmental simulation of COVID-19,
with interactive parameters that you can play with.
I then show a "backpropagation" algorithm 
that calculates death probabilities in compartmental models,
which lets us analyze optimal selfish strategies.
I find that there are four phases during epidemics, 
each with its own optimal strategy.

The following chart shows 
how likely a person is to be dead by the end of the year,
given their current state.
For example, on day 8, a person in the "infected with treatment" state
has a 2.5% chance of being dead by day 365.
But on the same day 8, a person in the "susceptible" state
has a full 5% chance of being dead by day 365!
It follows that the "susceptible" person
should choose to deliberately become infected,
to improve their chance of survival!

<div><canvas id="deathProbChart" width="800" height="400"></canvas></div>

According to the simulation,
which I explain more fully below,
it's rational to infect yourself right now.
Intuitively,
this is because you'll get better treatment 
while our healthcare system is still functioning.
But there are in fact four phases of the epidemic,
and the strategy is different in each phase.
By tracing the blue "susceptible" line in the chart,
and observing where it crosses the other lines,
we derive the four phases:

1. **Phase 1: you should infect yourself, getting treatment.**
   Before the peak,
   you should infect yourself 
   to get treatment while our healthcare system is still functioning.
   We're currently in this phase.
1. **Phase 2: you should still infect yourself, foregoing treatment.**
   Phase 2 begins when the healthcare system hits capacity,
   and there are no more beds.
   In the chart, the red line "infection without treatment" makes its appearance.
   Surprisingly,
   for a brief time,
   it is still rational to infect yourself,
   and go without treatment!
   This is because infected people are given priority
   when beds are freed up,
   so it's likely that you will soon get treatment.
1. **Phase 3: you should avoid infection (unless you can jump the queue).**
   After a short time,
   there are so many people waiting for treatment
   that it's no longer rational to join the "queue".
   But during this phase,
   it's still rational to infect yourself,
   if you're given the unlikely opportunity to get treatment --
   maybe you can join a clinical trial,
   or maybe your relative donates their treatment to you.
1. **Phase 4: you should avoid infection forever.**
   Eventually, 
   the blue "susceptible" line dips under the the "infected with treatment" line.
   Beyond this point,
   it's irrational to infect yourself,
   even if you can get treatment.
   You're better off gambling that you'll never get the infection,
   because "herd immunity" makes it unlikely.

Now I show how I simulated the epidemic.
Every simulated person is in one of five states:
"susceptible", "infected with treatment", "infected without treatment", "recovered", or "dead".
Each day, people transition between these states like so:

<img src="{% link assets/2020-03-15/sir-model.svg %}" style="border: none; max-width: 30em; margin: 0 auto; display: block;" />

We start the simulation with everyone in the "susceptible" state,
except for one person with the novel virus.
Each day, people meet each other,
through which susceptible people may become infected.
Unfortunately, there is a limited number of beds to provide treatment!
Infected people either die or recover,
but the chance of dying is reduced by receiving treatment.
When an infected person dies or recovers,
their bed is given an infected person waiting for treatment.
There are many parameters in this model,
which I've attempted to set to the known characteristics of COVID-19,
but you can play with them yourself:

<table style="background-color: #eee;">
    <tbody id="sliders-body"></tbody>
</table>

The following chart shows the proportion of the population in each state,
It should look familar;
especially the red curve of infected people.
This is the curve that we should be "flattening" 
to reduce the total death rate.
Use the sliders above to flatten the curve 
by reducing meetings,
or by reducing the probability of transmission (e.g., with masks).

<div><canvas id="populationChart" width="800" height="400"></canvas></div>

We can generate the above population chart
by running the model.
We end up with a graph like the following
(note that I've simplified the model for clarity).
Each vertex counts the number of people in a given state on a given day,
and each edge counts the number of people transferred from one state to another:

<img src="{% link assets/2020-03-15/sir-model-forwards.svg %}" style="border: none; max-width: 30em; margin: 0 auto; display: block;" />

But how can we generate the "death probability" chart from this?
Say Bob asks you:
"It's day 2, and I'm susceptible;
what's my chance of being dead at the end of the year?"
You could answer this by running the model _forwards_,
keeping track of the probability distribution of Bob's possible states
on day 2, then day 3, then day 4.
But then to generate our entire "death probability" chart,
you need to run this procedure for every combination of state and day.
That's very expensive!

Fortunately, I found a more efficient backpropagation-style algorithm!
First, we run the model forwards, as before,
keeping a record of all the transfers of people from one state to another.
Then we run the model _backwards_.
We'll get a graph that looks like this:

<img src="{% link assets/2020-03-15/sir-model-backwards.svg %}" style="border: none; max-width: 30em; margin: 0 auto; display: block;" />

We've labelled each node with the probability of ending up dead on day 3
(the bottom-right corner).
For example, "susceptible" on Day 2 has a 1/128 chance of dying.
Labelling day 3 is our easy base-case.
The dead state is 1, i.e. certain to be dead, because it's dead;
All other states are 0, i.e. certain to survive, because they survived.
Then, to generate a previous day's probabilities,
each node is a _weighted sum_ of the previous nodes on the following day.
For example, 1/128 is the weighted sum (87/96 × 0) + (9/96 × 1/12).

Now for some commentary.
Notice that the individual selfish strategy of getting infected
is in conflict with the the group strategy of avoiding infection to "flatten the curve".
This makes it an example of a [social dilemma](https://en.wikipedia.org/wiki/Social_dilemma),
like overfishing, or not voting.

Despite this dilemma,
no one appears to be deliberately infecting themselves with COVID-19.
Perhaps the model is wrong, and self-infection is not actually rational.
Or perhaps the model is right, but people don't act like _homo economicus_.
It's a moral argument:
I'm self-isolating, 
not for my own protection,
but for the good of the population.
At least, that's what I tell myself.
Maybe it's just because
my friends would call me a moron if I self-infected.

<script src="{% link /assets/Chart.min.js %}"></script>
<script>
    const displayFuncs = {
      toString: n => n.toString(),
      percentage: n => (n*100).toFixed(1) + "%",
    };

    const covid19Defaults = {
      populationSize: 66000000, // UK
      infectionDurationDays: 15, // https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)30627-9/fulltext
      meetingInfectionProbability: 0.06, // calibrated for growth rate ~= 1.6x per day, UK growth rate https://www.arcgis.com/apps/opsdashboard/index.html#/f94c3c90da5b4e9f9a0b19484dd4bb14
      meetingsPerDayPerPerson: 15, // http://jtd.amegroups.com/article/view/36385/pdf
      caseFatalityRateWithTreatment: 0.024, // https://ourworldindata.org/coronavirus "Case fatality rate for the rest of the world"
      caseFatalityRateWithoutTreatment: 0.05, // A guess - we don't seem to know since most are treated atm. Italy CFR is 5%
      numberOfBedsPerThousandPeople: 5, // 5 per 1K people, or 0.5%. Commonly cited
      immunityDurationDays: 3650, // Entirely unknown at this stage, it seems
    };

    const sliders = {
      populationSize:
        { min: 1000000, max: 400000000, value: covid19Defaults.populationSize, step: 1000000, display: displayFuncs.toString, label: "Population size" },
      infectionDurationDays:
        { min: 1, max: 30, value: covid19Defaults.infectionDurationDays, step: 1, display: displayFuncs.toString, label: "⏰ Average infection duration in days" },
      meetingInfectionProbability:      
        { min: 0, max: 0.1, value: covid19Defaults.meetingInfectionProbability, step: 0.001, display: displayFuncs.percentage, label: "🦠 Probability of transmission in meeting" },
      meetingsPerDayPerPerson:          
        { min: 0, max: 30, value: covid19Defaults.meetingsPerDayPerPerson, step: 1, display: displayFuncs.toString, label: "🤝 Meetings per day per person" },
      caseFatalityRateWithTreatment:    
        { min: 0, max: 0.2, value: covid19Defaults.caseFatalityRateWithTreatment, step: 0.001, display: displayFuncs.percentage, label: "☠️ Case fatality rate with treatment" },
      caseFatalityRateWithoutTreatment: 
        { min: 0, max: 0.2, value: covid19Defaults.caseFatalityRateWithoutTreatment, step: 0.001, display: displayFuncs.percentage, label: "☠️ Case fatality rate without treatment" },
      numberOfBedsPerThousandPeople:                     
        { min: 0, max: 200, value: covid19Defaults.numberOfBedsPerThousandPeople, step: 1, display: displayFuncs.toString, label: "🛏 Number of beds per thousand people" },
      immunityDurationDays:
        { min: 1, max: 3650, value: covid19Defaults.immunityDurationDays, step: 1, display: displayFuncs.toString, label: "⏰ Average immunity duration in days"},
    };

    function el(t, as, cs) {
      const e = document.createElement(t);

      // Ugly! Some attributes have to be set in order; e.g. min and max must precede value!
      for (const [aName, aVal] of Object.entries(as)) e.setAttribute(aName, aVal);
      for (const [aName, aVal] of Object.entries(as)) e.setAttribute(aName, aVal); 

      for (const state of cs) e.appendChild(typeof(state) === "string" ? document.createTextNode(state) : state);
      return e;
    }

    for (let [sliderId, sliderConfig] of Object.entries(sliders)) {
      const slider = el("input", { 
        type: "range", 
        id: sliderId, 
        min: sliderConfig.min, 
        max: sliderConfig.max, 
        value: sliderConfig.value, 
        step: sliderConfig.step,
        style: "width: 20em"
      }, []);
      const valueSpan = el("span", {id: sliderId+"Value"}, []);
      document.getElementById("sliders-body").appendChild(el("tr", {}, [
        el("td", {}, [ el("label", { for: sliderId }, [sliderConfig.label]) ]),
        el("td", {}, [ slider ]),
        el("td", {}, [ valueSpan ]),
      ]));
      slider.oninput = update;
      sliderConfig.slider = slider;
      sliderConfig.valueSpan = valueSpan;
    }

    labels = [];
    const populationDatasets = {
        susceptible: [],
        infectedWithTreatment: [],
        infectedWithoutTreatment: [],
        recovered: [],
        dead: [],
    };
    const deathProbDatasets = {
        susceptible: [],
        infectedWithTreatment: [],
        infectedWithoutTreatment: [],
        recovered: [],
        dead: [],
    };

    const populationChart = new Chart(
      document.getElementById('populationChart').getContext('2d'), 
      {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Infected with treatment',
                    backgroundColor: 'rgb(255, 99, 132)',
                    data: populationDatasets.infectedWithTreatment,
                    pointRadius: 0,
                    borderWidth: 0,
                    fill: true
                },
                {
                    label: 'Infected without treatment',
                    backgroundColor: 'rgb(255, 0, 0)',
                    data: populationDatasets.infectedWithoutTreatment,
                    pointRadius: 0,
                    borderWidth: 0,
                    fill: true
                },
                {
                    label: 'Dead',
                    backgroundColor: 'rgb(0, 0, 0)',
                    data: populationDatasets.dead,
                    pointRadius: 0,
                    borderWidth: 0,
                    fill: true
                },
                {
                    label: 'Recovered',
                    backgroundColor: 'rgb(99, 255, 132)',
                    data: populationDatasets.recovered,
                    pointRadius: 0,
                    borderWidth: 0,
                    fill: true
                },
                {
                    label: 'Susceptible',
                    backgroundColor: 'rgb(132, 99, 255)',
                    data: populationDatasets.susceptible,
                    pointRadius: 0,
                    borderWidth: 0,
                    fill: true
                },
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    stacked: true,
                    ticks: {
                      callback: function(value, index, values) {
                          return (value/1000000) + "M";
                      }
                    }
                }]
            },
        }
    });

    const deathProbChart = new Chart(
      document.getElementById('deathProbChart').getContext('2d'), 
      {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Infected with treatment',
                    borderColor: 'rgb(255, 99, 132)',
          					fill: false,
                    data: deathProbDatasets.infectedWithTreatment,
                    pointRadius: 0,
                },
                {
                    label: 'Infected without treatment',
                    borderColor: 'rgb(255, 0, 0)',
          					fill: false,
                    data: deathProbDatasets.infectedWithoutTreatment,
                    pointRadius: 0,
                },
                {
                    label: 'Recovered',
                    borderColor: 'rgb(99, 255, 132)',
          					fill: false,
                    data: deathProbDatasets.recovered,
                    pointRadius: 0,
                },
                {
                    label: 'Susceptible',
                    borderColor: 'rgb(132, 99, 255)',
          					fill: false,
                    data: deathProbDatasets.susceptible,
                    pointRadius: 0,
                },
            ]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                callback: function(value, index, values) {
                    return displayFuncs.percentage(value);
                }
              }
            }]
          }
        }
    });

    // E.g.
    // calcDeathProb(
    //   "infected",
    //   200, 
    //   [{to: "dead", value: 10}], 
    //   { infected: 0, dead: 1 }
    // ) = 0.05 = (0.95*0) + (0.05*1)
    function calcDeathProb(cmp, totalToday, transfers, deathProbsTomorrow) {
      if (totalToday < 0.00001) return null;

      let totalProb = 0;
      let transferred = 0;

      for (const transfer of transfers) {
        transferred += transfer.value;
        const weight = transfer.value / totalToday;
        const prob = deathProbsTomorrow[transfer.to];
        totalProb += weight * prob;
      }

      const weight = (totalToday-transferred) / totalToday;
      const prob = deathProbsTomorrow[cmp];
      totalProb += weight * prob;
    
      if (totalProb > 1) {
        console.error("prob > 1", JSON.stringify([cmp, totalToday, transfers, deathProbsTomorrow]));
      }
      return totalProb;
    }

    // E.g.
    // calcDeathProbs(
    //   { infected: 200, dead: 100 }, 
    //   [{from: "infected", to: "dead", value: 10}], 
    //   { infected: 0, dead: 1}
    // ) = { 
    //    infected: 0.05, 
    //    dead: 1
    // }
    function calcDeathProbs(totalsToday, transfers, deathProbsTomorrow) {
      const deathProbsToday = {};
      for (const cmp in totalsToday) {
        deathProbsToday[cmp] = calcDeathProb(
          cmp, 
          totalsToday[cmp], 
          transfers.filter(t => t.from === cmp), 
          deathProbsTomorrow
        );
      }
      return deathProbsToday;
    }

    function update() {
        const POPULATION_SIZE = sliders.populationSize.slider.value;
        const MEETINGS_PER_DAY_PER_PERSON = sliders.meetingsPerDayPerPerson.slider.value;
        const MEETING_INFECTION_PROBABILITY = sliders.meetingInfectionProbability.slider.value;
        const INFECTION_DURATION_DAYS = sliders.infectionDurationDays.slider.value;
        const CASE_FATALITY_RATE_WITH_TREATMENT = sliders.caseFatalityRateWithTreatment.slider.value;
        const CASE_FATALITY_RATE_WITHOUT_TREATMENT = sliders.caseFatalityRateWithoutTreatment.slider.value;
        const NUMBER_OF_BEDS_PER_THOUSAND = sliders.numberOfBedsPerThousandPeople.slider.value;
        const IMMUNITY_DURATION_DAYS = sliders.immunityDurationDays.slider.value;

        const NUMBER_OF_BEDS = (NUMBER_OF_BEDS_PER_THOUSAND/1000) * POPULATION_SIZE;

        function calcTransfers(state) {
          const total = state.susceptible + state.infectedWithTreatment + state.infectedWithoutTreatment + state.recovered;

          const totalInfected = state.infectedWithTreatment + state.infectedWithoutTreatment;

          const infectedMeetingsPerPerson = (totalInfected / total) * MEETINGS_PER_DAY_PER_PERSON;
          const transmissionProbability = 1-(Math.pow(1-MEETING_INFECTION_PROBABILITY, infectedMeetingsPerPerson));
          const newlyInfected = state.susceptible * transmissionProbability;

          const newlyNonInfectedFromWithTreatment = state.infectedWithTreatment / INFECTION_DURATION_DAYS;
          const newlyDeadFromWithTreatment = newlyNonInfectedFromWithTreatment * CASE_FATALITY_RATE_WITH_TREATMENT;
          const newlyRecoveredFromWithTreatment = newlyNonInfectedFromWithTreatment - newlyDeadFromWithTreatment;

          const newlyNonInfectedFromWithoutTreatment = state.infectedWithoutTreatment / INFECTION_DURATION_DAYS;
          const newlyDeadFromWithoutTreatment = newlyNonInfectedFromWithoutTreatment * CASE_FATALITY_RATE_WITHOUT_TREATMENT;
          const newlyRecoveredFromWithoutTreatment = newlyNonInfectedFromWithoutTreatment - newlyDeadFromWithoutTreatment;

          const stillInfectedWithoutTreatment = 
            state.infectedWithoutTreatment-newlyDeadFromWithoutTreatment-newlyRecoveredFromWithoutTreatment;

          let freeBeds = NUMBER_OF_BEDS-state.infectedWithTreatment;
          const givenABed = Math.min(freeBeds, stillInfectedWithoutTreatment);
          freeBeds -= givenABed;

          const newlyInfectedToTreatment = Math.min(newlyInfected, freeBeds);
          const newlyInfectedToWithoutTreatment = newlyInfected - newlyInfectedToTreatment;

          const newlySusceptible = state.recovered / IMMUNITY_DURATION_DAYS;

          return [
            { from: "infectedWithoutTreatment", to: "infectedWithTreatment", value: givenABed },
            { from: "susceptible", to: "infectedWithTreatment", value: newlyInfectedToTreatment },
            { from: "susceptible", to: "infectedWithoutTreatment", value: newlyInfectedToWithoutTreatment },
            { from: "infectedWithTreatment", to: "dead", value: newlyDeadFromWithTreatment },
            { from: "infectedWithTreatment", to: "recovered", value: newlyRecoveredFromWithTreatment },
            { from: "infectedWithoutTreatment", to: "dead", value: newlyDeadFromWithoutTreatment },
            { from: "infectedWithoutTreatment", to: "recovered", value: newlyRecoveredFromWithoutTreatment },
            { from: "recovered", to: "susceptible", value: newlySusceptible },
          ];
        }

        function doTransfers(state, transfers) {
          const c2 = {};
          for (cmp in state) c2[cmp] = state[cmp];
          for (const transfer of transfers) {
            c2[transfer.from] -= transfer.value;
            c2[transfer.to] += transfer.value;
          }
          return c2;
        }

        const stateByDay = [{
          susceptible: POPULATION_SIZE,
          infectedWithTreatment: 1,
          infectedWithoutTreatment: 0,
          recovered: 0,
          dead: 0,
        }];
        const transfersFromDay = [];

        for (let i = 0; i < 365; i++) {
          const state = stateByDay[i];
          const transfers = calcTransfers(state);
          transfersFromDay[i] = transfers;
          stateByDay[i+1] = doTransfers(state, transfers);
          console.log(i, stateByDay[i+1].infectedWithTreatment / stateByDay[i].infectedWithTreatment);
        }

        deathProbsOnDay = [];
        deathProbsOnDay[364] = {
          susceptible: 0,
          infectedWithTreatment: 0,
          infectedWithoutTreatment: 0,
          recovered: 0,
          dead: 1,
        }
        for (let i = 363; i >= 0; i--) {
          deathProbsOnDay[i] = calcDeathProbs(
            stateByDay[i],
            transfersFromDay[i],
            deathProbsOnDay[i+1]
          );
        }

        console.log(deathProbsOnDay);

        // DISPLAY

        for ([sliderId, sliderConfig] of Object.entries(sliders)) {
          sliderConfig.valueSpan.innerText = sliderConfig.display(sliderConfig.slider.value);
        }
      
        labels.length = 0;
        for (let i = 0; i < 365; i++) {
          labels.push('Day ' + i);
        }

        for (const cmp in populationDatasets) {
          populationDatasets[cmp].length = 0;
        }
        for (let i = 0; i < 365; i++) {
          const state = stateByDay[i];
          for (const compartment in state) {
            // We get some floats very slightly <0, which cause chart.js to bug
            populationDatasets[compartment].push({ x: i, y: Math.max(0, state[compartment]) });
          }
        }
        for (const cmp in deathProbDatasets) {
          deathProbDatasets[cmp].length = 0;
        }
        for (let i = 0; i < 365; i++) {
          const deathProbs = deathProbsOnDay[i];
          for (const compartment in deathProbs) {
            deathProbDatasets[compartment].push({ x: i, y: deathProbs[compartment] });
          }
        }
        populationChart.update();
        deathProbChart.update();
    }

    update();
</script>
