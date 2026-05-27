// Public health check. No DB, no auth — used to confirm the API is reachable.
export const handler = async () => ({
  statusCode: 200,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    status: 'ok',
    service: 'lifeventure-api',
    time: new Date().toISOString(),
  }),
});
