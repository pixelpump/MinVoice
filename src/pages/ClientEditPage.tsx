import { useParams, useNavigate } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import ClientForm from '../components/clients/ClientForm';
import type { Client } from '../lib/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { getClient } from '../lib/db';

export default function ClientEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { save } = useClients();
  const client = useLiveQuery(() => getClient(Number(id)), [id]);

  const handleSave = async (client: Client) => {
    await save(client);
    navigate('/clients', { replace: true });
    return 0;
  };

  if (!client) {
    return (
      <div className="text-center py-20 text-sm text-muted">Loading...</div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
          Edit {client.name}
        </h2>
      </div>
      <ClientForm initial={client} onSave={handleSave} />
    </div>
  );
}
