import { useNavigate } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import ClientForm from '../components/clients/ClientForm';
import type { Client } from '../lib/types';

export default function ClientNewPage() {
  const navigate = useNavigate();
  const { save } = useClients();

  const handleSave = async (client: Client) => {
    await save(client);
    navigate('/clients', { replace: true });
    return 0;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">New Client</h2>
      </div>
      <ClientForm onSave={handleSave} />
    </div>
  );
}
