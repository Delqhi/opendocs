# IMPLEMENTATION GUIDE: Gap 7 – Deployment & Versioning

**Phase 4 Deliverable 2B, Step 3**  
**Effort Estimate**: 5 developer-days  
**Sprint Assignment**: Week 6, Days 1–5  
**Acceptance Criteria**: Self-contained binary, zero CDNs, feature flags functional, rollback procedure validated

---

## 1. Overview

Gap 7 addresses the final production-readiness concern: **How do we deploy a single-file binary that serves the entire BIOMETRICS UI without external dependencies?**

Production deployments demand three critical capabilities:
1. **Embedded Assets** – All CSS, JavaScript, fonts served from Go binary (no CDNs)
2. **Feature Flags** – Dark-launch new UI features without redeploying backend
3. **Versioning & Rollback** – Semantic versioning enables instant rollback to previous stable builds

**Enterprise Impact**: 
- Eliminates CDN costs and latency variability
- Reduces deployment blast radius (single binary = atomic rollout)
- Enables safe canary deployments (5% users see v1.2.3, 95% see v1.2.2)
- Supports compliance requirements (air-gapped deployments, no external dependencies)

**Gap 7 addresses**:
- BIOMETRICS deployment pipeline
- Feature rollout strategy
- Emergency rollback procedure
- Version consistency across browser tabs

---

## 2. Prerequisite Knowledge

### Go Embed (`//go:embed`)

Go's `embed` package (1.16+) allows you to compile static assets into your binary at build time:

```go
//go:embed dist/*
var DistFS embed.FS

// Later: fs.FS(DistFS) serves all files in dist/ directory
```

**Key Concept**: Files matching `dist/*` are baked into the binary. No external file reads required.

### Feature Flags (Dark Launch Pattern)

Feature flags decouple deployment from feature rollout:

```
User Request → Feature Flag Evaluation → Show Feature or Fallback UI
```

Example: "New prompt builder UI" flag is deployed to 100% of users, but only 20% see it initially.

**Benefit**: Catch bugs in production on subset of users before full rollout.

### Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH`
- `1.2.3` → Major=1, Minor=2, Patch=3
- Breaking change → increment MAJOR
- New feature (backward-compatible) → increment MINOR
- Bug fix → increment PATCH

Example rollback: `v1.2.3` (buggy) → `v1.2.2` (stable)

---

## 3. Step-by-Step Implementation

### Step 1: Go Embed Integration (2 days)

**Goal**: Embed `dist/` directory into binary. Serve all CSS, JS, HTML without CDN.

#### 1a. Create Embed Handler

File: `server/dist.go`

```go
package server

import (
	"embed"
	"io/fs"
	"mime"
	"net/http"
	"strings"
)

//go:embed dist/*
var DistFS embed.FS

// DistHandler serves embedded assets (CSS, JS, HTML, fonts)
// Cache-Control: max-age=31536000 for versioned assets (hash in filename)
// Cache-Control: no-cache for index.html (always fetch latest)
func DistHandler(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/")
	if path == "" || path == "/" {
		path = "index.html"
	}

	// Try to serve the requested file
	file, err := DistFS.Open("dist/" + path)
	if err != nil {
		// File not found; fallback to index.html (SPA routing)
		file, err = DistFS.Open("dist/index.html")
		if err != nil {
			http.NotFound(w, r)
			return
		}
		path = "index.html"
	}
	defer file.Close()

	// Detect MIME type by extension
	contentType := mime.TypeByExtension("." + getExtension(path))
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	w.Header().Set("Content-Type", contentType)

	// Versioned assets (contain hash in filename) can be cached forever
	// Example: app.abc123def.js
	if isVersionedAsset(path) {
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	} else {
		// index.html, service worker, manifest: must validate on each request
		w.Header().Set("Cache-Control", "public, max-age=3600, must-revalidate")
	}

	// Serve the file
	stat, _ := file.Stat()
	http.ServeContent(w, r, path, stat.ModTime(), file)
}

// isVersionedAsset checks if filename contains hash (e.g., app.abc123.js)
func isVersionedAsset(path string) bool {
	// Example patterns: app.abc123def456.js, chunk.xyz789.css
	parts := strings.Split(path, ".")
	if len(parts) < 3 {
		return false
	}
	hash := parts[len(parts)-2]
	return len(hash) >= 8 && len(hash) <= 32 // Hash typically 8-32 chars
}

// getExtension extracts file extension (e.g., "js" from "app.abc123.js")
func getExtension(path string) string {
	parts := strings.Split(path, ".")
	if len(parts) > 0 {
		return parts[len(parts)-1]
	}
	return ""
}
```

#### 1b. Register Route in Main Server

File: `main.go`

```go
package main

import (
	"net/http"
	"yourapp/server"
)

func main() {
	// ... other routes ...

	// Serve embedded dist/ directory
	http.HandleFunc("/", server.DistHandler)
	
	// API routes (if any)
	http.HandleFunc("/api/", handleAPI)

	// Start server on port 8080
	http.ListenAndServe(":8080", nil)
}
```

#### 1c. Build with Embedded Assets

Ensure `dist/` directory exists before build:

```bash
# Build frontend (generate dist/ folder)
npm run build  # Output: dist/index.html, dist/app.abc123.js, dist/style.xyz.css

# Build Go binary with embedded assets
go build -o biometrics-ui main.go

# Test: binary should be ~5-10MB (includes all CSS, JS, fonts)
ls -lh biometrics-ui
```

#### 1d. Test Embedded Assets

```bash
# Start server
./biometrics-ui

# In another terminal, test asset serving
curl -I http://localhost:8080/                    # 200 OK, Cache-Control: no-cache
curl -I http://localhost:8080/app.abc123.js      # 200 OK, Cache-Control: max-age=31536000
curl -I http://localhost:8080/style.xyz.css      # 200 OK, Cache-Control: max-age=31536000
curl -I http://localhost:8080/nonexistent.js     # 200 OK, served index.html (SPA fallback)

# Verify no 404s unless file genuinely missing
```

**2-Day Breakdown**:
- Day 1: Implement DistHandler, register route, build system integration
- Day 2: Test asset serving, cache header validation, SPA fallback verification

---

### Step 2: Feature Flag System (2 days)

**Goal**: Allow toggling UI features via localStorage or query parameter without redeploying binary.

#### 2a. Backend Feature Flags Endpoint

File: `server/features.go`

```go
package server

import (
	"encoding/json"
	"net/http"
)

// FeatureFlags defines all available features in this release
type FeatureFlags struct {
	NewPromptBuilder   bool `json:"new_prompt_builder"`   // v1.3.0: redesigned prompt UI
	DarkMode           bool `json:"dark_mode"`            // v1.2.0: experimental dark theme
	ModelCostEstimate  bool `json:"model_cost_estimate"`  // v1.4.0: show estimated cost before API call
	AdvancedLogging    bool `json:"advanced_logging"`     // v1.2.1: verbose error logs
	BetaAIModels       bool `json:"beta_ai_models"`       // Upcoming Gemini 4 support
}

// GetFeatures returns feature flags (backend source of truth)
// Frontend can override via localStorage or query param
func GetFeatures(w http.ResponseWriter, r *http.Request) {
	flags := FeatureFlags{
		NewPromptBuilder:  false, // Off by default (dark launch)
		DarkMode:          false,
		ModelCostEstimate: true,  // On by default
		AdvancedLogging:   false,
		BetaAIModels:      false,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(flags)
}

// UpdateFeature allows admin to enable/disable a feature for testing
// POST /api/admin/features/{name}?enabled=true
func UpdateFeature(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// TODO: Verify user is admin
	// TODO: Persist flag change (optional; typically ephemeral for testing)

	featureName := r.PathValue("name") // Go 1.22+
	enabled := r.URL.Query().Get("enabled") == "true"

	// In production, this might write to cache (Redis) or database
	// For testing, just log and return
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"feature": featureName,
		"enabled": enabled,
	})
}
```

#### 2b. Frontend Feature Flag Manager

File: `src/FeatureFlagManager.js`

```javascript
// FeatureFlagManager: Evaluate feature flags from localStorage + query params + backend
export class FeatureFlagManager {
  constructor() {
    this.backendFlags = null;
    this.overrides = new Map(); // localStorage overrides
    this.queryParamOverrides = new Map(); // ?feature=name=true overrides
  }

  // Fetch feature flags from backend on app init
  async init() {
    try {
      const response = await fetch("/api/features");
      this.backendFlags = await response.json();
    } catch (error) {
      console.error("Failed to fetch feature flags:", error);
      this.backendFlags = {}; // Default to no features
    }

    // Parse localStorage overrides
    const stored = localStorage.getItem("feature_flags");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.overrides = new Map(Object.entries(parsed));
      } catch (e) {
        console.warn("Invalid feature_flags in localStorage:", e);
      }
    }

    // Parse query param overrides (?feature=name1=true&feature=name2=false)
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of params.entries()) {
      if (key === "feature") {
        const [name, enabled] = value.split("=");
        this.queryParamOverrides.set(name, enabled === "true");
      }
    }
  }

  // Check if feature is enabled (query param > localStorage > backend)
  isEnabled(featureName) {
    // Priority 1: Query param override (highest priority)
    if (this.queryParamOverrides.has(featureName)) {
      return this.queryParamOverrides.get(featureName);
    }

    // Priority 2: localStorage override
    if (this.overrides.has(featureName)) {
      return this.overrides.get(featureName);
    }

    // Priority 3: Backend default
    return this.backendFlags?.[featureName] ?? false;
  }

  // Temporarily enable/disable feature (localStorage persistence)
  setOverride(featureName, enabled) {
    if (enabled) {
      this.overrides.set(featureName, true);
    } else {
      this.overrides.delete(featureName);
    }

    // Persist to localStorage
    const obj = Object.fromEntries(this.overrides);
    localStorage.setItem("feature_flags", JSON.stringify(obj));

    // Notify listeners (if using pub/sub pattern)
    window.dispatchEvent(
      new CustomEvent("feature-flags-changed", {
        detail: { feature: featureName, enabled },
      })
    );
  }

  // Get all flags (for admin dashboard)
  getAll() {
    return {
      backend: this.backendFlags,
      overrides: Object.fromEntries(this.overrides),
      queryParams: Object.fromEntries(this.queryParamOverrides),
    };
  }
}
```

#### 2c. Alpine.js Feature-Gated Components

File: `src/components/PromptBuilder.js`

```javascript
// Example: Use FeatureFlagManager to conditionally show new UI
export function initPromptBuilderComponent(app, featureFlags) {
  app.data("promptBuilder", () => ({
    useNewUI: featureFlags.isEnabled("new_prompt_builder"),

    init() {
      // Listen for feature flag changes
      window.addEventListener("feature-flags-changed", (e) => {
        if (e.detail.feature === "new_prompt_builder") {
          this.useNewUI = e.detail.enabled;
        }
      });
    },

    renderPrompt() {
      if (this.useNewUI) {
        return this.renderNewPromptBuilder();
      } else {
        return this.renderLegacyPromptBuilder();
      }
    },

    renderNewPromptBuilder() {
      return `
        <div class="prompt-builder-v2">
          <h2>New Prompt Builder (v1.3.0)</h2>
          <!-- New UI markup -->
        </div>
      `;
    },

    renderLegacyPromptBuilder() {
      return `
        <div class="prompt-builder-v1">
          <h2>Legacy Prompt Builder</h2>
          <!-- Legacy UI markup -->
        </div>
      `;
    },
  }));
}
```

#### 2d. App Initialization with Feature Flags

File: `src/main.js`

```javascript
import { FeatureFlagManager } from "./FeatureFlagManager.js";
import { initPromptBuilderComponent } from "./components/PromptBuilder.js";

const featureFlags = new FeatureFlagManager();

// Initialize on app start
document.addEventListener("DOMContentLoaded", async () => {
  await featureFlags.init();

  // Initialize Alpine.js with feature flag support
  const app = Alpine.store("app", {
    featureFlags: featureFlags.getAll(),
  });

  // Initialize feature-gated components
  initPromptBuilderComponent(app, featureFlags);

  // Start Alpine
  Alpine.start();
});
```

**2-Day Breakdown**:
- Day 1: Implement backend endpoint, FeatureFlagManager class, localStorage persistence
- Day 2: Integrate with Alpine.js components, test query param overrides, admin dashboard

---

### Step 3: Versioning & Rollback Procedure (1 day)

**Goal**: Enable instant rollback to previous stable version via version selection.

#### 3a. Version Information in Binary

File: `version/version.go`

```go
package version

// Version constants set at build time
const (
	Major   = 1
	Minor   = 2
	Patch   = 3
	BuildID = "abc123def456" // Git commit hash
	BuildTime = "2024-02-20T10:30:00Z"
)

func String() string {
	return fmt.Sprintf("v%d.%d.%d (%s)", Major, Minor, Patch, BuildID)
}
```

#### 3b. Version Endpoint

File: `server/version.go`

```go
package server

import (
	"encoding/json"
	"net/http"
	"yourapp/version"
)

// GetVersion returns current binary version
// Response: {"version":"v1.2.3","buildId":"abc123def456","buildTime":"2024-02-20T10:30:00Z"}
func GetVersion(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"version":   version.String(),
		"buildId":   version.BuildID,
		"buildTime": version.BuildTime,
	})
}
```

#### 3c. Version Badge in UI Footer

File: `src/components/Footer.js`

```javascript
export function initFooter(app) {
  app.data("footer", () => ({
    version: null,
    buildId: null,
    buildTime: null,

    async init() {
      const response = await fetch("/api/version");
      const data = await response.json();
      this.version = data.version;
      this.buildId = data.buildId;
      this.buildTime = data.buildTime;
    },
  }));
}
```

HTML:
```html
<footer class="flex justify-between items-center bg-gray-900 text-white p-2 text-xs">
  <span>BIOMETRICS v1.2.3</span>
  <span x-data="footer()" x-init="init()" class="font-mono">
    {{ version }} • Build: {{ buildId.substring(0, 8) }}
  </span>
</footer>
```

#### 3d. Rollback Procedure (Manual)

In production, versioning enables two rollback strategies:

**Strategy 1: Rebuild from Git Tag**
```bash
# Production version is buggy: v1.2.3
git checkout v1.2.2  # Last stable release
npm run build        # Rebuild frontend (dist/)
go build -o biometrics-ui main.go  # Rebuild binary
# Deploy biometrics-ui to production
```

**Strategy 2: Keep Multiple Binaries**
```bash
# Directory structure
/bin/
  biometrics-ui-1.2.2  # Previous stable
  biometrics-ui-1.2.3  # Current (buggy)

# Rollback: Switch symlink
ln -sf /bin/biometrics-ui-1.2.2 /bin/biometrics-ui
systemctl restart biometrics
```

**Strategy 3: Blue-Green Deployment (Kubernetes)**
```yaml
# Deployment: biometrics-ui v1.2.3 (green, 0% traffic)
# Deployment: biometrics-ui v1.2.2 (blue, 100% traffic)
# If v1.2.3 has errors, revert traffic to v1.2.2:
kubectl patch service biometrics-ui -p '{"spec":{"selector":{"version":"v1.2.2"}}}'
```

**1-Day Breakdown**:
- Implement version constants, endpoint, UI badge
- Document rollback procedure in runbook

---

## 4. Testing Strategy

| Test Type | Coverage | Method |
|-----------|----------|--------|
| **Binary Size** | Ensures no external files missing | `ls -lh biometrics-ui` (should be 5-10MB) |
| **Asset Serving** | CSS, JS, fonts load correctly | `curl http://localhost:8080/{asset}` returns 200 |
| **Cache Headers** | Versioned assets cached 1 year | `curl -I app.abc123.js` includes `Cache-Control: max-age=31536000` |
| **SPA Fallback** | 404 URLs redirect to index.html | `curl http://localhost:8080/nonexistent-route` serves index.html |
| **Feature Flags** | Toggle features via localStorage + query param | `localStorage.setItem("feature_flags", '{"new_prompt_builder":true}')` then reload |
| **Version Badge** | Version displays in UI footer | Open browser DevTools → check footer shows v1.2.3 |
| **Rollback Procedure** | Can instantly switch binaries | Keep v1.2.2 and v1.2.3 binaries; symlink switching works |
| **No CDN Dependency** | All assets embedded in binary | `curl http://localhost:8080/` works offline (disconnect internet, verify no CDN errors) |

---

## 5. Common Pitfalls

| Pitfall | Cause | Fix |
|---------|-------|-----|
| **Binary too large (50+ MB)** | Unminified JS/CSS not removed from dist/ | Run `npm run build` (minification), check dist/ has no source maps |
| **Cache invalidation fails** | Static filenames don't include hash | Webpack/Vite build config: output filename = `[name].[hash].js` |
| **Feature flag not toggling** | localStorage key misspelled or never saved | Use `console.log(localStorage.getItem("feature_flags"))` to debug; verify setOverride() persists |
| **Rollback takes too long** | Only one binary in production; recompilation needed | Keep last 3 stable binaries (v1.2.2, v1.2.1, v1.2.0); symlink points to current |
| **Version mismatch across tabs** | Each tab loads different index.html (cache miss) | Set `Cache-Control: no-cache` for index.html; browser always validates |
| **SPA routing broken** | 404 handler doesn't fallback to index.html | Verify DistHandler catches `ErrNotExist` and serves index.html instead |
| **Feature flag overrides leak** | Query param persists across navigation | localStorage override should expire session (don't use window.name or persistence) |
| **Build step forgets to embed assets** | `go build` runs before `npm run build` | Add Makefile: `dist-build: npm run build` then `go build` depends on it |

---

## 6. Integration Points

| Gap | Integration | Notes |
|-----|-------------|-------|
| **Gap 1 (Error Handling)** | DistHandler 404 → error UI component | If asset load fails, ErrorHandler should catch + display graceful message |
| **Gap 3 (Auth)** | Feature flags check user role | Example: `ModelCostEstimate` flag only visible to premium users (check user.role in flag evaluation) |
| **Gap 4 (Persistence)** | Cache headers + browser cache | SessionPersistence reads from disk; versioned assets (1-year cache) don't invalidate prematurely |
| **Gap 6 (Monitoring)** | Track feature flag adoption | Report to backend: which % of users see new_prompt_builder = true (for rollout metrics) |
| **Gap 8 (Audit)** | Log feature flag changes | When admin enables beta_ai_models, log to audit trail: `FEATURE_ENABLED: beta_ai_models by admin@example.com` |

---

## 7. Effort Estimate

| Task | Days | Notes |
|------|------|-------|
| **1a. Go Embed Handler** | 0.5 | Implement DistHandler, MIME detection, cache headers |
| **1b–1d. Build & Test** | 1.5 | Integration, asset verification, SPA fallback testing |
| **2a. Backend Endpoint** | 0.5 | GetFeatures, UpdateFeature handlers |
| **2b–2d. Frontend Integration** | 1.5 | FeatureFlagManager, Alpine.js binding, localStorage, query param parsing |
| **3a–3d. Versioning & Rollback** | 1 | Version constants, endpoint, UI badge, rollback runbook |
| **Testing + Manual QA** | 0.5 | Cache validation, feature toggle, rollback simulation |
| **Total** | **5 days** | Week 6, Days 1–5 |

---

## 8. Next Steps

**Definition of Done**:
- ✅ Binary builds successfully (`go build -o biometrics-ui main.go`)
- ✅ All assets served from binary (no CDN, no external files)
- ✅ Cache headers correct (versioned assets: 1 year; index.html: no-cache)
- ✅ SPA fallback working (404 → index.html)
- ✅ Feature flags toggle via localStorage + query param
- ✅ Version badge displays in footer
- ✅ Rollback procedure documented + tested

**Transition to Gap 5 (Mobile Responsiveness)**:
With Gap 7 deployment finalized, the UI binary is production-ready. Next sprint focuses on mobile responsiveness: ensure all components render correctly on phones/tablets. Use Tailwind CSS breakpoints (`sm:`, `md:`, `lg:`) and test on real devices.

**Transition to Gap 8 (Monitoring)**:
Once deployment is stable, implement error tracking + audit logging (Gap 8) to capture issues in production and track user actions for compliance.

---

**Document Status**: PRODUCTION-READY  
**Last Updated**: 2024-02-20  
**Version**: v1.0 (Final)
