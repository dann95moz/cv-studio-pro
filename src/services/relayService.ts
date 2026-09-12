import { Capacitor, CapacitorHttp } from '@capacitor/core';
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
export async function pushSnapshotToRelay(
  id: string,
  ciphertext: string,
  serverOrigin?: string
): Promise<RelayPushResponse> {
  const base = serverOrigin ? serverOrigin.replace(/\/+$/, '') : '';
  const endpoint = `${base}/api/relay/push`;

  if (Capacitor.isNativePlatform()) {
    try {
      const nativeRes = await CapacitorHttp.post({
        url: endpoint,
        headers: { 'Content-Type': 'application/json' },
        data: { id, ciphertext },
        connectTimeout: 15000,
        readTimeout: 20000,
      });

      if (nativeRes.status < 200 || nativeRes.status >= 300) {
        const errorMsg = (nativeRes.data as { error?: string })?.error;
        throw new Error(errorMsg || `Failed to push snapshot (HTTP ${nativeRes.status})`);
      }

      return (typeof nativeRes.data === 'string' ? JSON.parse(nativeRes.data) : nativeRes.data) as RelayPushResponse;
    } catch (err: unknown) {
      console.error('[RelayService] Native HTTP push error:', err);
      throw err;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(endpoint || '/api/relay/push', {
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
 * Fetches and destroys (atomic getdel) the encrypted snapshot from Upstash Redis.
 * Uses native CapacitorHttp on Android to bypass Chromium Mixed Content blocking.
 */
export async function pullSnapshotFromRelay(id: string, serverOrigin?: string): Promise<string> {
  const sanitizedId = id.trim().toUpperCase();
  const base = serverOrigin ? serverOrigin.replace(/\/+$/, '') : '';
  const endpoint = `${base}/api/relay/pull/${encodeURIComponent(sanitizedId)}`;

  if (Capacitor.isNativePlatform()) {
    try {
      const nativeRes = await CapacitorHttp.get({
        url: endpoint,
        headers: { Accept: 'application/json' },
        connectTimeout: 15000,
        readTimeout: 20000,
      });

      if (nativeRes.status === 404) {
        throw new Error('NOT_FOUND_OR_EXPIRED');
      }

      if (nativeRes.status < 200 || nativeRes.status >= 300) {
        const errorMsg = (nativeRes.data as { error?: string })?.error;
        throw new Error(errorMsg || `Failed to pull snapshot (HTTP ${nativeRes.status})`);
      }

      const data = typeof nativeRes.data === 'string' ? JSON.parse(nativeRes.data) : nativeRes.data;
      return (data as RelayPullResponse).ciphertext;
    } catch (err: unknown) {
      console.error('[RelayService] Native HTTP pull error:', err);
      throw err;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(endpoint, {
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
