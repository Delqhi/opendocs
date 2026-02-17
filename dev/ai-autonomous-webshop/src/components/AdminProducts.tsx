import { useMemo, useState } from 'react';
import { Plus, Search, Tag, Trash2, PencilLine, Link, PackageCheck } from 'lucide-react';
import { useShopStore, type Product } from '../store/shopStore';

const categories = ['Phone Accessories', 'Health & Wellness', 'Smart Home', 'Audio & Tech', 'Beauty Tech', 'Pet Products', 'Car Accessories', 'Home & Kitchen', 'Wearables'];

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  description: '',
  price: 0,
  originalPrice: 0,
  category: 'Phone Accessories',
  image: '',
  rating: 4.7,
  reviews: 0,
  stock: 100,
  aiScore: 90,
  trending: false,
  tags: [],
  supplier: '',
  margin: 60,
  aiOptimized: true,
  demandScore: 90,
  sold: 0,
  sourceType: 'dropship',
  affiliateUrl: '',
  supplierId: '',
  supplierPrice: 0,
  sku: '',
  status: 'active',
};

export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, suppliers, affiliateNetworks } = useShopStore();
  const [query, setQuery] = useState('');
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [tagInput, setTagInput] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((product) =>
      !q || product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q)
    );
  }, [products, query]);

  const handleAdd = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.originalPrice) return;
    addProduct({
      ...newProduct,
      id: `prod-${Date.now()}`,
      tags: newProduct.tags.filter(Boolean),
      supplier: suppliers.find((s) => s.id === newProduct.supplierId)?.name ?? newProduct.supplier,
    });
    setNewProduct(emptyProduct);
    setTagInput('');
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setNewProduct((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
    setTagInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Product Catalog</h2>
          <p className="text-sm text-gray-500">Manage affiliate + dropship products in one place.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <PackageCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-gray-300">{products.length} active listings</span>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Plus className="w-4 h-4" /> Add new product</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Product name"
            value={newProduct.name}
            onChange={(event) => setNewProduct((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Category"
            value={newProduct.category}
            onChange={(event) => setNewProduct((prev) => ({ ...prev, category: event.target.value }))}
            list="categories"
          />
          <input
            type="number"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Price"
            value={newProduct.price || ''}
            onChange={(event) => setNewProduct((prev) => ({ ...prev, price: Number(event.target.value) }))}
          />
          <input
            type="number"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Original price"
            value={newProduct.originalPrice || ''}
            onChange={(event) => setNewProduct((prev) => ({ ...prev, originalPrice: Number(event.target.value) }))}
          />
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Image URL"
            value={newProduct.image}
            onChange={(event) => setNewProduct((prev) => ({ ...prev, image: event.target.value }))}
          />
          <select
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            value={newProduct.sourceType}
            onChange={(event) => setNewProduct((prev) => ({ ...prev, sourceType: event.target.value as Product['sourceType'] }))}
          >
            <option value="dropship">Dropship</option>
            <option value="affiliate">Affiliate</option>
            <option value="own">Own (in-house)</option>
          </select>

          {/* Supplier selection (dropship/own) */}
          <select
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            value={newProduct.supplierId}
            onChange={(event) => setNewProduct((prev) => ({ ...prev, supplierId: event.target.value }))}
            disabled={newProduct.sourceType === 'affiliate'}
          >
            <option value="">Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>

          {/* Affiliate network selection (affiliate) */}
          <select
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            value={newProduct.affiliateNetworkId ?? ''}
            onChange={(event) => setNewProduct((prev) => ({ ...prev, affiliateNetworkId: event.target.value }))}
            disabled={newProduct.sourceType !== 'affiliate'}
          >
            <option value="">Affiliate network</option>
            {affiliateNetworks.map((n) => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>

          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            placeholder="Affiliate link"
            value={newProduct.affiliateUrl}
            onChange={(event) => setNewProduct((prev) => ({ ...prev, affiliateUrl: event.target.value }))}
            disabled={newProduct.sourceType !== 'affiliate'}
          />
        </div>
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
          placeholder="Short description"
          rows={2}
          value={newProduct.description}
          onChange={(event) => setNewProduct((prev) => ({ ...prev, description: event.target.value }))}
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <input
              className="bg-transparent text-sm text-white outline-none"
              placeholder="Add tag"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addTag())}
            />
          </div>
          <button onClick={addTag} className="px-3 py-2 rounded-xl bg-white text-black text-xs font-semibold">Add tag</button>
          <div className="flex flex-wrap gap-2">
            {newProduct.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 rounded-full bg-white/10 text-xs text-gray-300">{tag}</span>
            ))}
          </div>
        </div>
        <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add to catalog
        </button>
        <datalist id="categories">
          {categories.map((category) => (<option key={category} value={category} />))}
        </datalist>
      </div>

      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Catalog overview</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="bg-white/5 border border-white/10 rounded-xl px-9 py-2 text-sm text-white"
              placeholder="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="space-y-3">
          {filtered.map((product) => (
            <div key={product.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-white/5">
              <img src={product.image} alt={product.name} className="w-full md:w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{product.name}</h4>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">{product.category}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{product.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-gray-400">
                  <span className="px-2 py-1 rounded-full bg-white/10">{product.sourceType}</span>
                  {product.affiliateUrl && (
                    <span className="flex items-center gap-1"><Link className="w-3 h-3" /> Affiliate linked</span>
                  )}
                  <span>Stock: {product.stock}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>${product.price.toFixed(2)}</span>
                  <span className="text-[10px] uppercase">{product.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="flex-1 px-3 py-2 rounded-xl bg-white text-black text-xs font-semibold flex items-center justify-center gap-2"
                    onClick={() => updateProduct(product.id, { status: product.status === 'active' ? 'draft' : 'active' })}
                  >
                    <PencilLine className="w-3.5 h-3.5" /> Toggle status
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs"
                    onClick={() => deleteProduct(product.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-gray-500">No products found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
