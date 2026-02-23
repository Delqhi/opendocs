# Implementation Guide: Gap 1 – Error Handling & Resilience

**Effort**: 10 developer-days (Week 1–2)  
**Priority**: CRITICAL (foundation for all other gaps)  
**Tech Stack**: Vanilla JS, Alpine.js, WebSockets  
**Status**: Ready for implementation

---

## 1. Overview

**What This Gap Solves**:
- Graceful handling of API timeouts, network failures, and rate limits
- Automatic retry logic with exponential backoff
- Circuit breaker pattern to prevent cascading failures
- WebSocket reconnection with visual indicators
- Error state UI that doesn't crash the dashboard

**Why It Matters**:
- Production systems fail—gracefully handling failures is the difference between "broken dashboard" and "resilient service"
- 9 agents running continuously; any single failure can cascade
- WebSocket disconnections are inevitable; users need clear feedback
- Rate limits require intelligent retry, not blind hammering

**Enterprise Impact**:
- Reduces MTTR (Mean Time To Recovery) from manual intervention to < 30s auto-recovery
- Prevents "angry user refreshes" that hammer overloaded services
- Clear error states build user trust ("I can see something went wrong, and it's recovering")

---

## 2. Prerequisite Knowledge

**Before implementing this gap, developer should understand**:

- **HTTP Status Codes**: 401 (auth), 429 (rate limit), 500 (server error), 503 (service unavailable)
- **WebSocket Events**: `open`, `close`, `message`, `error` event handlers
- **JavaScript Promises & async/await**: Error propagation, rejection handling
- **JavaScript Timers**: `setTimeout`, `setInterval`, cleanup with `clearTimeout`
- **Alpine.js Directives**: `x-show`, `x-if`, `x-on:click`, `x-data`, state binding
- **Local Storage API**: Persistence across page reloads
- **JavaScript Classes**: Constructor, methods, private properties (#field syntax)

**Recommended Reading**:
- MDN: "Promise" (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- MDN: "WebSocket API" (https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- Alpine.js Docs: "State Management" (https://alpinejs.dev/directives/data)

---

## 3. Step-by-Step Implementation

### Step 1: Create Error Classes (Day 1 AM – 2h)

**File**: `src/lib/errors.js`

```javascript
/**
 * Custom error types for API and WebSocket failures
 */

export class TimeoutError extends Error {
  constructor(message = 'Request timeout', timeoutMs = 5000) {
    super(message);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error', originalError = null) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded', retryAfterSeconds = 60) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class AuthError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthError';
  }
}

export class ServerError extends Error {
  constructor(message = 'Server error', statusCode = 500) {
    super(message);
    this.name = 'ServerError';
    this.statusCode = statusCode;
  }
}

/**
 * Parse HTTP response and throw appropriate error
 */
export function parseHttpError(response, body) {
  const { status } = response;
  
  if (status === 401) {
    return new AuthError('Unauthorized: Check API key or credentials');
  }
  
  if (status === 429) {
    const retryAfter = response.headers.get('retry-after') || '60';
    return new RateLimitError(`Rate limited. Retry in ${retryAfter}s`, parseInt(retryAfter));
  }
  
  if (status >= 500) {
    return new ServerError(`Server error: ${status}`, status);
  }
  
  if (status >= 400) {
    return new NetworkError(`HTTP ${status}: ${body?.message || 'Unknown error'}`);
  }
  
  return null;
}
```

**Acceptance Criteria**:
- ✅ All 5 error classes extend Error
- ✅ Each error has descriptive message + relevant metadata (timeoutMs, retryAfterSeconds, statusCode)
- ✅ `parseHttpError` correctly maps HTTP status codes to error types
- ✅ Error classes are exported and importable in tests

---

### Step 2: Implement Exponential Backoff Retry (Day 1 PM – 2h)

**File**: `src/lib/retry.js`

```javascript
import { RateLimitError, TimeoutError, NetworkError } from './errors.js';

/**
 * Exponential backoff retry strategy
 * Retries up to maxRetries times with increasing delays
 * Example: 1s, 2s, 4s, 8s, 16s (with jitter ±20%)
 */
export async function exponentialBackoff(
  fn,
  maxRetries = 3,
  baseDelayMs = 1000,
  maxDelayMs = 30000
) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on auth errors
      if (error.name === 'AuthError') {
        throw error;
      }
      
      // Calculate delay with jitter
      const delay = Math.min(
        baseDelayMs * Math.pow(2, attempt),
        maxDelayMs
      );
      const jitter = delay * 0.2 * Math.random(); // ±20% jitter
      const totalDelay = delay + jitter;
      
      console.warn(
        `Attempt ${attempt + 1}/${maxRetries} failed: ${error.name}. ` +
        `Retrying in ${Math.round(totalDelay)}ms...`
      );
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
  
  throw lastError;
}

/**
 * Retry only on specific error types
 */
export function shouldRetry(error) {
  return (
    error instanceof TimeoutError ||
    error instanceof NetworkError ||
    error instanceof RateLimitError ||
    (error instanceof Error && error.message.includes('ECONNREFUSED'))
  );
}
```

**Acceptance Criteria**:
- ✅ Backoff delay doubles with each retry (1s → 2s → 4s → 8s)
- ✅ Jitter prevents thundering herd (±20% randomness)
- ✅ Max delay capped at 30s (don't wait forever)
- ✅ Auth errors fail fast (no retry)
- ✅ Logs each retry attempt with remaining attempts

---

### Step 3: Create Circuit Breaker (Day 2 AM – 2h)

**File**: `src/lib/circuit-breaker.js`

```javascript
/**
 * Circuit Breaker Pattern:
 * CLOSED (working) → OPEN (failing, reject requests) → HALF_OPEN (testing recovery) → CLOSED
 */
export class CircuitBreaker {
  constructor(threshold = 5, timeoutMs = 60000) {
    this.threshold = threshold; // Failures before opening circuit
    this.timeoutMs = timeoutMs; // Time before trying again
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }
  
  /**
   * Execute function with circuit breaker protection
   */
  async call(fn) {
    if (this.state === 'OPEN') {
      // Check if timeout elapsed
      if (Date.now() - this.lastFailureTime > this.timeoutMs) {
        console.log('Circuit breaker: Transitioning to HALF_OPEN');
        this.state = 'HALF_OPEN';
      } else {
        throw new Error(
          `Circuit breaker is OPEN. Will retry in ${
            this.timeoutMs - (Date.now() - this.lastFailureTime)
          }ms`
        );
      }
    }
    
    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (error) {
      this._onFailure();
      throw error;
    }
  }
  
  _onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      console.log('Circuit breaker: Recovery successful, transitioning to CLOSED');
      this.state = 'CLOSED';
      this.successCount = 0;
    }
  }
  
  _onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      console.error(
        `Circuit breaker: Threshold (${this.threshold}) exceeded, opening circuit`
      );
      this.state = 'OPEN';
    }
  }
  
  /**
   * Manually reset circuit breaker (for testing)
   */
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
  }
  
  /**
   * Get current state for debugging
   */
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      threshold: this.threshold,
      timeoutMs: this.timeoutMs
    };
  }
}
```

**Acceptance Criteria**:
- ✅ Circuit transitions: CLOSED → OPEN → HALF_OPEN → CLOSED
- ✅ Opens after N failures (default 5)
- ✅ Rejects requests while OPEN (fast-fail, don't hammer backend)
- ✅ Transitions to HALF_OPEN after timeout (testing recovery)
- ✅ Returns to CLOSED on success in HALF_OPEN state
- ✅ Logs each state transition

---

### Step 4: Create HTTP Client with Timeout + Retry + Circuit Breaker (Day 2 PM – 2h)

**File**: `src/lib/http-client.js`

```javascript
import { TimeoutError, parseHttpError } from './errors.js';
import { exponentialBackoff, shouldRetry } from './retry.js';
import { CircuitBreaker } from './circuit-breaker.js';

export class HttpClient {
  constructor(baseURL = '/api', defaultTimeoutMs = 5000) {
    this.baseURL = baseURL;
    this.defaultTimeoutMs = defaultTimeoutMs;
    this.circuitBreaker = new CircuitBreaker();
    this.defaultHeaders = {};
  }
  
  /**
   * Set authorization header (e.g., Bearer token)
   */
  setAuthToken(token) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  /**
   * Fetch with timeout
   */
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || this.defaultTimeoutMs;
    
    const timeoutId = setTimeout(
      () => controller.abort(),
      timeoutMs
    );
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.defaultHeaders,
          ...options.headers
        }
      });
      
      // Handle error responses
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const error = parseHttpError(response, body);
        if (error) throw error;
      }
      
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  /**
   * GET request with retry + circuit breaker
   */
  async get(endpoint, options = {}) {
    return this._requestWithRetry(
      () => this.fetchWithTimeout(
        `${this.baseURL}${endpoint}`,
        { method: 'GET', ...options }
      ),
      options
    );
  }
  
  /**
   * POST request with retry + circuit breaker
   */
  async post(endpoint, data, options = {}) {
    return this._requestWithRetry(
      () => this.fetchWithTimeout(
        `${this.baseURL}${endpoint}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          ...options
        }
      ),
      options
    );
  }
  
  /**
   * Internal: Request with retry + circuit breaker
   */
  async _requestWithRetry(fn, options = {}) {
    const maxRetries = options.maxRetries ?? 3;
    
    return this.circuitBreaker.call(async () => {
      return exponentialBackoff(
        async () => {
          const response = await fn();
          return response.json();
        },
        maxRetries
      );
    });
  }
  
  /**
   * Get circuit breaker status (for UI display)
   */
  getCircuitBreakerStatus() {
    return this.circuitBreaker.getState();
  }
}

// Global instance
export const httpClient = new HttpClient('/api');
```

**Acceptance Criteria**:
- ✅ Timeout enforced via AbortController
- ✅ Retry logic integrated (exponentialBackoff)
- ✅ Circuit breaker protects all requests
- ✅ Auth token can be set globally
- ✅ Error responses parsed to typed errors
- ✅ Response auto-parsed to JSON

---

### Step 5: WebSocket Manager with Auto-Reconnect (Day 3 AM – 2h)

**File**: `src/lib/websocket-manager.js`

```javascript
import { NetworkError } from './errors.js';

export class WebSocketManager {
  constructor(url, options = {}) {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.reconnectDelayMs = options.reconnectDelayMs || 1000;
    this.messageHandlers = [];
    this.stateChangeHandlers = [];
    this.isManualClose = false;
  }
  
  /**
   * Connect to WebSocket
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.isManualClose = false;
          this._notifyStateChange('OPEN');
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(data));
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this._notifyStateChange('ERROR');
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this._notifyStateChange('CLOSED');
          
          // Auto-reconnect if not manually closed
          if (!this.isManualClose) {
            this._scheduleReconnect();
          }
        };
      } catch (error) {
        reject(new NetworkError('Failed to create WebSocket', error));
      }
    });
  }
  
  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    this.isManualClose = true;
    if (this.ws) {
      this.ws.close();
    }
  }
  
  /**
   * Send message (queue if not connected)
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not ready, message queued:', message);
      // TODO: Implement message queue (see Gap 4: Persistence)
    }
  }
  
  /**
   * Register handler for incoming messages
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }
  
  /**
   * Register handler for state changes
   */
  onStateChange(handler) {
    this.stateChangeHandlers.push(handler);
    return () => {
      this.stateChangeHandlers = this.stateChangeHandlers.filter(h => h !== handler);
    };
  }
  
  /**
   * Get current state
   */
  getState() {
    if (!this.ws) return 'DISCONNECTED';
    const readyState = this.ws.readyState;
    return [
      'CONNECTING',
      'OPEN',
      'CLOSING',
      'CLOSED'
    ][readyState];
  }
  
  /**
   * Internal: Schedule reconnect with exponential backoff
   */
  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      this._notifyStateChange('FAILED');
      return;
    }
    
    const delay = this.reconnectDelayMs * Math.pow(2, this.reconnectAttempts);
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(error => {
        console.error('Reconnect failed:', error);
        this._scheduleReconnect();
      });
    }, delay);
  }
  
  /**
   * Internal: Notify state change handlers
   */
  _notifyStateChange(state) {
    this.stateChangeHandlers.forEach(handler => handler(state));
  }
}
```

**Acceptance Criteria**:
- ✅ Connects to WebSocket
- ✅ Auto-reconnects on disconnect (exponential backoff)
- ✅ Stops reconnecting after max attempts
- ✅ Queues messages while disconnected (placeholder)
- ✅ Message handlers registered/unregistered
- ✅ State change handlers for UI indicators

---

### Step 6: Error State UI Components (Day 3 PM + Day 4 AM – 3h)

**File**: `src/components/error-alert.html`

```html
<div x-data="errorAlert()" class="error-container">
  <!-- Error Banner -->
  <template x-if="errorState.isVisible">
    <div class="fixed top-0 left-0 right-0 bg-red-100 border-b-2 border-red-600 p-4 z-50">
      <div class="max-w-6xl mx-auto flex justify-between items-start">
        <div>
          <h3 class="font-bold text-red-900" x-text="errorState.title"></h3>
          <p class="text-red-800 text-sm" x-text="errorState.message"></p>
          
          <!-- Retry info for rate limit -->
          <template x-if="errorState.type === 'RateLimitError'">
            <p class="text-red-700 text-xs mt-1">
              Retrying in <span x-text="retryCountdown"></span>s...
            </p>
          </template>
          
          <!-- Circuit breaker info -->
          <template x-if="errorState.type === 'CircuitBreakerOpen'">
            <p class="text-red-700 text-xs mt-1">
              System overloaded. Will retry in <span x-text="circuitBreakerCountdown"></span>s...
            </p>
          </template>
        </div>
        
        <button
          @click="dismiss()"
          class="text-red-900 hover:text-red-600 font-bold text-xl"
        >
          ×
        </button>
      </div>
    </div>
  </template>
  
  <!-- WebSocket Status Indicator (bottom right) -->
  <div
    class="fixed bottom-4 right-4 px-3 py-2 rounded text-white text-xs font-mono"
    :class="websocketStatusClasses()"
    x-text="websocketStatusText()"
  ></div>
</div>

<script>
function errorAlert() {
  return {
    errorState: {
      isVisible: false,
      type: null,
      title: '',
      message: '',
      duration: 5000
    },
    retryCountdown: 0,
    circuitBreakerCountdown: 0,
    
    init() {
      // Listen for error events (dispatched by httpClient or websocketManager)
      window.addEventListener('app:error', (event) => {
        this.showError(event.detail);
      });
      
      // Listen for WebSocket state changes
      window.addEventListener('app:websocket-state', (event) => {
        this.$watch('websocketState', event.detail.state);
      });
    },
    
    showError(error) {
      this.errorState.type = error.type;
      this.errorState.title = this._getErrorTitle(error.type);
      this.errorState.message = error.message || 'An error occurred';
      this.errorState.isVisible = true;
      
      // Auto-dismiss after duration (unless rate limit/circuit breaker)
      if (!['RateLimitError', 'CircuitBreakerOpen'].includes(error.type)) {
        setTimeout(() => this.dismiss(), this.errorState.duration);
      }
    },
    
    dismiss() {
      this.errorState.isVisible = false;
    },
    
    websocketStatusClasses() {
      const statusColor = {
        'OPEN': 'bg-green-500',
        'CLOSED': 'bg-red-500',
        'CONNECTING': 'bg-yellow-500',
        'FAILED': 'bg-red-900'
      };
      return statusColor[this.websocketState] || 'bg-gray-500';
    },
    
    websocketStatusText() {
      return `WS: ${this.websocketState}`;
    },
    
    _getErrorTitle(type) {
      const titles = {
        'TimeoutError': 'Request Timeout',
        'NetworkError': 'Network Error',
        'RateLimitError': 'Rate Limited',
        'AuthError': 'Authentication Failed',
        'ServerError': 'Server Error',
        'CircuitBreakerOpen': 'Service Temporarily Unavailable'
      };
      return titles[type] || 'Error';
    }
  };
}
</script>

<style>
.error-container {
  /* Container for error alerts */
}
</style>
```

**Acceptance Criteria**:
- ✅ Error banner displays at top of page
- ✅ WebSocket status indicator at bottom right
- ✅ Auto-dismisses after 5s (except rate limit/circuit breaker)
- ✅ Shows retry countdown for rate limits
- ✅ Shows circuit breaker recovery countdown
- ✅ Manual dismiss button

---

### Step 7: Integration & Testing (Day 4 PM + Day 5 – 4h)

**File**: `tests/error-handling.test.js`

```javascript
import { CircuitBreaker } from '../src/lib/circuit-breaker.js';
import { exponentialBackoff } from '../src/lib/retry.js';
import { TimeoutError, RateLimitError } from '../src/lib/errors.js';

describe('Error Handling', () => {
  describe('CircuitBreaker', () => {
    it('opens after threshold failures', async () => {
      const breaker = new CircuitBreaker(3, 1000);
      
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.call(() => Promise.reject(new Error('fail')));
        } catch (e) {
          // expected
        }
      }
      
      expect(breaker.getState().state).toBe('OPEN');
    });
    
    it('rejects requests while open', async () => {
      const breaker = new CircuitBreaker(1, 1000);
      
      try {
        await breaker.call(() => Promise.reject(new Error('fail')));
      } catch (e) {
        // expected
      }
      
      await expect(
        breaker.call(() => Promise.resolve('success'))
      ).rejects.toThrow('Circuit breaker is OPEN');
    });
    
    it('transitions to half-open after timeout', async () => {
      const breaker = new CircuitBreaker(1, 100);
      
      try {
        await breaker.call(() => Promise.reject(new Error('fail')));
      } catch (e) {
        // expected
      }
      
      expect(breaker.getState().state).toBe('OPEN');
      
      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Try to call again
      try {
        await breaker.call(() => Promise.reject(new Error('still failing')));
      } catch (e) {
        // expected
      }
      
      expect(breaker.getState().state).toBe('HALF_OPEN');
    });
  });
  
  describe('exponentialBackoff', () => {
    it('retries on failure', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) throw new TimeoutError();
        return 'success';
      };
      
      const result = await exponentialBackoff(fn, 5, 100);
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });
    
    it('fails after max retries', async () => {
      const fn = async () => {
        throw new TimeoutError();
      };
      
      await expect(
        exponentialBackoff(fn, 2, 100)
      ).rejects.toThrow(TimeoutError);
    });
  });
});
```

**Acceptance Criteria**:
- ✅ Unit tests for CircuitBreaker state transitions
- ✅ Unit tests for exponential backoff retry logic
- ✅ Integration test: HttpClient + CircuitBreaker
- ✅ Integration test: WebSocketManager reconnect
- ✅ Manual test: Navigate to dashboard, trigger timeout (dev tools network throttling)
- ✅ Manual test: Verify error banner appears
- ✅ Manual test: Verify WebSocket status indicator changes

---

## 4. Testing Strategy

| Test Type | Coverage | Method |
|-----------|----------|--------|
| **Unit Tests** | Error classes, retry logic, circuit breaker | Jest (see Step 7) |
| **Integration Tests** | HttpClient + CircuitBreaker, WebSocket reconnect | Jest + mock WebSocket |
| **Manual Tests** | Error banner UI, WebSocket indicator, retry countdown | Browser dev tools + network throttling |
| **Load Tests** | Circuit breaker under sustained load | Artillery (simulate 100 req/s) |

**Run Tests**:
```bash
npm test -- tests/error-handling.test.js
npm run test:integration
npm run test:e2e  # Playwright end-to-end
```

---

## 5. Common Pitfalls

| Pitfall | Cause | Fix |
|---------|-------|-----|
| **Infinite Retry Loop** | No max retry limit | Always set maxRetries; don't retry on auth errors |
| **Thundering Herd** | All retries fire at same time | Add jitter (±20% randomness) to backoff delay |
| **AbortController Polyfill Missing** | Old browser doesn't support AbortController | Import polyfill for fetch timeout; test in Safari 15+ |
| **Memory Leak: Event Listeners** | Handlers registered but never unregistered | Return unsubscribe function; call on component destroy |
| **WebSocket Message Queue Lost on Reload** | Messages queued in memory but lost on page reload | Persist queue to localStorage (see Gap 4) |
| **Circuit Breaker Stuck OPEN** | No recovery mechanism | Always transition to HALF_OPEN after timeout |
| **Error State UI Flickering** | Multiple error events fire simultaneously | Debounce error display (only show latest error after 100ms) |

---

## 6. Integration Points

| Gap | How Gap 1 is Used |
|-----|-------------------|
| **Gap 2** (Performance) | Wraps httpClient calls with latency monitoring |
| **Gap 3** (Auth) | apiCallWithAuth uses httpClient internally |
| **Gap 4** (Persistence) | Offline queue uses retry logic for queued actions |
| **Gap 5** (Mobile) | Error banner responsive (Tailwind) |
| **Gap 6** (Testing) | Tests verify error handling + retry behavior |
| **Gap 7** (Deployment) | Feature flag for circuit breaker threshold |
| **Gap 8** (Monitoring) | Error events captured + sent to ErrorTracker |

---

## 7. Effort Estimate

| Task | Developer-Days | Notes |
|------|-----------------|-------|
| Error classes + types | 1 day | Straightforward class definitions |
| Retry logic | 1 day | Exponential backoff + jitter |
| Circuit breaker | 1 day | State machine (CLOSED/OPEN/HALF_OPEN) |
| HTTP client | 1 day | Integrate timeout + retry + circuit breaker |
| WebSocket manager | 2 days | Complex reconnect logic + message queue (placeholder) |
| Error UI components | 2 days | Error banner + status indicator + Alpine.js |
| Testing + integration | 2 days | Unit tests + manual testing + dev tools validation |
| **TOTAL** | **10 days** | Completed by end of Week 2 |

---

## 8. Next Steps

**After Gap 1 is complete**:
1. ✅ All API calls use httpClient (with timeout + retry + circuit breaker)
2. ✅ All WebSocket messages logged (for debugging)
3. ✅ Error banner tested in production-like conditions (network throttling)
4. ✅ Ready to implement Gap 2 (Performance) → Gap 3 (Auth)

**Deliverables**:
- `src/lib/errors.js` (error classes)
- `src/lib/retry.js` (exponential backoff)
- `src/lib/circuit-breaker.js` (circuit breaker)
- `src/lib/http-client.js` (HTTP client with timeout + retry + CB)
- `src/lib/websocket-manager.js` (WebSocket with auto-reconnect)
- `src/components/error-alert.html` (error UI)
- `tests/error-handling.test.js` (unit + integration tests)

**Definition of Done**:
- ✅ All files created and syntax-valid
- ✅ All tests pass (100% code coverage)
- ✅ Error banner tested manually (network throttling)
- ✅ WebSocket auto-reconnect tested (kill WS, verify reconnect)
- ✅ Ready for Gap 2 implementation
