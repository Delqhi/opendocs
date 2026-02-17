import { useState } from 'react';
import { useShopStore, type UserAddress } from '../../store/shopStore';
import { MapPin, Plus, Trash2 } from 'lucide-react';

export function AccountAddresses() {
  const { userAddresses, addAddress, deleteAddress } = useShopStore();
  const [draft, setDraft] = useState<UserAddress>({
    id: '',
    label: 'Home',
    name: '',
    address1: '',
    city: '',
    zip: '',
    country: 'US',
  });

  const handleAdd = () => {
    if (!draft.name || !draft.address1) return;
    addAddress({ ...draft, id: `addr-${Date.now()}` });
    setDraft({ id: '', label: 'Home', name: '', address1: '', city: '', zip: '', country: 'US' });
  };

  return (
    <div className="space-y-4">
      <div className="surface border border-subtle rounded-2xl p-4">
        <div className="flex items-center gap-2 text-sm text-foreground mb-3"><Plus className="w-4 h-4" /> Add address</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input className="surface border border-subtle rounded-lg px-3 py-2 text-xs text-foreground" placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <input className="surface border border-subtle rounded-lg px-3 py-2 text-xs text-foreground" placeholder="Label" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          <input className="surface border border-subtle rounded-lg px-3 py-2 text-xs text-foreground" placeholder="Address" value={draft.address1} onChange={(e) => setDraft({ ...draft, address1: e.target.value })} />
          <input className="surface border border-subtle rounded-lg px-3 py-2 text-xs text-foreground" placeholder="City" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
          <input className="surface border border-subtle rounded-lg px-3 py-2 text-xs text-foreground" placeholder="ZIP" value={draft.zip} onChange={(e) => setDraft({ ...draft, zip: e.target.value })} />
          <input className="surface border border-subtle rounded-lg px-3 py-2 text-xs text-foreground" placeholder="Country" value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
        </div>
        <button onClick={handleAdd} className="mt-3 px-3 py-2 rounded-lg bg-foreground text-white text-xs font-semibold">Save address</button>
      </div>

      {userAddresses.length === 0 ? (
        <div className="surface border border-subtle rounded-2xl p-6 text-center">
          <MapPin className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {userAddresses.map((address) => (
            <div key={address.id} className="surface border border-subtle rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground font-semibold">{address.label}</p>
                <button onClick={() => deleteAddress(address.id)} className="text-xs text-red-500"><Trash2 className="w-3 h-3" /></button>
              </div>
              <p className="text-xs text-muted mt-1">{address.name}</p>
              <p className="text-xs text-muted">{address.address1}</p>
              <p className="text-xs text-muted">{address.city}, {address.zip}</p>
              <p className="text-xs text-muted">{address.country}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
