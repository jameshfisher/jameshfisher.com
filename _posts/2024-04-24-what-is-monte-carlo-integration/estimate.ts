function jumpDistance(h: number) {
  return h < 0 || h > 360 ? 0 : 300 * Math.sin(h * (Math.PI / 400));
}

function popCountForHeight(h: number) {
  return 1000 * Math.exp(-0.5 * ((h - 170) / 20) ** 2);
}

function riemannSumEstimate() {
  let totalJump = 0;
  let totalPeople = 0;
  for (let h = 0; h < 360; h += 1) {
    const count = popCountForHeight(h);
    totalJump += count * jumpDistance(h);
    totalPeople += count;
  }
  const averageJump = totalJump / totalPeople;
  return averageJump;
}

console.log(riemannSumEstimate());

class Chain<State> {
  constructor(
    // Initial state
    private state: State,

    // Function to calculate the frequency of any state
    private f: (state: State) => number,

    // Function to propose a new state - must be symmetric
    private propose: (state: State) => State,

    // Number of initial samples to discard
    burnIn = 1000,
  ) {
    for (let i = 0; i < burnIn; i++) {
      this.sample();
    }
  }

  sample(): State {
    const current = this.state;
    const proposed = this.propose(current);
    const prob = Math.min(1, this.f(proposed) / this.f(current));
    const next = Math.random() < prob ? proposed : current;
    this.state = next;
    return current;
  }
}

const normalDistFreq =
  (mean: number, stdDev: number) =>
  (x: number): number =>
    Math.exp(-0.5 * ((x - mean) / stdDev) ** 2);

class NormalDistribution {
  chain: Chain<number>;

  constructor({ mean, stdDev }: { mean: number; stdDev: number }) {
    this.chain = new Chain(
      mean,
      (x: number) => normalDistFreq(mean, stdDev)(x),
      (x: number) => x + (Math.random() - 0.5) * 10,
    );
  }

  sample(): number {
    return this.chain.sample();
  }
}

function monteCarloEstimate() {
  const populationHeights = new NormalDistribution({ mean: 170, stdDev: 20 });

  let totalJump = 0;
  let totalPeople = 0;
  for (let i = 0; i < 100000; i++) {
    const h = populationHeights.sample();
    totalJump += jumpDistance(h);
    totalPeople++;
  }

  const estimate = totalJump / totalPeople;
  return estimate;
}

console.log(monteCarloEstimate());
