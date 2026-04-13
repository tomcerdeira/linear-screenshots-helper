import { LinearClient } from '@linear/sdk';
import { getApiKey } from './store';

let client: LinearClient | null = null;

export function getLinearClient(): LinearClient {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Linear API key not configured. Please set it in Settings.');
  }

  if (!client) {
    client = new LinearClient({ apiKey });
  }

  return client;
}

export function resetClient(): void {
  client = null;
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}
