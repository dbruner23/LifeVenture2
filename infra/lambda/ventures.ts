// GET /ventures — protected by the Cognito authorizer.
//
// STUB: returns static data for now so the route is wired end-to-end before the
// database has a schema. Next increment replaces the body with a PostGIS query.
// The DB connection uses IAM auth (no password): generate a short-lived token
// with @aws-sdk/rds-signer Signer.getAuthToken() using DB_HOST/DB_PORT/DB_USER
// from the environment, then connect with `pg` using that token as the password
// and ssl enabled. Token generation is local (no network call), so no NAT.

export const handler = async () => {
  const ventures = [
    {
      id: 'v1',
      title: 'Sleeping Under the Northern Lights, Lofoten',
      location: 'Reine, Lofoten Islands · Norway',
      genre: 'Wilderness',
      coordinates: { latitude: 67.9311, longitude: 13.0908 },
    },
  ];

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ventures, source: 'stub' }),
  };
};
