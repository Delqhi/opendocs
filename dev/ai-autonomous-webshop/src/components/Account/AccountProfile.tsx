import { useState } from 'react';
import { useShopStore } from '../../store/shopStore';

export function AccountProfile() {
  const { userSession, updateProfile } = useShopStore();
  const profile = userSession.profile;
  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [lastName, setLastName] = useState(profile?.lastName ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');

  const handleSave = () => {
    updateProfile({ firstName, lastName, phone });
  };

  if (!profile) {
    return (
      <div className="surface border border-subtle rounded-2xl p-6 text-center text-sm text-muted">
        Sign in to manage your profile.
      </div>
    );
  }

  return (
    <div className="surface border border-subtle rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Profile</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="surface border border-subtle rounded-lg px-3 py-2 text-xs text-foreground" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
        <input className="surface border border-subtle rounded-lg px-3 py-2 text-xs text-foreground" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
        <input className="surface border border-subtle rounded-lg px-3 py-2 text-xs text-foreground" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
      </div>
      <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-foreground text-white text-xs font-semibold">Save changes</button>
    </div>
  );
}
