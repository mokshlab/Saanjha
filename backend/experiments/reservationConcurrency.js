const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3101';
const listingId = process.env.LISTING_ID;
const tokens = (process.env.BUYER_TOKENS || '').split(',').map((token) => token.trim()).filter(Boolean);
const attempts = Number(process.env.ATTEMPTS || tokens.length);

if (!listingId || !tokens.length || !attempts) {
  console.error('Set LISTING_ID, BUYER_TOKENS, and optionally ATTEMPTS before running this experiment.');
  process.exitCode = 1;
} else {
  const requests = Array.from({ length: attempts }, (_, index) => fetch(`${baseUrl}/api/reservations/${listingId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens[index % tokens.length]}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ durationHours: 3 })
  }).then(async (response) => ({ status: response.status, body: await response.json().catch(() => ({})) })));

  Promise.all(requests).then((results) => {
    const winners = results.filter((result) => result.status === 201).length;
    const statusCounts = results.reduce((counts, result) => {
      counts[result.status] = (counts[result.status] || 0) + 1;
      return counts;
    }, {});
    console.log(JSON.stringify({ attempts, winners, statusCounts, results }, null, 2));
  }).catch((error) => {
    console.error('Concurrency experiment failed:', error.message);
    process.exitCode = 1;
  });
}