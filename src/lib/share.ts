import lzstring from 'lz-string';
import type { Invoice, Client, Settings } from './types';

export interface SharePayload {
  invoice: Invoice;
  client: Client;
  settings: Settings;
}

export function encodeSharePayload(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  return lzstring.compressToEncodedURIComponent(json);
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    const json = lzstring.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function buildShareUrl(encoded: string): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}#/share/${encoded}`;
}
