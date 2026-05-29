import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getPool } from '../db';
import {
  listVentures,
  createVentureFromBody,
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

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext?.http?.method ?? 'GET';

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

    try {
      const venture = await createVentureFromBody(getPool(), body);
      return { statusCode: 201, headers: JSON_HEADERS, body: JSON.stringify({ venture }) };
    } catch (err) {
      if (err instanceof ValidationError) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: err.message }) };
      }
      throw err;
    }
  }

  const opts = parseVentureQuery(event.queryStringParameters ?? {});
  const ventures = await listVentures(getPool(), opts);
  return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ventures, source: 'postgis' }) };
};
