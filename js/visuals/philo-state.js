// State of the table at time t (ms) from the owner's recorded philo output. Index = philosopher id - 1.
const ACTION = { 'has taken a fork': 'fork', 'is eating': 'eating', 'is sleeping': 'sleeping', 'is thinking': 'thinking', died: 'dead' };

export function stateAt(events, t, n) {
  const philos = Array(n).fill('thinking'), meals = Array(n).fill(0), forks = Array(n).fill(0);
  for (const e of events) {
    if (e.t > t) break;
    const i = e.id - 1;
    if (philos[i] === 'dead') continue;
    philos[i] = ACTION[e.action];
    if (e.action === 'is eating') meals[i]++;
    if (e.action === 'has taken a fork') forks[i] = Math.min(2, forks[i] + 1);
    else if (e.action !== 'is eating') forks[i] = 0; // the log names no fork: only how many are held
  }
  return { philos, meals, forks };
}
