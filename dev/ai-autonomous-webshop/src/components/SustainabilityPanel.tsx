import { Leaf, Globe, Recycle } from 'lucide-react';

export function SustainabilityPanel() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        { icon: <Leaf className="w-4 h-4" />, title: 'Eco packaging', text: 'Recycled, plastic-free materials' },
        { icon: <Recycle className="w-4 h-4" />, title: 'Carbon neutral', text: 'Offsets per shipment batch' },
        { icon: <Globe className="w-4 h-4" />, title: 'Global compliance', text: 'RoHS + CE certified supply' },
      ].map((item) => (
        <div key={item.title} className="surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 text-foreground">
            {item.icon}
            <p className="text-sm font-semibold">{item.title}</p>
          </div>
          <p className="text-xs text-muted mt-2">{item.text}</p>
        </div>
      ))}
    </div>
  );
}
