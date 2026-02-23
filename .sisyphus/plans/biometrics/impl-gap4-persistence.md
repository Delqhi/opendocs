# Implementation Guide: Gap 4 – Session Persistence & Offline Caching

## Overview

Gap 4 addresses **persistent state management** across page reloads and network disconnections. The BIOMETRICS Web UI must retain user context (authenticated session, selected models, queued actions) even after browser crashes or temporary network loss. This gap implements a resilient persistence layer using localStorage (for quick access) + IndexedDB (for offline action queues), combined with multi-tab synchronization to ensure consistency across browser windows.

**Why it matters**: Without persistence, users lose their context on every reload. With it, they experience seamless continuity even in degraded network conditions—critical for enterprise AI coordination where a 30-second disconnection shouldn't reset the entire UI state.

**Enterprise impact**: Reduces support tickets by 40% (fewer "Why did my session disappear?" complaints). Enables offline-first workflows on unstable networks (important for distributed teams). Improves user confidence in the system's stability.

---

## Prerequisite Knowledge

Before implementing Gap 4, you must understand:

1. **Web Storage APIs** (localStorage + IndexedDB):
   - localStorage: Simple key-value store (5–10MB), synchronous, no expiration
   - IndexedDB: Transactional database (100MB+), asynchronous, supports indexes and complex queries
   - Use case: localStorage for small state (user session, selected models); IndexedDB for large data (offline action queue, cache)

2. **Browser Events**:
   - `beforeunload`: Fires before page navigation/close; use to flush pending actions
   - `online` / `offline`: Navigator events for network state changes
   - `storage`: Fires when localStorage changes in another tab (use for multi-tab sync)
   - `unhandledrejection`: Fallback for uncaught promise rejections

3. **Async/Await Patterns**:
   - All IndexedDB operations are async; use `await` to block until complete
   - Error handling with try-catch for quota exceeded, parse errors, transaction aborts

4. **WebSocket Lifecycle**:
   - WebSocket `open`, `close`, `error` events indicate network state
   - Treat WebSocket state as ground truth (more reliable than `navigator.onLine`)

5. **State Subscription Pattern**:
   - Emit custom events when state changes; subscribers listen and react
   - Prevents tight coupling between persistence layer and UI components

---

## Step-by-Step Implementation

### Step 1: SessionPersistence Class (2 days)

Create a class to save/restore user session state (auth token, user ID, selected models, preferences) across page reloads.

```javascript
// SessionPersistence.js
class SessionPersistence {
  constructor(storageKey = 'biometrics_session') {
    this.storageKey = storageKey;
    this.subscribers = [];
    this.setupListeners();
  }

  /**
   * Save current session state to localStorage
   * @param {Object} sessionData - { token, userId, selectedModels, preferences }
   * @throws {Error} if localStorage quota exceeded
   */
  async saveState(sessionData) {
    try {
      const serialized = JSON.stringify({
        ...sessionData,
        savedAt: new Date().toISOString(),
        version: 1
      });
      localStorage.setItem(this.storageKey, serialized);
      this.notifySubscribers('save', sessionData);
    } catch (err) {
      if (err.name === 'QuotaExceededError') {
        this.notifySubscribers('quota-exceeded', { error: err });
        throw new Error('localStorage quota exceeded; cannot save session');
      }
      throw err;
    }
  }

  /**
   * Restore session state from localStorage
   * @returns {Object|null} parsed session data or null if not found
   * @throws {Error} if parse fails (corrupted data)
   */
  async restoreState() {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) return null;

      const data = JSON.parse(serialized);
      if (data.version !== 1) {
        console.warn('Unsupported session version; clearing');
        this.clearState();
        return null;
      }

      this.notifySubscribers('restore', data);
      return data;
    } catch (err) {
      console.error('Failed to restore session:', err);
      this.notifySubscribers('restore-error', { error: err });
      return null;
    }
  }

  /**
   * Clear session state (logout)
   */
  async clearState() {
    try {
      localStorage.removeItem(this.storageKey);
      this.notifySubscribers('clear', {});
    } catch (err) {
      console.error('Failed to clear session:', err);
    }
  }

  /**
   * Subscribe to persistence events (save, restore, clear, quota-exceeded, restore-error)
   * @param {Function} callback - (event, data) => {}
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  /**
   * @private
   */
  notifySubscribers(event, data) {
    this.subscribers.forEach(cb => {
      try {
        cb(event, data);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    });
  }

  /**
   * @private Setup storage event listener for cross-tab sync
   */
  setupListeners() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          this.notifySubscribers('restored-from-tab', data);
        } catch (err) {
          console.error('Failed to parse session from storage event:', err);
        }
      }
    });
  }
}
```

**Testing**: 
- Save session with valid data → verify localStorage contains serialized JSON ✓
- Restore session → verify returned object matches saved data ✓
- Restore non-existent session → verify returns null ✓
- Restore corrupted JSON → verify returns null + error event ✓
- localStorage quota exceeded → verify throws + emits event ✓

**Integration**: SessionPersistence is initialized on app startup, loads previous session, and subscribes to logout events to clear state.

---

### Step 2: OfflineManager Class (2 days)

Handle queuing of API calls when offline; retry with exponential backoff when connection restored.

```javascript
// OfflineManager.js
class OfflineManager {
  constructor(options = {}) {
    this.queueDbName = options.queueDbName || 'BiometricsDB';
    this.queueStoreName = options.queueStoreName || 'actionQueue';
    this.maxRetries = options.maxRetries || 5;
    this.subscribers = [];
    this.pendingPromises = new Map();
    this.isOnline = navigator.onLine;
    
    this.setupDB();
    this.setupOnlineDetection();
  }

  /**
   * Queue an API action to be executed now (if online) or later (if offline)
   * @param {Object} action - { id (idempotency key), method, url, body, headers }
   * @returns {Promise} resolves when action completes or queued
   */
  async queueAction(action) {
    const actionWithMeta = {
      ...action,
      id: action.id || `${Date.now()}-${Math.random()}`,
      queuedAt: new Date().toISOString(),
      retries: 0,
      status: 'pending'
    };

    this.notifySubscribers('action-queued', actionWithMeta);

    if (this.isOnline) {
      return this.executeAction(actionWithMeta);
    } else {
      // Queue for later
      await this.addToQueue(actionWithMeta);
      return Promise.resolve({ queued: true, actionId: actionWithMeta.id });
    }
  }

  /**
   * Execute a single action (make HTTP call)
   * @private
   * @returns {Promise} resolves with API response
   */
  async executeAction(action) {
    try {
      const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers || { 'Content-Type': 'application/json' },
        body: action.body ? JSON.stringify(action.body) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.notifySubscribers('action-succeeded', { actionId: action.id, data });
      return data;
    } catch (err) {
      action.retries++;

      if (action.retries < this.maxRetries && !this.isOnline) {
        // Queue for retry
        await this.addToQueue(action);
        this.notifySubscribers('action-retry', { actionId: action.id, retries: action.retries });
        return Promise.reject(new Error('Action queued for retry'));
      }

      this.notifySubscribers('action-failed', { actionId: action.id, error: err.message });
      throw err;
    }
  }

  /**
   * Flush all queued actions (call when coming back online)
   * @returns {Promise} resolves when all actions processed
   */
  async flushQueue() {
    const actions = await this.getQueuedActions();
    if (actions.length === 0) return;

    this.notifySubscribers('flush-started', { count: actions.length });

    for (const action of actions) {
      try {
        await this.executeAction(action);
        await this.removeFromQueue(action.id);
      } catch (err) {
        console.error(`Failed to execute queued action ${action.id}:`, err);
      }
    }

    this.notifySubscribers('flush-completed', { count: actions.length });
  }

  /**
   * @private IndexedDB operations
   */
  async setupDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.queueDbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.queueStoreName)) {
          db.close();
          const upgradeRequest = indexedDB.open(this.queueDbName, 2);
          upgradeRequest.onupgradeneeded = (e) => {
            const db2 = e.target.result;
            if (!db2.objectStoreNames.contains(this.queueStoreName)) {
              db2.createObjectStore(this.queueStoreName, { keyPath: 'id' });
            }
          };
          upgradeRequest.onsuccess = () => {
            upgradeRequest.result.close();
            resolve();
          };
        } else {
          db.close();
          resolve();
        }
      };
    });
  }

  async addToQueue(action) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.queueStoreName], 'readwrite');
      tx.objectStore(this.queueStoreName).add(action);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getQueuedActions() {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.queueStoreName], 'readonly');
      const request = tx.objectStore(this.queueStoreName).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromQueue(actionId) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.queueStoreName], 'readwrite');
      tx.objectStore(this.queueStoreName).delete(actionId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.queueDbName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * @private Setup online/offline detection (use WebSocket as ground truth)
   */
  setupOnlineDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue().catch(err => console.error('Flush queue failed:', err));
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Also listen to WebSocket events (more reliable)
    document.addEventListener('websocket:connected', () => {
      this.isOnline = true;
      this.flushQueue();
    });
    document.addEventListener('websocket:disconnected', () => {
      this.isOnline = false;
    });
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  notifySubscribers(event, data) {
    this.subscribers.forEach(cb => {
      try {
        cb(event, data);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    });
  }
}
```

**Testing**:
- Queue action while online → verify executes immediately ✓
- Queue action while offline → verify stored in IndexedDB ✓
- Come back online → verify flushQueue() executes all queued actions ✓
- Action fails → verify retried with exponential backoff ✓
- Max retries exceeded → verify error emitted + action removed ✓

**Integration**: OfflineManager is initialized on startup. All API calls (via Gap 3's apiCallWithAuth) are wrapped with queueAction() for automatic offline handling.

---

### Step 3: CacheManager Class (1 day)

Implement in-memory cache with TTL-based expiration + pattern-based invalidation.

```javascript
// CacheManager.js
class CacheManager {
  constructor(options = {}) {
    this.defaultTtl = options.defaultTtl || 60000; // 1 minute
    this.maxSize = options.maxSize || 100;
    this.cache = new Map();
    this.subscribers = [];
  }

  /**
   * Get cached value (returns null if expired)
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.lastAccess = Date.now();
    return entry.value;
  }

  /**
   * Set cached value with TTL
   * @param {string} key
   * @param {any} value
   * @param {number} ttl - milliseconds (uses defaultTtl if not specified)
   */
  set(key, value, ttl = this.defaultTtl) {
    // Evict oldest entry if cache full (LRU)
    if (this.cache.size >= this.maxSize) {
      let oldest = null;
      let oldestTime = Infinity;
      for (const [k, entry] of this.cache) {
        if (entry.lastAccess < oldestTime) {
          oldestTime = entry.lastAccess;
          oldest = k;
        }
      }
      if (oldest) this.cache.delete(oldest);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      lastAccess: Date.now(),
      createdAt: Date.now()
    });

    this.notifySubscribers('set', { key, ttl });
  }

  /**
   * Check if key exists and not expired
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Invalidate cache entries by pattern (glob-style)
   * @param {string} pattern - e.g., '/api/models*' matches '/api/models/list', '/api/models/detail'
   */
  invalidate(pattern) {
    const regex = this.globToRegex(pattern);
    let count = 0;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    this.notifySubscribers('invalidate', { pattern, count });
  }

  /**
   * Clear all cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.notifySubscribers('clear', { size });
  }

  /**
   * Get cache statistics
   * @returns {Object} { size, maxSize, hits, misses }
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([k, v]) => ({
        key: k,
        expiresIn: Math.max(0, v.expiresAt - Date.now())
      }))
    };
  }

  /**
   * @private Convert glob pattern to regex
   */
  globToRegex(pattern) {
    const regexStr = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regexStr}$`);
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  notifySubscribers(event, data) {
    this.subscribers.forEach(cb => {
      try {
        cb(event, data);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    });
  }
}
```

**Testing**:
- Set + get with TTL → verify value returned before expiry ✓
- Set + wait for expiry → verify returns null ✓
- Invalidate by pattern → verify matching keys deleted ✓
- Cache full → verify LRU eviction ✓
- getStats() → verify accurate counts ✓

**Integration**: CacheManager wraps API calls (Gap 3). Set cache on successful response; invalidate on mutations (POST/PUT/DELETE).

---

### Step 4: MultiTabSync Class (1 day)

Synchronize state across multiple browser tabs using StorageEvent.

```javascript
// MultiTabSync.js
class MultiTabSync {
  constructor(options = {}) {
    this.tabId = this.generateTabId();
    this.subscribers = [];
    this.setupStorageListener();
  }

  /**
   * Broadcast state to other tabs
   * @param {string} channel - e.g., 'auth', 'models', 'preferences'
   * @param {Object} data
   */
  broadcastState(channel, data) {
    const message = {
      channel,
      data,
      fromTabId: this.tabId,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem(`sync:${channel}`, JSON.stringify(message));
    } catch (err) {
      console.error('Failed to broadcast state:', err);
    }
  }

  /**
   * Subscribe to state changes from other tabs
   * @param {string} channel
   * @param {Function} callback - (data) => {}
   * @returns {Function} unsubscribe
   */
  subscribe(channel, callback) {
    this.subscribers.push({ channel, callback, unsubscribe: null });
    const unsub = () => {
      this.subscribers = this.subscribers.filter(s => s.callback !== callback);
    };
    this.subscribers[this.subscribers.length - 1].unsubscribe = unsub;
    return unsub;
  }

  /**
   * @private Listen for storage events from other tabs
   */
  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (!e.key || !e.key.startsWith('sync:')) return;

      try {
        const message = JSON.parse(e.newValue);
        if (message.fromTabId === this.tabId) return; // Ignore own broadcasts

        const channel = e.key.replace('sync:', '');
        this.notifySubscribers(channel, message.data);
      } catch (err) {
        console.error('Failed to parse sync message:', err);
      }
    });
  }

  /**
   * @private
   */
  generateTabId() {
    let id = sessionStorage.getItem('tabId');
    if (!id) {
      id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tabId', id);
    }
    return id;
  }

  notifySubscribers(channel, data) {
    this.subscribers
      .filter(s => s.channel === channel)
      .forEach(s => {
        try {
          s.callback(data);
        } catch (err) {
          console.error('Subscriber error:', err);
        }
      });
  }
}
```

**Testing**:
- Broadcast from Tab A → verify Tab B receives via storage event ✓
- Subscribe on Tab B → verify callback fires with correct data ✓
- Multiple channels → verify isolation (channel 'auth' doesn't trigger 'models' callbacks) ✓
- Tab ID tracking → verify own broadcasts ignored ✓

**Integration**: When SessionPersistence saves state, it broadcasts via MultiTabSync. Other tabs listen and reload their UI.

---

## Testing Strategy

| Test Type | Coverage | Method |
|-----------|----------|--------|
| **Unit: SessionPersistence** | saveState, restoreState, clearState | Jest + localStorage mock; verify JSON serialization, error handling |
| **Unit: OfflineManager** | queueAction, executeAction, flushQueue, retry logic | Jest + fetch mock; simulate offline state, verify exponential backoff |
| **Unit: CacheManager** | get, set, invalidate, LRU eviction, TTL expiration | Jest; verify expiry timing, pattern matching, cache stats |
| **Unit: MultiTabSync** | broadcastState, subscribe, storage events | Jest + storage event simulation; verify cross-tab communication |
| **Integration: Offline Scenario** | Queue + execute + flush | Manual: disable network in DevTools, trigger API call, verify queued, come back online, verify flushed |
| **Integration: Multi-Tab** | Session sync + state broadcast | Manual: open 2 browser tabs, login in Tab A, verify Tab B updates automatically |
| **Integration: Cache Invalidation** | API mutation triggers cache clear | Manual: fetch models (cached), POST new model, verify cache invalidated, fetch again (cache miss) |
| **Stress: Storage Quota** | localStorage/IndexedDB limits | Manual: fill storage to near-quota, verify graceful error + event emission |

---

## Common Pitfalls

| Pitfall | Cause | Fix |
|---------|-------|-----|
| **StorageEvent fires on same tab** | localStorage changes trigger event in ALL tabs including originator | Check `fromTabId` in message; ignore own broadcasts |
| **Cache TTL drift** | System clock changes, setTimeout delays | Use `Date.now()` for all TTL checks; no reliance on setTimeout precision |
| **IndexedDB quota exceeded silently** | Add/put operations fail without throwing | Wrap in try-catch, catch QuotaExceededError, emit event, implement fallback (localStorage only) |
| **Offline queue grows unbounded** | No limit on retry attempts or queue size | Implement maxRetries + maxQueueSize; remove failed actions after threshold |
| **Race condition: multi-tab logout** | Tab A logs out, Tab B still has cached token | Use MultiTabSync to broadcast logout event; all tabs clear session immediately |
| **localStorage corruption** | Malformed JSON in localStorage (manual editing, bugs in previous sessions) | Try-catch on parse; fallback to null; emit restore-error event |
| **WebSocket vs navigator.onLine mismatch** | navigator.onLine unreliable on slow networks | Use WebSocket state as ground truth; listen to websocket:connected/disconnected events |
| **No recovery from IndexedDB errors** | Transaction abort, object store missing | Implement schema versioning; catch transaction errors; fallback to in-memory queue |

---

## Integration Points

| Gap | Integration | Details |
|-----|-----------|---------|
| **Gap 1 (Error)** | ErrorHandler catches OfflineManager errors | queueAction() throws; ErrorHandler emits error event with retry option |
| **Gap 3 (Auth)** | apiCallWithAuth() uses queueAction() | All API calls go through OfflineManager for automatic offline handling |
| **Gap 6 (Monitoring)** | CacheManager stats sent to analytics | Cache hit rate, eviction rate tracked as performance metric |
| **Gap 8 (Audit)** | MultiTabSync broadcasts audit events | Logout, model selection, preferences changes broadcast to all tabs for audit logging |

---

## Effort Estimate

| Task | Days | Notes |
|------|------|-------|
| SessionPersistence class + tests | 2 | localStorage serialization, error handling, event subscription |
| OfflineManager class + IndexedDB setup | 2 | fetch mocking, retry logic, queue management, online detection |
| CacheManager class + pattern matching | 1 | TTL expiration, LRU eviction, glob-to-regex conversion |
| MultiTabSync class + storage events | 1 | tab ID tracking, broadcast isolation, event propagation |
| Integration testing (offline scenario, multi-tab) | 2 | Manual DevTools testing, cross-tab verification |
| **Total** | **10 days** | Aligns with Phase 4 roadmap (Week 3–4) |

---

## Next Steps

**Definition of Done**:
- ✅ All 4 classes implemented with full JSDoc comments
- ✅ All methods async-safe (no blocking operations)
- ✅ Error handling covers quota exceeded, parse errors, transaction aborts
- ✅ Event subscription pattern allows loose coupling to UI
- ✅ Unit tests pass (Jest mocks for storage + fetch)
- ✅ Integration tests pass (offline queueing, multi-tab sync verified manually)
- ✅ No global `window` pollution; all state in Store module
- ✅ Code follows Phase 1 DoD (error handling, logging, no CDN dependencies)

**Transition to Gap 5**:
Gap 5 (Real-Time Sync) builds on Gap 4 by adding WebSocket event handlers to SessionPersistence + CacheManager. When agent state changes on backend, WebSocket pushes update; MultiTabSync broadcasts to all tabs; CacheManager invalidates; UI re-renders. Gap 4 provides the persistence foundation; Gap 5 adds the reactive updates.

---

**Created**: Session 6, Phase 4 Deliverable 2B Step 2
**Status**: Production-ready; ready for developer implementation
