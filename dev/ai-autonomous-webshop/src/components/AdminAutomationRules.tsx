import { useShopStore } from '../store/shopStore';
import { Zap, Plus, Trash2, Play, Settings, Mail, Truck, Shield } from 'lucide-react';

const TRIGGER_OPTIONS = [
  { value: 'on_order_paid', label: 'Order Paid' },
  { value: 'on_stock_low', label: 'Stock Low (< 20)' },
  { value: 'on_new_user', label: 'User Registered' },
  { value: 'on_fulfillment_fail', label: 'Fulfillment Failed' },
];

const ACTION_OPTIONS = [
  { value: 'send_email', label: 'Send Email (Template)' },
  { value: 'trigger_n8n', label: 'Trigger n8n Workflow' },
  { value: 'buy_supplier', label: 'Order from Supplier' },
  { value: 'notify_admin', label: 'Push Notification' },
];

export function AdminAutomationRules() {
  const { automationRules: rules, addAutomationRule, updateAutomationRule, deleteAutomationRule, pushToast } = useShopStore();

  const addRule = () => {
    addAutomationRule({
      id: Date.now().toString(),
      trigger: 'on_order_paid',
      condition: 'true',
      action: 'send_email',
      active: true,
    });
    pushToast({ type: 'success', message: 'Automation rule added' });
  };

  const removeRule = (id: string) => {
    deleteAutomationRule(id);
    pushToast({ type: 'info', message: 'Rule deleted' });
  };

  const toggleRule = (id: string, active: boolean) => {
    updateAutomationRule(id, { active });
  };

  const updateRuleField = (id: string, field: 'trigger' | 'action', value: string) => {
    updateAutomationRule(id, { [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" /> Automation Rules Engine
          </h2>
          <p className="text-xs text-gray-500">Edge Function Workflows (If-Then Logic)</p>
        </div>
        <button 
          onClick={addRule}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-100"
        >
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-6">
            <div className={`p-3 rounded-xl ${rule.active ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-gray-500'}`}>
              <Play className="w-5 h-5" />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[9px] uppercase tracking-widest text-gray-500 block mb-1">When (Trigger)</label>
                <select 
                  value={rule.trigger}
                  onChange={(e) => updateRuleField(rule.id, 'trigger', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                >
                  {TRIGGER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-center pt-4">
                <ArrowRight className="w-4 h-4 text-gray-700" />
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-widest text-gray-500 block mb-1">Then (Action)</label>
                <select 
                  value={rule.action}
                  onChange={(e) => updateRuleField(rule.id, 'action', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                >
                  {ACTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleRule(rule.id, !rule.active)}
                className={`p-2 rounded-lg border transition-all ${rule.active ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-white/10 text-gray-500'}`}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button 
                onClick={() => removeRule(rule.id)}
                className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <Mail className="w-5 h-5 text-blue-400 mb-2" />
          <h4 className="text-xs font-bold text-white">Email Flow Active</h4>
          <p className="text-[10px] text-gray-500">3 templates linked</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <Truck className="w-5 h-5 text-amber-400 mb-2" />
          <h4 className="text-xs font-bold text-white">Auto-Ordering</h4>
          <p className="text-[10px] text-gray-500">2 suppliers connected</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <Shield className="w-5 h-5 text-emerald-400 mb-2" />
          <h4 className="text-xs font-bold text-white">Anti-Fraud Rules</h4>
          <p className="text-[10px] text-gray-500">Risk scoring enabled</p>
        </div>
      </div>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
  );
}
