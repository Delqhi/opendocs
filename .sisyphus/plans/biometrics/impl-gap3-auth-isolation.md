# Gap 3: Authorization Isolation & API Quota Management

## Overview

Authorization isolation is the enterprise pattern that separates authentication (identity verification) from authorization (permission enforcement). In BIOMETRICS, this means: (1) securely managing OAuth 2.0 tokens from the authorization server, (2) injecting Bearer tokens into every API call, (3) enforcing per-user model quotas before allowing requests, and (4) implementing role-based access control (RBAC) to hide/enable menu items based on user permissions.

Without this gap, a malicious user could craft API calls to models they don't have quota for, or a token refresh failure would crash the entire app. With this gap, the Web UI becomes a secure API client that respects quotas and gracefully handles token expiry.

**Enterprise Impact**: Prevents quota abuse, enforces fine-grained access control, and ensures secure token lifecycle management.

---

## Prerequisite Knowledge

### OAuth 2.0 Authorization Code Flow

The Web UI does NOT own the user's password. Instead:
1. User clicks "Login"
2. Web UI redirects to authorization server (e.g., `https://auth.biometrics.ai/authorize?client_id=...`)
3. User logs in at the authorization server and grants permission
4. Authorization server redirects back to Web UI with an authorization `code`
5. Web UI exchanges the `code` for an access token (backend-to-backend, secure)
6. Web UI stores the access token and uses it to call the API

**Key**: The access token has a short lifetime (e.g., 1 hour). When it expires, the Web UI must exchange a refresh token for a new access token (transparent to the user).

### Bearer Token Injection

Every API call to the orchestrator must include the access token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Without this header, the API rejects the request with HTTP 401 Unauthorized.

### Model Quotas

Each user has a quota per model (e.g., "100 requests/month for gpt-4-turbo"). Before allowing a user to submit a request, the Web UI must check:
- Does this user have quota for this model?
- How much quota remains?
- Should the UI show a warning or disable the model entirely?

Quotas are NOT enforced on the client alone (users can bypass client-side checks); they are enforced on the API server. But the Web UI must respect quotas locally to provide good UX.

### Role-Based Access Control (RBAC)

Users have roles (e.g., "admin", "power-user", "free-tier"). Each role has:
- A set of allowed models (e.g., power-users can access gpt-4-turbo; free-tier users cannot)
- A set of allowed features (e.g., only admins can delete agents)

The Web UI must fetch the user's role on login and use it to show/hide menu items and buttons.

---

## Step-by-Step Implementation

### Step 1: OAuthManager – Manage Token Lifecycle (Effort: 2 days)

**Files**: `src/modules/auth/oauth-manager.js`

Create a class that orchestrates the entire OAuth 2.0 flow: authorization URL generation, code exchange, token refresh, and logout.

```javascript
/**
 * OAuthManager
 * 
 * Manages OAuth 2.0 authorization code flow.
 * Handles token acquisition, refresh, and expiry.
 * 
 * @class
 */
export class OAuthManager {
  constructor(clientId, redirectUri, authServerUrl) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;  // e.g., "https://biometrics.ai/callback"
    this.authServerUrl = authServerUrl;  // e.g., "https://auth.biometrics.ai"
    
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = null;
    this.user = null;
    
    // Load tokens from localStorage (persisted from previous session)
    this._restoreFromStorage();
  }
  
  /**
   * Generate the authorization URL for user login
   * 
   * @param {string} state - CSRF protection state parameter
   * @returns {string} Full authorization URL
   */
  getAuthorizationUrl(state) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state: state,
    });
    
    return `${this.authServerUrl}/authorize?${params}`;
  }
  
  /**
   * Exchange authorization code for access token
   * 
   * Called after user returns from authorization server.
   * This is a critical operation—if it fails, user cannot log in.
   * 
   * @param {string} code - Authorization code from auth server
   * @returns {Promise<void>}
   * @throws {Error} If token exchange fails
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await fetch(`${this.authServerUrl}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code,
          client_id: this.clientId,
          redirect_uri: this.redirectUri,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
      this.user = this._decodeJWT(data.access_token);
      
      // Save tokens to localStorage for persistence
      this._saveToStorage();
      
      // Dispatch login event for UI to react
      window.dispatchEvent(new CustomEvent('app:login', { detail: { user: this.user } }));
      
    } catch (error) {
      console.error('OAuth token exchange failed:', error);
      throw error;
    }
  }
  
  /**
   * Refresh expired access token using refresh token
   * 
   * Called when API returns 401 OR when access token is about to expire.
   * 
   * @returns {Promise<void>}
   * @throws {Error} If refresh fails (user must re-login)
   */
  async refreshToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available. User must re-login.');
    }
    
    try {
      const response = await fetch(`${this.authServerUrl}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: this.clientId,
        }),
      });
      
      if (!response.ok) {
        // If refresh fails, tokens are invalid. Force re-login.
        this.logout();
        throw new Error('Token refresh failed. User must re-login.');
      }
      
      const data = await response.json();
      
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;  // Server may issue new refresh token
      this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
      this.user = this._decodeJWT(data.access_token);
      
      this._saveToStorage();
      
      // Dispatch refresh event
      window.dispatchEvent(new CustomEvent('app:token-refreshed', { detail: { user: this.user } }));
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }
  
  /**
   * Check if access token is expired or about to expire
   * 
   * @returns {boolean}
   */
  isTokenExpired(bufferMs = 60000) {
    if (!this.tokenExpiresAt) return true;
    return Date.now() >= this.tokenExpiresAt - bufferMs;
  }
  
  /**
   * Decode JWT to extract user info (audience, roles, email, etc.)
   * 
   * WARNING: This is client-side decoding for UI purposes only.
   * The API server will validate the token signature.
   * 
   * @param {string} token - JWT token
   * @returns {object} Decoded payload
   */
  _decodeJWT(token) {
    try {
      const parts = token.split('.');
      const decoded = atob(parts[1]);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('JWT decode failed:', error);
      return {};
    }
  }
  
  /**
   * Get current access token (with auto-refresh if expired)
   * 
   * @returns {Promise<string>} Valid access token
   */
  async getAccessToken() {
    if (this.isTokenExpired()) {
      await this.refreshToken();
    }
    return this.accessToken;
  }
  
  /**
   * Logout: clear tokens and redirect to login
   */
  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = null;
    this.user = null;
    localStorage.removeItem('oauth_tokens');
    window.dispatchEvent(new CustomEvent('app:logout'));
  }
  
  /**
   * Persist tokens to localStorage
   * @private
   */
  _saveToStorage() {
    localStorage.setItem('oauth_tokens', JSON.stringify({
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenExpiresAt: this.tokenExpiresAt,
    }));
  }
  
  /**
   * Restore tokens from localStorage
   * @private
   */
  _restoreFromStorage() {
    const stored = localStorage.getItem('oauth_tokens');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.tokenExpiresAt = data.tokenExpiresAt;
        this.user = this._decodeJWT(this.accessToken);
      } catch (error) {
        console.error('Failed to restore tokens from storage:', error);
        localStorage.removeItem('oauth_tokens');
      }
    }
  }
}
```

**Acceptance Criteria**:
- [ ] OAuth authorization URL is correct (includes `client_id`, `redirect_uri`, `scope`)
- [ ] Token exchange succeeds and stores `access_token`, `refresh_token`, `expires_in`
- [ ] Token refresh works without user interaction
- [ ] Expired tokens are auto-refreshed before API calls
- [ ] Logout clears all tokens and redirects to login
- [ ] Tokens persisted to localStorage survive page reload
- [ ] `app:login` event fired on successful login
- [ ] `app:token-refreshed` event fired on token refresh
- [ ] `app:logout` event fired on logout

---

### Step 2: API Interceptor with Bearer Token Injection (Effort: 1 day)

**Files**: `src/modules/api/api-client.js`

Create a wrapper around `fetch` that:
1. Injects Bearer token into every request
2. Handles 401 responses by refreshing token and retrying
3. Propagates errors for error handling (Gap 1)

```javascript
/**
 * apiCallWithAuth
 * 
 * Wrapper around fetch that automatically injects Bearer token
 * and handles token refresh on 401.
 * 
 * @param {OAuthManager} oauthManager - OAuth manager instance
 * @param {string} endpoint - API endpoint (e.g., "/api/agents")
 * @param {object} options - fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>}
 * @throws {NetworkError|AuthError|ServerError} See Gap 1 error handling
 */
export async function apiCallWithAuth(oauthManager, endpoint, options = {}) {
  const { method = 'GET', body = null, ...otherOptions } = options;
  
  // Ensure we have a valid token
  const accessToken = await oauthManager.getAccessToken();
  
  // Build headers with Bearer token
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    ...otherOptions.headers,
  };
  
  try {
    let response = await fetch(endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      ...otherOptions,
    });
    
    // If 401, token may have just expired. Refresh and retry once.
    if (response.status === 401) {
      console.warn('Received 401. Refreshing token...');
      
      try {
        const newToken = await oauthManager.getAccessToken();  // Force refresh
        headers['Authorization'] = `Bearer ${newToken}`;
        
        // Retry the request with new token
        response = await fetch(endpoint, {
          method,
          headers,
          body: body ? JSON.stringify(body) : null,
          ...otherOptions,
        });
      } catch (refreshError) {
        // If refresh fails, user must re-login
        oauthManager.logout();
        throw new AuthError('Session expired. Please login again.', { cause: refreshError });
      }
    }
    
    // For non-2xx responses, throw an error (will be caught by error handler in Gap 1)
    if (!response.ok) {
      const errorBody = await response.text();
      const error = new Error(`API call failed: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.body = errorBody;
      throw error;
    }
    
    return response;
    
  } catch (error) {
    // Network errors (no internet) or other fetch errors
    if (error instanceof TypeError) {
      throw new NetworkError('Network request failed', { cause: error });
    }
    throw error;
  }
}

/**
 * Convenience function for GET requests
 */
export async function apiGet(oauthManager, endpoint) {
  const response = await apiCallWithAuth(oauthManager, endpoint, { method: 'GET' });
  return response.json();
}

/**
 * Convenience function for POST requests
 */
export async function apiPost(oauthManager, endpoint, body) {
  const response = await apiCallWithAuth(oauthManager, endpoint, { method: 'POST', body });
  return response.json();
}
```

**Acceptance Criteria**:
- [ ] Bearer token injected into `Authorization` header
- [ ] Token auto-refreshed on 401 response
- [ ] Request retried with new token after refresh
- [ ] Logout triggered if refresh fails
- [ ] Network errors wrapped in `NetworkError` (Gap 1)
- [ ] Auth errors wrapped in `AuthError` (Gap 1)
- [ ] Response parsed as JSON (for convenience functions)
- [ ] All errors propagate to error handler (Gap 1)

---

### Step 3: ModelQuotaManager – Enforce Per-User Quotas (Effort: 2 days)

**Files**: `src/modules/quota/quota-manager.js`

Create a class that:
1. Fetches user's model quotas from the API
2. Checks if a model is available before sending a request
3. Displays quota percentage in the UI

```javascript
/**
 * ModelQuotaManager
 * 
 * Fetches and enforces per-user model quotas.
 * Prevents users from using models they don't have quota for.
 * 
 * @class
 */
export class ModelQuotaManager {
  constructor(oauthManager) {
    this.oauthManager = oauthManager;
    this.quotas = {};  // { [modelId]: { limit, used, remaining, resetAt } }
    this.lastFetched = null;
    this.cacheMs = 60000;  // Refresh quota cache every 60 seconds
  }
  
  /**
   * Fetch user's model quotas from API
   * 
   * @returns {Promise<void>}
   */
  async fetchQuotas() {
    try {
      const response = await apiGet(this.oauthManager, '/api/user/quotas');
      this.quotas = response.quotas || {};
      this.lastFetched = Date.now();
      
      // Dispatch event so UI can update quota display
      window.dispatchEvent(new CustomEvent('app:quotas-updated', { detail: this.quotas }));
      
    } catch (error) {
      console.error('Failed to fetch quotas:', error);
      throw error;
    }
  }
  
  /**
   * Ensure quotas are fresh (refetch if older than cacheMs)
   * 
   * @returns {Promise<void>}
   */
  async ensureFresh() {
    if (!this.lastFetched || Date.now() - this.lastFetched > this.cacheMs) {
      await this.fetchQuotas();
    }
  }
  
  /**
   * Check if user can use a specific model
   * 
   * @param {string} modelId - Model ID (e.g., "gpt-4-turbo")
   * @returns {Promise<boolean>}
   */
  async canUseModel(modelId) {
    await this.ensureFresh();
    
    const quota = this.quotas[modelId];
    if (!quota) {
      // Model not in quota list = not authorized
      return false;
    }
    
    // Check if user has remaining quota
    return quota.remaining > 0;
  }
  
  /**
   * Get quota percentage for a model (for progress bar display)
   * 
   * @param {string} modelId
   * @returns {Promise<number>} Percentage used (0-100)
   */
  async getQuotaPercentage(modelId) {
    await this.ensureFresh();
    
    const quota = this.quotas[modelId];
    if (!quota) return 100;  // Unknown model = show as full
    
    const usedPercent = (quota.used / quota.limit) * 100;
    return Math.min(usedPercent, 100);  // Cap at 100%
  }
  
  /**
   * Get user's role-based visible models
   * 
   * Different roles have different model permissions:
   * - free-tier: only [gpt-3.5-turbo, claude-instant]
   * - power-user: all non-enterprise models
   * - admin: all models
   * 
   * @returns {Promise<string[]>} Array of model IDs user is authorized to see
   */
  async getRoleBasedVisibleModels() {
    await this.ensureFresh();
    
    // Get user role from OAuth token
    const userRole = this.oauthManager.user?.role || 'free-tier';
    
    // Define role-to-models mapping
    const roleModels = {
      'free-tier': ['gpt-3.5-turbo', 'claude-instant'],
      'power-user': ['gpt-4-turbo', 'claude-opus', 'gemini-3-pro', 'gpt-3.5-turbo', 'claude-instant'],
      'admin': Object.keys(this.quotas),  // All models in quota list
    };
    
    return roleModels[userRole] || [];
  }
  
  /**
   * Get remaining quota for a model (for display in UI)
   * 
   * @param {string} modelId
   * @returns {Promise<{used: number, limit: number, remaining: number}>}
   */
  async getQuotaInfo(modelId) {
    await this.ensureFresh();
    return this.quotas[modelId] || { used: 0, limit: 0, remaining: 0 };
  }
}
```

**Acceptance Criteria**:
- [ ] Quotas fetched from API on initialization
- [ ] `canUseModel()` returns false if user has no quota
- [ ] Quota percentage calculated correctly (used / limit * 100)
- [ ] Role-based models filtered by user role
- [ ] Quota cache refreshed every 60 seconds
- [ ] `app:quotas-updated` event fired when quotas change
- [ ] Unknown models shown with 100% usage (disabled)
- [ ] Quota info includes `used`, `limit`, `remaining`

---

### Step 4: Role-Based Menu Visibility with Alpine.js (Effort: 1 day)

**Files**: `src/components/app-menu.html`, `src/modules/ui/menu-controller.js`

Create an Alpine.js component that shows/hides menu items based on user role and model quota.

**HTML** (`src/components/app-menu.html`):

```html
<div x-data="menuController()" class="menu">
  <!-- Admin-only section -->
  <section x-show="userRole === 'admin'" class="admin-section">
    <h3>Administration</h3>
    <ul>
      <li><a href="#/settings">Settings</a></li>
      <li><a href="#/users">Manage Users</a></li>
      <li><a href="#/billing">Billing</a></li>
    </ul>
  </section>
  
  <!-- Model selector (only show models user has quota for) -->
  <section class="models-section">
    <h3>Available Models</h3>
    <ul>
      <template x-for="modelId in visibleModels" :key="modelId">
        <li class="model-item">
          <label class="model-label">
            <input 
              type="radio" 
              name="selectedModel" 
              :value="modelId"
              @change="selectModel(modelId)"
            />
            <span x-text="modelId"></span>
            
            <!-- Quota bar -->
            <div class="quota-bar">
              <div 
                class="quota-used" 
                :style="`width: ${getQuotaPercent(modelId)}%`"
                :class="{ 'quota-critical': getQuotaPercent(modelId) > 80 }"
              ></div>
            </div>
            
            <!-- Quota text -->
            <span class="quota-text" x-text="getQuotaText(modelId)"></span>
          </label>
        </li>
      </template>
      
      <!-- Show unavailable models as disabled -->
      <template x-for="modelId in unavailableModels" :key="modelId">
        <li class="model-item disabled">
          <label class="model-label disabled">
            <input type="radio" name="selectedModel" disabled />
            <span x-text="modelId"></span>
            <span class="quota-text quota-exhausted">Quota exhausted</span>
          </label>
        </li>
      </template>
    </ul>
  </section>
  
  <!-- Power-user feature: bulk operations -->
  <section x-show="userRole === 'power-user' || userRole === 'admin'" class="power-features">
    <h3>Power Features</h3>
    <button @click="openBulkOperations()">Bulk Operations</button>
    <button @click="openAdvancedSettings()">Advanced Settings</button>
  </section>
</div>

<style>
  .quota-bar {
    width: 100%;
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    margin: 4px 0;
  }
  
  .quota-used {
    height: 100%;
    background: #4caf50;
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  
  .quota-used.quota-critical {
    background: #ff9800;
  }
  
  .model-item.disabled .model-label {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .quota-exhausted {
    color: #f44336;
    font-weight: bold;
  }
</style>
```

**JavaScript** (`src/modules/ui/menu-controller.js`):

```javascript
/**
 * menuController
 * 
 * Alpine.js data function for menu visibility and quota display.
 */
export function menuController() {
  return {
    userRole: 'free-tier',
    selectedModel: null,
    visibleModels: [],
    unavailableModels: [],
    quotaInfo: {},
    
    async init() {
      // Fetch quotas and populate menu
      await quotaManager.fetchQuotas();
      this.userRole = oauthManager.user?.role || 'free-tier';
      
      // Get role-based visible models
      this.visibleModels = await quotaManager.getRoleBasedVisibleModels();
      
      // Find models user can't use (in system but not in their quota)
      const allModels = ['gpt-4-turbo', 'claude-opus', 'gemini-3-pro', 'gpt-3.5-turbo'];
      this.unavailableModels = allModels.filter(m => !this.visibleModels.includes(m));
      
      // Store quota info for display
      for (const modelId of this.visibleModels) {
        this.quotaInfo[modelId] = await quotaManager.getQuotaInfo(modelId);
      }
    },
    
    getQuotaPercent(modelId) {
      const quota = this.quotaInfo[modelId];
      if (!quota) return 100;
      return (quota.used / quota.limit) * 100;
    },
    
    getQuotaText(modelId) {
      const quota = this.quotaInfo[modelId];
      if (!quota) return '';
      return `${quota.remaining} / ${quota.limit} remaining`;
    },
    
    selectModel(modelId) {
      this.selectedModel = modelId;
      window.dispatchEvent(new CustomEvent('app:model-selected', { detail: { modelId } }));
    },
    
    openBulkOperations() {
      window.location.hash = '#/bulk-operations';
    },
    
    openAdvancedSettings() {
      window.location.hash = '#/advanced-settings';
    },
  };
}
```

**Acceptance Criteria**:
- [ ] Admin-only sections hidden from non-admin users
- [ ] Only models with remaining quota are shown
- [ ] Models with zero quota shown as disabled
- [ ] Quota percentage bar displays correctly
- [ ] Quota remaining text shows "N / M remaining"
- [ ] Power-user features shown only to power-users and admins
- [ ] Role-based filtering happens on init and on quota refresh
- [ ] Model selection dispatches `app:model-selected` event

---

## Testing Strategy

| Test Type | Coverage | Method |
|-----------|----------|--------|
| **Unit Tests** | OAuthManager token lifecycle, ModelQuotaManager quota calculation | Jest: `test('OAuthManager.exchangeCodeForToken', ...)` |
| **Integration Tests** | Full OAuth flow (mock auth server), API call with Bearer token, token refresh on 401 | Jest: `test('OAuth flow with token refresh', ...)` |
| **Manual Testing** | Login → token stored → page reload → tokens restored, API call succeeds, 401 triggers refresh and retry, model selector shows only available models | Browser: (1) Open console, (2) Login via OAuth, (3) Check localStorage for tokens, (4) Reload page, (5) Verify tokens loaded, (6) Make API call, (7) Check Authorization header, (8) Verify model quota display |
| **Quota Enforcement** | `canUseModel()` returns true only if quota > 0, quota percentage bar displays correctly, disabled models are unclickable | Jest: `test('ModelQuotaManager.canUseModel', ...)` |

**Run Tests**:
```bash
npm test -- src/modules/auth/oauth-manager.test.js
npm test -- src/modules/quota/quota-manager.test.js
npm test -- src/modules/ui/menu-controller.test.js

# Manual test:
npm run dev
# Open http://localhost:5173
# Click Login, complete OAuth flow
```

---

## Common Pitfalls

| Pitfall | Cause | Fix |
|---------|-------|-----|
| **401 after token refresh still fails** | Token refresh endpoint is broken or refresh token expired (requires user re-login) | Add graceful logout in catch block; test with expired refresh token |
| **CORS errors on token refresh** | Authorization server doesn't allow cross-origin requests from Web UI | Add `mode: 'cors'` to fetch options; verify auth server CORS headers |
| **Token never refreshed (expires silently)** | No auto-refresh before API call; token expires mid-request | Call `oauthManager.getAccessToken()` which auto-refreshes if expired |
| **Quota always shows 100% (cache not refreshing)** | Quota cache never invalidated after API updates quota | Set `cacheMs = 0` for testing; in production, use websocket push for real-time updates |
| **Role not decoded from JWT** | JWT decode fails silently; user role is undefined | Add try-catch in `_decodeJWT`; validate JWT structure (3 base64 parts) |
| **Menu items stay hidden after role change** | Alpine.js doesn't react to role change; need to refresh component | Dispatch `app:quotas-updated` event with new role in payload |
| **localStorage quota persists after logout** | Old quota data shown before new quota fetched | Clear localStorage in `logout()`; refetch on login |

---

## Integration Points

| Gap | How Gap 3 is Used |
|-----|------------------|
| **Gap 1 ← Gap 3** | Error handler catches `AuthError` (from token refresh failure) and `NetworkError` (from API call) |
| **Gap 3 → Gap 4** | Offline manager must queue API calls with Bearer token; when online, uses same `apiCallWithAuth()` |
| **Gap 3 → Gap 6** | API quotas must be included in system metrics (e.g., "5/10 gpt-4 requests remaining this month") |
| **Gap 3 ↔ Gap 8** | Audit logger logs `model_used` event (with model ID + quota remaining) for cost tracking |

---

## Effort Estimate

| Task | Developer-Days | Notes |
|------|----------------|-------|
| Step 1: OAuthManager | 2 | Token lifecycle, auto-refresh, persistence |
| Step 2: API Interceptor | 1 | Bearer token injection, 401 retry logic |
| Step 3: ModelQuotaManager | 2 | Fetch quotas, quota calculation, role-based filtering |
| Step 4: Menu Visibility | 1 | Alpine.js component, role-based show/hide |
| Testing (Unit + Integration) | 2 | Jest tests, OAuth flow mock, quota validation |
| Manual Testing | 2 | Full OAuth flow, token refresh, menu visibility |
| **Total** | **10** | Aligns with Phase 4 roadmap (Week 3–4) |

---

## Next Steps

- **Deliverable**: `impl-gap3-auth-isolation.md` (this file) ✅
- **Definition of Done**:
  - [ ] OAuthManager class created and tested
  - [ ] Bearer token injected into all API calls
  - [ ] Token refresh works on 401
  - [ ] Model quotas fetched and enforced
  - [ ] Role-based menu visibility implemented
  - [ ] All unit tests pass
  - [ ] Manual OAuth flow tested end-to-end
- **Ready for Gap 4**: Session state management and offline persistence (build on top of authenticated API client)

---
