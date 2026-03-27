function estimateWaitMinutes(waitingPeople, avgTimePerUserMinutes) {
  const a = Number(waitingPeople) || 0;
  const b = Number(avgTimePerUserMinutes) || 0;
  return a * b;
}

module.exports = { estimateWaitMinutes };

