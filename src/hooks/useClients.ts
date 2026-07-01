import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useCallback } from 'react';
import { getAllClients, getClient, saveClient, deleteClient } from '../lib/db';
import type { Client } from '../lib/types';

export function useClients() {
  const clients = useLiveQuery(() => getAllClients(), []) ?? [];
  const [loading, setLoading] = useState(false);

  const get = useCallback(async (id: number) => {
    return getClient(id);
  }, []);

  const save = useCallback(async (client: Client) => {
    setLoading(true);
    const id = await saveClient(client);
    setLoading(false);
    return id;
  }, []);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    await deleteClient(id);
    setLoading(false);
  }, []);

  return { clients, get, save, remove, loading };
}
