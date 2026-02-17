import { useMemo, useState } from 'react';
import { useShopStore } from '../store/shopStore';
import {
  UserCircle,
  ShieldCheck,
  Server,
  KeyRound,
  Save,
  CheckCircle,
  AlertTriangle,
  Activity,
} from 'lucide-react';

export function AdminProfile() {
  const { adminProfile, updateAdminProfile, settings } = useShopStore();
  const [draft, setDraft] = useState(adminProfile);
  const [saved, setSaved] = useState(false);

  const supabaseConfigured = useMemo(() => {
    return !!settings.supabaseUrl.trim() && !!settings.supabaseAnonKey.trim();
  }, [settings.supabaseAnonKey, settings.supabaseUrl]);

  const fulfillmentReady = useMemo(() => {
    if (!supabaseConfigured) return false;
    return !!settings.supabaseFnCreateOrder && !!settings.supabaseFnFulfillOrder && !!settings.supabaseFnSendEmail;
  }, [settings, supabaseConfigured]);

  const handleSave = () => {
    updateAdminProfile({
      displayName: draft.displayName,
      email: draft.email,
      role: draft.role,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-primary-400" /> Admin Profile
          </h2>
          <p className="text-sm text-gray-500">Owner/admin identity + operational readiness checks.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-gray-300">Session: demo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Username</label>
              <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300">
                {adminProfile.username}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Role</label>
              <select
                value={draft.role}
                onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value as typeof p.role }))}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="ops">Ops</option>
                <option value="support">Support</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Display name</label>
              <input
                value={draft.displayName}
                onChange={(e) => setDraft((p) => ({ ...p, displayName: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Email</label>
              <input
                value={draft.email}
                onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold"
          >
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved' : 'Save profile'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-semibold text-white">Autonomy Readiness</h3>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <StatusRow
                ok={supabaseConfigured}
                title="Supabase configured"
                desc={supabaseConfigured ? 'URL + anon key set' : 'Set Supabase URL + anon key in Admin Settings'}
              />
              <StatusRow
                ok={fulfillmentReady}
                title="Fulfillment Edge Functions"
                desc={fulfillmentReady ? 'create_order / fulfill_order / send_email ready' : 'Set Edge Function names in Settings'}
              />
              <StatusRow
                ok={settings.autoFulfillment && settings.autopilotEnabled}
                title="Auto-fulfillment enabled"
                desc={settings.autoFulfillment ? 'Module enabled' : 'Enable Auto Fulfillment module'}
              />
              <StatusRow
                ok={settings.autoSupport}
                title="Auto-support enabled"
                desc={settings.autoSupport ? 'Chat support module enabled' : 'Enable Auto Support module'}
              />
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Operational Notes</h3>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              For production, keep API keys server-side, use Supabase Auth + RLS, and execute fulfillment + email sending via Edge Functions.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-400">
              <Activity className="w-3.5 h-3.5" />
              Autopilot modules are toggled in Admin → Settings.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ ok, title, desc }: { ok: boolean; title: string; desc: string }) {
  return (
    <div className={`p-3 rounded-xl border ${ok ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">
          {ok ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
        </div>
        <div>
          <p className={`text-xs font-semibold ${ok ? 'text-emerald-300' : 'text-amber-300'}`}>{title}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
        </div>
      </div>
    </div>
  );
}
