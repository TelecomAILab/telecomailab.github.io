// MIT licensed demo material. Synthetic scheduling example, not a research result.
export function allocateResources(users, budget = 100) {
  const total = users.reduce((sum, user) => sum + user.demand, 0);
  return users.map(user => ({ id: user.id, allocation: total ? budget * user.demand / total : 0 }));
}
