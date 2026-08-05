// Quick check: does the seeded generator produce different pending counts per year?
function seeded(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

for (let yearIdx = 0; yearIdx < 5; yearIdx++) {
  const yearSeed = yearIdx * 997;
  let approved = 0;
  let pending = 0;
  let verified = 0;
  let obs = 0;
  let rejected = 0;
  let counter = 0;
  // approximate total docs: mimic flat count of ~247 (matches 80 pending @ 32%)
  const total = 400;
  for (let i = 0; i < total; i++) {
    const roll = seeded((counter + yearSeed) * 131 + (i % 7) * 7);
    const hod = roll < 0.45 ? 'approved' : roll < 0.85 ? 'pending' : 'rejected';
    if (hod === 'approved') {
      approved++;
      const iqacRoll = seeded((counter + yearSeed) * 197 + (i % 7) * 13);
      if (iqacRoll < 0.18) verified++;
      else if (iqacRoll < 0.28) obs++;
      else pending++;
    } else if (hod === 'pending') {
      // nothing
    } else rejected++;
    counter++;
  }
  console.log(`yearIdx=${yearIdx} seed=${yearSeed} approved=${approved} pending(iqac queue)=${pending} verified=${verified} obs=${obs} rejected=${rejected}`);
}
