/**
 * Zero-Knowledge Client-Side Encryption & Compression Service
 * Uses Web Crypto API (AES-GCM-256) and CompressionStream (gzip)
 */

export function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64UrlToUint8Array(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function compressString(text: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const byteArray = encoder.encode(text);
  if (typeof CompressionStream !== 'undefined') {
    try {
      const stream = new Response(byteArray).body!.pipeThrough(new CompressionStream('gzip'));
      const buffer = await new Response(stream).arrayBuffer();
      return new Uint8Array(buffer);
    } catch (e) {
      console.warn('CompressionStream fallback to raw bytes:', e);
      return byteArray;
    }
  }
  return byteArray;
}

export async function decompressString(data: Uint8Array): Promise<string> {
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const stream = new Response(data as unknown as BodyInit).body!.pipeThrough(new DecompressionStream('gzip'));
      const buffer = await new Response(stream).arrayBuffer();
      return new TextDecoder().decode(buffer);
    } catch {
      // Fallback if payload was not compressed
      return new TextDecoder().decode(data);
    }
  }
  return new TextDecoder().decode(data);
}

export async function generateAesKey(): Promise<CryptoKey> {
  const subtle = window?.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API no disponible. Asegúrate de estar usando un contexto seguro (HTTPS o localhost).');
  }
  return await subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportKeyToBase64Url(key: CryptoKey): Promise<string> {
  const rawKey = await window.crypto.subtle.exportKey('raw', key);
  return uint8ArrayToBase64Url(new Uint8Array(rawKey));
}

export async function importKeyFromBase64Url(base64Url: string): Promise<CryptoKey> {
  const rawBuffer = base64UrlToUint8Array(base64Url);
  return await window.crypto.subtle.importKey(
    'raw',
    rawBuffer as unknown as BufferSource,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a string: Gzips first, then AES-GCM encrypts with random 12-byte IV.
 * Returns base64url ciphertext containing [12-byte IV + AES ciphertext].
 */
export async function encryptPayload(plaintext: string, key: CryptoKey): Promise<string> {
  const compressed = await compressString(plaintext);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    compressed as unknown as BufferSource
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(iv.length + encryptedBytes.length);
  combined.set(iv, 0);
  combined.set(encryptedBytes, iv.length);

  return uint8ArrayToBase64Url(combined);
}

/**
 * Decrypts a base64url payload: extracts 12-byte IV, decrypts AES-GCM, then decompresses gzip.
 */
export async function decryptPayload(combinedBase64Url: string, key: CryptoKey): Promise<string> {
  const combined = base64UrlToUint8Array(combinedBase64Url);
  if (combined.length < 13) {
    throw new Error('Invalid encrypted payload length');
  }

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    ciphertext as unknown as BufferSource
  );

  return await decompressString(new Uint8Array(decryptedBuffer));
}
