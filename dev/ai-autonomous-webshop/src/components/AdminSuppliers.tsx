import { useMemo, useState } from 'react';
import { Plus, Search, Building2, Trash2, PencilLine, Globe, Link2, Download, Loader2 } from 'lucide-react';
import { useShopStore, type AdminSupplier } from '../store/shopStore';
import { importCatalogFromUrl } from '../utils/catalogImport';

const emptySupplier: Omit<AdminSupplier, 'id'> = {
  name: '',
  type: 'dropship',
  region: 'Global',
  status: 'active',
  rating: 4.6,
  shippingTime: '5-8 days',
  priceIndex: 80,
  apiEndpoint: '',
  orderEndpoint: '',
  catalogUrl: '',
  catalogFormat: 'json',
  catalogAuthHeader: '',
  defaultAffiliateNetworkId: '',
  website: '',
  contactEmail: '',
  notes: '',
};

export function AdminSuppliers() {
  const {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    affiliateNetworks,
    bulkUpsertProducts,
    pushToast,
  } = useShopStore();

  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState(emptySupplier);
  const [importingSupplierId, setImportingSupplierId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return suppliers;
    return suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(q) ||
      supplier.region.toLowerCase().includes(q) ||
      supplier.type.toLowerCase().includes(q)
    );
  }, [suppliers, query]);

  const handleAdd = () => {
    if (!draft.name.trim()) {
      pushToast({ type: 'error', message: 'Supplier name is required.' });
      return;
    }
    addSupplier({
      ...draft,
      id: `sup-${Date.now()}`,
      name: draft.name.trim(),
      region: draft.region.trim() || 'Global',
      apiEndpoint: draft.apiEndpoint?.trim() || undefined,
      orderEndpoint: draft.orderEndpoint?.trim() || undefined,
      catalogUrl: draft.catalogUrl?.trim() || undefined,
      catalogAuthHeader: draft.catalogAuthHeader?.trim() || undefined,
      website: draft.website?.trim() || undefined,
      contactEmail: draft.contactEmail?.trim() || undefined,
      notes: draft.notes?.trim() || undefined,
      defaultAffiliateNetworkId: draft.defaultAffiliateNetworkId?.trim() || undefined,
    });
    setDraft(emptySupplier);
    pushToast({ type: 'success', message: 'Supplier added.' });
  };

  const runCatalogImport = async (supplier: AdminSupplier) => {
    if (!supplier.catalogUrl || !supplier.catalogFormat) {
      pushToast({ type: 'error', message: 'Missing catalog URL or format.' });
      return;
    }

    setImportingSupplierId(supplier.id);
    try {
      const res = await importCatalogFromUrl({
        supplier,
        url: supplier.catalogUrl,
        format: supplier.catalogFormat,
        authHeader: supplier.catalogAuthHeader,
      });

      // Optional: if supplier is affiliate and has a default network, stamp it onto imported products when missing.
      const stamped = res.products.map((p) => {
        if ((p.sourceType ?? 'dropship') !== 'affiliate') return p;
        if (p.affiliateNetworkId) return p;
        if (supplier.defaultAffiliateNetworkId) return { ...p, affiliateNetworkId: supplier.defaultAffiliateNetworkId };
        return p;
      });

      bulkUpsertProducts(stamped, { prepend: true });

      if (res.warnings.length > 0) {
        pushToast({ type: 'info', message: `Imported ${stamped.length} products with ${res.warnings.length} warning(s).` });
      } else {
        pushToast({ type: 'success', message: `Imported ${stamped.length} products.` });
      }
    } catch (e) {
      pushToast({ type: 'error', message: 'Catalog import failed. Check URL/CORS/Auth.' });
    } finally {
      setImportingSupplierId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Suppliers & Networks</h2>
          <p className="text-sm text-gray-500">Connect dropship, warehouse, and affiliate partners. Import supplier catalogs into your product list.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-gray-300">{suppliers.length} suppliers</span>
        </div>
      </div>

      {/* Add Supplier */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Plus className="w-4 h-4" /> Add supplier</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Supplier name"
            value={draft.name}
            onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
          />
          <select
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            value={draft.type}
            onChange={(event) => setDraft((prev) => ({ ...prev, type: event.target.value as AdminSupplier['type'] }))}
          >
            <option value="dropship">Dropship</option>
            <option value="affiliate">Affiliate</option>
            <option value="warehouse">Warehouse</option>
          </select>
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Region"
            value={draft.region}
            onChange={(event) => setDraft((prev) => ({ ...prev, region: event.target.value }))}
          />
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Shipping time"
            value={draft.shippingTime}
            onChange={(event) => setDraft((prev) => ({ ...prev, shippingTime: event.target.value }))}
          />
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="API endpoint (optional)"
            value={draft.apiEndpoint}
            onChange={(event) => setDraft((prev) => ({ ...prev, apiEndpoint: event.target.value }))}
          />
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Order endpoint (optional)"
            value={draft.orderEndpoint}
            onChange={(event) => setDraft((prev) => ({ ...prev, orderEndpoint: event.target.value }))}
          />
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Website"
            value={draft.website}
            onChange={(event) => setDraft((prev) => ({ ...prev, website: event.target.value }))}
          />
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Contact email"
            value={draft.contactEmail}
            onChange={(event) => setDraft((prev) => ({ ...prev, contactEmail: event.target.value }))}
          />
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Price index"
            type="number"
            value={draft.priceIndex}
            onChange={(event) => setDraft((prev) => ({ ...prev, priceIndex: Number(event.target.value) }))}
          />

          {/* Catalog fields */}
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white md:col-span-2"
            placeholder="Catalog feed URL (JSON/CSV)"
            value={draft.catalogUrl ?? ''}
            onChange={(event) => setDraft((prev) => ({ ...prev, catalogUrl: event.target.value }))}
          />
          <select
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            value={draft.catalogFormat ?? 'json'}
            onChange={(event) => setDraft((prev) => ({ ...prev, catalogFormat: event.target.value as 'json' | 'csv' }))}
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Auth header (optional) e.g. Authorization: Bearer xxx"
            value={draft.catalogAuthHeader ?? ''}
            onChange={(event) => setDraft((prev) => ({ ...prev, catalogAuthHeader: event.target.value }))}
          />

          {/* Default affiliate network */}
          <select
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            value={draft.defaultAffiliateNetworkId ?? ''}
            onChange={(event) => setDraft((prev) => ({ ...prev, defaultAffiliateNetworkId: event.target.value }))}
            disabled={draft.type !== 'affiliate'}
          >
            <option value="">Default affiliate network</option>
            {affiliateNetworks.map((n) => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>

        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
          placeholder="Notes"
          rows={2}
          value={draft.notes}
          onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
        />

        <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add supplier
        </button>
      </div>

      {/* Suppliers List */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Active suppliers</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="bg-white/5 border border-white/10 rounded-xl px-9 py-2 text-sm text-white"
              placeholder="Search suppliers"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((supplier) => (
            <div key={supplier.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{supplier.name}</h4>
                    <p className="text-xs text-gray-500">{supplier.region} · {supplier.type} · {supplier.status}</p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
                  <div>Shipping: <span className="text-gray-200">{supplier.shippingTime}</span></div>
                  <div>Price index: <span className="text-gray-200">{supplier.priceIndex}</span></div>
                  <div className="flex items-center gap-1"><Link2 className="w-3 h-3" /> {supplier.apiEndpoint || supplier.website || 'No link'}</div>
                  <div className="truncate">Catalog: <span className="text-gray-200">{supplier.catalogUrl ? supplier.catalogFormat?.toUpperCase() : '—'}</span></div>
                </div>

                <div className="flex items-center gap-2 min-w-[240px]">
                  <button
                    className="flex-1 px-3 py-2 rounded-xl bg-white text-black text-xs font-semibold flex items-center justify-center gap-2"
                    onClick={() => updateSupplier(supplier.id, { status: supplier.status === 'active' ? 'paused' : 'active' })}
                  >
                    <PencilLine className="w-3.5 h-3.5" /> Toggle
                  </button>

                  <button
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 hover:bg-white/10 flex items-center justify-center gap-2 disabled:opacity-60"
                    onClick={() => runCatalogImport(supplier)}
                    disabled={!supplier.catalogUrl || importingSupplierId === supplier.id}
                    aria-label="Import catalog"
                  >
                    {importingSupplierId === supplier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Import
                  </button>

                  <button
                    className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs"
                    onClick={() => deleteSupplier(supplier.id)}
                    aria-label="Delete supplier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-sm text-gray-500">No suppliers found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
