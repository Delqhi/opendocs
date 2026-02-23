# Phase 5.1: Analytics & Observability Workstream Implementation Roadmap

**Workstream**: Analytics & Observability  
**Total Effort**: 13 effort-days  
**Duration**: 6 weeks (Week 1–6 of Phase 5)  
**Tasks**: Ph5.1, Ph5.6, Ph5.11, Ph5.16, Ph5.21, Ph5.26  
**Status**: READY FOR EXECUTION  
**Last Updated**: 2026-02-23

---

## Executive Summary

The Analytics & Observability workstream establishes comprehensive monitoring, logging, tracing, and alerting infrastructure for the SIMONE-WEBSHOP-01 platform. This workstream provides real-time visibility into system health, performance, and business metrics, enabling proactive incident response and data-driven optimization.

### Workstream Goals
- **Real-time visibility**: Metrics dashboard showing system health, response times, error rates
- **Complete audit trail**: Centralized logging capturing all significant events
- **Distributed tracing**: Request journey tracking across microservices
- **Proactive alerting**: Automated alerts based on configurable thresholds
- **Event tracking**: Custom business event capture for analytics
- **Business intelligence**: Aggregated reporting and forecasting capabilities

### Stakeholders
- **DevOps Team**: Responsible for infrastructure, deployment, monitoring
- **Backend Team**: Integration points (logging, tracing, event emission)
- **Frontend Team**: Client-side event tracking, performance monitoring
- **Product Team**: Business metrics, KPI tracking, forecasting

### Success Criteria
- ✅ Metrics dashboard deployed and operational (Week 1)
- ✅ Centralized logging capturing all application events (Week 2)
- ✅ Distributed tracing showing request flows across services (Week 3)
- ✅ Alerting system configured with critical thresholds (Week 4)
- ✅ Custom event tracking implemented across platform (Week 5)
- ✅ Analytics reporting and forecasting operational (Week 6)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                   ANALYTICS & OBSERVABILITY STACK                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  DATA COLLECTION LAYER                                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │  Application Metrics     Application Logs      Events        │  │
│  │  (Prometheus SDK)        (Structured JSON)     (Custom)      │  │
│  │         │                       │                │           │  │
│  │         ▼                       ▼                ▼           │  │
│  │  Prometheus Scrape    Fluentd/Logstash    Message Queue     │  │
│  │  (Pull-based)         (Push-based)        (RabbitMQ/Redis)  │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│  AGGREGATION & STORAGE LAYER │                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                       ▼                                      │  │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ Prometheus DB   │  │ Elasticsearch│  │ Jaeger       │   │  │
│  │  │ (Time-series)   │  │ (Logs)       │  │ (Traces)     │   │  │
│  │  └─────────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│  VISUALIZATION & ALERTING LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                       ▼                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │ Grafana      │  │ Alert Mgr    │  │ Custom       │      │  │
│  │  │ (Dashboard)  │  │ (Rules)      │  │ Reports      │      │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Purpose | Effort |
|-----------|-----------|---------|--------|
| **Metrics Collection** | Prometheus SDK | Instrument Go/Node.js services | Week 1 |
| **Metrics Storage** | Prometheus | Time-series database for metrics | Week 1 |
| **Metrics Dashboard** | Grafana | Visualization and dashboarding | Week 1 |
| **Log Collection** | Fluentd/Logstash | Centralized log aggregation | Week 2 |
| **Log Storage** | Elasticsearch | Full-text search and storage | Week 2 |
| **Distributed Tracing** | Jaeger/OpenTelemetry | Request flow tracking | Week 3 |
| **Alerting** | Prometheus AlertManager | Rule-based alerting | Week 4 |
| **Event Queue** | RabbitMQ/Redis | Asynchronous event processing | Week 5 |
| **Business Analytics** | Custom reporting layer | SQL-based reporting + forecasting | Week 6 |

---

## Week-by-Week Implementation Roadmap

### Week 1: Metrics Dashboard Implementation (2 effort-days)
**Task**: Ph5.1  
**Status**: pending  

#### Objectives
- Deploy Prometheus monitoring stack
- Instrument backend Go services with Prometheus metrics
- Instrument frontend Next.js with Web Vitals tracking
- Create Grafana dashboard with key metrics

#### Detailed Steps

**Step 1: Prometheus Deployment** (6 hours)
- Deploy Prometheus server in Docker container (room-23-prometheus)
  - Image: `prom/prometheus:latest`
  - Port: 8290 (per PORT SOVEREIGNTY mandate)
  - Volume: `/data/prometheus` (persistence)
  - Config: `/etc/prometheus/prometheus.yml` (scrape configs)
- Create Prometheus scrape configuration
  - Scrape interval: 15 seconds (default)
  - Job 1: Go backend services (`:9090/metrics`)
  - Job 2: Node.js services (`:9091/metrics`)
  - Job 3: Nginx reverse proxy metrics (`:9100/metrics`)
- Health check: Verify Prometheus accessible at `http://localhost:8290`

**Step 2: Backend Instrumentation** (6 hours)
- Add Prometheus Go SDK to backend services
  - Package: `github.com/prometheus/client_golang`
  - Import in main.go: `prometheus`, `promhttp`
- Instrument key metrics (HTTP requests)
  - `http_requests_total` (counter): Total requests by method/endpoint
  - `http_request_duration_seconds` (histogram): Request duration distribution
  - `http_request_size_bytes` (histogram): Request payload size
  - `http_response_size_bytes` (histogram): Response payload size
  - `database_query_duration_seconds` (histogram): Query latency
  - `cache_hits_total` (counter): Cache hit rate
- Expose metrics endpoint at `/metrics`
  - Enable only for internal access (127.0.0.1)
  - Protect with basic auth if exposed externally
- Test instrumentation: Verify metrics at `http://localhost:9090/metrics`

**Step 3: Frontend Instrumentation** (4 hours)
- Add Web Vitals tracking to Next.js
  - Package: `web-vitals`
  - Metrics to track:
    - Core Web Vitals: LCP (Largest Contentful Paint), FID (First Input Delay), CLS (Cumulative Layout Shift)
    - Additional: FCP (First Contentful Paint), TTFB (Time to First Byte)
- Send metrics to Prometheus Pushgateway
  - Endpoint: `http://localhost:9091/metrics/job/nextjs-client`
  - Interval: Every 5 seconds (batch aggregation)
- Alternative: Send to custom backend endpoint for aggregation
  - Endpoint: `POST /api/metrics/web-vitals`
  - Payload: `{metric_name, value, timestamp}`

**Step 4: Grafana Dashboard** (4 hours)
- Deploy Grafana in Docker container (room-24-grafana)
  - Image: `grafana/grafana:latest`
  - Port: 8291 (per PORT SOVEREIGNTY)
  - Default credentials: admin/admin (change immediately!)
  - Data source: Prometheus (http://prometheus:8290)
- Create dashboard: "SIMONE Webshop - System Health"
  - Row 1: Overview
    - Requests/sec (rate)
    - Error rate (%)
    - P95/P99 latency (ms)
    - Uptime (%)
  - Row 2: Backend Services
    - HTTP requests by endpoint
    - Error rates by status code
    - Database query latency
    - Cache hit rate
  - Row 3: Frontend Performance
    - Core Web Vitals (LCP, FID, CLS)
    - Page load time distribution
    - JavaScript error rate
  - Row 4: Infrastructure
    - CPU usage (%)
    - Memory usage (%)
    - Disk I/O
    - Network throughput
- Save dashboard as JSON for version control
- Create dashboard alerts (will be configured in Week 4)

#### Deliverables
- ✅ Prometheus container running on 8290
- ✅ Grafana dashboard accessible on 8291
- ✅ Backend services instrumented with metrics
- ✅ Frontend Web Vitals tracking operational
- ✅ Dashboard showing real-time metrics

#### Integration Points
- **Docker infrastructure**: Uses existing room-23-prometheus, room-24-grafana
- **Backend services**: HTTP handlers instrumented (no breaking changes)
- **Frontend**: Web Vitals SDK integrated (non-breaking, polyfill for older browsers)
- **Networking**: Prometheus accesses backends via internal Docker network
- **Storage**: Metrics persist to volume (survives container restarts)

#### Success Criteria
- ✅ Prometheus scrapes metrics every 15 seconds
- ✅ Grafana dashboard displays real-time metrics
- ✅ No data loss on container restart
- ✅ Dashboard loads in < 2 seconds
- ✅ Metric cardinality < 10k (performance requirement)

---

### Week 2: Centralized Logging (2 effort-days)
**Task**: Ph5.6  
**Status**: pending  

#### Objectives
- Deploy Elasticsearch for log storage
- Configure Fluentd/Logstash for log collection
- Implement structured JSON logging across all services
- Create Kibana dashboards for log analysis

#### Detailed Steps

**Step 1: Elasticsearch Deployment** (4 hours)
- Deploy Elasticsearch cluster (single node for Phase 5, scale in Phase 6)
  - Docker image: `docker.elastic.co/elasticsearch/elasticsearch:8.x`
  - Port: 8292 (per PORT SOVEREIGNTY)
  - Configuration:
    - Single-node cluster: `discovery.type=single-node`
    - Heap size: 2GB (adjust based on log volume)
    - Storage: `/data/elasticsearch` (persistent volume)
    - Security: Enable xpack.security (username/password)
- Initialize cluster: Create indices with appropriate mappings
  - Index pattern: `logs-{service}-{date}` (e.g., `logs-backend-2026-02-23`)
  - Retention: 30 days (configurable per service)
  - Shards: 1 (single node), Replicas: 0 (no replication yet)

**Step 2: Fluentd Configuration** (4 hours)
- Deploy Fluentd container (room-25-fluentd)
  - Docker image: `fluent/fluentd:latest`
  - Port: 24224 (standard Fluentd port)
  - Configuration file: `/fluentd/etc/fluent.conf`
- Configure input plugins
  - Input 1: Docker logs (collect from all containers)
    - Plugin: `fluent-plugin-docker` or native docker logging driver
    - Extract container name, service, timestamp
  - Input 2: Syslog (from OS-level events)
    - Plugin: `in_syslog` (listen on 514/UDP)
  - Input 3: Forward API (application logs)
    - Plugin: `in_forward` (listen on 24224/TCP)
- Configure output plugin
  - Output: Elasticsearch bulk indexing
    - Plugin: `fluent-plugin-elasticsearch`
    - Bulk size: 1000 events
    - Flush interval: 5 seconds
    - Retry: exponential backoff (max 10 retries)
- Configure filter plugins
  - Parser: Extract JSON fields from log messages
  - Mutate: Add service name, hostname, environment tags
  - Throttle: Rate limit excessive logs (prevent disk saturation)

**Step 3: Application Logging Integration** (2 hours)
- Backend Go services: Structured JSON logging
  - Package: `github.com/sirupsen/logrus` (popular structured logger)
  - Output format: JSON (one line per log entry)
  - Fields to include: timestamp, level, service, request_id, message, error
  - Example:
    ```json
    {"timestamp":"2026-02-23T10:30:45Z","level":"error","service":"backend","request_id":"uuid-1234","message":"Database connection failed","error":"connection timeout"}
    ```
  - Send to stdout (Docker will capture and forward to Fluentd)
- Frontend Next.js: Client-side error tracking
  - Package: Custom error boundary + error tracking service
  - Send errors to backend endpoint: `POST /api/logs/client-error`
  - Include: error message, stack trace, browser, URL, timestamp

**Step 4: Kibana Dashboard** (2 hours)
- Deploy Kibana container (room-26-kibana)
  - Docker image: `docker.elastic.co/kibana/kibana:8.x`
  - Port: 8293 (per PORT SOVEREIGNTY)
  - Configuration: Point to Elasticsearch at `elasticsearch:8292`
- Create index pattern: `logs-*` (wildcard pattern for all logs)
- Create Kibana dashboards
  - Dashboard 1: "All Logs"
    - Log volume over time
    - Error rate (logs with level=error)
    - Top services by log volume
    - Top error messages
  - Dashboard 2: "Backend Logs"
    - Requests by endpoint
    - Errors by endpoint
    - Database query errors
    - Cache errors
  - Dashboard 3: "Frontend Logs"
    - JavaScript errors by type
    - Most common errors
    - User sessions with errors
    - Performance metrics from client logs

#### Deliverables
- ✅ Elasticsearch cluster running on 8292
- ✅ Fluentd collecting logs from all services
- ✅ Kibana dashboards accessible on 8293
- ✅ Structured JSON logging across all services
- ✅ 30-day log retention operational

#### Success Criteria
- ✅ All application logs arrive in Elasticsearch within 5 seconds
- ✅ Log search queries return results in < 1 second
- ✅ Kibana dashboards display real-time log data
- ✅ No log loss (Fluentd buffering + Elasticsearch replication)
- ✅ Log volume < 1GB/day (performance requirement)

---

### Week 3: Distributed Tracing (3 effort-days)
**Task**: Ph5.11  
**Status**: pending  

#### Objectives
- Deploy Jaeger distributed tracing infrastructure
- Integrate OpenTelemetry SDK across services
- Trace request flows across microservices
- Analyze performance bottlenecks via trace data

#### Detailed Steps

**Step 1: Jaeger Deployment** (6 hours)
- Deploy Jaeger all-in-one container (room-27-jaeger)
  - Docker image: `jaegertracing/all-in-one:latest`
  - Ports:
    - 8294: Jaeger UI (per PORT SOVEREIGNTY)
    - 16686: Jaeger API
    - 6831: Agent (UDP, thrift compact)
    - 6832: Agent (UDP, thrift binary)
  - Configuration:
    - Storage: In-memory for Phase 5 (persistent in Phase 6 with Elasticsearch)
    - Sampling strategy: Probabilistic (10% sampling to reduce volume)
    - Agent address: `jaeger:6831`
- Configure Jaeger UI
  - Service list: Auto-discovered from traces
  - Retention: 72 hours (in-memory limit)
  - Search: By service, operation, tags

**Step 2: OpenTelemetry Integration** (2 days, 16 hours)
- Backend Go services: OpenTelemetry SDK
  - Package: `go.opentelemetry.io/otel`
  - Import: otel, otrace (tracer), otlpgrpc exporter
  - Initialization in main.go
  ```go
  // Initialize Jaeger exporter
  conn, _ := grpc.Dial("jaeger:6831")
  exporter, _ := otlpgrpc.New(context.Background(), otlpgrpc.WithConn(conn))
  tp := sdktrace.NewTracerProvider(
    sdktrace.WithBatcher(exporter),
    sdktrace.WithSampler(sdktrace.TraceIDRatioBased(0.1)),
  )
  otel.SetTracerProvider(tp)
  
  // Get global tracer
  tracer := otel.Tracer("backend-service")
  ```
  - Instrument HTTP handlers
    - Create span for each request: `span := tracer.Start(ctx, "POST /api/checkout")`
    - Set attributes: method, path, status, user_id
  - Instrument database operations
    - Create child span for each query: `span := tracer.Start(ctx, "SELECT products")`
    - Set attributes: query, duration, rows_affected
  - Instrument external API calls
    - Create child span: `span := tracer.Start(ctx, "Call Stripe API")`
    - Set attributes: api, endpoint, status, latency
- Frontend Next.js: Web tracing
  - Package: `@opentelemetry/sdk-trace-web`
  - Initialize tracer in `_app.tsx`
  - Track page navigation: `span = tracer.start("Navigation", {url, from_url})`
  - Track API calls: `span = tracer.start("API Call", {method, endpoint, duration})`
  - Track component renders: `span = tracer.start("Render Component", {component_name})`
  - Send traces to Jaeger via collector endpoint

**Step 3: Trace Correlation** (4 hours)
- Implement request ID generation
  - Generate UUID for each incoming request: `request_id = uuid.New()`
  - Pass request_id through all downstream calls (header: `X-Request-ID`)
  - Inject request_id into trace context
- Implement span correlation
  - All spans from same request have same trace_id
  - Parent-child span relationships established via parent_span_id
- Cross-service trace propagation
  - When calling another service, propagate trace context
  - Header format: `traceparent: 00-{trace_id}-{span_id}-{trace_flags}`
  - Jaeger automatically links spans across services

**Step 4: Trace Analysis & Visualization** (4 hours)
- Configure Jaeger UI queries
  - Query 1: "Find all requests > 1000ms"
    - Service: backend
    - Operation: POST /api/checkout
    - Min duration: 1s
  - Query 2: "Find all failed requests"
    - Tags: `error=true`
    - Service: backend
  - Query 3: "Trace request from frontend to Stripe"
    - Span name: "Call Stripe API"
    - Show full trace across all services
- Create trace templates for common scenarios
  - Template 1: Checkout flow (frontend → backend → Stripe → database)
  - Template 2: Product search (frontend → backend → Elasticsearch)
  - Template 3: Recommendation engine (backend → ML service → cache)

#### Deliverables
- ✅ Jaeger server running on 8294
- ✅ All services instrumented with OpenTelemetry
- ✅ Traces flowing from services to Jaeger
- ✅ Request flows visible across all microservices
- ✅ Performance bottleneck identification operational

#### Success Criteria
- ✅ Traces arrive in Jaeger within 1 second
- ✅ Trace UI loads complete request flow in < 500ms
- ✅ All cross-service calls properly traced
- ✅ Database queries visible in trace hierarchy
- ✅ End-to-end latency calculated from root to leaf spans

---

### Week 4: Alerting System (2 effort-days)
**Task**: Ph5.16  
**Status**: pending  

#### Objectives
- Deploy Prometheus AlertManager
- Configure alert rules for critical metrics
- Integrate with notification channels (Slack, email, PagerDuty)
- Test alert routing and escalation

#### Detailed Steps

**Step 1: AlertManager Deployment** (4 hours)
- Deploy AlertManager container (room-28-alertmanager)
  - Docker image: `prom/alertmanager:latest`
  - Port: 8295 (per PORT SOVEREIGNTY)
  - Configuration: `/etc/alertmanager/alertmanager.yml`
  - Storage: `/data/alertmanager` (for deduplication)
- Configure alerting routes
  - Route 1: High-priority (critical)
    - Receivers: pagerduty, slack-critical, email-admin
    - Grouping: by service, severity
  - Route 2: Medium-priority (warning)
    - Receivers: slack-warnings, email-team
  - Route 3: Low-priority (info)
    - Receivers: slack-info

**Step 2: Prometheus Alert Rules** (4 hours)
- Configure alert rules in Prometheus
  - File: `/etc/prometheus/alert-rules.yml`
  - Rule 1: High error rate
    ```yaml
    - alert: HighErrorRate
      expr: |
        (
          sum(rate(http_requests_total{status=~"5.."}[5m]))
          /
          sum(rate(http_requests_total[5m]))
        ) > 0.05
      for: 5m
      annotations:
        summary: "High error rate (> 5%)"
        service: "{{ $labels.service }}"
    ```
  - Rule 2: Slow response times
    ```yaml
    - alert: SlowResponseTime
      expr: histogram_quantile(0.95, http_request_duration_seconds) > 1.0
      for: 5m
    ```
  - Rule 3: Database unavailable
    ```yaml
    - alert: DatabaseUnavailable
      expr: pg_up == 0
      for: 1m
    ```
  - Rule 4: High memory usage
    ```yaml
    - alert: HighMemoryUsage
      expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.9
      for: 5m
    ```
  - Rule 5: Service down
    ```yaml
    - alert: ServiceDown
      expr: up{job="backend"} == 0
      for: 1m
    ```

**Step 3: Notification Channels** (2 hours)
- Slack integration
  - Create Slack app in SIMONE workspace
  - Add incoming webhook: `https://hooks.slack.com/services/...`
  - Configure AlertManager to send to Slack channel: `#alerts-critical`
  - Message format: service, severity, description, runbook link
- Email integration
  - Configure SMTP relay (e.g., SendGrid)
  - Recipients: devops@simone.local, alerts@simone.local
  - Email template with alert details
- PagerDuty integration (for critical alerts)
  - Create PagerDuty service for SIMONE
  - Integration key: `...`
  - Severity mapping: critical → page-immediately, warning → create-incident

**Step 4: Runbook Creation** (2 hours)
- Create runbooks for critical alerts
  - Runbook 1: "High Error Rate"
    - Steps: Check logs, identify error type, rollback or fix
    - Escalation: If not resolved in 5m, page on-call engineer
  - Runbook 2: "Database Unavailable"
    - Steps: Check database logs, restart if crashed, failover if replica
  - Runbook 3: "High Memory Usage"
    - Steps: Check memory leaks, restart service, scale horizontally
- Link runbooks in AlertManager alert annotations
  - Each alert includes: `runbook_url: "https://docs/runbooks/..."`

#### Deliverables
- ✅ AlertManager running on 8295
- ✅ Prometheus alert rules configured
- ✅ Slack notifications operational
- ✅ Email notifications operational
- ✅ Runbooks created for critical alerts

#### Success Criteria
- ✅ Alerts fire within 1 minute of condition
- ✅ Notifications delivered to Slack within 10 seconds
- ✅ No alert storms (grouping prevents duplicate alerts)
- ✅ Alert deduplication working (AlertManager memory)
- ✅ False positive rate < 5% (tuning alert thresholds)

---

### Week 5: Custom Event Tracking (2 effort-days)
**Task**: Ph5.21  
**Status**: pending  

#### Objectives
- Implement custom event tracking across platform
- Create event schema for business events
- Track user actions, conversions, and business metrics
- Build event pipeline for analytics

#### Detailed Steps

**Step 1: Event Schema Design** (4 hours)
- Define business events
  - Event 1: `user_signup` (new user registration)
    - Fields: user_id, email, signup_timestamp, source (organic/paid)
  - Event 2: `product_viewed` (user viewed product)
    - Fields: user_id, product_id, category, price, timestamp
  - Event 3: `add_to_cart` (added product to cart)
    - Fields: user_id, product_id, quantity, price, timestamp
  - Event 4: `checkout_started` (initiated checkout)
    - Fields: user_id, cart_value, item_count, timestamp
  - Event 5: `purchase_completed` (successful order)
    - Fields: user_id, order_id, total_value, items, payment_method, timestamp
  - Event 6: `payment_failed` (failed payment)
    - Fields: user_id, order_id, error_code, retry_count, timestamp
  - Event 7: `customer_support_ticket` (support request)
    - Fields: user_id, ticket_id, category, priority, timestamp
  - Event 8: `refund_requested` (refund initiated)
    - Fields: user_id, order_id, reason, amount, timestamp
- Define event structure
  ```json
  {
    "event_name": "purchase_completed",
    "event_id": "uuid",
    "timestamp": "2026-02-23T10:30:45Z",
    "user_id": "user-123",
    "session_id": "session-uuid",
    "properties": {
      "order_id": "order-456",
      "total_value": 99.99,
      "items": 3,
      "payment_method": "stripe_card"
    }
  }
  ```

**Step 2: Event Emission** (6 hours)
- Backend event emission (Go)
  - Create event service: `services/event_service.go`
  - Function: `EmitEvent(ctx, eventName, properties)` → sends to event queue
  - Emit in handlers:
    ```go
    // In checkout handler
    eventService.EmitEvent(ctx, "purchase_completed", map[string]interface{}{
      "order_id": order.ID,
      "total_value": order.Total,
      "items": len(order.Items),
    })
    ```
  - Queue backend: RabbitMQ or Redis (configured in Week 5.2 Performance workstream)
- Frontend event emission (Next.js)
  - Create analytics service: `services/analytics.ts`
  - Function: `trackEvent(eventName, properties)` → sends to backend
  - Track in components:
    ```typescript
    // In checkout button
    trackEvent('checkout_started', {
      cart_value: total,
      item_count: items.length,
    })
    ```
  - Send to backend endpoint: `POST /api/events`

**Step 3: Event Pipeline** (2 hours)
- Event queue (RabbitMQ/Redis)
  - Queue name: `events` (single queue for all events)
  - Persistence: Enabled (survives crashes)
  - TTL: 7 days (configurable)
- Event consumer
  - Worker: Consumes events from queue
  - Batch: Groups events by type (100 events per batch)
  - Destination: ClickHouse (columnar analytics database)
  - Error handling: Dead-letter queue for failed events
- ClickHouse integration
  - Create table: `events` (user_id, event_name, timestamp, properties_json)
  - Insert batch: 100 events → 1 ClickHouse insert
  - Compression: LZ4 (efficient storage)

**Step 4: Analytics Queries** (2 hours)
- Create SQL templates for common queries
  - Query 1: Daily active users (DAU)
    ```sql
    SELECT COUNT(DISTINCT user_id) FROM events WHERE timestamp >= today()
    ```
  - Query 2: Conversion funnel (signup → purchase)
    ```sql
    SELECT
      COUNT(DISTINCT CASE WHEN event_name = 'user_signup' THEN user_id END) as signups,
      COUNT(DISTINCT CASE WHEN event_name = 'purchase_completed' THEN user_id END) as purchases,
      (purchases / signups * 100) as conversion_rate
    ```
  - Query 3: Revenue by payment method
    ```sql
    SELECT properties['payment_method'] as method, SUM(properties['total_value']) as revenue
    FROM events WHERE event_name = 'purchase_completed'
    GROUP BY method
    ```
  - Query 4: Top products by views
    ```sql
    SELECT properties['product_id'], COUNT(*) as views
    FROM events WHERE event_name = 'product_viewed'
    GROUP BY properties['product_id']
    ORDER BY views DESC LIMIT 10
    ```

#### Deliverables
- ✅ Event schema defined and documented
- ✅ Event emission integrated in backend and frontend
- ✅ Event pipeline operational (queue → consumer → ClickHouse)
- ✅ Analytics queries available
- ✅ Custom events flowing into analytics system

#### Success Criteria
- ✅ Events arrive in ClickHouse within 5 seconds
- ✅ No event loss (queue persistence + consumer acks)
- ✅ Batch processing operational (100 events per insert)
- ✅ Analytics queries return results in < 1 second
- ✅ Event volume: 1000+ events/hour (scalable to 10k+)

---

### Week 6: Analytics Reporting & Forecasting (2 effort-days)
**Task**: Ph5.26  
**Status**: pending  

#### Objectives
- Build analytics reporting dashboard
- Implement forecasting models for business metrics
- Create automated reports (daily/weekly/monthly)
- Enable data-driven decision-making

#### Detailed Steps

**Step 1: Reporting Dashboard** (4 hours)
- Technology: Metabase or custom dashboard
  - Tool: Metabase (open-source, self-hosted)
  - Port: 8296 (per PORT SOVEREIGNTY)
  - Database: ClickHouse (events data source)
- Dashboard 1: "Business Metrics"
  - Daily Active Users (DAU) trend
  - Monthly Active Users (MAU) trend
  - Total Revenue (MTD, YTD)
  - Average Order Value (AOV)
  - Customer Acquisition Cost (CAC)
  - Conversion funnel (signup → purchase)
  - Churn rate (monthly)
- Dashboard 2: "Product Analytics"
  - Top 10 products by revenue
  - Top 10 products by views
  - Product add-to-cart rate
  - Product conversion rate
  - Inventory status by product
- Dashboard 3: "User Behavior"
  - New users (daily, weekly, monthly)
  - Returning user rate
  - User segments (by geography, device, acquisition source)
  - Session duration distribution
  - Pages per session

**Step 2: Forecasting Models** (6 hours)
- Technology: Python + scikit-learn + Prophet
  - Package: `facebook/prophet` (time-series forecasting)
  - Deployment: Separate Python service (room-29-forecaster)
  - Endpoint: `GET /forecast/{metric}?periods=30`
- Forecasting models
  - Model 1: Revenue forecast (30 days)
    - Input: Daily revenue from last 90 days
    - Seasonality: Weekly (weekends higher)
    - Trend: Linear (adjust for growth)
    - Output: Daily revenue prediction + confidence interval
  - Model 2: User growth forecast (90 days)
    - Input: Daily signups from last 90 days
    - Seasonality: None (organic growth)
    - Trend: Exponential (early-stage growth)
    - Output: User count prediction + upper/lower bounds
  - Model 3: Churn prediction (monthly)
    - Input: User engagement metrics from past 6 months
    - Model: Logistic regression (churn vs. no churn)
    - Output: Churn probability per user segment
- Forecast refresh schedule
  - Revenue forecast: Daily (run at 00:00 UTC)
  - User forecast: Weekly (run every Monday)
  - Churn model: Monthly (run on 1st of month)

**Step 3: Automated Reports** (2 hours)
- Technology: Metabase scheduling + email
  - Daily report: Sent at 08:00 UTC to team@simone.local
    - Content: DAU, Revenue, Top products, Key alerts
    - Format: HTML email with embedded charts
  - Weekly report: Sent every Monday at 09:00 UTC
    - Content: Summary of week (vs. previous week), Forecasts, Anomalies
    - Format: PDF attachment + summary email
  - Monthly report: Sent on 1st of month at 10:00 UTC
    - Content: Full business summary, Year-over-year comparison, Churn analysis
    - Format: Comprehensive PDF report
- Report scheduling
  - Configure in Metabase: Dashboards → Scheduled emails
  - Recipients: customizable per report
  - Format: HTML or PDF

**Step 4: Anomaly Detection** (2 hours)
- Implement anomaly detection queries
  - Anomaly 1: Revenue spike/drop (> 20% daily change)
    - Query: Compare today's revenue vs. 7-day moving average
    - Alert: If > 20% deviation, flag for investigation
  - Anomaly 2: Error rate spike (> 5% sudden increase)
    - Query: Compare current error rate vs. last hour
    - Alert: If spike detected, page on-call engineer
  - Anomaly 3: Low user activity (< 30% of expected DAU)
    - Query: Compare today's DAU vs. rolling average
    - Alert: Possible system issue
- Integrate with alerting system
  - Anomalies trigger alerts in Slack (#alerts-business)
  - Include remediation suggestions in alert message

#### Deliverables
- ✅ Metabase dashboard deployed on 8296
- ✅ Forecasting models operational
- ✅ Daily/weekly/monthly reports automated
- ✅ Anomaly detection rules configured
- ✅ Executive dashboard for business metrics

#### Success Criteria
- ✅ Reports delivered on schedule (100% delivery rate)
- ✅ Dashboard loads in < 3 seconds
- ✅ Forecast accuracy MAPE < 10% (first month)
- ✅ Anomaly detection < 5% false positive rate
- ✅ Historical data available (minimum 6 months)

---

## Cross-Workstream Integration

### Dependencies on Other Workstreams

**Performance & Caching (Ph5.2, 5.7, 5.12, 5.17, 5.22, 5.27)**
- Metrics dashboard relies on performance metrics from caching layer
- Logging must not impact performance (async, batching)
- Trace sampling required to reduce overhead (10% sampling)

**Security & Compliance (Ph5.3, 5.8, 5.13, 5.18, 5.23, 5.28)**
- Audit logging captures security events (login, permission changes)
- Tracing must not log sensitive data (PII, payment info)
- Analytics must comply with GDPR (anonymize PII in events)

**Scaling & Load Balancing (Ph5.4, 5.9, 5.14, 5.19, 5.24, 5.29)**
- Monitoring enables auto-scaling decisions (CPU/memory thresholds)
- Alerting triggers manual scaling (if auto-scaling insufficient)
- Event pipeline uses message queue (shared with Ph5.19)

**API Gateway & Service Mesh (Ph5.5, 5.10, 5.15, 5.20, 5.25, 5.30)**
- API gateway exposes metrics for monitoring (/metrics endpoint)
- Service mesh propagates trace context (OpenTelemetry headers)
- Rate limiting metrics feed into alerting system

### Dependencies Provided to Other Workstreams

- **Metrics endpoint**: Backend `/metrics` → used by Performance workstream for caching metrics
- **Trace context**: Request ID propagation → used by Scaling workstream for request tracking
- **Event pipeline**: Message queue → used by Scaling workstream for async job processing
- **Log aggregation**: Centralized logs → used by Security workstream for compliance audit trail

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Prometheus scrape delays | Medium | Medium | Implement queue buffering, increase scrape timeout |
| High cardinality metrics | Medium | High | Implement label restrictions, use cardinality limits |
| Log disk saturation | Low | Critical | Implement retention policies, compression, cleanup |
| Trace sampling loss | Low | Medium | Implement head-based sampling with priority, tail sampling |
| Alert fatigue | Medium | Medium | Tune alert thresholds, implement deduplication grouping |
| PII in logs/traces | Low | Critical | Redact sensitive fields, implement log sanitization |
| Elasticsearch cluster split-brain | Low | High | Single-node in Phase 5, migrate to cluster in Phase 6 |

---

## Success Metrics & KPIs

### Infrastructure Metrics
- **Prometheus uptime**: > 99.9% (maintenance windows excluded)
- **Grafana dashboard responsiveness**: < 500ms load time
- **Log ingest latency**: < 5 seconds (from application to Elasticsearch)
- **Trace availability**: > 95% of requests traced (with 10% sampling)
- **Alert delivery latency**: < 10 seconds (alert fire to notification)

### Business Metrics
- **Revenue tracking accuracy**: ±2% vs. actual sales
- **User DAU tracking accuracy**: ±1% vs. expected growth
- **Conversion funnel visibility**: All 5 stages visible and tracked
- **Product performance visibility**: Top 50 products tracked with < 1 second update latency

### Operational Metrics
- **MTTR (Mean Time To Resolve)**: Reduced by 50% via better visibility
- **Incident detection time**: < 5 minutes (via alerts)
- **Root cause analysis time**: Reduced by 40% (via tracing + logging)
- **Forecast accuracy**: MAPE < 10% (revenue forecast)

---

## Next Steps (Handoff to Ph5.6)

1. **Phase 6 Planning** (Week 2)
   - Design persistent storage for Prometheus/Elasticsearch
   - Plan multi-node Elasticsearch cluster
   - Design Jaeger span storage (Elasticsearch backend)

2. **Enhanced Monitoring** (Weeks 3-6)
   - Add custom metrics from domain-specific events
   - Implement SLI/SLO tracking
   - Build dashboards for each service team

3. **Advanced Analytics** (Phase 6)
   - Implement machine learning models (churn prediction, recommendation)
   - Build customer journey analysis
   - Create attribution models (marketing campaign effectiveness)

---

## Reference Documents

- **Prometheus Documentation**: https://prometheus.io/docs/
- **Grafana Dashboarding**: https://grafana.com/docs/grafana/latest/
- **OpenTelemetry**: https://opentelemetry.io/docs/
- **Jaeger Tracing**: https://www.jaegertracing.io/docs/
- **Elasticsearch Guide**: https://www.elastic.co/guide/en/elasticsearch/reference/
- **Kibana User Guide**: https://www.elastic.co/guide/en/kibana/current/
- **ClickHouse Documentation**: https://clickhouse.com/docs/
- **Metabase Guide**: https://www.metabase.com/docs/

---

**Workstream Status**: 🟢 **READY FOR WEEK 1 EXECUTION**  
**Last Updated**: 2026-02-23  
**Next Review**: After Week 1 completion (assessment of metrics dashboard)
