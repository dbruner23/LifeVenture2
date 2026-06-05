import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { ensureConnected, getPool } from '../db';
import {
  listVentures,
  createVentureFromBody,
  getOrCreateUserBySub,
  ValidationError,
  type ListVenturesOptions,
} from '../queries/ventures';

const JSON_HEADERS = { 'content-type': 'application/json' };

// Parses ?genre=, ?bbox=minLng,minLat,maxLng,maxLat, ?near=lng,lat,radiusM
export function parseVentureQuery(qs: Record<string, string | undefined>): ListVenturesOptions {
  const opts: ListVenturesOptions = {};
  if (qs.genre) opts.genre = qs.genre;

  if (qs.bbox) {
    const parts = qs.bbox.split(',').map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      opts.bbox = parts as [number, number, number, number];
    }
  }

  if (qs.near) {
    const [lng, lat, radiusMeters] = qs.near.split(',').map(Number);
    if ([lng, lat, radiusMeters].every((n) => Number.isFinite(n))) {
      opts.near = { lng, lat, radiusMeters };
    }
  }

  return opts;
}

// HTTP API attaches JWT claims under requestContext.authorizer.jwt.claims for
// authorized routes. GET /ventures uses the same route group + same Lambda, so
// the wider event type is fine here.
export const handler = async (
  event: APIGatewayProxyEventV2 | APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext?.http?.method ?? 'GET';

  const pool = getPool();
  await ensureConnected(pool);

  if (method === 'POST') {
    let body: unknown;
    try {
      const raw = event.isBase64Encoded && event.body
        ? Buffer.from(event.body, 'base64').toString('utf8')
        : event.body;
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    // Resolve the author from the Cognito JWT claims the API Gateway authorizer
    // attached. Upsert into our users table by cognito_sub so we have a real
    // local row to set as ventures.author_id.
    const ctxAuthorizer = (event as APIGatewayProxyEventV2WithJWTAuthorizer).requestContext
      ?.authorizer;
    const claims = ctxAuthorizer?.jwt?.claims as
      | Record<string, string | undefined>
      | undefined;
    const sub = claims?.sub;
    if (!sub) {
      return { statusCode: 401, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Missing identity' }) };
    }
    try {
      const authorId = await getOrCreateUserBySub(pool, {
        sub,
        email: claims?.email,
        name: claims?.name,
      });
      const bodyWithAuthor = { ...(body as Record<string, unknown>), authorId };
      const venture = await createVentureFromBody(pool, bodyWithAuthor);
      return { statusCode: 201, headers: JSON_HEADERS, body: JSON.stringify({ venture }) };
    } catch (err) {
      if (err instanceof ValidationError) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: err.message }) };
      }
      throw err;
    }
  }

  const opts = parseVentureQuery(event.queryStringParameters ?? {});
  const ventures = await listVentures(pool, opts);
  return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ventures, source: 'postgis' }) };
};
