# Phase 5.2: Performance & Caching Workstream Implementation Roadmap

**Project**: SIMONE-WEBSHOP-01 (AI-powered dropshipping platform)  
**Workstream**: Performance & Caching Infrastructure  
**Duration**: 6 weeks (Phase 5, Weeks 1–6)  
**Total Effort**: 13 effort-days  
**Status**: Ready for execution (Q1 2026)  
**Owner**: Infrastructure team

---

## Executive Summary

The Performance & Caching workstream optimizes SIMONE's platform for speed, efficiency, and scalability by implementing a **multi-layer caching strategy** that reduces latency at every level: client, CDN, server, and database.

### Goals
- **Client-side**: Fast page loads via service workers and IndexedDB offline support
- **CDN layer**: Global content distribution with edge caching
- **Server-side**: Redis distributed cache for sessions, data, and computed results
- **Database**: Query optimization through indexes, prepared statements, and intelligent caching
- **API responses**: Intelligent caching of frequently accessed data

### Success Criteria
- **Page load time**: < 2 seconds (P95)
- **Time to Interactive (TTI)**: < 1.5 seconds
- **Cache hit rate**: > 80% for repeating requests
- **Database query optimization**: 50% reduction in slow queries (> 100ms)
- **CDN cache ratio**: > 70% of static assets served from edge
- **Offline functionality**: Seamless offline experience with sync on reconnect

### Stakeholders
- **Frontend Lead**: Next.js optimization, client-side caching
- **Backend Lead**: Redis integration, API response caching
- **DevOps Lead**: CDN configuration, cache invalidation strategy
- **Database Admin**: Query optimization, indexing strategy

### Team Composition
- 1 Frontend engineer (Weeks 1, 2, 6)
- 1 Backend engineer (Weeks 3, 4, 5)
- 1 DevOps engineer (Weeks 1, 3, 6)
- 1 Database specialist (Week 4)

---

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Service Worker (offline-first PWA)                       │  │
│  │ IndexedDB (local data cache, ~100MB)                     │  │
│  │ Browser Cache (HTTP cache headers)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS + HTTP/2
┌──────────────────────┴──────────────────────────────────────────┐
│                    CDN EDGE LAYER                               │
│  Cloudflare / AWS CloudFront / Akamai                           │
│  ├─ Static asset caching (images, JS, CSS, fonts)              │
│  ├─ HTML caching (short TTL: 60s-5m)                           │
│  ├─ API response caching (selected endpoints)                  │
│  └─ Geographic distribution (100+ POPs worldwide)              │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Internal network (5ms latency)
┌──────────────────────┴──────────────────────────────────────────┐
│              REVERSE PROXY / LOAD BALANCER                      │
│  Nginx / HAProxy with caching headers validation               │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼────┐  ┌──────▼─────┐  ┌────▼──────┐
│  Next.js   │  │   Redis    │  │  Backend  │
│  Frontend  │  │  Cache     │  │   (Go)    │
│  (8000/8001)  │  (6379)    │  │  API      │
│  ├─Build   │  │            │  │  (3000)   │
│  │ cache   │  │ Sessions   │  │           │
│  │ (Node)  │  │ Data       │  │ ├─ Cache  │
│  │         │  │ Computed   │  │ │ results │
│  └─────────┘  │ Results    │  │ ├─ Query  │
│               └────────────┘  │ │ planning│
│                               │ └─────────┘
│                               │
│                         ┌─────▼──────┐
│                         │ PostgreSQL │
│                         │ Database   │
│                         │ (5432)     │
│                         │            │
│                         │ ├─ Indexes │
│                         │ ├─ Stats   │
│                         │ └─ Tuning  │
│                         └────────────┘
└───────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose | Effort Days |
|-------|-----------|---------|-------------|
| **Client** | Service Workers + IndexedDB | Offline-first PWA, local caching | 2d |
| **CDN** | Cloudflare / CloudFront | Global edge caching, static assets | 2d |
| **Server Cache** | Redis (Distributed) | Session store, data cache | 2d |
| **Next.js** | Build optimization + caching | Code splitting, image optimization | 2d |
| **API** | Response caching + ETags | Smart HTTP caching | 3d |
| **Database** | Query optimization, indexes | Performance tuning | 2d |
| **Infrastructure** | Cache invalidation strategy | TTL management, purging | - |

---

## Week-by-Week Implementation Roadmap

### Week 1: Ph5.2 — Distributed Redis Cache Layer (2 effort-days)

**Objective**: Deploy Redis for distributed caching and implement core caching patterns (session storage, data caching).

#### Architecture
```
Application Layer
       │
       ├─ Session Store: Redis (10GB, 24h TTL)
       ├─ Data Cache: Redis (5GB, variable TTL)
       └─ Computed Results: Redis (2GB, 1h TTL)
       │
       └─ Fallback: Supabase PostgreSQL (when cache misses)
```

#### Detailed Implementation Steps

**Step 1: Deploy Redis Cluster (4 hours)**
- [ ] Provision Redis 7.x cluster (3 master, 3 replica nodes)
  - Memory allocation: 20GB total (10GB sessions + 5GB data + 2GB computed + 3GB buffer)
  - Enable AOF (Append-Only File) for durability
  - Configure RDB snapshots (hourly)
  - Set maxmemory-policy to `allkeys-lru` (evict LRU keys when full)
- [ ] Setup Redis Sentinel for automatic failover
  - 3 Sentinel instances (quorum: 2)
  - Monitor heartbeat interval: 1 second
- [ ] Create Redis persistence strategy
  - AOF rewrite schedule: Daily at 2 AM UTC
  - RDB snapshots: Hourly
  - Backup to S3 every 6 hours
- [ ] Configure Redis monitoring
  - Export metrics to Prometheus (redis_exporter)
  - Track: memory usage, commands/sec, hit ratio, evictions
  - Grafana dashboard with alerting

**Step 2: Implement Session Store in Go Backend (4 hours)**
- [ ] Create Redis session manager
  ```go
  type SessionManager interface {
    Set(ctx context.Context, sessionID string, data map[string]interface{}) error
    Get(ctx context.Context, sessionID string) (map[string]interface{}, error)
    Delete(ctx context.Context, sessionID string) error
    Refresh(ctx context.Context, sessionID string) error
  }
  ```
- [ ] Session key structure: `session:{sessionID}` (Redis hash)
- [ ] TTL: 24 hours (refresh on activity)
- [ ] Fields: user_id, cart_data, preferences, last_activity
- [ ] Implement graceful fallback to Supabase if Redis unavailable
- [ ] Add logging for cache hits/misses
- [ ] Create integration tests (mock Redis)

**Step 3: Implement Data Caching Layer (2 hours)**
- [ ] Create generic cache wrapper
  ```go
  type CacheManager interface {
    Get(ctx context.Context, key string, dest interface{}) error
    Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error
    Delete(ctx context.Context, keys ...string) error
    GetOrElse(ctx context.Context, key string, ttl time.Duration, fn func() (interface{}, error)) (interface{}, error)
  }
  ```
- [ ] Implement cache key naming: `cache:entity:id:variant` (e.g., `cache:product:12345:with_inventory`)
- [ ] Common cache TTLs:
  - Products: 1 hour
  - User profiles: 2 hours
  - Shopping cart: 30 minutes
  - Search results: 5 minutes
- [ ] Implement cache warming for frequently accessed data
- [ ] Add metrics: hit rate, miss rate, eviction count

#### Deliverables
- ✅ Redis cluster deployed and healthy (3 masters, 3 replicas)
- ✅ Session manager implementation (Go backend)
- ✅ Cache manager abstraction layer
- ✅ Monitoring dashboard (Prometheus + Grafana)
- ✅ 5 integration tests (Redis failover, TTL, eviction)
- ✅ Documentation: Redis configuration, cache key naming convention, fallback strategy

#### Integration Points
- **Next.js Frontend**: Will use session cookie in Week 2
- **Analytics**: Cache metrics fed to Prometheus (Ph5.1)
- **API Gateway**: Will implement response caching in Ph5.5

#### Success Criteria
- [ ] Redis cluster healthy (3 nodes, 100% uptime)
- [ ] Session store operational (test: create session → retrieve → expire)
- [ ] Data cache operational (test: cache miss → fetch → store → hit)
- [ ] Cache hit ratio > 60% for repeating requests
- [ ] Response time improvement: 30% faster (with cache vs. without)

---

### Week 2: Ph5.7 — Next.js Build Optimization (2 effort-days)

**Objective**: Optimize Next.js application for faster builds, smaller bundle sizes, and improved runtime performance through code splitting, image optimization, and caching.

#### Architecture
```
Source Code
    │
    ├─ Build Phase (Next.js build)
    │  ├─ Tree shaking (remove unused code)
    │  ├─ Code splitting (per-route chunks)
    │  ├─ Minification (terser)
    │  └─ Asset optimization (images, fonts)
    │
    ├─ Cache Phase
    │  ├─ HTTP cache headers (browser cache)
    │  ├─ Next.js ISR (incremental static regeneration)
    │  └─ Build cache (npm cache, Node modules)
    │
    └─ Deployment Phase
       ├─ Docker layer caching
       ├─ CDN distribution
       └─ Service Worker caching
```

#### Detailed Implementation Steps

**Step 1: Implement Advanced Code Splitting (4 hours)**
- [ ] Analyze current bundle size (`next analyze`)
  - Identify largest modules (typically: node_modules deps)
  - Look for duplicate dependencies
  - Find unused code paths
- [ ] Configure dynamic imports for heavy libraries
  ```typescript
  // Example: Image editor only loaded when needed
  const ImageEditor = dynamic(() => import('@/components/ImageEditor'), {
    loading: () => <LoadingSpinner />,
    ssr: false
  });
  ```
- [ ] Implement route-level code splitting
  - Each page loads only its required dependencies
  - Shared dependencies extracted to separate chunk
  - Lazy-load non-critical routes
- [ ] Remove unused dependencies from package.json
  - Run `depcheck` to find unused packages
  - Audit bundle: `webpack-bundle-analyzer`
- [ ] Target: 20% reduction in main bundle size

**Step 2: Image Optimization Pipeline (2 hours)**
- [ ] Configure Next.js Image component for all product images
  ```typescript
  import Image from 'next/image';
  
  <Image
    src={product.image}
    alt={product.name}
    width={400}
    height={300}
    quality={85}
    placeholder="blur"
    blurDataURL={product.blurHash}
    priority={false}
  />
  ```
- [ ] Implement automatic image formats (AVIF fallback to WebP, then JPEG)
- [ ] Add responsive image sizes (srcset) for mobile/tablet/desktop
- [ ] Use blurhash for placeholder blur effect
- [ ] Enable `next/image` optimization:
  - Automatic WebP/AVIF conversion
  - Responsive image serving (different sizes per device)
  - Lazy loading by default
- [ ] Cache busting: Content-hash in filenames
- [ ] Target: 50% reduction in image bandwidth

**Step 3: Build Cache Optimization (2 hours)**
- [ ] Enable Next.js experimental SWC minification (faster builds)
  ```js
  // next.config.js
  module.exports = {
    swcMinify: true,
    compress: true,
  };
  ```
- [ ] Configure HTTP caching headers
  ```typescript
  // next.config.js
  async function headers() {
    return [
      {
        source: '/_next/static/chunks/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }],
      },
      {
        source: '/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' }],
      },
    ];
  }
  ```
- [ ] Enable ISR (Incremental Static Regeneration) for product pages
  - Static generation with 1-hour revalidation
  - Falls back to on-demand generation if product not yet cached
  - User-triggered revalidation on inventory updates
- [ ] Setup Docker layer caching in CI/CD
  - Cache node_modules layer
  - Cache Next.js `.next` directory
  - Only rebuild when dependencies change

#### Deliverables
- ✅ Bundle size reduced by 20% (measured via `next analyze`)
- ✅ Code splitting implemented (separate chunks per route)
- ✅ Image optimization pipeline (automatic WebP/AVIF)
- ✅ HTTP caching headers configured (immutable assets, revalidation for content)
- ✅ ISR enabled for product pages (1-hour revalidation)
- ✅ Build time reduced by 15% (SWC minification + caching)
- ✅ Documentation: bundle analysis report, image optimization guide, ISR strategy

#### Integration Points
- **CDN**: Will serve optimized assets from edge (Ph5.3)
- **Service Worker**: Will cache these optimized bundles (Ph5.6)
- **API Gateway**: Will cache HTML responses (Ph5.5)

#### Success Criteria
- [ ] Bundle size: < 200KB (gzipped main)
- [ ] Images: < 50KB each (optimized)
- [ ] First Contentful Paint (FCP): < 1.5 seconds
- [ ] Largest Contentful Paint (LCP): < 2.5 seconds
- [ ] Build time: < 60 seconds
- [ ] Cache hit rate: > 80% for static assets

---

### Week 3: Ph5.12 — CDN Edge Caching (2 effort-days)

**Objective**: Implement global CDN edge caching for static assets, HTML, and API responses to reduce origin load and serve content from geographically distributed points of presence (POPs).

#### Architecture
```
Global Requests
    │
    ├─ Static Assets (JS, CSS, images)
    │  └─ CDN POP cache (TTL: 30 days, immutable)
    │
    ├─ HTML Pages
    │  └─ CDN POP cache (TTL: 60s, revalidate)
    │
    ├─ API Responses
    │  └─ CDN POP cache (TTL: 5m, smart invalidation)
    │
    └─ User-specific Content
       └─ Origin only (no CDN cache)
```

#### Detailed Implementation Steps

**Step 1: CDN Configuration & Purge Strategy (4 hours)**
- [ ] Select CDN provider (Cloudflare recommended)
  - Setup origin: backend.simone-webshop.com
  - Enable automatic SSL/TLS
  - Setup HTTPS everywhere
- [ ] Create cache rules for different content types
  ```
  Rule 1: Static Assets (_next/static/*)
  - Cache Control: public, max-age=31536000, immutable
  - TTL: 1 year (infinite for fingerprinted assets)
  - Serve stale: Yes (stale-while-revalidate)
  
  Rule 2: HTML Pages (/*.html)
  - Cache Control: public, max-age=60, s-maxage=3600
  - TTL: 60s at edge, 1h at browser
  - Bypass cache on: Set-Cookie, Authorization headers
  
  Rule 3: API Responses (/api/products/*)
  - Cache Control: public, max-age=300, s-maxage=300
  - TTL: 5 minutes
  - Bypass cache on: Custom headers (admin updates)
  
  Rule 4: User Pages (account, dashboard)
  - Cache Control: private, max-age=0, must-revalidate
  - Never cache (always fresh from origin)
  ```
- [ ] Implement cache purging strategy
  - On product update: purge `/api/products/{id}` and `/products/{id}`
  - On inventory change: purge product page + listing pages
  - On user action: purge user-specific pages
  - Batch purge API: max 10,000 URLs per request
- [ ] Setup cache key variations
  - Country header (serve country-specific currency)
  - Device type (mobile vs. desktop)
  - User tier (premium vs. free)

**Step 2: Geo-Distribution & Performance Optimization (3 hours)**
- [ ] Configure geo-routing
  - Route US traffic to US POPs
  - Route EU traffic to EU POPs (GDPR compliance)
  - Route APAC traffic to APAC POPs
  - Automatic fallback to nearest POP on outage
- [ ] Enable compression
  - Brotli compression (11/11 quality) for text
  - WebP/AVIF for images (CDN handles format selection)
  - Skip compression for already-compressed formats (videos, archives)
- [ ] Setup performance monitoring
  - Track cache hit ratio per region
  - Monitor origin bandwidth usage
  - Alert on cache miss spikes (> 20%)
- [ ] Implement smart prefetching
  - Preload critical JS/CSS in HTML `<head>`
  - Prefetch likely next pages (product detail from listing)
  - DNS prefetch for external APIs

**Step 3: Origin Shielding & Stale Content Serving (1 hour)**
- [ ] Enable origin shield (Cloudflare)
  - Additional cache layer before origin
  - Reduces origin load on cache misses
  - Increases hit ratio for non-cacheable content
- [ ] Implement stale-while-revalidate (SWR)
  - Serve stale content while fetching fresh in background
  - User gets instant response (from cache)
  - Background fetch updates cache for next user
  - Reduces origin requests by ~40%
- [ ] Setup error page caching
  - Cache 404 pages (2 minutes)
  - Cache 500 errors (30 seconds)
  - Prevent thundering herd on origin errors

#### Deliverables
- ✅ CDN configured with Cloudflare / CloudFront
- ✅ Cache rules implemented for all content types
- ✅ Cache purge strategy operational (automated on product updates)
- ✅ Geo-routing configured (US, EU, APAC)
- ✅ Performance monitoring dashboard (hit ratio, bandwidth, latency)
- ✅ Origin shield enabled (30% reduction in origin load)
- ✅ Documentation: cache rules, purge API, geo-routing configuration

#### Integration Points
- **Analytics**: Cache metrics sent to Prometheus (Ph5.1)
- **Product API**: Implements cache headers for product endpoints
- **Frontend**: References CDN URLs for static assets
- **API Gateway**: Coordinates cache invalidation with CDN (Ph5.5)

#### Success Criteria
- [ ] Cache hit ratio: > 70% overall
- [ ] Cache hit ratio: > 90% for static assets
- [ ] Origin bandwidth: < 50% of total CDN bandwidth
- [ ] P95 latency from edge: < 200ms
- [ ] Bandwidth cost reduction: 40% (compared to origin-only)

---

### Week 4: Ph5.17 — Database Query Optimization (3 effort-days)

**Objective**: Analyze and optimize PostgreSQL queries to reduce slow queries, improve index utilization, and decrease database load through query analysis, index optimization, and execution plan tuning.

#### Architecture
```
Application Layer
    │
    ├─ Query Submission
    │  ├─ Prepared statements (prevent SQL injection)
    │  └─ Connection pooling (pgBouncer, 100 concurrent)
    │
    ├─ Query Analysis
    │  ├─ EXPLAIN ANALYZE (query plans)
    │  ├─ Query logging (slow query log, > 100ms)
    │  └─ Auto-advisor (pg_stat_statements)
    │
    ├─ Index Optimization
    │  ├─ Existing index usage analysis
    │  ├─ New indexes for slow queries
    │  ├─ Index maintenance (REINDEX, VACUUM)
    │  └─ Partial indexes (WHERE clauses)
    │
    └─ Caching Layer (above database)
       ├─ Redis query cache
       └─ Application-level cache
```

#### Detailed Implementation Steps

**Step 1: Slow Query Analysis & Indexing (1.5 days)**
- [ ] Enable slow query logging
  ```sql
  -- PostgreSQL postgresql.conf
  log_min_duration_statement = 100  -- Log queries > 100ms
  log_statement = 'all'
  log_duration = on
  log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
  ```
- [ ] Analyze current query performance
  - Export slow query log from last 7 days
  - Identify top 50 slowest queries (by total time)
  - Categorize: N+1 queries, missing indexes, subqueries
- [ ] For each slow query, run EXPLAIN ANALYZE
  ```sql
  EXPLAIN (ANALYZE, BUFFERS, VERBOSE) 
  SELECT * FROM products 
  WHERE category_id = 5 AND status = 'active' 
  ORDER BY popularity DESC 
  LIMIT 20;
  ```
  - Look for: Sequential scans, high buffer reads, nested loops
  - Identify: Which columns should be indexed
  - Check: Index selectivity (filter rate)
- [ ] Create missing indexes
  ```sql
  -- Example indexes for common queries
  CREATE INDEX idx_products_category_status ON products(category_id, status);
  CREATE INDEX idx_products_popularity ON products(popularity DESC);
  CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);
  CREATE INDEX idx_inventory_product ON inventory(product_id);
  CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating DESC);
  
  -- Partial indexes for common filters
  CREATE INDEX idx_products_active ON products(id) WHERE status = 'active';
  CREATE INDEX idx_orders_pending ON orders(id) WHERE status IN ('pending', 'processing');
  ```
- [ ] Verify index impact
  - Re-run EXPLAIN ANALYZE on previously slow queries
  - Target: Query time < 10ms with index
  - Measure: Index size vs. performance gain trade-off

**Step 2: Query Optimization & Refactoring (1 day)**
- [ ] Identify and fix N+1 queries
  ```sql
  -- BAD: N+1 query (1 query + N queries per product)
  SELECT * FROM products WHERE category = 'electronics';
  -- Then in application loop: SELECT * FROM inventory WHERE product_id = ?
  
  -- GOOD: Single query with JOIN
  SELECT p.*, COUNT(i.id) as inventory_count 
  FROM products p
  LEFT JOIN inventory i ON i.product_id = p.id
  WHERE p.category = 'electronics'
  GROUP BY p.id;
  ```
- [ ] Optimize subqueries
  ```sql
  -- BAD: Correlated subquery (runs once per row)
  SELECT * FROM products WHERE id IN (
    SELECT DISTINCT product_id FROM reviews WHERE rating > 4
  );
  
  -- GOOD: JOIN with GROUP BY
  SELECT DISTINCT p.* FROM products p
  INNER JOIN reviews r ON r.product_id = p.id
  WHERE r.rating > 4;
  ```
- [ ] Use window functions instead of self-joins
  ```sql
  -- BAD: Self-join to get rank
  SELECT p.*, (SELECT COUNT(*) FROM products p2 
    WHERE p2.popularity > p.popularity) + 1 as rank
  FROM products p;
  
  -- GOOD: Window function (much faster)
  SELECT p.*, ROW_NUMBER() OVER (ORDER BY popularity DESC) as rank
  FROM products p;
  ```
- [ ] Implement connection pooling (pgBouncer)
  ```
  [databases]
  simone = host=db.internal port=5432 user=app password=secret dbname=simone
  
  [pgbouncer]
  pool_mode = transaction
  max_client_conn = 1000
  default_pool_size = 25
  reserve_pool_size = 5
  reserve_pool_timeout = 3
  ```

**Step 3: Query Caching & Execution Plan Tuning (0.5 days)**
- [ ] Identify cacheable query patterns
  - Read-heavy queries: product listings, categories, reviews
  - Not cacheable: user-specific data, real-time inventory
  - Cache TTL: 5m for product data, 2m for inventory
- [ ] Implement query result caching (Redis)
  ```go
  // Cache wrapper for database queries
  func GetProductsInCategory(ctx context.Context, categoryID int) ([]*Product, error) {
    cacheKey := fmt.Sprintf("products:category:%d", categoryID)
    
    // Try cache first
    if cached, err := cache.Get(ctx, cacheKey); err == nil {
      return cached, nil
    }
    
    // Cache miss: query database
    products, err := db.QueryProducts(ctx, categoryID)
    if err != nil {
      return nil, err
    }
    
    // Store in cache (5m TTL)
    cache.Set(ctx, cacheKey, products, 5*time.Minute)
    return products, nil
  }
  ```
- [ ] Tune PostgreSQL parameters
  ```sql
  -- postgresql.conf
  shared_buffers = 4GB           -- 25% of system RAM
  effective_cache_size = 12GB    -- 75% of system RAM
  work_mem = 20MB                -- Per-operation memory
  max_parallel_workers = 8       -- Parallel query execution
  random_page_cost = 1.1         -- SSD tuning (vs. 4.0 for HDD)
  jit = on                       -- JIT compilation for complex queries
  ```
- [ ] Auto-vacuum tuning
  ```sql
  -- Prevent table bloat
  ALTER TABLE products SET (autovacuum_vacuum_scale_factor = 0.01);
  ALTER TABLE orders SET (autovacuum_vacuum_scale_factor = 0.01);
  ```

#### Deliverables
- ✅ Slow query log analysis (top 50 queries documented)
- ✅ Missing indexes created (15+ new indexes)
- ✅ N+1 queries eliminated (10+ refactored)
- ✅ Connection pooling configured (pgBouncer)
- ✅ Query result caching implemented (Redis)
- ✅ PostgreSQL parameters tuned (7 configuration changes)
- ✅ Query optimization report (before/after metrics)
- ✅ Documentation: index strategy, cacheable query patterns, tuning rationale

#### Integration Points
- **Redis Cache**: Query results cached (Week 1)
- **Analytics**: Database metrics tracked in Prometheus (Ph5.1)
- **API Layer**: Uses optimized queries (Ph5.5)

#### Success Criteria
- [ ] Slow queries (> 100ms): < 5% of total queries
- [ ] Average query time: < 50ms (down from ~150ms)
- [ ] Database CPU: < 50% during peak load
- [ ] Connection pool utilization: 40-70% (healthy range)
- [ ] Query cache hit ratio: > 60% for cached queries

---

### Week 5: Ph5.22 — API Endpoint Response Caching (2 effort-days)

**Objective**: Implement intelligent caching at the API layer using HTTP cache headers (ETags, Cache-Control), conditional requests, and application-level caching to reduce database hits and origin server load.

#### Architecture
```
Client Request
    │
    ├─ If cached locally
    │  └─ Return from browser cache (no network)
    │
    ├─ If cache expired
    │  └─ Send conditional request (If-None-Match / If-Modified-Since)
    │     ├─ If unchanged: 304 Not Modified
    │     └─ If changed: 200 OK with new data
    │
    ├─ If not cached
    │  └─ GET /api/products/123
    │     ├─ Server checks cache
    │     │  └─ Cache hit: Return cached response
    │     └─ Cache miss: Query database
    │        └─ Return response with cache headers
    │           ├─ ETag (for validation)
    │           └─ Cache-Control (for TTL)
    │
    └─ Response stored in browser cache
```

#### Detailed Implementation Steps

**Step 1: Implement ETag & Cache Headers (4 hours)**
- [ ] Add ETag generation to API responses
  ```go
  // Go middleware for ETag
  func ETagMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
      // Create ETag from response body hash
      body := captureResponseBody()
      etag := fmt.Sprintf(`"%s"`, md5Hash(body))
      
      w.Header().Set("ETag", etag)
      w.Header().Set("Cache-Control", "public, max-age=300")
      
      // If client sends If-None-Match
      if r.Header.Get("If-None-Match") == etag {
        w.WriteHeader(http.StatusNotModified)
        return
      }
      
      next.ServeHTTP(w, r)
    })
  }
  ```
- [ ] Add Last-Modified header for HTTP caching
  ```go
  // Set Last-Modified for resource
  w.Header().Set("Last-Modified", time.Now().UTC().Format(time.RFC1123))
  ```
- [ ] Configure Cache-Control headers per endpoint
  ```go
  // Public endpoints: 5 minutes
  router.Get("/api/products", cacheControl("public, max-age=300"), handlers.ListProducts)
  
  // User-specific: no cache
  router.Get("/api/users/:id/orders", cacheControl("private, max-age=0"), handlers.GetUserOrders)
  
  // Static: 30 days
  router.Get("/api/categories", cacheControl("public, max-age=2592000"), handlers.GetCategories)
  ```
- [ ] Implement stale-if-error caching
  ```go
  w.Header().Set("Cache-Control", "public, max-age=300, stale-if-error=3600")
  // If origin unavailable: serve stale data for up to 1 hour
  ```

**Step 2: API Response Caching Logic (3 hours)**
- [ ] Identify cacheable endpoints
  ```
  Cacheable (GET, no auth):
  - /api/products (5m)
  - /api/products/:id (5m)
  - /api/categories (1d)
  - /api/reviews/:product_id (30m)
  
  Conditional caching (auth required, but cached):
  - /api/users/:id (2m) - invalidate on user update
  
  Not cacheable:
  - /api/cart (user-specific)
  - /api/checkout (transaction)
  - Any POST/PUT/DELETE
  ```
- [ ] Implement response caching in Go
  ```go
  type CachedResponse struct {
    Data    interface{}
    ETag    string
    Expires time.Time
  }
  
  func GetProductWithCache(id string) (*Product, error) {
    cacheKey := fmt.Sprintf("product:%s", id)
    
    // Check cache
    if cached := cache.Get(cacheKey); cached != nil {
      return cached, nil
    }
    
    // Cache miss: query database
    product, err := db.GetProduct(id)
    if err != nil {
      return nil, err
    }
    
    // Cache for 5 minutes
    cache.Set(cacheKey, product, 5*time.Minute)
    return product, nil
  }
  ```
- [ ] Implement cache invalidation on updates
  ```go
  // POST /api/products/:id (update product)
  func UpdateProduct(w http.ResponseWriter, r *http.Request) {
    id := mux.Vars(r)["id"]
    product := parseRequest(r)
    
    // Update in database
    err := db.UpdateProduct(id, product)
    if err != nil {
      http.Error(w, err.Error(), http.StatusInternalServerError)
      return
    }
    
    // Invalidate cache
    cache.Delete(fmt.Sprintf("product:%s", id))
    cache.Delete("products:listing")  // Also invalidate listings
    
    w.Header().Set("Cache-Control", "no-cache")
    json.NewEncoder(w).Encode(product)
  }
  ```
- [ ] Setup cache warming for popular products
  ```go
  // On startup: pre-load top 100 products
  func WarmCache() {
    products, _ := db.GetTopProducts(100)
    for _, p := range products {
      cache.Set(fmt.Sprintf("product:%d", p.ID), p, 24*time.Hour)
    }
  }
  ```

**Step 3: Monitoring & Optimization (1 hour)**
- [ ] Track cache effectiveness
  - Cache hit rate per endpoint
  - Average response time (cached vs. uncached)
  - Memory usage of cache
  - Eviction rate (when cache is full)
- [ ] Setup Prometheus metrics
  ```go
  var (
    cacheHits = prometheus.NewCounterVec(
      prometheus.CounterOpts{Name: "api_cache_hits_total"},
      []string{"endpoint"},
    )
    cacheMisses = prometheus.NewCounterVec(
      prometheus.CounterOpts{Name: "api_cache_misses_total"},
      []string{"endpoint"},
    )
  )
  ```
- [ ] Create Grafana dashboard
  - Cache hit ratio (goal: > 70%)
  - Response times (cached vs. uncached)
  - Cache memory usage
  - Top endpoints by cache benefit

#### Deliverables
- ✅ ETag generation for all GET endpoints
- ✅ Cache-Control headers configured (per endpoint)
- ✅ Response caching layer implemented (Redis)
- ✅ Cache invalidation on updates (automatic purging)
- ✅ Cache warming for popular products (on startup)
- ✅ Monitoring dashboard (cache hit ratio, response times)
- ✅ Documentation: cacheable endpoints, invalidation strategy, metrics

#### Integration Points
- **Redis**: Uses distributed cache from Week 1
- **CDN**: Works with CDN caching (Ph5.3)
- **Analytics**: Cache metrics sent to Prometheus (Ph5.1)

#### Success Criteria
- [ ] Cache hit ratio: > 70% for public endpoints
- [ ] Response time improvement: 40% faster (cached)
- [ ] Database query reduction: 50% fewer queries
- [ ] API endpoint P95 latency: < 50ms

---

### Week 6: Ph5.27 — Client-Side Offline-First Architecture (2 effort-days)

**Objective**: Implement service workers and IndexedDB for offline-first PWA support, enabling users to browse products, view cart, and prepare checkout even without internet connection, with automatic sync on reconnect.

#### Architecture
```
Client Browser
    │
    ├─ Service Worker (offline interceptor)
    │  ├─ Cache static assets
    │  ├─ Intercept network requests
    │  └─ Route to IndexedDB if offline
    │
    ├─ IndexedDB (local database)
    │  ├─ Products (read-only copy)
    │  ├─ User data (read-write)
    │  ├─ Cart (read-write)
    │  └─ Sync queue (pending changes)
    │
    └─ Sync Engine
       ├─ Detect offline/online state
       ├─ Queue writes while offline
       └─ Sync on reconnect
```

#### Detailed Implementation Steps

**Step 1: Service Worker Implementation (4 hours)**
- [ ] Create service worker
  ```typescript
  // public/sw.ts
  import { precacheAndRoute } from 'workbox-precaching';
  import { registerRoute } from 'workbox-routing';
  import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
  import { ExpirationPlugin } from 'workbox-expiration';
  
  // Precache Next.js static assets
  precacheAndRoute(self.__WB_MANIFEST);
  
  // Static assets: cache-first (1 year)
  registerRoute(
    ({ request }) => request.destination === 'image' || request.destination === 'font',
    new CacheFirst({
      cacheName: 'static-assets',
      plugins: [new ExpirationPlugin({ maxEntries: 1000, maxAgeSeconds: 31536000 })],
    })
  );
  
  // HTML pages: network-first (fresh content first, fallback to cache)
  registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
      cacheName: 'html-pages',
      plugins: [new ExpirationPlugin({ maxAgeSeconds: 3600 })],
    })
  );
  
  // API calls: stale-while-revalidate (serve cache, update in background)
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new StaleWhileRevalidate({
      cacheName: 'api-responses',
      plugins: [new ExpirationPlugin({ maxAgeSeconds: 300 })],
    })
  );
  ```
- [ ] Register service worker in Next.js
  ```typescript
  // pages/_app.tsx
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);
  ```
- [ ] Handle offline state
  ```typescript
  // lib/offline.ts
  export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true);
    
    useEffect(() => {
      window.addEventListener('online', () => setIsOnline(true));
      window.addEventListener('offline', () => setIsOnline(false));
      return () => {
        window.removeEventListener('online', () => setIsOnline(true));
        window.removeEventListener('offline', () => setIsOnline(false));
      };
    }, []);
    
    return isOnline;
  }
  ```

**Step 2: IndexedDB Schema & Sync (3 hours)**
- [ ] Create IndexedDB schema
  ```typescript
  // lib/db.ts
  const dbRequest = indexedDB.open('simone-webshop', 2);
  
  dbRequest.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    
    // Products store (read-only)
    const productsStore = db.createObjectStore('products', { keyPath: 'id' });
    productsStore.createIndex('categoryId', 'categoryId');
    productsStore.createIndex('popularity', 'popularity');
    
    // Cart store (read-write)
    const cartStore = db.createObjectStore('cart', { keyPath: 'productId' });
    
    // Sync queue (pending writes)
    const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
    syncStore.createIndex('status', 'status');  // pending, completed, failed
  };
  ```
- [ ] Implement data sync from API to IndexedDB
  ```typescript
  // Sync products on app load
  async function syncProducts() {
    const response = await fetch('/api/products?limit=1000');
    const products = await response.json();
    
    const db = await getDB();
    const tx = db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    
    for (const product of products) {
      await store.put(product);
    }
  }
  ```
- [ ] Implement write sync (queue changes while offline, sync on reconnect)
  ```typescript
  // Queue a write operation
  async function queueWrite(operation: SyncOperation) {
    const db = await getDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    
    await store.add({
      ...operation,
      status: 'pending',
      timestamp: Date.now(),
    });
  }
  
  // Sync pending operations when online
  async function syncPendingOperations() {
    const db = await getDB();
    const tx = db.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');
    const index = store.index('status');
    
    const pending = await index.getAll('pending');
    
    for (const op of pending) {
      try {
        const response = await fetch(op.endpoint, {
          method: op.method,
          body: JSON.stringify(op.data),
        });
        
        if (response.ok) {
          // Mark as synced
          const writeTx = db.transaction('syncQueue', 'readwrite');
          writeTx.objectStore('syncQueue').delete(op.id);
        }
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }
  
  // Trigger sync on online event
  window.addEventListener('online', syncPendingOperations);
  ```

**Step 3: UI/UX for Offline Support (1 hour)**
- [ ] Add offline indicator
  ```typescript
  // components/OfflineIndicator.tsx
  export function OfflineIndicator() {
    const isOnline = useOnlineStatus();
    
    if (isOnline) return null;
    
    return (
      <div className="fixed top-0 w-full bg-yellow-500 text-white p-2 text-center">
        You are offline. Some features may be limited.
      </div>
    );
  }
  ```
- [ ] Disable checkout while offline
  ```typescript
  // components/CheckoutButton.tsx
  export function CheckoutButton() {
    const isOnline = useOnlineStatus();
    
    return (
      <button disabled={!isOnline}>
        {isOnline ? 'Proceed to Checkout' : 'Go Online to Checkout'}
      </button>
    );
  }
  ```
- [ ] Show sync status
  ```typescript
  // components/SyncStatus.tsx
  export function SyncStatus() {
    const [pendingCount, setPendingCount] = useState(0);
    
    useEffect(() => {
      const updatePendingCount = async () => {
        const count = await getPendingSyncCount();
        setPendingCount(count);
      };
      
      window.addEventListener('online', updatePendingCount);
      updatePendingCount();
    }, []);
    
    if (pendingCount === 0) return null;
    
    return (
      <div className="text-sm text-gray-600">
        Syncing {pendingCount} pending changes...
      </div>
    );
  }
  ```

#### Deliverables
- ✅ Service worker implemented (precaching, offline fallback)
- ✅ IndexedDB schema created (products, cart, sync queue)
- ✅ Data sync from API to IndexedDB (on app load)
- ✅ Write sync implementation (queue and replay on reconnect)
- ✅ Offline indicator UI (shows when offline)
- ✅ Disabled operations when offline (checkout, etc.)
- ✅ Sync status indicator (shows pending changes)
- ✅ Documentation: offline architecture, sync flow, data structures

#### Integration Points
- **Service Worker**: Caches optimized Next.js assets (Ph5.7)
- **API Layer**: Syncs data from API endpoints (Ph5.22)
- **Analytics**: Tracks offline events (Ph5.1)

#### Success Criteria
- [ ] Service worker installation: 100% (all users)
- [ ] Offline functionality: Browse products, manage cart
- [ ] Sync success rate: > 99% (pending changes synced)
- [ ] Sync latency: < 2 seconds (after reconnect)
- [ ] IndexedDB storage: < 50MB (with 1000 products)

---

## Cross-Workstream Integration

### Workstream Dependencies Map

```
                    Analytics & Observability (Ph5.1)
                     /              |              \
                    /               |               \
         Performance &        Security &        Scaling &
         Caching (Ph5.2)      Compliance       Load Balancing
         /            |       (Ph5.3)           (Ph5.4)
        /             |         /   \              /
       /              |        /     \            /
   Redis Cache      Metrics    WAF   Logs   Message Queue
   (Week 1)        (Week 1-6) (Week 6) (Week 2) (Week 3-4)
                                                    \
                                                     \
                                                API Gateway
                                              & Service Mesh
                                                  (Ph5.5)
```

### Dependencies Provided by Performance & Caching

| Component | Consumes | Provides | Week |
|-----------|----------|----------|------|
| **Redis** | - | Distributed cache for other workstreams | Week 1 |
| **Caching Layer** | Database queries | Reduced database load (50%) | Week 4 |
| **CDN** | Static assets | Global distribution, bandwidth reduction | Week 3 |
| **Service Worker** | Next.js optimization | Offline support for all features | Week 6 |
| **Query Cache** | PostgreSQL | Faster API responses (40% improvement) | Week 4 |

### Dependencies on Other Workstreams

| Dependency | From Workstream | Used In | Week |
|------------|-----------------|---------|------|
| **Metrics** | Analytics (Ph5.1) | Cache hit ratio, response times | Week 1-6 |
| **Log Aggregation** | Analytics (Ph5.6) | Cache invalidation logs | Week 2-3 |
| **Load Balancing** | Scaling (Ph5.4) | Distribute cache load | Week 3-4 |
| **API Gateway** | API Gateway (Ph5.5) | Gateway-level response caching | Week 5 |
| **Monitoring** | Analytics (Ph5.16) | Cache health monitoring | Week 4 |

---

## Risk Mitigation

| Risk | Impact | Mitigation | Owner |
|------|--------|-----------|-------|
| **Redis failure** | Cache unavailable, origin overload | Fallback to database, Sentinel failover, 3-replica setup | DevOps |
| **Cache stampede** | Thundering herd on cache miss | Lock mechanism, stale-while-revalidate, probabilistic early expiration | Backend |
| **Cache poisoning** | Stale/incorrect data served | TTL validation, cache invalidation on updates, versioning | Backend |
| **CDN purge delays** | Updated content not visible | Manual purge API, short TTL (1m), origin header verification | DevOps |
| **Query optimization side effects** | Indexes slow down writes | Index maintenance (REINDEX), monitor write performance | DBA |
| **Service worker bugs** | Cached broken code | Versioning (sw.js?v=hash), gradual rollout, old version cleanup | Frontend |
| **IndexedDB quota exceeded** | Offline functionality breaks | Quota management (50MB limit), cleanup old data, user notification | Frontend |
| **Cache coherency** | Inconsistent data across layers | Proper invalidation, versioning, cache warming | Architecture |

---

## Success Metrics & KPIs

### Performance Metrics

| Metric | Target | Measurement | Frequency |
|--------|--------|-------------|-----------|
| **Page Load Time (P95)** | < 2 seconds | RUM (Real User Monitoring) | Real-time |
| **Time to Interactive (TTI)** | < 1.5 seconds | Lighthouse CI | Per commit |
| **Largest Contentful Paint (LCP)** | < 2.5 seconds | Core Web Vitals | Real-time |
| **Cache Hit Ratio** | > 80% | Prometheus (`cache_hits / total_requests`) | Real-time |
| **Database Queries/sec** | < 1000 | PostgreSQL metric | Real-time |
| **API Response Time (P95)** | < 50ms | Prometheus latency histogram | Real-time |

### Business Metrics

| Metric | Target | Impact | Frequency |
|--------|--------|--------|-----------|
| **Bandwidth Cost** | -40% | Reduced CDN costs, CDN bill | Monthly |
| **Origin Bandwidth Usage** | < 50% of total | Lower server costs | Monthly |
| **Database CPU** | < 50% peak | Better multi-tenancy | Monthly |
| **User Bounce Rate** | -10% | Faster pages = more engagement | Weekly |
| **Conversion Rate** | +5% | Performance → sales | Weekly |
| **Mobile Performance** | LCP < 3s | Mobile user experience | Real-time |

### Infrastructure Metrics

| Metric | Target | Tool | Alert |
|--------|--------|------|-------|
| **Redis Memory Usage** | < 80% | Prometheus | > 80% |
| **CDN Cache Hit Ratio** | > 70% | CDN provider | < 60% |
| **Cache Eviction Rate** | < 5% | Prometheus | > 10% |
| **Database Index Size** | Growth tracked | PostgreSQL stats | Unusual growth |
| **Service Worker Installation** | > 95% | Google Analytics | < 90% |

---

## Next Steps (Handoff to Phase 5.3)

### Week 7 (Phase 5.3 begins):

1. **Handoff to Security & Compliance Workstream**
   - Performance & Caching layer complete and operational
   - Redis cluster running, CDN configured, database optimized
   - Cache invalidation strategy documented
   - Metrics being collected (cache hit rate, response times)

2. **Inputs from Performance & Caching**
   - Redis cluster (deployed Week 1) → Used by other workstreams for session storage
   - Database optimization (Week 4) → Better query performance for all APIs
   - CDN infrastructure (Week 3) → Serves static assets for all workstreams
   - Service worker (Week 6) → Offline support for authenticated features

3. **Phase 5.4 Integration** (Scaling & Load Balancing)
   - Performance & Caching reduces database load → Easier to scale
   - Cache layer absorbs traffic spikes → Less backend scaling needed
   - Redis distributed cache → Shared across multiple backend instances

4. **Ongoing Monitoring**
   - Continue tracking cache hit ratio (target: > 80%)
   - Monitor database query performance (target: < 50ms P95)
   - Track bandwidth reduction (target: 40% savings)
   - Real User Monitoring for actual page load times

### Post-Phase 5 Continuation (Phase 6: Optimization & Fine-tuning)

- Advanced caching strategies (predictive prefetching, smart TTL)
- Machine learning for cache recommendations
- Further database optimization (partitioning for large tables)
- Edge computing for cache computation

---

## Reference Documents

### Internal Documentation
- **Boulder.json**: `/Users/jeremy/.sisyphus/plans/biometrics/boulder.json` (Task tracking)
- **Phase 5 Analytics Guide**: `web-ui-phase5-analytics-observability-roadmap.md` (Metrics infrastructure)
- **SIMONE Architecture**: `/dev/SIN-Solver/ARCHITECTURE-MODULAR.md` (Overall system design)

### External Resources
- **Redis**: https://redis.io/docs/ (Official documentation)
- **Next.js Optimization**: https://nextjs.org/docs/advanced-features/performance-optimization
- **Cloudflare CDN**: https://developers.cloudflare.com/cache/
- **PostgreSQL Query Optimization**: https://www.postgresql.org/docs/current/sql-explain.html
- **Service Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Workbox**: https://developers.google.com/web/tools/workbox (Service worker library)
- **IndexedDB**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

### Tools & Dashboards
- **Prometheus**: Metrics collection (port 8290)
- **Grafana**: Dashboards (port 8291)
- **pgBouncer**: Connection pooling (port 6432)
- **Lighthouse CI**: Build-time performance testing
- **Chrome DevTools**: Real-time performance profiling

---

## Appendix: Configuration Examples

### Redis Configuration
```
# Redis master configuration
port 6379
timeout 300
tcp-backlog 511
bind 0.0.0.0
protected-mode no

# Memory management
maxmemory 10gb
maxmemory-policy allkeys-lru
lazyfree-lazy-eviction yes

# Persistence
save 3600 1
rdbcompression yes
aof-use-rdb-preamble yes

# Replication
repl-diskless-sync no
repl-diskless-sync-delay 5

# Cluster
cluster-enabled no
```

### Next.js next.config.js
```javascript
module.exports = {
  swcMinify: true,
  compress: true,
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128],
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => [
    {
      source: '/_next/static/chunks/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ],
};
```

---

**END OF GUIDE 2: PERFORMANCE & CACHING WORKSTREAM**

**Status**: ✅ Complete (878 lines, 13 effort-days documented)
