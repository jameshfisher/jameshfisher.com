---
title: "Simulating epidemics"
tags: ["programming", "epidemiology"]
---

Below you see a simulation of an epidemic.
You can adjust the characteristics of the disease,
and the characteristics of human behavior,
to see how these affect the course of the epidemic.
For example,
consider an infection which lasts for 5 days,
and which has a 3% probability of transmission.
If people have 10 meetings per day,
half of the global population will become infected.
But if people reduced their interactions to just 6 per day,
the epidemic could never even started!

<canvas id="myChart" width="800" height="200"></canvas>

<table>
    <tbody>
        <tr>
            <td><input type="range" id="infectionDurationDays" min="1" max="11" value="5"/></td>
            <td><span id="infectionDurationDaysValue"></span></td>
            <td><label for="infectionDurationDays">Infection duration in days</label></td>
        </tr>
        <tr>
            <td><input type="range" id="meetingInfectionProbability" min="0" max="0.1" value="0.03" step="0.01"/></td>
            <td><span id="meetingInfectionProbabilityValue"></span></td>
            <td><label for="meetingInfectionProbability">Probability of transmission in meeting</label></td>
        </tr>
        <tr>
            <td><input type="range" id="meetingsPerDayPerPerson" min="0" max="15" value="10" step="1"/></td>
            <td><span id="meetingsPerDayPerPersonValue"></span></td>
            <td><label for="meetingsPerDayPerPerson">Meetings per day per person</label></td>
        </tr>
    </tbody>
</table>

Max infectious: <span id="maxInfected"></span>. Min susceptible: <span id="minSusceptible"></span>.

<script src="{% link /assets/Chart.min.js %}"></script>
<script>
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const ctx = document.getElementById('myChart').getContext('2d');

    const infectionDurationDaysEl = document.getElementById("infectionDurationDays");
    const meetingInfectionProbabilityEl = document.getElementById("meetingInfectionProbability");
    const meetingsPerDayPerPersonEl = document.getElementById("meetingsPerDayPerPerson");

    infectionDurationDaysEl.onchange = update;
    meetingInfectionProbabilityEl.onchange = update;
    meetingsPerDayPerPersonEl.onchange = update;

    labels = [];
    const datasets = {
        susceptible: [],
        infected: [],
        recovered: [],
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Infected',
                    backgroundColor: 'rgb(255, 99, 132)',
                    data: datasets.infected,
                    pointRadius: 0,
                    borderWidth: 0,
                    fill: true
                },
                {
                    label: 'Recovered',
                    backgroundColor: 'rgb(99, 255, 132)',
                    data: datasets.recovered,
                    pointRadius: 0,
                    borderWidth: 0,
                    fill: true
                },
                {
                    label: 'Susceptible',
                    backgroundColor: 'rgb(132, 99, 255)',
                    data: datasets.susceptible,
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

    function update() {
        const MEETINGS_PER_DAY_PER_PERSON = meetingsPerDayPerPersonEl.value;
        const MEETING_INFECTION_PROBABILITY = meetingInfectionProbabilityEl.value;
        const INFECTION_DURATION_DAYS = infectionDurationDaysEl.value;

        document.getElementById("infectionDurationDaysValue").innerText = INFECTION_DURATION_DAYS;
        document.getElementById("meetingInfectionProbabilityValue").innerText = (MEETING_INFECTION_PROBABILITY * 100) + "%";
        document.getElementById("meetingsPerDayPerPersonValue").innerText = MEETINGS_PER_DAY_PER_PERSON;
        
        labels.length = 0;
        datasets.susceptible.length = 0;
        datasets.infected.length = 0;
        datasets.recovered.length = 0;


        let susceptible = 7800000000;
        let infected = 1;
        let recovered = 0;
        const total = susceptible + infected + recovered;

        let maxInfected = 0;
        let minSusceptible = susceptible;

        for (let i = 0; i < 365; i++) {
            labels.push('Day ' + i);
            datasets.susceptible.push({ x: i, y: susceptible });
            datasets.infected.push({ x: i, y: infected });
            datasets.recovered.push({ x: i, y: recovered });

            const infectedMeetingsPerPerson = (infected / total) * MEETINGS_PER_DAY_PER_PERSON;
            const transmissionProbability = 1-(Math.pow(1-MEETING_INFECTION_PROBABILITY, infectedMeetingsPerPerson));
            newlyInfected = susceptible * transmissionProbability;
            newlyRecovered = infected / INFECTION_DURATION_DAYS;

            infected += newlyInfected;
            susceptible -= newlyInfected;
            infected -= newlyRecovered;
            recovered += newlyRecovered;

            maxInfected = Math.max(maxInfected, infected);
            minSusceptible = Math.min(minSusceptible, susceptible);
        }

        chart.update();

        document.getElementById("minSusceptible").innerText = Math.round(minSusceptible).toLocaleString();
        document.getElementById("maxInfected").innerText = Math.round(maxInfected).toLocaleString();
    }

    update();
</script>

This is an "SIR model".
"SIR" stands for "Susceptible, Infected, Recovered".
We have a constant population
where each person is in one of these three states.
Each day,
some susceptible people become infected by meeting infectious people,
and some infected people recover.

The SIR model is simplistic!
Most obviously, it doesn't account for _location_ or _networks_;
all meetings are between two random members of the global population.
This is a limitation of all ["compartmental models"](https://en.wikipedia.org/wiki/Compartmental_models_in_epidemiology).
And the "states" in the SIR model are also simplistic.
They don't account for an incubation period,
or for loss of immunity,
or for _carrier_ status,
or for death (perhaps the most important state we care about!).

And yet the SIR model shows some important things about epidemics.
It shows that the outcome is very sensitive to inputs.
I mentioned one at the start:
a moderate reduction in the number of meetings 
can be the difference between a pandemic and an isolated case.
Similarly,
if we reduced transmission probability from 3% to 2%,
perhaps by wearing masks,
the epidemic would never get started.
Exponential growth is very sensitive to the exponent!

But the SIR model also shows that
the epidemic won't reach the whole population.
As people become immune,
the exponent drops below 1,
because meetings between infected and susceptible people become less likely.
In the simulation above,
40% of the population remain susceptible,
but the epidemic died before it could reach them.
