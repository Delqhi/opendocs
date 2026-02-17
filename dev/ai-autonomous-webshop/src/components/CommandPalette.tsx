import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { 
  Search, Command, ShoppingBag, Settings, Truck, 
  Brain, BarChart3, Megaphone, Globe, Wallet, Layout, Package, 
  Building2, Plug, Zap, X, CornerDownLeft,
  ArrowUp, ArrowDown, Clock, Sparkles, Filter, DollarSign,
  Mic, MicOff, Hash, ChevronRight, TrendingUp,
  Star, Percent, Tag, Home, Plus, RefreshCw, Download, Upload
} from 'lucide-react';
import { useShopStore } from '../store/shopStore';

// Fuzzy match helper
const fuzzyMatch = (text: string, query: string): boolean => {
  if (!query) return true;
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  if (textLower.includes(queryLower)) return true;
  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) queryIndex++;
  }
  return queryIndex === queryLower.length;
};

const SYNONYMS: Record<string, string[]> = {
  phone: ['mobile', 'iphone', 'android', 'smartphone', 'charger', 'magsafe'],
  charger: ['charging', 'power', 'battery', 'usb', 'cable'],
  audio: ['earbuds', 'headphones', 'speaker', 'sound', 'music'],
  beauty: ['skincare', 'cosmetic', 'face', 'mask', 'curler'],
  pet: ['dog', 'cat', 'animal', 'collar', 'gps'],
  car: ['auto', 'vehicle', 'driving', 'mount'],
  smart: ['home', 'iot', 'wifi', 'automation'],
  health: ['fitness', 'wellness', 'massage', 'tracker'],
  cheap: ['budget', 'affordable', 'deal', 'discount', 'sale'],
  best: ['top', 'popular', 'trending', 'bestseller', 'hot'],
  settings: ['config', 'configuration', 'preferences', 'options'],
  dashboard: ['overview', 'stats', 'analytics', 'home'],
  orders: ['purchases', 'tracking', 'shipments', 'deliveries'],
};

const expandQuery = (query: string): string[] => {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const expanded = new Set(terms);
  terms.forEach(term => {
    Object.entries(SYNONYMS).forEach(([key, values]) => {
      if (key.includes(term) || term.includes(key)) {
        values.forEach(v => expanded.add(v));
        expanded.add(key);
      }
      if (values.some(v => v.includes(term) || term.includes(v))) {
        expanded.add(key);
        values.forEach(v => expanded.add(v));
      }
    });
  });
  return Array.from(expanded);
};

interface CommandItem {
  id: string;
  type: 'navigation' | 'action' | 'product' | 'category' | 'recent' | 'quick';
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
  badge?: string;
  badgeColor?: string;
}

interface CommandPaletteProps {
  isAdmin?: boolean;
  onNavigate?: (view: string) => void;
}

export function CommandPalette({ isAdmin = false, onNavigate }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<'all' | 'products' | 'commands' | 'categories'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  
  const { products, setSearchQuery, setSelectedCategory, setCurrentView, addToCart, cart, toggleAiAutoPilot, aiAutoPilot, darkMode } = useShopStore();

  // Theming helpers
  const surface = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const headerBorder = darkMode ? 'border-gray-700' : 'border-gray-200';
  const headerBg = darkMode ? '' : '';
  const inputText = darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500';
  const tabsRow = darkMode ? 'border-gray-800 bg-gray-900/60' : 'border-gray-200 bg-gray-50';
  const tabActive = darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900';
  const tabInactive = darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-gray-900';
  const groupHeader = darkMode ? 'bg-gray-900/95 text-gray-600' : 'bg-white/95 text-gray-500';
  const rowSelected = darkMode ? 'bg-white/10' : 'bg-gray-100';
  const rowHover = darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50';
  const rowTitle = darkMode ? 'text-white' : 'text-gray-900';
  const rowSubtitle = darkMode ? 'text-gray-500' : 'text-gray-600';
  const keycap = darkMode ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-700';
  const footer = darkMode ? 'border-gray-800 bg-gray-900/60 text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-600';

  useFocusTrap({
    active: open,
    containerRef: dialogRef,
    onEscape: () => setOpen(false),
    initialFocusSelector: 'input',
    lockScroll: true,
  });

  // Check speech support
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    setSpeechSupported(!!(win.SpeechRecognition || win.webkitSpeechRecognition));
  }, []);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nexus_recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim() || term.length < 2) return;
    setRecentSearches(prev => {
      const cleaned = term.trim().toLowerCase();
      const next = [cleaned, ...prev.filter(s => s !== cleaned)].slice(0, 8);
      try { localStorage.setItem('nexus_recent_searches', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try { localStorage.removeItem('nexus_recent_searches'); } catch {}
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(prev => !prev); }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) { e.preventDefault(); setOpen(true); setQuery('/'); }
      if (e.key === 'Escape' && open) { e.preventDefault(); setOpen(false); }
    };
    const handleOpen = () => setOpen(true);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setMode('all');
    } else {
      setQuery('');
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    }
  }, [open]);

  const parsedQuery = useMemo(() => {
    const q = query.trim();
    if (q.startsWith('/')) return { prefix: 'command' as const, term: q.slice(1).trim() };
    if (q.startsWith('>')) return { prefix: 'action' as const, term: q.slice(1).trim() };
    if (q.startsWith('@')) return { prefix: 'category' as const, term: q.slice(1).trim() };
    if (q.startsWith('#')) return { prefix: 'tag' as const, term: q.slice(1).trim() };
    if (q.startsWith('$')) return { prefix: 'price' as const, term: q.slice(1).trim() };
    if (q.startsWith('!')) return { prefix: 'quick' as const, term: q.slice(1).trim() };
    return { prefix: null, term: q };
  }, [query]);

  const categories = useMemo(() => [
    'All', 'Phone Accessories', 'Health & Wellness', 'Smart Home', 
    'Audio & Tech', 'Beauty Tech', 'Pet Products', 'Car Accessories', 
    'Home & Kitchen', 'Wearables'
  ], []);

  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    if (!isAdmin) {
      items.push({
        id: 'quick-cart', type: 'quick', icon: <ShoppingBag className="w-4 h-4" />, title: 'Open Cart',
        subtitle: cart.length > 0 ? `${cart.reduce((s, i) => s + i.quantity, 0)} items` : 'Empty',
        shortcut: '!cart', action: () => { window.dispatchEvent(new CustomEvent('toggle-mobile-cart')); setOpen(false); },
        keywords: ['cart', 'basket', 'checkout', 'buy'],
      });
      items.push({ id: 'quick-deals', type: 'quick', icon: <Percent className="w-4 h-4" />, title: 'View Deals', subtitle: 'Products on sale', action: () => { setSearchQuery('deal'); setOpen(false); }, keywords: ['deals', 'sale', 'discount', 'cheap'], });
      items.push({ id: 'quick-trending', type: 'quick', icon: <TrendingUp className="w-4 h-4" />, title: 'Trending Products', subtitle: 'Hot items right now', action: () => { setSearchQuery('trending'); setOpen(false); }, keywords: ['trending', 'hot', 'popular', 'viral'], });
      items.push({ id: 'quick-bestsellers', type: 'quick', icon: <Star className="w-4 h-4" />, title: 'Best Sellers', subtitle: 'Top rated products', action: () => { setSearchQuery('best seller'); setOpen(false); }, keywords: ['best', 'top', 'rated', 'popular'], });
    }

    const navItems = isAdmin ? [
      { id: 'dashboard', title: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, view: 'dashboard', keywords: ['stats', 'overview', 'analytics', 'home'] },
      { id: 'ai-center', title: 'AI Center', icon: <Brain className="w-4 h-4" />, view: 'ai-center', keywords: ['ai', 'automation', 'neural', 'intelligence'] },

      // Ops / tracking UI
      { id: 'orders', title: 'Orders (Tracking UI)', icon: <Truck className="w-4 h-4" />, view: 'orders', keywords: ['orders', 'tracking', 'shipping', 'deliveries'] },
      { id: 'suppliers-ops', title: 'Supplier Operations', icon: <Building2 className="w-4 h-4" />, view: 'suppliers', keywords: ['suppliers', 'vendors', 'sourcing'] },

      { id: 'marketing', title: 'Marketing', icon: <Megaphone className="w-4 h-4" />, view: 'marketing', keywords: ['marketing', 'ads', 'campaigns', 'social'] },
      { id: 'research', title: 'Research Lab', icon: <Globe className="w-4 h-4" />, view: 'research', keywords: ['research', 'trends', 'analysis', 'discover'] },
      { id: 'finances', title: 'Finances', icon: <Wallet className="w-4 h-4" />, view: 'finances', keywords: ['finance', 'money', 'revenue', 'profit', 'tax'] },
      { id: 'landing-pages', title: 'Landing Pages', icon: <Layout className="w-4 h-4" />, view: 'landing-pages', keywords: ['landing', 'pages', 'builder', 'design'] },

      // Store management
      { id: 'admin-products', title: 'Manage Products', icon: <Package className="w-4 h-4" />, view: 'admin-products', keywords: ['products', 'catalog', 'inventory'] },
      { id: 'admin-suppliers', title: 'Manage Suppliers', icon: <Building2 className="w-4 h-4" />, view: 'admin-suppliers', keywords: ['suppliers', 'vendors'] },
      { id: 'admin-orders', title: 'Orders (Store)', icon: <Truck className="w-4 h-4" />, view: 'admin-orders', keywords: ['orders', 'store', 'checkout', 'purchases'] },
      { id: 'admin-coupons', title: 'Coupons', icon: <Tag className="w-4 h-4" />, view: 'admin-coupons', keywords: ['coupons', 'discounts', 'promo', 'codes'] },

      { id: 'admin-profile', title: 'Admin Profile', icon: <Command className="w-4 h-4" />, view: 'admin-profile', keywords: ['admin', 'profile', 'owner', 'account'] },

      { id: 'admin-settings', title: 'Settings', icon: <Settings className="w-4 h-4" />, view: 'admin-settings', keywords: ['settings', 'config', 'preferences'] },
      { id: 'admin-integrations', title: 'Integrations', icon: <Plug className="w-4 h-4" />, view: 'admin-integrations', keywords: ['integrations', 'connect', 'api', 'webhooks'] },
    ] : [
      { id: 'shop', title: 'Shop Home', icon: <Home className="w-4 h-4" />, view: 'shop', keywords: ['shop', 'home', 'products', 'browse'] },
    ];

    navItems.forEach(nav => {
      items.push({ id: `nav-${nav.id}`, type: 'navigation', icon: nav.icon, title: `Go to ${nav.title}`, subtitle: 'Navigation', action: () => { if (onNavigate) onNavigate(nav.view); else setCurrentView(nav.view as Parameters<typeof setCurrentView>[0]); setOpen(false); }, keywords: nav.keywords });
    });

    const actions: Array<{ id: string; title: string; icon: React.ReactNode; shortcut?: string; action: () => void; keywords: string[]; adminOnly?: boolean; }>= [
      { id: 'filter-category', title: 'Filter by Category', icon: <Filter className="w-4 h-4" />, shortcut: '@', action: () => { setQuery('@'); setMode('categories'); }, keywords: ['filter', 'category', 'browse'] },
      { id: 'filter-tag', title: 'Filter by Tag', icon: <Hash className="w-4 h-4" />, shortcut: '#', action: () => setQuery('#'), keywords: ['filter', 'tag', 'hashtag'] },
      { id: 'filter-price', title: 'Filter by Max Price', icon: <DollarSign className="w-4 h-4" />, shortcut: '$', action: () => setQuery('$'), keywords: ['price', 'budget', 'max', 'under'] },
      { id: 'clear-filters', title: 'Clear All Filters', icon: <X className="w-4 h-4" />, action: () => { setSearchQuery(''); setSelectedCategory('All'); setOpen(false); }, keywords: ['clear', 'reset', 'filters'] },
      { id: 'clear-history', title: 'Clear Search History', icon: <RefreshCw className="w-4 h-4" />, action: () => { clearRecentSearches(); }, keywords: ['clear', 'history', 'recent'] },
    ];

    if (speechSupported) actions.push({ id: 'voice-search', title: 'Voice Search', icon: isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />, action: () => toggleVoiceSearch(), keywords: ['voice', 'speak', 'microphone', 'audio'] });

    if (isAdmin) {
      actions.push(
        { id: 'add-product', title: 'Add New Product', icon: <Plus className="w-4 h-4" />, shortcut: 'P', action: () => { setCurrentView('admin-products'); setOpen(false); }, keywords: ['add', 'new', 'product', 'create'], adminOnly: true },
        { id: 'add-supplier', title: 'Add New Supplier', icon: <Plus className="w-4 h-4" />, shortcut: 'S', action: () => { setCurrentView('admin-suppliers'); setOpen(false); }, keywords: ['add', 'new', 'supplier', 'vendor'], adminOnly: true },
        { id: 'toggle-autopilot', title: `${aiAutoPilot ? 'Disable' : 'Enable'} AI Autopilot`, icon: <Zap className="w-4 h-4" />, action: () => { toggleAiAutoPilot(); setOpen(false); }, keywords: ['autopilot', 'ai', 'automation', 'toggle'], adminOnly: true },
        { id: 'export-data', title: 'Export Data', icon: <Download className="w-4 h-4" />, action: () => { alert('Export functionality coming soon'); setOpen(false); }, keywords: ['export', 'download', 'data', 'backup'], adminOnly: true },
        { id: 'import-data', title: 'Import Data', icon: <Upload className="w-4 h-4" />, action: () => { alert('Import functionality coming soon'); setOpen(false); }, keywords: ['import', 'upload', 'data', 'restore'], adminOnly: true },
      );
    }

    actions.forEach(act => items.push({ id: `action-${act.id}`, type: 'action', icon: act.icon, title: act.title, subtitle: 'Action', shortcut: act.shortcut, action: act.action, keywords: act.keywords, badge: act.adminOnly ? 'Admin' : undefined, badgeColor: act.adminOnly ? 'bg-primary-500/20 text-primary-400' : undefined }));

    categories.filter(c => c !== 'All').forEach(cat => items.push({ id: `cat-${cat}`, type: 'category', icon: <Tag className="w-4 h-4" />, title: cat, subtitle: 'Category', action: () => { setSelectedCategory(cat); setSearchQuery(''); setOpen(false); }, keywords: [cat.toLowerCase(), ...cat.toLowerCase().split(/\s+/)], }));

    if (parsedQuery.term === '' && recentSearches.length > 0 && mode === 'all') {
      recentSearches.slice(0, 5).forEach((term, i) => items.push({ id: `recent-${i}`, type: 'recent', icon: <Clock className="w-4 h-4 text-gray-500" />, title: term, subtitle: 'Recent search', action: () => { setSearchQuery(term); setOpen(false); }, keywords: [term], }));
    }

    return items;
  }, [isAdmin, onNavigate, setCurrentView, setSearchQuery, setSelectedCategory, recentSearches, parsedQuery.term, mode, isListening, speechSupported, cart, categories, aiAutoPilot, toggleAiAutoPilot, clearRecentSearches, darkMode]);

  const productResults = useMemo<CommandItem[]>(() => {
    if (parsedQuery.term.length < 1 && parsedQuery.prefix !== 'category' && parsedQuery.prefix !== 'tag') return [];
    const term = parsedQuery.term.toLowerCase();
    const expandedTerms = expandQuery(term);
    const scored = products.map(product => {
      let score = 0;
      const nameLower = product.name.toLowerCase();
      const descLower = product.description.toLowerCase();
      const catLower = product.category.toLowerCase();
      const tagsLower = product.tags.map(t => t.toLowerCase());
      if (parsedQuery.prefix === 'category') {
        if (!fuzzyMatch(catLower, term)) return { product, score: 0 };
        score = 100;
      } else if (parsedQuery.prefix === 'tag') {
        if (!tagsLower.some(t => fuzzyMatch(t, term))) return { product, score: 0 };
        score = 100;
      } else if (parsedQuery.prefix === 'price') {
        const maxPrice = parseFloat(term) || 999999;
        if (product.price > maxPrice) return { product, score: 0 };
        score = 100 - (product.price / maxPrice * 50);
      } else {
        expandedTerms.forEach(t => {
          if (nameLower.includes(t)) score += 50;
          if (nameLower.startsWith(t)) score += 30;
          if (catLower.includes(t)) score += 20;
          if (tagsLower.some(tag => tag.includes(t))) score += 15;
          if (descLower.includes(t)) score += 10;
        });
        if (product.trending) score += 10;
        if (product.rating >= 4.7) score += 5;
        if (product.badge) score += 5;
      }
      return { product, score };
    }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).slice(0, 8);

    return scored.map(({ product }) => ({
      id: `product-${product.id}`,
      type: 'product' as const,
      icon: <img src={product.image} alt="" className="w-8 h-8 rounded-lg object-cover" />,
      title: product.name,
      subtitle: `$${product.price.toFixed(2)} · ${product.category}`,
      badge: product.badge,
      badgeColor: 'bg-white/10 text-white',
      action: () => { addToCart(product); setOpen(false); },
      keywords: [product.name.toLowerCase(), product.category.toLowerCase(), ...product.tags.map(t => t.toLowerCase())],
    }));
  }, [products, parsedQuery, addToCart]);

  const filteredCommands = useMemo(() => {
    if (!parsedQuery.term && parsedQuery.prefix === null) return commands;
    const term = parsedQuery.term.toLowerCase();
    const expandedTerms = expandQuery(term);
    if (parsedQuery.prefix === 'command') {
      return commands.filter(cmd => (cmd.type === 'action' || cmd.type === 'navigation') && (fuzzyMatch(cmd.title, term) || cmd.keywords?.some(k => expandedTerms.some(t => k.includes(t)))));
    }
    if (parsedQuery.prefix === 'category') return commands.filter(cmd => cmd.type === 'category' && fuzzyMatch(cmd.title, term));
    return commands.filter(cmd => fuzzyMatch(cmd.title, term) || cmd.keywords?.some(k => expandedTerms.some(t => k.includes(t))));
  }, [commands, parsedQuery]);

  const allResults = useMemo(() => {
    switch (mode) {
      case 'products': return productResults;
      case 'commands': return filteredCommands.filter(c => c.type === 'action' || c.type === 'navigation');
      case 'categories': return filteredCommands.filter(c => c.type === 'category');
      default:
        if (!parsedQuery.term) {
          const quick = filteredCommands.filter(c => c.type === 'quick');
          const recent = filteredCommands.filter(c => c.type === 'recent');
          const rest = filteredCommands.filter(c => c.type !== 'quick' && c.type !== 'recent');
          return [...quick, ...recent, ...rest.slice(0, 5)];
        }
        const cmds = filteredCommands.slice(0, 4);
        const prods = productResults.slice(0, 6);
        return [...cmds, ...prods];
    }
  }, [mode, filteredCommands, productResults, parsedQuery.term]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => Math.max(prev - 1, 0)); }
      else if (e.key === 'Enter' && allResults.length > 0) { e.preventDefault(); const selected = allResults[selectedIndex]; if (selected) { selected.action(); if (selected.type === 'product' || selected.type === 'category') saveRecentSearch(parsedQuery.term); } }
      else if (e.key === 'Tab') { e.preventDefault(); setMode(prev => prev === 'all' ? 'products' : prev === 'products' ? 'commands' : prev === 'commands' ? 'categories' : 'all'); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, allResults, selectedIndex, parsedQuery.term, saveRecentSearch]);

  useEffect(() => { if (listRef.current && selectedIndex >= 0) listRef.current.querySelector(`[data-index="${selectedIndex}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [selectedIndex]);
  useEffect(() => { setSelectedIndex(0); }, [query, mode]);

  const toggleVoiceSearch = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;
    if (isListening && recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); return; }
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => { setIsListening(false); recognitionRef.current = null; };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => { const transcript = event.results[0][0].transcript; setQuery(transcript); setIsListening(false); };
    try { recognition.start(); } catch { setIsListening(false); }
  }, [isListening]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, CommandItem[]> = { quick: [], navigation: [], action: [], category: [], product: [], recent: [] };
    allResults.forEach(item => { if (groups[item.type]) groups[item.type].push(item); });
    return groups;
  }, [allResults]);

  const groupLabels: Record<string, string> = { quick: 'Quick Actions', navigation: 'Navigation', action: 'Commands', category: 'Categories', product: 'Products', recent: 'Recent Searches' };

  const TriggerButton = () => (
    <button
      onClick={() => setOpen(true)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm transition-all ${
        darkMode ? 'bg-white/10 border-white/15 text-gray-400 hover:text-white hover:border-white/25' : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
      }`}
    >
      <Command className="w-3.5 h-3.5" />
      <span className="text-xs hidden sm:inline">Search...</span>
      <kbd className={`hidden sm:inline ml-2 px-1.5 py-0.5 rounded text-[10px] ${darkMode ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-700'}`}>⌘K</kbd>
    </button>
  );

  if (!open) return <TriggerButton />;

  return (
    <>
      <TriggerButton />
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-3 sm:px-4" onClick={() => setOpen(false)}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className={`relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up border ${surface}`}
          onClick={e => e.stopPropagation()}
        >
          <div className={`flex items-center gap-3 px-4 py-3 border-b ${headerBorder} ${headerBg}`}>
            <Search className="w-5 h-5 text-gray-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={isAdmin ? 'Search or type / for commands...' : 'Search products, type / for commands...'}
              className={`flex-1 bg-transparent text-sm min-w-0 focus:outline-none ${inputText}`}
            />
            {isListening && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 animate-pulse shrink-0">
                <Mic className="w-3 h-3 text-red-400" />
                <span className="text-[10px] text-red-400">Listening...</span>
              </div>
            )}
            {speechSupported && (
              <button onClick={toggleVoiceSearch} className={`p-1.5 rounded-lg transition-colors shrink-0 ${isListening ? 'bg-red-500/20 text-red-400' : darkMode ? 'hover:bg-white/10 text-gray-500 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <button onClick={() => setOpen(false)} className={`p-1.5 rounded-lg shrink-0 ${darkMode ? 'hover:bg-white/10 text-gray-500 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className={`flex items-center gap-1 px-4 py-2 border-b overflow-x-auto no-scrollbar ${tabsRow}`}>
            {[
              { id: 'all', label: 'All' },
              { id: 'products', label: 'Products' },
              { id: 'commands', label: 'Commands' },
              { id: 'categories', label: 'Categories' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setMode(tab.id as typeof mode)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${mode === tab.id ? tabActive : tabInactive}`}>
                {tab.label}
              </button>
            ))}
            <div className="flex-1" />
            <div className={`text-[10px] hidden sm:block whitespace-nowrap ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
              <kbd className={`px-1 py-0.5 rounded ${keycap}`}>Tab</kbd> switch · <span className="ml-1">/</span> cmd · <span className="ml-1">@</span> cat · <span className="ml-1">#</span> tag · <span className="ml-1">$</span> price
            </div>
          </div>

          <div ref={listRef} className="max-h-[50vh] sm:max-h-80 overflow-y-auto">
            {allResults.length === 0 ? (
              <div className="p-8 text-center">
                <Sparkles className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>No results found</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>Try a different search term or filter</p>
              </div>
            ) : (
              <div className="py-2">
                {['quick', 'recent', 'navigation', 'action', 'category', 'product'].map(type => {
                  const items = groupedResults[type];
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={type}>
                      <div className={`px-4 py-1.5 text-[10px] uppercase tracking-wider font-medium sticky top-0 ${groupHeader}`}>
                        {groupLabels[type]}
                      </div>
                      {items.map((item) => {
                        const globalIndex = allResults.indexOf(item);
                        const isSel = selectedIndex === globalIndex;
                        return (
                          <button
                            key={item.id}
                            data-index={globalIndex}
                            onClick={() => { item.action(); if (item.type === 'product' || item.type === 'category') saveRecentSearch(parsedQuery.term); }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${isSel ? rowSelected : ''} ${rowHover}`}
                          >
                            <div className="shrink-0 text-gray-400">{item.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${rowTitle}`}>{item.title}</p>
                              {item.subtitle && <p className={`text-[11px] truncate ${rowSubtitle}`}>{item.subtitle}</p>}
                            </div>
                            {item.badge && (
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${item.badgeColor || (darkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-700')}`}>
                                {item.badge}
                              </span>
                            )}
                            {item.shortcut && (
                              <kbd className={`px-1.5 py-0.5 rounded ${keycap}`}>{item.shortcut}</kbd>
                            )}
                            {item.type === 'product' && (
                              <span className="text-[10px] text-emerald-500 font-medium">+ Add</span>
                            )}
                            <ChevronRight className={`w-3 h-3 ${darkMode ? 'text-gray-700' : 'text-gray-400'} shrink-0`} />
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={`flex items-center justify-between px-4 py-2 border-t ${footer}`}>
            <div className="flex items-center gap-3 sm:gap-4 text-[10px]">
              <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> nav</span>
              <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> select</span>
              <span className="hidden sm:flex items-center gap-1"><kbd className={`px-1 py-0.5 rounded ${keycap}`}>esc</kbd> close</span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <Zap className="w-3 h-3 text-blue-500" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
