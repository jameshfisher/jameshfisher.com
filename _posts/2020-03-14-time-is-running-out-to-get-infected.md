---
title: "Time is running out to get infected"
tags: ["programming", "epidemiology"]
---

<div><canvas id="populationChart" width="800" height="200"></canvas></div>
<div><canvas id="deathProbChart" width="800" height="200"></canvas></div>

<table>
    <tbody id="sliders-body"></tbody>
</table>

<script src="{% link /assets/Chart.min.js %}"></script>
<script>
    const displayFuncs = {
      toString: n => n.toString(),
      percentage: n => (n*100).toFixed(1) + "%",
    };
    const sliders = {
      infectionDurationDays:            
        { min: 1, max: 30, value: 14, step: 1, display: displayFuncs.toString, label: "⏰ Average infection duration in days" },
      meetingInfectionProbability:      
        { min: 0, max: 0.1, value: 0.03, step: 0.001, display: displayFuncs.percentage, label: "🦠 Probability of transmission in meeting" },
      meetingsPerDayPerPerson:          
        { min: 0, max: 15, value: 10, step: 1, display: displayFuncs.toString, label: "🤝 Meetings per day per person" },
      caseFatalityRateWithTreatment:    
        { min: 0, max: 0.2, value: 0.01, step: 0.001, display: displayFuncs.percentage, label: "☠️ Case fatality rate with treatment" },
      caseFatalityRateWithoutTreatment: 
        { min: 0, max: 0.2, value: 0.06, step: 0.001, display: displayFuncs.percentage, label: "☠️ Case fatality rate without treatment" },
      numberOfBeds:                     
        { min: 0, max: 100000, value: 10000, step: 100, display: displayFuncs.toString, label: "🛏 Number of beds" }
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
        step: sliderConfig.step 
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
      if (totalToday === 0) return 0;

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
        const MEETINGS_PER_DAY_PER_PERSON = sliders.meetingsPerDayPerPerson.slider.value;
        const MEETING_INFECTION_PROBABILITY = sliders.meetingInfectionProbability.slider.value;
        const INFECTION_DURATION_DAYS = sliders.infectionDurationDays.slider.value;
        const CASE_FATALITY_RATE_WITH_TREATMENT = sliders.caseFatalityRateWithTreatment.slider.value;
        const CASE_FATALITY_RATE_WITHOUT_TREATMENT = sliders.caseFatalityRateWithoutTreatment.slider.value;
        const NUMBER_OF_BEDS = sliders.numberOfBeds.slider.value;

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

          return [
            { from: "infectedWithoutTreatment", to: "infectedWithTreatment", value: givenABed },
            { from: "susceptible", to: "infectedWithTreatment", value: newlyInfectedToTreatment },
            { from: "susceptible", to: "infectedWithoutTreatment", value: newlyInfectedToWithoutTreatment },
            { from: "infectedWithTreatment", to: "dead", value: newlyDeadFromWithTreatment },
            { from: "infectedWithTreatment", to: "recovered", value: newlyRecoveredFromWithTreatment },
            { from: "infectedWithoutTreatment", to: "dead", value: newlyDeadFromWithoutTreatment },
            { from: "infectedWithoutTreatment", to: "recovered", value: newlyRecoveredFromWithoutTreatment },
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
          susceptible: 100000,
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
