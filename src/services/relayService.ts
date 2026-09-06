import { RelayPushResponse, RelayPullResponse } from '../types/sync';

/**
 * Generates an ergonomic, easily readable 6-character pairing code (e.g. CV-78K2).
 * Excludes confusing characters like 0, O, 1, I.
 */
export function generateSyncId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CV-${code}`;
}

/**
 * Sends the encrypted snapshot to Upstash Redis via Vercel Serverless Function
 */
export async function pushSnapshotToRelay(id: string, ciphertext: string): Promise<RelayPushResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('/api/relay/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ciphertext }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(errorData.error || `Failed to push snapshot (HTTP ${response.status})`);
    }

    return (await response.json()) as RelayPushResponse;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado al conectar con el servidor relay.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches and destroys (atomic getdel) the encrypted snapshot from Upstash Redis
 */
export async function pullSnapshotFromRelay(id: string): Promise<string> {
  const sanitizedId = id.trim().toUpperCase();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`/api/relay/pull/${encodeURIComponent(sanitizedId)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (response.status === 404) {
      throw new Error('NOT_FOUND_OR_EXPIRED');
    }

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(errorData.error || `Failed to pull snapshot (HTTP ${response.status})`);
    }

    const data = (await response.json()) as RelayPullResponse;
    return data.ciphertext;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado al descargar del servidor relay.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
