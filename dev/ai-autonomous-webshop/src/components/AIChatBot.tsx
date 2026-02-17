import {
  X,
  Send,
  MessageCircle,
  Sparkles,
  Heart,
  RotateCcw,
  Clock,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Truck,
  CreditCard,
  ArrowRight,
  LayoutGrid,
  MessagesSquare,
  ChevronDown,
  ChevronUp,
  PanelLeft,
  PanelRight,
  Square,
  StopCircle,
} from 'lucide-react';
import { useShopStore, type Product } from '../store/shopStore';
import { useFormatPrice } from './CurrencySelector';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { aiChatComplete } from '../utils/aiClient';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { aiCommandHub } from '../utils/aiCommandHub';

const CHAT_STORAGE_KEY = 'nexus_chat_history_v1';
const CHAT_UI_KEY = 'nexus_chat_ui_v1';

type ChatPanel = 'chat' | 'picks';

type ChatUIState = {
  dock: 'right' | 'left';
  w: number;
  h: number;
  expanded: boolean;
  panel: ChatPanel;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    onChange();
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

const formatDayLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

const groupMessagesByDay = (messages: { id: string; timestamp: Date }[]) =>
  messages.reduce<Record<string, number[]>>((acc, msg, index) => {
    const key = formatDayLabel(msg.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(index);
    return acc;
  }, {});

const getProductMatchScore = (product: Product, query: string) => {
  const text = `${product.name} ${product.category} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  let score = 0;
  if (text.includes(q)) score += 8;

  const tokens = q.split(/\s+/).filter(Boolean);
  tokens.forEach((t) => {
    if (text.includes(t)) score += 3;
    if (product.category.toLowerCase().includes(t)) score += 2;
    if (product.tags.some((tag) => tag.toLowerCase().includes(t))) score += 2;
  });

  if (product.trending) score += 2;
  score += Math.round(product.rating);
  return score;
};

const summarizeUserContext = (wishlistCount: number, recentCount: number, cartCount: number) => {
  const parts: string[] = [];
  if (wishlistCount > 0) parts.push(`wishlist (${wishlistCount})`);
  if (recentCount > 0) parts.push(`recently viewed (${recentCount})`);
  if (cartCount > 0) parts.push(`cart (${cartCount})`);
  return parts.length ? parts.join(', ') : 'no recent activity yet';
};

const PRESET_PROMPTS = [
  'Best sellers under $30',
  'Fast shipping picks',
  'Gift ideas under $50',
  'Trending beauty tech',
];

const QUICK_ACTIONS = [
  { label: 'Shipping', query: 'shipping times and costs' },
  { label: 'Returns', query: 'return policy and refunds' },
  { label: 'Track order', query: 'track my order' },
];

const buildTranscript = (messages: { role: 'user' | 'ai'; content: string }[]) =>
  messages.map((m) => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`).join('\n');

function SmallChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-full badge-chip text-[11px] hover:opacity-80"
    >
      {label}
    </button>
  );
}

function PicksPanel({
  query,
  shownRecommendations,
  recommendedCategories,
  onRunPrompt,
  onPickCategory,
  onShopProduct,
  onAdd,
  onSave,
  isSaved,
}: {
  query: string;
  shownRecommendations: Product[];
  recommendedCategories: string[];
  onRunPrompt: (text: string) => void;
  onPickCategory: (category: string) => void;
  onShopProduct: (p: Product) => void;
  onAdd: (p: Product) => void;
  onSave: (id: string) => void;
  isSaved: (id: string) => boolean;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-subtle">
        <p className="text-sm font-semibold text-foreground">Picks</p>
        <p className="text-[11px] text-muted mt-1">
          {query ? (
            <>
              Based on “<span className="text-foreground font-medium">{query}</span>”
            </>
          ) : (
            <>Personalized from your activity</>
          )}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {PRESET_PROMPTS.slice(0, 3).map((p) => (
            <SmallChip key={p} label={p} onClick={() => onRunPrompt(p)} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {recommendedCategories.length > 0 && (
          <div className="surface border border-subtle rounded-2xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted">Categories for you</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {recommendedCategories.map((c) => (
                <SmallChip key={c} label={c} onClick={() => onPickCategory(c)} />
              ))}
            </div>
          </div>
        )}

        <div className="surface border border-subtle rounded-2xl overflow-hidden">
          <div className="px-3 py-2 border-b border-subtle flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider text-muted">Recommended products</p>
            <p className="text-[10px] text-muted">Tap to shop</p>
          </div>

          <div className="p-3 space-y-2">
            {shownRecommendations.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-2 rounded-xl border border-subtle surface hover:border-strong transition-colors"
              >
                <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted truncate">{formatPrice(p.price)} · {p.category}</p>
                </div>
                <button
                  onClick={() => onSave(p.id)}
                  className={`p-2 rounded-full transition-colors ${
                    isSaved(p.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-black/5 dark:bg-white/[0.06] text-muted hover:text-red-500'
                  }`}
                  aria-label="Save"
                >
                  <Heart className={`w-4 h-4 ${isSaved(p.id) ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => onAdd(p)}
                  className="p-2 rounded-full bg-foreground text-white hover:opacity-90"
                  aria-label="Add to cart"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onShopProduct(p)}
                  className="hidden sm:inline-flex px-2.5 py-2 rounded-xl btn-brand-outline text-[11px] font-semibold"
                >
                  Shop
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="surface border border-subtle rounded-2xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted">Quick intents</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {['Deals under $40', 'Premium picks', 'Low stock alerts', 'Affiliate-only'].map((x) => (
              <SmallChip key={x} label={x} onClick={() => onRunPrompt(x)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function loadChatUI(): ChatUIState {
  const fallback: ChatUIState = { dock: 'right', w: 440, h: 660, expanded: false, panel: 'chat' };
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(CHAT_UI_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<ChatUIState>;
    return {
      dock: parsed.dock === 'left' ? 'left' : 'right',
      w: typeof parsed.w === 'number' ? parsed.w : fallback.w,
      h: typeof parsed.h === 'number' ? parsed.h : fallback.h,
      expanded: Boolean(parsed.expanded),
      panel: parsed.panel === 'picks' ? 'picks' : 'chat',
    };
  } catch {
    return fallback;
  }
}

function saveChatUI(next: ChatUIState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAT_UI_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function AIChatBot() {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const formatPrice = useFormatPrice();

  const [copiedNotice, setCopiedNotice] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | undefined>>({});
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  const initialUI = useMemo(() => loadChatUI(), []);
  const [dock, setDock] = useState<ChatUIState['dock']>(initialUI.dock);
  const [panel, setPanel] = useState<ChatPanel>(initialUI.panel);
  const [expanded, setExpanded] = useState(initialUI.expanded);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: initialUI.w, h: initialUI.h });

  const abortRef = useRef<AbortController | null>(null);
  const streamTimerRef = useRef<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const atBottomRef = useRef(true);

  const {
    chatMessages,
    addChatMessage,
    setChatMessages,
    clearChatMessages,
    chatOpen,
    toggleChat,
    products,
    wishlist,
    recentlyViewed,
    cart,
    addToCart,
    toggleWishlist,
    setSearchQuery,
    setSelectedCategory,
    userSession,
    setCurrentView,
    settings,
    pushToast,
  } = useShopStore();

  // Buyer-facing AI is intentionally decoupled from admin AI settings.
  // This prevents expensive/admin models from triggering Puter login prompts for shoppers.
  const buyerProvider = settings.buyerAiProvider ?? 'puter';
  const buyerModel = settings.buyerAiModel?.trim() || 'gpt-4o-mini';

  const chatSettings = useMemo(
    () => ({
      ...settings,
      aiProvider: buyerProvider,
      aiModel: buyerModel,
    }),
    [settings, buyerProvider, buyerModel]
  );

  const groupedMessages = useMemo(() => groupMessagesByDay(chatMessages), [chatMessages]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const profileName = userSession.profile?.firstName ?? 'there';
  const userContext = summarizeUserContext(wishlist.length, recentlyViewed.length, cartCount);

  const picksQuery = (input.trim() || lastUserMessage || '').trim();

  const suggestions = useMemo(() => {
    if (!picksQuery) return [] as Product[];
    return [...products]
      .map((product) => ({ product, score: getProductMatchScore(product, picksQuery) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.product);
  }, [picksQuery, products]);

  const personalizedPicks = useMemo(() => {
    const ids = new Set([...wishlist, ...recentlyViewed]);
    const base = products.filter((p) => ids.has(p.id));
    if (base.length === 0) return [] as Product[];
    const categories = new Map<string, number>();
    base.forEach((p) => categories.set(p.category, (categories.get(p.category) || 0) + 1));
    return [...products]
      .filter((p) => !ids.has(p.id))
      .sort((a, b) => (categories.get(b.category) || 0) - (categories.get(a.category) || 0))
      .slice(0, 4);
  }, [products, recentlyViewed, wishlist]);

  const recommendedCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    recentlyViewed.forEach((id) => {
      const product = products.find((p) => p.id === id);
      if (product) counts[product.category] = (counts[product.category] || 0) + 1;
    });
    wishlist.forEach((id) => {
      const product = products.find((p) => p.id === id);
      if (product) counts[product.category] = (counts[product.category] || 0) + 2;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([category]) => category);
  }, [products, recentlyViewed, wishlist]);

  const fallbackPicks = useMemo(() => {
    return [...products].sort((a, b) => b.sold - a.sold).slice(0, 4);
  }, [products]);

  const shownRecommendations = useMemo(() => {
    return suggestions.length > 0 ? suggestions : personalizedPicks.length > 0 ? personalizedPicks : fallbackPicks;
  }, [fallbackPicks, personalizedPicks, suggestions]);

  // Persist chat UI state
  useEffect(() => {
    saveChatUI({ dock, w: size.w, h: size.h, expanded, panel });
  }, [dock, expanded, panel, size.h, size.w]);

  // Focus trap on mobile/fullscreen (modal experience)
  useFocusTrap({
    active: chatOpen && isMobile,
    containerRef: dialogRef,
    onEscape: () => {
      if (chatOpen) toggleChat();
    },
    initialFocusSelector: 'textarea',
    lockScroll: true,
  });

  // Persist chat history
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Array<{ id: string; role: 'user' | 'ai'; content: string; timestamp: string }>;
        setChatMessages(parsed.map((msg) => ({ ...msg, timestamp: new Date(msg.timestamp) })));
      }
    } catch {
      // ignore
    }
  }, [setChatMessages]);

  useEffect(() => {
    try {
      const serialized = chatMessages.map((msg) => ({ ...msg, timestamp: msg.timestamp.toISOString() }));
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(serialized));
    } catch {
      // ignore
    }
  }, [chatMessages]);

  // Track scroll position for jump-to-latest
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
      atBottomRef.current = atBottom;
      setShowJump(!atBottom);
    };

    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [chatOpen, panel, expanded]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  // Autoscroll while user is at bottom
  useEffect(() => {
    if (!chatOpen) return;
    if (atBottomRef.current) scrollToBottom('auto');
  }, [chatMessages.length, chatOpen, scrollToBottom]);

  // Command Execution Logic
  useEffect(() => {
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (!lastMsg || lastMsg.role !== 'ai' || streaming) return;

    const commandRegex = /\[COMMAND:(\w+):?({.*?})?\]/g;
    let match;
    while ((match = commandRegex.exec(lastMsg.content)) !== null) {
      const cmd = match[1];
      const argsRaw = match[2];
      let args = {};
      try { if (argsRaw) args = JSON.parse(argsRaw); } catch { /* ignore */ }
      
      aiCommandHub.execute(cmd, args);
    }
  }, [chatMessages, streaming]);

  const stopAll = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (streamTimerRef.current) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setThinking(false);
    setStreaming(false);
  }, []);

  useEffect(() => {
    if (!chatOpen) stopAll();
  }, [chatOpen, stopAll]);

  const buildFallbackResponse = (msg: string) => {
    const l = msg.toLowerCase();
    if (l.includes('shipping') || l.includes('delivery')) {
      return `${profileName}, we offer FREE worldwide shipping. Standard: 5–12 business days. Express: 3–5 days ($9.99). Priority: 1–3 days ($19.99). All orders include tracking.`;
    }
    if (l.includes('return') || l.includes('refund')) {
      return 'We offer a 30-day money-back guarantee. Free return shipping and full refund within 5 business days.';
    }
    if (l.includes('track')) {
      return 'If you have a tracking number, paste it here. Otherwise, go to Account → Orders to see your latest tracking status.';
    }
    if (l.includes('recommend') || l.includes('suggest') || l.includes('best') || l.includes('popular') || l.includes('gift') || l.includes('deal')) {
      setCurrentView('shop');
      return `Based on ${userContext}, I have prepared some personalized picks for you. Open the “Picks” tab to see them.`;
    }
    return `Tell me what you are looking for (budget, category, or use-case). For example: “best sellers under $30” or “fast shipping phone accessories”.`;
  };

  const tryAIResponse = useCallback(
    async (msg: string, signal?: AbortSignal) => {
      try {
        const ai = await aiChatComplete({
          settings: chatSettings,
          messages: [...chatMessages, { id: `tmp-${Date.now()}`, role: 'user', content: msg, timestamp: new Date() }],
          system:
            'You are an expert ecommerce concierge. Be concise. Use bullet points. You can execute actions by including strings like [COMMAND:NAVIGATE:{"view":"cart"}] or [COMMAND:OFFER_DISCOUNT:{"percent":15}]. If the user is hesitating, offer a discount. If recommending, list 1–3 options with reasons.',
          signal,
        });
        if (!ai || ai.length < 2) throw new Error('Empty response');
        return ai;
      } catch {
        pushToast({ type: 'info', message: 'AI provider offline. Using smart assistant.' });
        return buildFallbackResponse(msg);
      }
    },
    [buildFallbackResponse, chatMessages, pushToast, settings]
  );

  const streamAIMessage = useCallback(
    (fullText: string) => {
      const id = `msg-${Date.now()}`;
      const msg = { id, role: 'ai' as const, content: '', timestamp: new Date() };

      const cur = useShopStore.getState().chatMessages;
      setChatMessages([...cur, msg]);

      setStreaming(true);

      const targetTicks = 80; // ~80 frames
      const step = Math.max(3, Math.ceil(fullText.length / targetTicks));
      let idx = 0;

      if (streamTimerRef.current) window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = window.setInterval(() => {
        idx = Math.min(fullText.length, idx + step);
        const partial = fullText.slice(0, idx);

        const now = useShopStore.getState().chatMessages;
        setChatMessages(now.map((m) => (m.id === id ? { ...m, content: partial } : m)));

        if (idx >= fullText.length) {
          if (streamTimerRef.current) window.clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
          setStreaming(false);
        }
      }, 28);
    },
    [setChatMessages]
  );

  const streamFromPuter = useCallback(
    async (userText: string, controller: AbortController) => {
      if (typeof window === 'undefined' || !window.puter?.ai?.chat) {
        const fallback = buildFallbackResponse(userText);
        streamAIMessage(fallback);
        return;
      }

      // IMPORTANT: keep prompt tiny to avoid triggering Puter guest-limit login prompts.
      // Do NOT call any puter.auth.* APIs here.
      const system =
        'Expert ecommerce concierge. Concise, use bullets. Actions allowed: [COMMAND:NAVIGATE:{"view":"cart"}] or [COMMAND:OFFER_DISCOUNT:{"percent":15}]. Offer discount if hesitating.';

      // Only include a small sliding window of recent context (last 6 messages), then hard-truncate.
      const contextMsgs = chatMessages.slice(-6);
      const context = contextMsgs
        .map((m) => `${m.role === 'ai' ? 'ASSISTANT' : 'USER'}: ${m.content}`)
        .join('\n');

      const MAX_CHARS = 1800;
      const contextTail = context.length > MAX_CHARS ? context.slice(context.length - MAX_CHARS) : context;

      const prompt = `SYSTEM: ${system}\n\nCONTEXT (recent only):\n${contextTail}\n\nUSER: ${userText}\nASSISTANT:`;

      const id = `msg-${Date.now()}`;
      const aiMsg = { id, role: 'ai' as const, content: '', timestamp: new Date() };
      const cur = useShopStore.getState().chatMessages;
      setChatMessages([...cur, aiMsg]);

      setThinking(false);
      setStreaming(true);

      try {
        const res = await window.puter.ai.chat(prompt, {
          model: buyerModel,
          stream: true,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isAsyncIterable = (obj: any): obj is AsyncIterable<any> => obj && typeof obj[Symbol.asyncIterator] === 'function';

        if (isAsyncIterable(res)) {
          let out = '';
          for await (const part of res) {
            if (controller.signal.aborted) break;
            out += String(part?.text ?? '');
            const now = useShopStore.getState().chatMessages;
            setChatMessages(now.map((m) => (m.id === id ? { ...m, content: out } : m)));
            if (atBottomRef.current) scrollToBottom('auto');
          }
        } else {
          const text = String((res as { text?: string })?.text ?? '');
          const now = useShopStore.getState().chatMessages;
          setChatMessages(now.map((m) => (m.id === id ? { ...m, content: text } : m)));
        }
      } catch {
        pushToast({ type: 'info', message: 'Puter AI unavailable. Using smart assistant.' });
        const fallback = buildFallbackResponse(userText);
        const now = useShopStore.getState().chatMessages;
        setChatMessages(now.map((m) => (m.id === id ? { ...m, content: fallback } : m)));
      } finally {
        setStreaming(false);
      }
    },
    [buildFallbackResponse, chatMessages, pushToast, scrollToBottom, setChatMessages, settings.aiModel, streamAIMessage]
  );

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || thinking || streaming) return;

    stopAll();
    abortRef.current = new AbortController();

    addChatMessage({ role: 'user', content: text });
    setLastUserMessage(text);
    setInput('');
    setThinking(true);

    // Provider: Puter (real browser streaming)
    if (buyerProvider === 'puter') {
      await streamFromPuter(text, abortRef.current);
    } else {
      const response = await tryAIResponse(text, abortRef.current.signal);
      setThinking(false);
      streamAIMessage(response);
    }

    const l = text.toLowerCase();
    if (l.includes('best') || l.includes('recommend') || l.includes('deal') || l.includes('gift') || l.includes('trending')) {
      setPanel('picks');
    }
      },
    [addChatMessage, input, thinking, streaming, buyerProvider, stopAll, streamAIMessage, streamFromPuter, tryAIResponse]);

  const quickSend = useCallback(
    async (text: string) => {
      if (thinking || streaming) return;
      stopAll();
      abortRef.current = new AbortController();
      addChatMessage({ role: 'user', content: text });
      setLastUserMessage(text);
      setThinking(true);

      if (buyerProvider === 'puter') {
        await streamFromPuter(text, abortRef.current);
      } else {
        const response = await tryAIResponse(text, abortRef.current.signal);
        setThinking(false);
        streamAIMessage(response);
      }

      const l = text.toLowerCase();
      if (l.includes('best') || l.includes('recommend') || l.includes('deal') || l.includes('gift') || l.includes('trending')) {
        setPanel('picks');
      }
    },
    [addChatMessage, buyerProvider, stopAll, streamAIMessage, streamFromPuter, thinking, streaming, tryAIResponse]
  );




  const handleClear = () => {
    stopAll();
    clearChatMessages();
    addChatMessage({ role: 'ai', content: 'Chat cleared. Ask me anything.' });
  };

  const pickCategory = (category: string) => {
    setCurrentView('shop');
    setSelectedCategory(category);
    setSearchQuery('');
    pushToast({ type: 'success', message: `Filtering: ${category}` });
  };

  const shopProduct = (p: Product) => {
    setCurrentView('shop');
    setSelectedCategory(p.category);
    setSearchQuery(p.name);
    pushToast({ type: 'info', message: 'Showing product in shop.' });
  };

  const handleCopyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(buildTranscript(chatMessages));
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 1800);
    } catch {
      pushToast({ type: 'error', message: 'Unable to copy transcript.' });
    }
  };

  const handleRetryLast = async () => {
    if (!lastUserMessage || thinking || streaming) return;
    quickSend(lastUserMessage);
  };

  const handleFeedback = (msgId: string, value: 'up' | 'down') => {
    setFeedback((prev) => ({ ...prev, [msgId]: value }));
    pushToast({ type: 'success', message: value === 'up' ? 'Thanks!' : 'Got it — we’ll improve.' });
  };

  const isSaved = (id: string) => wishlist.includes(id);

  // Desktop resize
  const resizeStartRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const beginResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeStartRef.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
    const onMove = (ev: MouseEvent) => {
      if (!resizeStartRef.current) return;
      const dx = ev.clientX - resizeStartRef.current.x;
      const dy = ev.clientY - resizeStartRef.current.y;
      const nextW = clamp(resizeStartRef.current.w + dx, expanded ? 720 : 360, 980);
      const nextH = clamp(resizeStartRef.current.h + dy, 520, 860);
      setSize({ w: nextW, h: nextH });
    };
    const onUp = () => {
      resizeStartRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Open button
  if (!chatOpen) {
    return (
      <button
        onClick={() => {
          setPanel('chat');
          toggleChat();
          setTimeout(() => inputRef.current?.focus(), 80);
        }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-foreground text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="Open AI concierge"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    );
  }

  const dockPos = dock === 'left' ? 'sm:left-4 md:left-6' : 'sm:right-4 md:right-6';
  const desktopStyle = expanded
    ? { width: `${Math.max(size.w, 780)}px`, height: `${size.h}px` }
    : { width: `${size.w}px`, height: `${size.h}px` };

  const showStop = thinking || streaming;

  const ChatBody = (
    <div className="h-full flex flex-col">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3"
      >
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted">
          <Clock className="w-3.5 h-3.5" /> History saved
          <span>•</span>
          <span>{userContext}</span>
        </div>

        {chatMessages.map((msg, index) => {
          const dayLabel = formatDayLabel(msg.timestamp);
          const isFirstOfDay = groupedMessages[dayLabel]?.[0] === index;
          return (
            <div key={msg.id} className="space-y-2">
              {isFirstOfDay && (
                <div className="flex items-center justify-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] bg-black/5 dark:bg-white/[0.06] text-muted">
                    {dayLabel}
                  </span>
                </div>
              )}

              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[92%] sm:max-w-[84%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-foreground text-white rounded-br-sm'
                      : 'surface-alt text-foreground rounded-bl-sm border border-subtle'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>
                </div>
              </div>

              {msg.role === 'ai' && (
                <div className="flex items-center gap-2 pl-2 text-[10px] text-muted">
                  <button
                    onClick={() => handleFeedback(msg.id, 'up')}
                    className={`p-1.5 rounded-lg border ${
                      feedback[msg.id] === 'up'
                        ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
                        : 'border-subtle hover:bg-black/5 dark:hover:bg-white/[0.06]'
                    }`}
                    aria-label="Thumbs up"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, 'down')}
                    className={`p-1.5 rounded-lg border ${
                      feedback[msg.id] === 'down'
                        ? 'border-amber-500/30 text-amber-500 bg-amber-500/10'
                        : 'border-subtle hover:bg-black/5 dark:hover:bg-white/[0.06]'
                    }`}
                    aria-label="Thumbs down"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {(thinking || streaming) && (
          <div className="flex justify-start">
            <div className="surface-alt rounded-2xl rounded-bl-sm px-4 py-3 border border-subtle">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {showJump && (
        <div className="px-4 pb-2">
          <button
            onClick={() => {
              atBottomRef.current = true;
              scrollToBottom();
            }}
            className="w-full py-2 rounded-xl border border-subtle surface text-xs font-semibold text-foreground inline-flex items-center justify-center gap-2"
          >
            Jump to latest <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {QUICK_ACTIONS.map((a) => (
          <SmallChip key={a.label} label={a.label} onClick={() => quickSend(a.query)} />
        ))}
        <button
          onClick={() => setPanel('picks')}
          className="ml-auto px-3 py-1 rounded-full text-[11px] border border-subtle text-muted hover:text-foreground"
        >
          Picks ({shownRecommendations.length})
        </button>
      </div>

      <div className="p-3 sm:p-4 border-t border-subtle shrink-0 safe-bottom">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask about products, shipping, returns…"
            rows={1}
            className="flex-1 px-4 py-3 surface border border-subtle rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gray-400 dark:focus:border-white/20 resize-none max-h-28"
          />

          {showStop ? (
            <button
              onClick={stopAll}
              className="p-3 rounded-xl border border-subtle text-foreground hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all shrink-0"
              aria-label="Stop"
              title="Stop"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!input.trim()}
              className="p-3 rounded-xl bg-foreground text-white hover:opacity-90 disabled:opacity-30 active:scale-95 transition-all shrink-0"
              aria-label="Send"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-2 text-[10px] text-muted flex items-center justify-between">
          <span>Enter to send • Shift+Enter for newline</span>
          <button
            onClick={() => scrollToBottom()}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            Bottom <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  const PicksBody = (
    <PicksPanel
      query={picksQuery}
      shownRecommendations={shownRecommendations}
      recommendedCategories={recommendedCategories}
      onRunPrompt={(t) => quickSend(t)}
      onPickCategory={pickCategory}
      onShopProduct={shopProduct}
      onAdd={addToCart}
      onSave={toggleWishlist}
      isSaved={isSaved}
    />
  );

  const Header = (
    <div className="flex items-center justify-between p-4 border-b border-subtle shrink-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground truncate">NEXUS AI Concierge</h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Online
          </span>
          {thinking && <span className="text-[10px] text-muted">Thinking…</span>}
          {streaming && <span className="text-[10px] text-muted">Typing…</span>}
        </div>
        <p className="text-[10px] text-muted">
          {cartCount > 0 ? `${cartCount} in cart` : 'Ready to help'} • {expanded ? 'Expanded' : 'Compact'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {!isMobile && (
          <button
            onClick={() => setDock((d) => (d === 'left' ? 'right' : 'left'))}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Dock"
            title="Dock"
          >
            {dock === 'left' ? <PanelRight className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        )}

        <button
          onClick={handleRetryLast}
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Retry"
          title="Retry"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={handleCopyTranscript}
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Copy transcript"
          title="Copy"
        >
          <Copy className="w-4 h-4" />
        </button>

        <button
          onClick={handleClear}
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Clear"
          title="Clear"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="px-2.5 py-1.5 rounded-lg text-[10px] border border-subtle text-muted hover:text-foreground"
          aria-label="Toggle size"
          title="Toggle size"
        >
          {expanded ? 'Compact' : 'Expand'}
        </button>

        <button
          onClick={toggleChat}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted"
          aria-label="Close"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const SubHeader = (
    <div className="px-4 py-3 border-b border-subtle flex flex-wrap items-center gap-2 text-[10px] text-muted">
      <ShieldCheck className="w-3.5 h-3.5" /> Buyer protection
      <span>•</span>
      <Truck className="w-3.5 h-3.5" /> Free shipping
      <span>•</span>
      <CreditCard className="w-3.5 h-3.5" /> Secure checkout
      {copiedNotice && <span className="ml-auto text-emerald-500">Copied</span>}
    </div>
  );

  const Tabs = (
    <div className="px-4 py-2 border-b border-subtle flex items-center gap-2">
      <button
        onClick={() => setPanel('chat')}
        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center justify-center gap-2 ${
          panel === 'chat'
            ? 'bg-foreground text-white border-foreground'
            : 'surface border-subtle text-muted hover:text-foreground'
        }`}
      >
        <MessagesSquare className="w-4 h-4" /> Chat
      </button>
      <button
        onClick={() => setPanel('picks')}
        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center justify-center gap-2 ${
          panel === 'picks'
            ? 'bg-foreground text-white border-foreground'
            : 'surface border-subtle text-muted hover:text-foreground'
        }`}
      >
        <LayoutGrid className="w-4 h-4" /> Picks
        <span className="px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-[10px]">
          {shownRecommendations.length}
        </span>
      </button>
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={
        isMobile
          ? 'fixed inset-0 z-50 surface flex flex-col'
          : `fixed sm:bottom-4 md:bottom-6 ${dockPos} z-50 surface rounded-2xl flex flex-col shadow-2xl border border-subtle`
      }
      style={!isMobile ? desktopStyle : undefined}
      role="dialog"
      aria-label="AI Concierge"
      aria-modal={isMobile ? 'true' : 'false'}
    >
      <div ref={dialogRef} className="h-full flex flex-col min-h-0">
        {Header}
        {SubHeader}

        {!expanded && Tabs}

        {/* body */}
        {expanded ? (
          <div className="flex-1 min-h-0 grid grid-cols-[1fr_320px]">
            <div className="min-h-0 border-r border-subtle">{ChatBody}</div>
            <div className="min-h-0">{PicksBody}</div>
          </div>
        ) : (
          <div className="flex-1 min-h-0">{panel === 'chat' ? ChatBody : PicksBody}</div>
        )}

        {/* first open assistant */}
        {!expanded && panel === 'chat' && chatMessages.length < 4 && (
          <div className="px-4 pb-4">
            <div className="surface border border-subtle rounded-2xl p-3">
              <div className="flex items-center gap-2 text-[10px] text-muted">
                <Sparkles className="w-3.5 h-3.5" /> Try
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESET_PROMPTS.slice(0, 4).map((p) => (
                  <SmallChip key={p} label={p} onClick={() => quickSend(p)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Desktop resize handle */}
        {!isMobile && (
          <div className="absolute right-2 bottom-2">
            <button
              onMouseDown={beginResize}
              className="w-8 h-8 rounded-xl border border-subtle surface hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center cursor-nwse-resize"
              aria-label="Resize"
              title="Resize"
            >
              <Square className="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile bottom close affordance */}
      {isMobile && (
        <div className="border-t border-subtle px-4 py-3 flex items-center justify-between text-[10px] text-muted safe-bottom">
          <button
            onClick={() => {
              if (panel === 'picks') setPanel('chat');
              else toggleChat();
            }}
            className="inline-flex items-center gap-2"
          >
            {panel === 'picks' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {panel === 'picks' ? 'Back to chat' : 'Close'}
          </button>
          <span>{thinking || streaming ? 'Generating…' : 'Ready'}</span>
        </div>
      )}
    </div>
  );
}
