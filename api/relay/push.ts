import { Redis } from '@upstash/redis';

export const config = {
  runtime: 'edge',
  regions: ['iad1'],
};

const getRedisClient = () => {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('Missing KV_REST_API_URL or KV_REST_API_TOKEN environment variables');
  }
  return new Redis({ url, token });
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as { id?: string; ciphertext?: string };
    const { id, ciphertext } = body || {};

    if (!id || typeof id !== 'string' || !ciphertext || typeof ciphertext !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid id / ciphertext' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sanitizedId = id.trim().slice(0, 32);
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedId)) {
      return new Response(JSON.stringify({ error: 'Invalid id format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const redis = getRedisClient();
    // 300 seconds (5 minutes) TTL
    await redis.set(sanitizedId, ciphertext, { ex: 300 });

    return new Response(JSON.stringify({ ok: true, id: sanitizedId, ttl: 300 }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
