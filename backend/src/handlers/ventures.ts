import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getPool } from '../db';
import { listVentures, type ListVenturesOptions } from '../queries/ventures';

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
  const opts = parseVentureQuery(event.queryStringParameters ?? {});
  const ventures = await listVentures(getPool(), opts);

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ventures, source: 'postgis' }),
  };
};
