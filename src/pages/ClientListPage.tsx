import { Link } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import { useState } from 'react';
import EmptyState from '../components/shared/EmptyState';
import ConfirmDialog from '../components/shared/ConfirmDialog';

export default function ClientListPage() {
  const { clients, remove } = useClients();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await remove(deleteId);
      setDeleteId(null);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete client');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Clients</h2>
          <p className="text-sm text-muted mt-1">{clients.length} clients</p>
        </div>
        <Link
          to="/clients/new"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-accent rounded-lg hover:opacity-90 transition-opacity inline-block w-fit"
        >
          New Client
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Add your first client to start creating invoices."
          action={
            <Link
              to="/clients/new"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-accent rounded-lg hover:opacity-90 transition-opacity"
            >
              New Client
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-border bg-neutral-50/50 text-left">
                <th className="px-4 py-3 font-medium text-muted">Name</th>
                <th className="px-4 py-3 font-medium text-muted hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 font-medium text-muted hidden sm:table-cell">Phone</th>
                <th className="px-4 py-3 font-medium text-muted w-20"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-border last:border-0 hover:bg-neutral-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/clients/${client.id}/edit`}
                      className="font-medium text-accent hover:underline"
                    >
                      {client.name}
                    </Link>
                    <div className="sm:hidden text-xs text-neutral-400 mt-0.5">
                      {client.email && <span>{client.email}</span>}
                      {client.email && client.phone && <span> · </span>}
                      {client.phone && <span>{client.phone}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell">{client.email || '—'}</td>
                  <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell">{client.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteId(client.id ?? null)}
                      className="text-xs text-muted hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Client"
        message="Are you sure you want to delete this client?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
