# IMPLEMENTATION GUIDE: Gap 8 – Monitoring, Error Tracking & Audit Logging

**Phase**: Phase 4 (Week 5–6)  
**Effort Estimate**: 5 developer-days  
**Status**: Ready for Implementation  
**Last Updated**: 2026-02-23

---

## 1. OVERVIEW

Gap 8 addresses the critical absence of observability infrastructure in the BIOMETRICS Web UI. Without proper error tracking, audit logging, and usage instrumentation, the system operates as a "black box"—failures go undetected, user actions are untracked, and cost attribution becomes impossible. This gap directly impacts:

- **Enterprise Compliance** (audit trails for regulatory requirements)
- **Incident Response** (error detection + root cause analysis)
- **Cost Management** (per-user, per-model billing)
- **Performance Monitoring** (slow API calls, WebSocket disconnections)

Gap 8 implements four foundational monitoring systems:

1. **ErrorTracker**: Captures unhandled errors (sync + async) and sends them to the backend
2. **AuditLogger**: Records user actions (login, model selection, API calls, admin actions) for compliance
3. **TraceIdManager**: Propagates unique request IDs across distributed services for correlation
4. **CostTracker**: Instruments API usage per model + user and aggregates for monthly reporting

**Enterprise Impact**: Transforms the UI from "invisible" to "fully observable"—every error is logged, every user action is audited, every API call is cost-attributed, and every request can be traced across the entire system.

---

## 2. PREREQUISITE KNOWLEDGE

### Understanding Error Types in the Browser

The browser environment has **two categories of errors**:

1. **Synchronous Errors**: Thrown within try/catch blocks (detected immediately)
   ```javascript
   try {
     JSON.parse("invalid");  // SyntaxError thrown
   } catch (e) {
     // Caught here
   }
   ```

2. **Asynchronous Errors** (Silent Failures):
   - Unhandled promise rejections: `Promise.reject(error)` without `.catch()`
   - Event listener errors: `element.addEventListener('click', () => throw error)`
   - setTimeout/setInterval errors: `setTimeout(() => throw error, 1000)`
   
   These errors propagate to `window.onerror` or `window.onunhandledrejection` and crash the app if not caught.

### Understanding Audit Logging

Audit logging differs from application logging:

- **Application Logging**: "Debug info for developers" (INFO, WARN, DEBUG)
- **Audit Logging**: "Record of business actions for compliance" (WHO did WHAT, WHEN, WHY)

Audit logs must be **immutable**, **non-repudiable** (user cannot deny they did it), and **traceable** across services.

### Understanding Request Tracing

In distributed systems, a single user request may touch multiple services:

```
User Request
  ├─ Frontend (browser)
  ├─ API Gateway (Go backend)
  ├─ Auth Service
  ├─ Model Service
  └─ Database (Supabase)
```

Without a unique **TraceID** linking all these calls, it's impossible to correlate logs and debug failures. TraceID enables "follow a request through the entire system."

### Understanding Cost Attribution

The backend must know:
- Which user called which model API
- How many tokens were used
- What the cost was per token
- Monthly aggregation for billing

The frontend's job is to **instrument each API call** with model name + user ID, so the backend can calculate cost retroactively.

---

## 3. STEP-BY-STEP IMPLEMENTATION

### STEP 1: Implement ErrorTracker (2 days)

**Objective**: Capture all unhandled errors (sync + async) and send them to backend.

#### 1a. Create ErrorTracker Class

```javascript
/**
 * ErrorTracker: Global error capture system
 * 
 * Responsibilities:
 * - Capture sync errors (window.onerror)
 * - Capture async errors (window.onunhandledrejection)
 * - Deduplicate errors (same stack within 5 seconds = one error)
 * - Send batch to backend
 * - Maintain in-memory error buffer (last 10)
 */

class ErrorTracker {
  constructor(apiClient, traceIdManager, maxBufferSize = 10) {
    this.apiClient = apiClient;
    this.traceIdManager = traceIdManager;
    this.errorBuffer = [];
    this.maxBufferSize = maxBufferSize;
    this.recentStackTraces = new Set();  // Deduplication
    
    this.initialize();
  }

  initialize() {
    // Capture synchronous errors
    window.onerror = (message, source, lineno, colno, error) => {
      this.captureError({
        type: 'UncaughtError',
        message,
        source,
        lineno,
        colno,
        stack: error?.stack || 'No stack trace',
        timestamp: new Date().toISOString(),
      });
      return true;  // Prevent default error handling
    };

    // Capture unhandled promise rejections
    window.onunhandledrejection = (event) => {
      const reason = event.reason;
      const error = reason instanceof Error ? reason : new Error(String(reason));
      
      this.captureError({
        type: 'UnhandledRejection',
        message: error.message,
        stack: error.stack || 'No stack trace',
        timestamp: new Date().toISOString(),
      });
    };

    // Periodically flush errors to backend (batching)
    this.flushInterval = setInterval(() => this.flush(), 30000);  // Every 30 seconds
  }

  /**
   * Capture an error and deduplicate by stack trace
   */
  captureError(errorData) {
    const stackHash = this._hashStack(errorData.stack);

    // Deduplication: ignore if same stack seen in last 5 seconds
    if (this.recentStackTraces.has(stackHash)) {
      return;
    }

    this.recentStackTraces.add(stackHash);
    setTimeout(() => this.recentStackTraces.delete(stackHash), 5000);

    // Add trace ID and user context
    const errorWithContext = {
      ...errorData,
      traceId: this.traceIdManager.getCurrentTraceId(),
      userId: this._getUserId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this._generateErrorId(),
    };

    // Add to buffer (maintain max size)
    this.errorBuffer.unshift(errorWithContext);
    if (this.errorBuffer.length > this.maxBufferSize) {
      this.errorBuffer.pop();
    }

    // Optionally send immediately for critical errors
    if (this._isCriticalError(errorData)) {
      this.flush();
    }
  }

  /**
   * Batch send errors to backend
   */
  async flush() {
    if (this.errorBuffer.length === 0) return;

    const errorsToSend = [...this.errorBuffer];
    this.errorBuffer = [];

    try {
      await this.apiClient.post('/api/errors', {
        errors: errorsToSend,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      // Backend unreachable; restore buffer for retry
      this.errorBuffer = [...errorsToSend, ...this.errorBuffer];
      console.error('Failed to flush errors:', e);
    }
  }

  /**
   * Get recent errors (for UI error panel)
   */
  getRecentErrors(count = 5) {
    return this.errorBuffer.slice(0, count);
  }

  /**
   * Private helpers
   */
  _hashStack(stack) {
    return btoa(stack).substring(0, 16);  // Simple hash
  }

  _generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _getUserId() {
    // Retrieved from OAuth token or session storage
    return sessionStorage.getItem('userId') || 'anonymous';
  }

  _isCriticalError(errorData) {
    return errorData.message.includes('Fatal') || errorData.message.includes('Critical');
  }

  destroy() {
    clearInterval(this.flushInterval);
    this.flush();  // Final flush
  }
}
```

#### 1b. Integrate ErrorTracker into App Initialization

```javascript
// In your app initialization (main.js or app.html)

import ErrorTracker from './lib/ErrorTracker.js';
import ApiClient from './lib/ApiClient.js';
import TraceIdManager from './lib/TraceIdManager.js';

const apiClient = new ApiClient();
const traceIdManager = new TraceIdManager();
const errorTracker = new ErrorTracker(apiClient, traceIdManager);

// Expose globally for access within Alpine.js components
window.app = {
  errorTracker,
  apiClient,
  traceIdManager,
  // ... other modules
};
```

#### 1c. Alpine.js UI Component: Error Display Panel

```html
<!-- In your dashboard layout -->
<div x-data="errorPanel()" class="fixed bottom-4 right-4 max-w-sm">
  <!-- Error count badge -->
  <div class="bg-red-100 text-red-800 px-3 py-2 rounded-lg cursor-pointer"
       @click="expanded = !expanded">
    <span x-text="`${errorCount} Errors`"></span>
  </div>

  <!-- Expanded error list -->
  <div x-show="expanded" class="mt-2 bg-white border border-red-300 rounded-lg shadow-lg p-4 max-h-64 overflow-auto">
    <template x-for="error in recentErrors" :key="error.errorId">
      <div class="mb-3 pb-3 border-b border-gray-200">
        <div class="font-bold text-red-700" x-text="error.type"></div>
        <div class="text-sm text-gray-600" x-text="error.message"></div>
        <div class="text-xs text-gray-500 mt-1" x-text="new Date(error.timestamp).toLocaleString()"></div>
      </div>
    </template>
  </div>
</div>

<script>
function errorPanel() {
  return {
    expanded: false,
    recentErrors: [],
    errorCount: 0,

    init() {
      // Poll for new errors every 5 seconds
      this.pollInterval = setInterval(() => {
        this.recentErrors = window.app.errorTracker.getRecentErrors(5);
        this.errorCount = window.app.errorTracker.errorBuffer.length;
      }, 5000);
    },

    destroy() {
      clearInterval(this.pollInterval);
    }
  };
}
</script>
```

---

### STEP 2: Implement AuditLogger (1.5 days)

**Objective**: Record all user actions (login, model selection, API calls, admin actions) for compliance.

#### 2a. Create AuditLogger Class

```javascript
/**
 * AuditLogger: User action recording system
 * 
 * Responsibilities:
 * - Log user actions with WHO, WHAT, WHEN, WHY
 * - Support structured action types (enum)
 * - Batch send to backend
 * - Maintain in-memory buffer
 */

const AuditActionType = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  MODEL_SELECT: 'MODEL_SELECT',
  API_CALL: 'API_CALL',
  SETTINGS_CHANGE: 'SETTINGS_CHANGE',
  ADMIN_ACTION: 'ADMIN_ACTION',
  EXPORT_DATA: 'EXPORT_DATA',
  DELETE_DATA: 'DELETE_DATA',
};

class AuditLogger {
  constructor(apiClient, traceIdManager, maxBufferSize = 100) {
    this.apiClient = apiClient;
    this.traceIdManager = traceIdManager;
    this.auditBuffer = [];
    this.maxBufferSize = maxBufferSize;
    
    // Flush audit logs every 60 seconds
    this.flushInterval = setInterval(() => this.flush(), 60000);
  }

  /**
   * Log a user action
   * @param {string} action - Action type (from AuditActionType)
   * @param {object} details - Additional context
   */
  logAction(action, details = {}) {
    const auditEntry = {
      auditId: this._generateAuditId(),
      action,
      userId: this._getUserId(),
      email: this._getUserEmail(),
      timestamp: new Date().toISOString(),
      traceId: this.traceIdManager.getCurrentTraceId(),
      details: {
        ...details,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    };

    this.auditBuffer.push(auditEntry);
    if (this.auditBuffer.length > this.maxBufferSize) {
      this.auditBuffer.shift();
    }

    console.log(`[AUDIT] ${action}:`, auditEntry);
  }

  /**
   * Batch send audit logs to backend
   */
  async flush() {
    if (this.auditBuffer.length === 0) return;

    const logsToSend = [...this.auditBuffer];
    this.auditBuffer = [];

    try {
      await this.apiClient.post('/api/audit-logs', {
        logs: logsToSend,
        timestamp: new Date().toISOString(),
      });
      console.log(`[AUDIT] Flushed ${logsToSend.length} audit entries`);
    } catch (e) {
      // Restore buffer for retry
      this.auditBuffer = [...logsToSend, ...this.auditBuffer];
      console.error('[AUDIT] Failed to flush logs:', e);
    }
  }

  _generateAuditId() {
    return `aud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _getUserId() {
    return sessionStorage.getItem('userId') || 'anonymous';
  }

  _getUserEmail() {
    return sessionStorage.getItem('userEmail') || 'unknown@example.com';
  }

  destroy() {
    clearInterval(this.flushInterval);
    this.flush();  // Final flush
  }
}
```

#### 2b. Integrate AuditLogger into App

```javascript
// In main.js
import AuditLogger from './lib/AuditLogger.js';

const auditLogger = new AuditLogger(apiClient, traceIdManager);

window.app = {
  errorTracker,
  auditLogger,
  apiClient,
  traceIdManager,
};
```

#### 2c. Log Actions from Components

```javascript
// Example: When user logs in
export function handleLogin(credentials) {
  // ... OAuth flow ...
  window.app.auditLogger.logAction(
    AuditActionType.LOGIN,
    { provider: 'google', email: user.email }
  );
}

// Example: When user selects a model
export function selectModel(modelId) {
  window.app.auditLogger.logAction(
    AuditActionType.MODEL_SELECT,
    { modelId, modelName: 'gemini-3.1-pro' }
  );
}

// Example: When user calls an API
export async function callModelAPI(modelId, prompt) {
  window.app.auditLogger.logAction(
    AuditActionType.API_CALL,
    { modelId, promptLength: prompt.length }
  );
  
  const response = await window.app.apiClient.post('/api/chat', { modelId, prompt });
  return response;
}
```

---

### STEP 3: Implement TraceIdManager (1 day)

**Objective**: Generate and propagate unique request IDs across distributed services.

#### 3a. Create TraceIdManager Class

```javascript
/**
 * TraceIdManager: Request correlation across services
 * 
 * Responsibilities:
 * - Generate unique trace IDs
 * - Propagate in HTTP headers (X-Trace-Id)
 * - Rotate on session refresh
 * - Expose current trace ID for logging
 */

class TraceIdManager {
  constructor(userId = null) {
    this.userId = userId || this._getUserId();
    this.sessionId = this._generateSessionId();
    this.currentTraceId = this._generateTraceId();
  }

  /**
   * Generate a new trace ID
   * Format: timestamp-userId-random
   */
  _generateTraceId() {
    const timestamp = Date.now().toString(36);
    const userId = (this.userId || 'anon').substring(0, 8);
    const random = Math.random().toString(36).substr(2, 8);
    return `${timestamp}-${userId}-${random}`;
  }

  /**
   * Get current trace ID (immutable within request)
   */
  getCurrentTraceId() {
    return this.currentTraceId;
  }

  /**
   * Generate new trace ID (on session refresh/navigation)
   */
  rotate() {
    this.currentTraceId = this._generateTraceId();
    console.log(`[TRACE] New trace ID: ${this.currentTraceId}`);
  }

  /**
   * Propagate trace ID in HTTP headers
   */
  propagateInHeaders(headers = {}) {
    return {
      ...headers,
      'X-Trace-Id': this.currentTraceId,
      'X-Session-Id': this.sessionId,
      'X-User-Id': this.userId,
    };
  }

  _generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _getUserId() {
    return sessionStorage.getItem('userId') || 'anonymous';
  }

  destroy() {
    // Cleanup if needed
  }
}
```

#### 3b. Integrate TraceIdManager into ApiClient

```javascript
/**
 * ApiClient: Enhanced with trace ID propagation
 */
class ApiClient {
  constructor(traceIdManager) {
    this.traceIdManager = traceIdManager;
  }

  async request(method, path, options = {}) {
    const headers = this.traceIdManager.propagateInHeaders(options.headers || {});
    
    const response = await fetch(path, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`${method} ${path} failed: ${response.status}`);
    }

    return response.json();
  }

  async get(path, options = {}) {
    return this.request('GET', path, options);
  }

  async post(path, data, options = {}) {
    return this.request('POST', path, { ...options, body: data });
  }

  async put(path, data, options = {}) {
    return this.request('PUT', path, { ...options, body: data });
  }
}
```

---

### STEP 4: Implement CostTracker (1.5 days)

**Objective**: Instrument API usage per model and user for cost attribution.

#### 4a. Create CostTracker Class

```javascript
/**
 * CostTracker: API usage instrumentation
 * 
 * Responsibilities:
 * - Track API calls (model, tokens, cost)
 * - Aggregate by model, user, day, month
 * - Report monthly usage to backend
 * - Expose usage for quota management
 */

class CostTracker {
  constructor(apiClient, traceIdManager) {
    this.apiClient = apiClient;
    this.traceIdManager = traceIdManager;
    this.usageBuffer = [];
    
    // Monthly report: send at end of month or at user logout
    this.reportInterval = setInterval(() => {
      const now = new Date();
      if (now.getDate() === 1 && now.getHours() === 0) {  // First day of month
        this.reportMonthlyUsage();
      }
    }, 3600000);  // Check hourly
  }

  /**
   * Track a model API call
   * @param {string} modelId - Model identifier
   * @param {number} inputTokens - Input token count
   * @param {number} outputTokens - Output token count
   * @param {number} costUsd - Cost in USD
   */
  trackApiCall(modelId, inputTokens, outputTokens, costUsd) {
    const usage = {
      usageId: this._generateUsageId(),
      userId: this._getUserId(),
      modelId,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      costUsd,
      timestamp: new Date().toISOString(),
      traceId: this.traceIdManager.getCurrentTraceId(),
    };

    this.usageBuffer.push(usage);
    
    // Periodically flush usage to backend (every 100 calls or 5 minutes)
    if (this.usageBuffer.length >= 100) {
      this.flushUsage();
    }
  }

  /**
   * Flush usage buffer to backend
   */
  async flushUsage() {
    if (this.usageBuffer.length === 0) return;

    const usageToSend = [...this.usageBuffer];
    this.usageBuffer = [];

    try {
      await this.apiClient.post('/api/usage', {
        usage: usageToSend,
        timestamp: new Date().toISOString(),
      });
      console.log(`[COST] Flushed ${usageToSend.length} usage records`);
    } catch (e) {
      this.usageBuffer = [...usageToSend, ...this.usageBuffer];
      console.error('[COST] Failed to flush usage:', e);
    }
  }

  /**
   * Get user's current month usage (for quota display)
   */
  async getCurrentMonthUsage() {
    try {
      const response = await this.apiClient.get('/api/usage/current-month');
      return response;  // { totalCostUsd, tokenCount, byModel: [...] }
    } catch (e) {
      console.error('[COST] Failed to fetch usage:', e);
      return null;
    }
  }

  /**
   * Report monthly usage to backend (for billing)
   */
  async reportMonthlyUsage() {
    this.flushUsage();  // Flush any pending

    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const response = await this.apiClient.post('/api/usage-report', {
        month: lastMonth.toISOString().substring(0, 7),  // YYYY-MM
        timestamp: new Date().toISOString(),
      });
      console.log('[COST] Monthly usage reported:', response);
    } catch (e) {
      console.error('[COST] Failed to report monthly usage:', e);
    }
  }

  _generateUsageId() {
    return `use_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _getUserId() {
    return sessionStorage.getItem('userId') || 'anonymous';
  }

  destroy() {
    clearInterval(this.reportInterval);
    this.flushUsage();
    this.reportMonthlyUsage();
  }
}
```

#### 4b. Integrate CostTracker into Model API Calls

```javascript
// Example: Wrap model API call with cost tracking
export async function callModelAPI(modelId, prompt, maxTokens) {
  const startTime = performance.now();
  
  try {
    const response = await window.app.apiClient.post('/api/chat', {
      modelId,
      prompt,
      maxTokens,
    });

    // Backend returns token counts and cost
    const { inputTokens, outputTokens, costUsd } = response.metadata;
    
    window.app.costTracker.trackApiCall(modelId, inputTokens, outputTokens, costUsd);
    
    return response;
  } catch (e) {
    window.app.errorTracker.captureError({
      type: 'ModelAPIError',
      message: `Failed to call ${modelId}: ${e.message}`,
      stack: e.stack,
      timestamp: new Date().toISOString(),
    });
    throw e;
  }
}
```

#### 4c. Admin Dashboard Endpoint (Backend)

The frontend can display current user's usage, but the **admin dashboard** (served separately) fetches aggregated data:

```
GET /api/admin/usage?month=2024-02&breakdown=model
GET /api/admin/usage?month=2024-02&breakdown=user
GET /api/admin/usage?month=2024-02&breakdown=combined
```

Response format:
```json
{
  "month": "2024-02",
  "totalCostUsd": 1234.56,
  "totalTokens": 5000000,
  "byModel": [
    { "modelId": "gemini-3.1-pro", "costUsd": 600, "tokenCount": 2500000 },
    { "modelId": "gemini-3-flash", "costUsd": 400, "tokenCount": 2000000 }
  ],
  "byUser": [
    { "userId": "user_001", "email": "alice@example.com", "costUsd": 500, "tokenCount": 2000000 },
    { "userId": "user_002", "email": "bob@example.com", "costUsd": 734.56, "tokenCount": 3000000 }
  ]
}
```

---

## 4. TESTING STRATEGY

| Test Type | Coverage | Method |
|-----------|----------|--------|
| **Unhandled Error Capture** | `window.onerror` + `window.onunhandledrejection` | Jest mock window events; throw error; verify ErrorTracker.captureError called |
| **Error Deduplication** | Same stack within 5 sec = single error | Throw same error twice; verify buffer has 1 entry, not 2 |
| **Audit Log Recording** | All action types logged (LOGIN, MODEL_SELECT, API_CALL, etc.) | Call logAction(); verify auditBuffer entry created |
| **Trace ID Propagation** | X-Trace-Id header in all requests | Mock fetch; verify header includes currentTraceId |
| **Cost Tracking** | Usage recorded per model/user | Call trackApiCall(); verify usageBuffer entry; fetch getCurrentMonthUsage() |
| **Buffer Flushing** | Errors/audit/usage sent to backend | Mock apiClient.post(); trigger flush; verify called with correct payload |
| **Offline Resilience** | Buffer preserved if backend unreachable | Mock fetch failure; verify buffer restored |
| **TraceID Rotation** | New TraceID on rotate() | Call rotate(); verify currentTraceId changed |

**Unit Test Example** (Jest):
```javascript
describe('ErrorTracker', () => {
  let errorTracker, apiClient, traceIdManager;

  beforeEach(() => {
    apiClient = { post: jest.fn().mockResolvedValue({}) };
    traceIdManager = { getCurrentTraceId: jest.fn().mockReturnValue('trace_123') };
    errorTracker = new ErrorTracker(apiClient, traceIdManager);
  });

  test('captures sync errors', () => {
    errorTracker.captureError({
      type: 'UncaughtError',
      message: 'Test error',
      stack: 'at test.js:10',
      timestamp: new Date().toISOString(),
    });

    expect(errorTracker.errorBuffer.length).toBe(1);
    expect(errorTracker.errorBuffer[0].message).toBe('Test error');
  });

  test('deduplicates same stack trace within 5 seconds', () => {
    const errorData = {
      type: 'Error',
      message: 'Same error',
      stack: 'at line 10',
      timestamp: new Date().toISOString(),
    };

    errorTracker.captureError(errorData);
    errorTracker.captureError(errorData);  // Same stack

    expect(errorTracker.errorBuffer.length).toBe(1);  // Not 2
  });

  test('flushes errors to backend', async () => {
    errorTracker.captureError({
      type: 'Error',
      message: 'Test',
      stack: 'test',
      timestamp: new Date().toISOString(),
    });

    await errorTracker.flush();

    expect(apiClient.post).toHaveBeenCalledWith('/api/errors', expect.any(Object));
    expect(errorTracker.errorBuffer.length).toBe(0);
  });
});
```

---

## 5. COMMON PITFALLS

| Pitfall | Cause | Fix |
|---------|-------|-----|
| **Unhandled rejection not caught** | Event listener errors (setTimeout, Promise) not propagated to window | Set `window.onunhandledrejection` in addition to `window.onerror`; test with `Promise.reject()` |
| **TraceID scope too broad** | New TraceID generated on every request instead of per-session | TraceID should live for entire session; rotate only on login/navigation |
| **Error loop: ErrorTracker throws error** | errorTracker.captureError() throws → triggers window.onerror → infinite loop | Wrap errorTracker methods in try/catch; never throw in error capture code |
| **Audit logs don't get sent** | flush() never called before page unload | Call flush() in `beforeunload` event + periodic interval (60s) |
| **Cost calculation drift** | Frontend tracks usage, backend counts differently (rounding, retries) | Backend is source of truth; frontend sends best-effort data for quota display only |
| **Trace ID collision** | Random part not random enough | Use cryptographically secure random (crypto.getRandomValues) or higher entropy |
| **Buffer grows indefinitely** | No maxBufferSize enforcement | Implement circular buffer: if length > max, shift oldest entry |
| **Private data in error logs** | User passwords, API keys exposed in error messages | Sanitize error messages; never log request/response body for auth endpoints |

---

## 6. INTEGRATION POINTS

| Gap | Dependency | How It Connects |
|-----|------------|-----------------|
| **Gap 1 (Error Handling)** | ErrorTracker → ErrorHandler | When Circuit Breaker fails (Gap 1), ErrorTracker captures the failure; ErrorHandler displays it |
| **Gap 3 (Auth)** | AuditLogger → OAuthManager | Login/logout actions logged via AuditLogger; user ID passed to TraceIdManager |
| **Gap 4 (Persistence)** | TraceID → SessionPersistence | TraceID stored in session state; restored on page reload for request correlation |
| **Gap 6 (Monitoring—Dashboard)** | CostTracker → Metrics Display | Monthly usage displayed on dashboard; quota warnings based on CostTracker data |
| **Gap 7 (Deployment)** | ErrorTracker → Feature Flags | Feature flag changes logged in AuditLogger; errors in new features tracked separately |

---

## 7. EFFORT ESTIMATE

| Task | Days | Notes |
|------|------|-------|
| **ErrorTracker** (capture sync + async errors, batch to backend) | 2 | Deduplication logic; Alpine.js UI panel for error display |
| **AuditLogger** (structured action logging, compliance) | 1.5 | Enum for action types; batch flushing; integration with components |
| **TraceIdManager** (generate + propagate trace IDs) | 1 | Session ID + trace ID rotation; header injection |
| **CostTracker** (usage instrumentation, monthly reporting) | 1.5 | Track per-model cost; aggregate by user/month; admin dashboard data |
| **Testing** (unit + integration + manual) | 1 | Jest tests; offline resilience; deduplication; buffer management |
| **Total** | **5 days** | Parallel: ErrorTracker + TraceIdManager; Sequential: AuditLogger + CostTracker → Integration |

---

## 8. NEXT STEPS

### Definition of Done (All Required)

- ✅ ErrorTracker captures unhandled sync + async errors
- ✅ Errors deduplicated by stack trace (within 5 sec = 1 entry)
- ✅ Error buffer sent to `/api/errors` (batched, 30-sec interval)
- ✅ AuditLogger records user actions (LOGIN, MODEL_SELECT, API_CALL, ADMIN_ACTION, etc.)
- ✅ Audit logs sent to `/api/audit-logs` (batched, 60-sec interval)
- ✅ TraceID propagated in `X-Trace-Id` header on all API requests
- ✅ CostTracker instruments each model API call (inputTokens, outputTokens, costUsd)
- ✅ Usage data sent to `/api/usage` (batched, 100-call threshold or 5-min interval)
- ✅ Admin endpoint `/api/admin/usage?month=...&breakdown=...` returns aggregated data
- ✅ Alpine.js error panel displays recent errors (last 5)
- ✅ All classes integrated into global `window.app`
- ✅ Jest unit tests for all classes (error capture, deduplication, audit logging, trace propagation, cost tracking)
- ✅ Offline resilience verified (buffer preserved if backend unreachable)
- ✅ Private data (passwords, API keys) sanitized from error logs
- ✅ Buffer size limits enforced (circular buffer, max 100 entries)

### Transition to Next Gap (Gap 5: Mobile Responsiveness)

**Preconditions Met**:
- All errors observable via ErrorTracker
- All user actions auditable via AuditLogger
- All requests traceable via TraceID
- All costs attributed via CostTracker

**Next Gap Tasks**:
1. Add Tailwind responsive breakpoints (sm, md, lg, xl)
2. Implement CSS Grid for mobile dashboard layout
3. Add touch-friendly interaction (larger buttons, swipe gestures)
4. Test on iOS Safari, Android Chrome
5. Optimize font sizes for small screens

---

## REFERENCES

- **Gap Analysis**: `/Users/jeremy/.sisyphus/plans/biometrics/web-ui-enterprise-gap-analysis-v1.md` (lines ~950–1100)
- **Phase 4 Roadmap**: `/Users/jeremy/.sisyphus/plans/biometrics/web-ui-phase4-implementation-roadmap.md` (week 5 section)
- **Gap 1 (Error Handling)**: `/Users/jeremy/.sisyphus/plans/biometrics/impl-gap1-error-handling.md`
- **Gap 3 (Auth)**: `/Users/jeremy/.sisyphus/plans/biometrics/impl-gap3-auth-isolation.md`
- **Gap 4 (Persistence)**: `/Users/jeremy/.sisyphus/plans/biometrics/impl-gap4-persistence.md`
- **Gap 7 (Deployment)**: `/Users/jeremy/.sisyphus/plans/biometrics/impl-gap7-deployment.md`

---

**End of Gap 8 Implementation Guide**

