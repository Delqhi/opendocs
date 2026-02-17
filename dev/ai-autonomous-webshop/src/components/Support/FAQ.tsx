import { useState } from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { SupportPageShell } from './SupportPageShell';

const FAQ = [
  { q: 'Do you ship worldwide?', a: 'Yes. Standard shipping is free worldwide on most products.' },
  { q: 'How long does delivery take?', a: 'Standard: 5–12 business days. Express/Priority: 1–5 business days where available.' },
  { q: 'Do you offer refunds?', a: 'Yes. 30-day returns with buyer protection (template policy). Replace with your legal policy in production.' },
  { q: 'Are products affiliate or dropship?', a: 'Both. Each product can be configured as affiliate or dropship in Admin.' },
  { q: 'Is the AI real?', a: 'The UI supports real provider configuration (Ollama/OpenAI/Anthropic). This demo build uses local simulation unless you connect a backend.' },
];

export function SupportFAQ() {
  const [open, setOpen] = useState<string | null>(FAQ[0]?.q ?? null);

  return (
    <SupportPageShell title="FAQ" subtitle="Quick answers to the most common questions.">
      <div className="space-y-2">
        {FAQ.map((item) => (
          <button
            key={item.q}
            onClick={() => setOpen(open === item.q ? null : item.q)}
            className="w-full text-left surface border border-subtle rounded-2xl p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-muted" />
                <span className="text-sm font-semibold text-foreground">{item.q}</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-muted transition-transform ${open === item.q ? 'rotate-90' : ''}`} />
            </div>
            {open === item.q && (
              <p className="text-xs text-muted mt-2 leading-relaxed">{item.a}</p>
            )}
          </button>
        ))}
      </div>
    </SupportPageShell>
  );
}
