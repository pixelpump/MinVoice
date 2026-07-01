import type { Client } from '../../lib/types';

interface Props {
  initial?: Client;
  onSave: (client: Client) => Promise<number>;
}

export default function ClientForm({ initial, onSave }: Props) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const client: Client = {
      id: initial?.id,
      name: form.get('name') as string,
      email: form.get('email') as string,
      address: form.get('address') as string,
      phone: form.get('phone') as string,
      createdAt: initial?.createdAt ?? Date.now(),
    };
    await onSave(client);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
        <input
          name="name"
          type="text"
          required
          defaultValue={initial?.name}
          placeholder="Acme Corp"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={initial?.email}
          placeholder="billing@acme.com"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
        <textarea
          name="address"
          defaultValue={initial?.address}
          rows={2}
          placeholder="456 Oak Ave&#10;New York, NY 10001"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
        <input
          name="phone"
          type="text"
          defaultValue={initial?.phone}
          placeholder="+1 (555) 000-0000"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>
      <div className="pt-4 border-t border-border">
        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-semibold text-white bg-accent rounded-lg hover:opacity-90 transition-opacity"
        >
          {initial ? 'Update Client' : 'Create Client'}
        </button>
      </div>
    </form>
  );
}
