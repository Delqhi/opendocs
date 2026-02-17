import { useState, useTransition } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { useCatalogStore } from '../hooks/useCatalog';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isSearching, startTransition] = useTransition();
  const { searchProducts, fetchProducts } = useCatalogStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (query.trim()) {
        await searchProducts(query);
      } else {
        await fetchProducts();
      }
    });
  };

  const clearSearch = () => {
    setQuery('');
    startTransition(async () => {
      await fetchProducts();
    });
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xl group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {isSearching ? (
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        ) : (
          <SearchIcon className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
        )}
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="block w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all backdrop-blur-md"
        placeholder="Search products, categories, or AI trends..."
      />
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </form>
  );
};
