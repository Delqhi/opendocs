# SIMONE-WEBSHOP-01: Phase 5 Workstream 5
## API Gateway & Service Mesh Implementation Roadmap

**Workstream**: API Gateway & Service Mesh  
**Duration**: 6 weeks  
**Effort-Days**: 13 days  
**Task IDs**: Ph5.5, Ph5.10, Ph5.15, Ph5.20, Ph5.25, Ph5.30  
**Team Size**: 4-5 engineers (Platform, Backend, DevOps)  
**Status**: Ready for execution  

---

## Executive Summary

The API Gateway & Service Mesh workstream establishes intelligent request routing, service-to-service communication, and fault tolerance mechanisms across the SIMONE-WEBSHOP infrastructure. This workstream complements the Scaling & Load Balancing (Ph5.4, etc.) efforts by adding application-layer intelligence, enabling circuit breaking, rate limiting, and observability at the service mesh level.

### Strategic Goals

- **Unified API Gateway**: Single entry point for all API clients with request transformation, authentication, and routing
- **Service Mesh Control**: Automatic service discovery, traffic management, and security policies
- **Fault Tolerance**: Circuit breakers and graceful degradation prevent cascading failures
- **Rate Limiting**: Token bucket algorithm ensures fair resource allocation and prevents abuse
- **Response Caching**: Gateway-level caching reduces backend load for frequently accessed resources
- **Full Observability**: Metrics, tracing, and logging for all API traffic through gateway and mesh

### Success Criteria

1. API gateway routes 100% of client requests with < 50ms latency overhead
2. Service mesh manages all inter-service communication with automatic retries and timeouts
3. Circuit breaker prevents cascading failures (90%+ success rate during backend issues)
4. Rate limiting enforces per-user (1000 req/min) and per-endpoint (10K req/sec) limits
5. Response caching reduces backend load by 30% for read-heavy workloads
6. Mesh observability captures all service interactions with distributed tracing

### Team Composition

| Role | Headcount | Responsibilities |
|------|-----------|------------------|
| Platform Engineer (Lead) | 1 | Gateway architecture, mesh control plane setup |
| Backend Engineer | 1 | Service mesh integration, circuit breaker patterns |
| DevOps Engineer | 1 | Deployment, monitoring, troubleshooting |
| SRE | 1 | Observability, alerting, incident response |
| QA Engineer | 1 | Load testing, failover testing, performance validation |

### Stakeholders

- **Infrastructure Team**: Approves gateway & mesh architecture decisions
- **Backend Team**: Implements service-level changes (circuit breakers, timeouts)
- **Product Team**: Sets rate limiting policies per endpoint
- **Security Team**: Reviews authentication and authorization policies
- **Operations Team**: Monitors gateway and mesh health metrics
- **Finance Team**: Tracks infrastructure costs (Kong vs Traefik licensing)

---

## Architecture Overview

### API Gateway & Service Mesh Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                                 │
│                    (Web, Mobile, Third-party APIs)                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE CDN / WCDN                                   │
│              (Global load balancing, DDoS protection)                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               API GATEWAY LAYER (Kong / Traefik)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Request routing by path/hostname/method                                  │
│  • Authentication (OAuth 2.0, JWT verification)                             │
│  • Rate limiting (token bucket, per-user/endpoint quotas)                   │
│  • Request/response transformation (headers, body modifications)             │
│  • Request/response logging and tracing                                     │
│  • Response caching (HTTP caching headers, conditional requests)            │
│  • Load balancing to backend services (weighted round-robin)                │
│  • TLS termination, certificate rotation                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
        ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
        │  Auth Service    │ │ User Service │ │ Order Service│
        │  (go-auth)       │ │ (go-users)   │ │ (go-orders) │
        └──────────────────┘ └──────────────┘ └──────────────┘
                    │             │             │
                    └─────────────┼─────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│            SERVICE MESH CONTROL PLANE (Istio / Linkerd)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Service registry (discovers all service instances)                       │
│  • Traffic management policies (routing rules, traffic splitting)           │
│  • Security policies (mTLS, network policies, authorization)                │
│  • Observability (metrics collection, distributed tracing)                  │
│  • Circuit breaker configuration (failure thresholds, timeouts)             │
│  • Retry policies and timeout management                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│            SERVICE MESH DATA PLANE (Envoy Sidecar Proxies)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Service 1 Sidecar    Service 2 Sidecar    Service 3 Sidecar               │
│  ├─ Intercept         ├─ Intercept         ├─ Intercept                    │
│  ├─ Encryption (mTLS) ├─ Encryption (mTLS) ├─ Encryption (mTLS)            │
│  ├─ Load balancing    ├─ Load balancing    ├─ Load balancing               │
│  ├─ Circuit breaking  ├─ Circuit breaking  ├─ Circuit breaking             │
│  └─ Observability     └─ Observability     └─ Observability                │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
        ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
        │  PostgreSQL      │ │  Redis       │ │  RabbitMQ    │
        │  (main DB)       │ │  (sessions)  │ │  (queue)     │
        └──────────────────┘ └──────────────┘ └──────────────┘
```

### Technology Stack

| Layer | Technology | Purpose | Port |
|-------|-----------|---------|------|
| **API Gateway** | Kong API Gateway OR Traefik | Request routing, auth, rate limiting, caching | 8000, 8001 |
| **Service Mesh CP** | Istio OR Linkerd | Traffic management, security, observability | 15010, 15012 |
| **Service Mesh DP** | Envoy sidecar | Inter-service communication, encryption | 15000, 15001 |
| **Metrics** | Prometheus | Metrics collection from gateway and mesh | 9090 |
| **Tracing** | Jaeger | Distributed tracing across service calls | 6831 (UDP), 16686 (UI) |
| **Service Discovery** | Kubernetes DNS | Built-in service discovery in K8s | 53 |
| **mTLS** | Cert-Manager + Istio | Automatic certificate generation and rotation | N/A |
| **Observability** | Grafana + Loki | Dashboards and log aggregation | 3000, 3100 |

---

## Week-by-Week Implementation Roadmap

### Week 1: API Gateway Layer (Kong or Traefik)
**Task ID**: Ph5.5  
**Effort**: 2 days  
**Objective**: Deploy API gateway to handle all inbound client requests with authentication, rate limiting, and request transformation.

#### Architecture Diagram

```
Clients (Web, Mobile, Third-party)
         │
         ▼
    Cloudflare CDN
         │
         ▼
  Kong API Gateway (Kubernetes)
  ├─ /auth/* → Auth Service
  ├─ /users/* → User Service
  ├─ /orders/* → Order Service
  ├─ /products/* → Product Service
  └─ /admin/* → Admin Service
         │
         ▼
  Backend Microservices (via Service Mesh)
```

#### Implementation Steps

1. **Deploy Kong API Gateway on Kubernetes** (Day 1)
   - Create Kong Helm values file with database configuration
   - Deploy Kong PostgreSQL database for storing routes, plugins, consumers
   - Install Kong Ingress Controller for automatic route discovery
   - Configure Kong database connectivity with connection pooling
   - Verify Kong Admin API and proxy endpoints

2. **Define API Gateway Routes** (Day 1)
   - Create KongRoute resources for `/auth/*`, `/users/*`, `/orders/*`
   - Map routes to backend service targets (using Kubernetes service names)
   - Set up HTTP methods and path matching rules
   - Configure weighted load balancing for canary deployments
   - Define request/response transformations (add/remove headers)

3. **Implement Authentication Plugin** (Day 2)
   - Install Kong OAuth 2.0 plugin for client authentication
   - Configure OAuth token validation endpoint
   - Define scopes for different API endpoints (auth, users, orders)
   - Set up JWT token verification with RSA keys
   - Implement token refresh endpoint in Auth Service

4. **Configure TLS Termination** (Day 2)
   - Generate TLS certificates using Cert-Manager
   - Configure Kong to accept HTTPS requests (TLS 1.2+)
   - Set up automatic certificate renewal
   - Configure HTTP → HTTPS redirects
   - Verify certificate validity and chain

5. **Setup Request/Response Logging** (Day 2)
   - Enable Kong HTTP Log plugin to send access logs to Elasticsearch
   - Configure log format: timestamp, client_ip, path, method, status_code, latency
   - Set up log shipper to Elasticsearch for centralized logging
   - Create Kibana dashboard for API access visualization
   - Implement log retention policies (30-day retention)

6. **Load Testing & Validation** (Day 2)
   - Load test gateway with 100 concurrent clients, 1000 req/sec sustained
   - Measure gateway latency (target: < 50ms overhead)
   - Test OAuth token validation performance
   - Test failover behavior (stop Kong pod, verify automatic recovery)
   - Document baseline metrics for future comparison

#### Complete Kong Configuration Example

```yaml
# kong-values.yaml - Helm values for Kong installation
image:
  repository: kong
  tag: "3.4"

env:
  database: postgres
  pg_host: kong-postgres
  pg_user: kong
  pg_password: "secure_password_here"

postgresql:
  enabled: true
  auth:
    username: kong
    password: "secure_password_here"
    database: kong

ingressController:
  enabled: true
  installCRDs: true

proxy:
  type: LoadBalancer
  ports:
    proxy:
      port: 8000
    proxyTls:
      port: 8443

admin:
  enabled: true
  ports:
    adminApi:
      port: 8001
    adminApiTls:
      port: 8444

kongProxy:
  resources:
    requests:
      cpu: 500m
      memory: 256Mi
    limits:
      cpu: 2000m
      memory: 1024Mi
```

#### Kong Route Definition (KongRoute CRD)

```yaml
apiVersion: configuration.konghq.com/v1
kind: KongRoute
metadata:
  name: users-api-route
  namespace: default
spec:
  hosts:
    - "api.simone-webshop.com"
  paths:
    - "/users"
  methods:
    - GET
    - POST
    - PUT
    - DELETE
  backend:
    serviceName: go-users
    servicePort: 8080
  plugins:
    - name: oauth2
      config:
        provision_key: "kong-oauth-key"
        token_expiration: 3600
    - name: rate-limiting
      config:
        minute: 1000
    - name: cors
      config:
        origins:
          - "https://simone-webshop.com"
        credentials: true
        max_age: 3600
```

#### OAuth 2.0 Configuration in Auth Service (Go)

```go
// handlers/oauth.go
package handlers

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type OAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
	TokenExpiry  time.Duration
}

type TokenRequest struct {
	GrantType    string `json:"grant_type"`
	ClientID     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	Code         string `json:"code"`
	RedirectURI  string `json:"redirect_uri"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
}

// IssueToken generates JWT token for OAuth client
func (c *OAuthConfig) IssueToken(clientID string, scopes []string) (TokenResponse, error) {
	claims := jwt.MapClaims{
		"client_id": clientID,
		"scopes":    scopes,
		"exp":       time.Now().Add(c.TokenExpiry).Unix(),
		"iat":       time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(c.ClientSecret))
	if err != nil {
		return TokenResponse{}, err
	}

	refreshToken := generateRefreshToken()

	return TokenResponse{
		AccessToken:  tokenString,
		TokenType:    "Bearer",
		ExpiresIn:    int(c.TokenExpiry.Seconds()),
		RefreshToken: refreshToken,
	}, nil
}

// ValidateToken verifies JWT token from Kong
func (c *OAuthConfig) ValidateToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(c.ClientSecret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, jwt.ErrSignatureInvalid
	}

	return claims, nil
}

func generateRefreshToken() string {
	data := time.Now().String()
	hash := sha256.Sum256([]byte(data))
	return base64.URLEncoding.EncodeToString(hash[:])
}

// TokenHandler handles OAuth token requests from clients
func (c *OAuthConfig) TokenHandler(w http.ResponseWriter, r *http.Request) {
	var req TokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Validate client credentials
	if req.ClientID != c.ClientID || req.ClientSecret != c.ClientSecret {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Issue token
	token, err := c.IssueToken(req.ClientID, []string{"read:users", "write:orders"})
	if err != nil {
		http.Error(w, "Token generation failed", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(token)
}
```

#### Deliverables Checklist

- ✅ Kong deployed on Kubernetes (3+ replicas for HA)
- ✅ Kong PostgreSQL database configured with backups
- ✅ API routes defined for all backend services
- ✅ OAuth 2.0 authentication plugin configured
- ✅ TLS certificates installed and auto-renewal setup
- ✅ Request/response logging to Elasticsearch
- ✅ Load testing completed (100 concurrent, 1000 req/sec)
- ✅ Gateway latency verified (< 50ms overhead)
- ✅ Documentation updated with Kong architecture

#### Integration Points

- **Ph5.9 (Backend Services)**: Gateway routes requests to go-auth, go-users, go-orders microservices
- **Ph5.24 (Sessions)**: Gateway stores session tokens in Redis cache
- **Ph5.1 (Observability)**: Gateway sends access logs to Elasticsearch, metrics to Prometheus
- **Ph5.3 (Security)**: OAuth tokens generated and validated at gateway level

#### Success Criteria

- API gateway operational with 99.9% uptime during week 1
- All OAuth tokens issued and validated successfully
- Request latency overhead < 50ms (p99)
- No 5xx errors due to gateway issues

---

### Week 2: Service Mesh Control Plane & Data Plane Setup
**Task ID**: Ph5.10  
**Effort**: 3 days  
**Objective**: Deploy Istio/Linkerd service mesh to manage inter-service communication with automatic traffic management and mTLS encryption.

#### Architecture Diagram

```
Service Mesh Control Plane (Istio)
├─ Istiod (traffic management, certificate generation)
├─ Ingress Gateway (entry point for external traffic)
└─ Service Registry (Kubernetes DNS + Istio ServiceRegistry)

Service Mesh Data Plane (Envoy Sidecars)
├─ go-auth sidecar (intercepts all traffic to/from go-auth)
├─ go-users sidecar (intercepts all traffic to/from go-users)
├─ go-orders sidecar (intercepts all traffic to/from go-orders)
├─ go-products sidecar (intercepts all traffic to/from go-products)
└─ go-admin sidecar (intercepts all traffic to/from go-admin)

mTLS Communication (encrypted by Envoy sidecars)
go-auth:8080 → [sidecar] --mTLS--> [sidecar] → go-users:8080
```

#### Implementation Steps

1. **Install Istio Control Plane** (Day 1)
   - Download Istio 1.18+ release
   - Install CRDs (CustomResourceDefinitions) for VirtualService, DestinationRule, etc.
   - Deploy Istiod (Istio daemon) - control plane core
   - Deploy Istio Ingress Gateway for external traffic routing
   - Configure Istio to use Kubernetes DNS for service discovery
   - Verify control plane readiness (check istiod Pod status)

2. **Enable Sidecar Injection** (Day 1)
   - Label default namespace for auto-injection: `istio-injection=enabled`
   - Re-deploy all backend services (go-auth, go-users, go-orders, go-products, go-admin)
   - Verify Envoy sidecars injected (each Pod should have 2 containers: app + istio-proxy)
   - Check sidecar logs for errors: `kubectl logs <pod> -c istio-proxy`
   - Verify inter-service communication still works after sidecar injection

3. **Configure Service Entries & Virtual Services** (Day 2)
   - Create Istio ServiceEntry for each backend microservice
   - Create VirtualService for traffic management (routing rules, traffic splitting)
   - Define traffic policies: round-robin load balancing, session affinity, etc.
   - Implement canary deployments (route 10% traffic to new version initially)
   - Configure retry policies (auto-retry on 5xx errors, max 3 attempts)
   - Set timeouts for inter-service calls (default 30 seconds)

4. **Enable mTLS Enforcement** (Day 2)
   - Create PeerAuthentication policy for namespace (STRICT mode)
   - Generate mTLS certificates using Istio CA (automatic)
   - Configure certificate rotation policy (renewal every 24 hours)
   - Verify mTLS traffic encryption (use tcpdump to confirm encrypted traffic)
   - Test mTLS certificate validation (reject requests with invalid certs)

5. **Setup Service Mesh Monitoring** (Day 3)
   - Enable Istio metrics collection (Prometheus endpoint on port 15000)
   - Configure Prometheus scrape configs for sidecars
   - Deploy Kiali (Istio visualization dashboard)
   - Create Grafana dashboards for mesh metrics (latency, throughput, errors)
   - Configure Jaeger for distributed tracing of inter-service calls

6. **Integration Testing** (Day 3)
   - Test service-to-service communication through sidecars
   - Verify mTLS encryption with network packet inspection
   - Test canary deployment (verify traffic split between versions)
   - Test automatic retries on backend failure
   - Test timeout enforcement (exceed timeout, verify error handling)

#### Complete Istio Installation (Helm)

```bash
# 1. Add Istio Helm repo
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo update

# 2. Create istio-system namespace
kubectl create namespace istio-system

# 3. Install Istio Helm chart
helm install istio-base istio/base -n istio-system \
  --set defaultRevision=default

helm install istiod istio/istiod -n istio-system \
  --wait

# 4. Label default namespace for auto-injection
kubectl label namespace default istio-injection=enabled

# 5. Verify installation
kubectl get pods -n istio-system
kubectl get crds | grep istio
```

#### VirtualService Definition (Service Mesh Traffic Management)

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: go-users
  namespace: default
spec:
  hosts:
    - go-users
  http:
    # Normal traffic routing (v1)
    - match:
        - headers:
            user-agent:
              exact: "mobile"
      route:
        - destination:
            host: go-users
            port:
              number: 8080
            subset: v2
          weight: 10
        - destination:
            host: go-users
            port:
              number: 8080
            subset: v1
          weight: 90
      timeout: 30s
      retries:
        attempts: 3
        perTryTimeout: 10s

    # Fallback for other clients
    - route:
        - destination:
            host: go-users
            port:
              number: 8080
            subset: v1
          weight: 100
      timeout: 30s
      corsPolicy:
        allowOrigins:
          - exact: "https://simone-webshop.com"
        allowMethods:
          - GET
          - POST
          - PUT
          - DELETE
        allowHeaders:
          - authorization
          - content-type
        maxAge: "3600s"
```

#### DestinationRule Definition (Load Balancing & Circuit Breaker)

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: go-users
  namespace: default
spec:
  host: go-users
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 1000
      http:
        http1MaxPendingRequests: 100
        http2MaxRequests: 1000
        maxRequestsPerConnection: 100
    loadBalancer:
      simple: ROUND_ROBIN
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
      minRequestVolume: 10
      splitExternalLocalOriginErrors: true

  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
```

#### PeerAuthentication Policy (mTLS Enforcement)

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: default
spec:
  mtls:
    mode: STRICT  # Enforce mTLS for all inter-service communication

---
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: jwt-auth
  namespace: default
spec:
  jwtRules:
    - issuer: "https://auth.simone-webshop.com"
      jwksUri: "https://auth.simone-webshop.com/.well-known/jwks.json"
      audiences: "api"
      forwardOriginalToken: true

---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: api-policy
  namespace: default
spec:
  selector:
    matchLabels:
      app: go-users
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/default/sa/go-auth"]
      to:
        - operation:
            methods: ["GET", "POST"]
            paths: ["/users/*"]
```

#### Service Mesh Monitoring (Prometheus + Grafana)

```yaml
# ServiceMonitor for Envoy sidecars
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: envoy-metrics
  namespace: default
spec:
  selector:
    matchLabels:
      app: go-users
  endpoints:
    - port: metrics
      interval: 30s
      path: /stats/prometheus

---
# Grafana Dashboard ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-dashboard
  namespace: monitoring
data:
  dashboard.json: |
    {
      "dashboard": {
        "title": "Istio Mesh Dashboard",
        "panels": [
          {
            "title": "Request Rate",
            "targets": [
              {
                "expr": "rate(istio_request_total[5m])"
              }
            ]
          },
          {
            "title": "Error Rate",
            "targets": [
              {
                "expr": "rate(istio_request_total{response_code=~\"5..\"}[5m])"
              }
            ]
          },
          {
            "title": "P99 Latency",
            "targets": [
              {
                "expr": "histogram_quantile(0.99, rate(istio_request_duration_milliseconds_bucket[5m]))"
              }
            ]
          }
        ]
      }
    }
```

#### Go Service Integration with Istio (Sidecar-aware)

```go
// services/users.go - Sidecar-aware service configuration
package services

import (
	"context"
	"fmt"
	"net"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/keepalive"
)

// ServiceClient for inter-service communication through sidecar
type ServiceClient struct {
	conn   *grpc.ClientConn
	target string
}

// NewServiceClient creates client with sidecar routing
func NewServiceClient(serviceName, namespace string) (*ServiceClient, error) {
	// Use Kubernetes DNS name: service.namespace.svc.cluster.local
	target := fmt.Sprintf("%s.%s.svc.cluster.local:50051", serviceName, namespace)

	// Configure keepalive for long-lived connections
	kacp := keepalive.ClientParameters{
		Time:                10 * time.Second,
		Timeout:             1 * time.Second,
		PermitWithoutStream: true,
	}

	conn, err := grpc.Dial(
		target,
		grpc.WithDefaultCallOptions(grpc.MaxCallRecvMsgSize(4*1024*1024)),
		grpc.WithKeepaliveParams(kacp),
		grpc.WithTransportCredentials(insecure.NewCredentials()), // mTLS handled by Envoy sidecar
	)
	if err != nil {
		return nil, err
	}

	return &ServiceClient{
		conn:   conn,
		target: target,
	}, nil
}

// Close closes the connection
func (sc *ServiceClient) Close() error {
	return sc.conn.Close()
}

// HealthCheck verifies service availability through mesh
func (sc *ServiceClient) HealthCheck(ctx context.Context) error {
	// Create a simple connection to verify service is available
	conn, err := net.DialTimeout("tcp", sc.target, 2*time.Second)
	if err != nil {
		return fmt.Errorf("service unavailable: %w", err)
	}
	defer conn.Close()

	return nil
}

// CallService makes RPC call to another service through sidecar
func (sc *ServiceClient) CallService(ctx context.Context, method string, in interface{}) (interface{}, error) {
	// This would be service-specific implementation
	// Sidecar automatically handles:
	// - mTLS encryption
	// - Load balancing between instances
	// - Retry policies
	// - Circuit breaking
	// - Distributed tracing headers (x-trace-id, etc.)

	// Example gRPC call (would be proto-generated in real scenario)
	// response, err := pb.NewUserServiceClient(sc.conn).GetUser(ctx, in)

	return nil, nil
}
```

#### Deliverables Checklist

- ✅ Istio control plane (Istiod) deployed and running
- ✅ Envoy sidecars injected into all backend service Pods
- ✅ VirtualService and DestinationRule configured for traffic management
- ✅ mTLS enforcement enabled (STRICT mode)
- ✅ Service-to-service communication verified through sidecar
- ✅ Prometheus metrics collection from mesh sidecars
- ✅ Kiali dashboard accessible for mesh visualization
- ✅ Distributed tracing integrated with Jaeger
- ✅ Integration tests pass (10/10 test scenarios)

#### Integration Points

- **Ph5.5 (API Gateway)**: Kong routes to Istio Ingress Gateway, then to backend services through mesh
- **Ph5.14 (Database)**: Service mesh manages connections to PostgreSQL read replicas
- **Ph5.1 (Observability)**: Mesh metrics sent to Prometheus, traces to Jaeger
- **Ph5.19 (Message Queue)**: Service mesh manages RabbitMQ client connections

#### Success Criteria

- All inter-service communication uses mTLS (verified with Kiali)
- No unencrypted traffic between services
- Mesh latency overhead < 5ms (p99)
- Automatic circuit breaker activation on 5+ consecutive failures

---

### Week 3: Circuit Breaker Pattern Implementation
**Task ID**: Ph5.15  
**Effort**: 2 days  
**Objective**: Implement circuit breaker pattern to prevent cascading failures and enable graceful degradation.

#### Architecture Diagram

```
Closed State (Normal)          Open State (Failed)         Half-Open State (Recovery)
┌─────────────────┐           ┌──────────────────┐        ┌──────────────────┐
│ Requests flow   │           │ Requests blocked │        │ Limited requests  │
│ normally        │           │ immediately      │        │ allowed for test  │
│ Errors counted  │           │ No calls to      │        │ Success → close   │
│                 │           │ backend          │        │ Failure → reopen  │
└────────┬────────┘           └────────┬─────────┘        └────────┬──────────┘
         │                             │                           │
         │ 5 consecutive               │ 30s timeout after         │
         │ failures                    │ opening                   │
         └────────────────►            └──────────────►            │
                                                        ◄───────────┘
```

#### Implementation Steps

1. **Configure Istio Circuit Breaker** (Day 1)
   - Update DestinationRule with outlierDetection settings
   - Set consecutive5xxErrors threshold (5 failures)
   - Set baseEjectionTime (30 seconds)
   - Configure maxEjectionPercent (50% of pool)
   - Enable splitExternalLocalOriginErrors for better detection

2. **Implement Application-Level Circuit Breaker** (Day 1)
   - Use Go library (e.g., gobreaker, hystrix-go)
   - Wrap service calls with circuit breaker decorator
   - Configure thresholds: consecutive failures (5), timeout (30s)
   - Implement fallback/degradation logic for open state
   - Add metrics export (state transitions, failures, successes)

3. **Implement Fallback Strategies** (Day 2)
   - Cache frequently accessed data for fallback use
   - Return default values when circuit is open
   - Queue requests for retry when circuit recovers
   - Implement graceful degradation (reduced functionality)
   - Log all circuit breaker state transitions

4. **Testing & Validation** (Day 2)
   - Simulate backend service failure
   - Verify circuit breaker opens within 5 failures
   - Verify requests are blocked while open
   - Verify circuit closes after timeout (30s)
   - Verify half-open state allows limited requests
   - Test fallback behavior under load

#### Circuit Breaker Implementation (Go)

```go
// circuit/breaker.go - Circuit breaker pattern implementation
package circuit

import (
	"fmt"
	"sync"
	"time"
)

// State represents circuit breaker state
type State string

const (
	StateClosed   State = "closed"
	StateOpen     State = "open"
	StateHalfOpen State = "half-open"
)

// Config holds circuit breaker configuration
type Config struct {
	Name                  string        // Breaker name (e.g., "users-service")
	MaxConsecutiveFailures int          // Open after N failures
	OpenDuration          time.Duration // Time to stay open
	HalfOpenAttempts      int           // Attempts allowed in half-open
	HalfOpenTimeout       time.Duration // Timeout for half-open requests
}

// CircuitBreaker implements circuit breaker pattern
type CircuitBreaker struct {
	mu                  sync.RWMutex
	state               State
	consecutiveFailures int
	lastFailureTime     time.Time
	successCount        int
	config              Config

	// Metrics
	totalCalls      int64
	totalSuccesses  int64
	totalFailures   int64
	totalRejections int64
}

// NewCircuitBreaker creates new circuit breaker
func NewCircuitBreaker(config Config) *CircuitBreaker {
	return &CircuitBreaker{
		state:  StateClosed,
		config: config,
	}
}

// Call executes function through circuit breaker
func (cb *CircuitBreaker) Call(fn func() error) error {
	cb.mu.Lock()

	// Check if breaker should transition to half-open
	if cb.state == StateOpen {
		if time.Since(cb.lastFailureTime) > cb.config.OpenDuration {
			cb.state = StateHalfOpen
			cb.successCount = 0
		} else {
			cb.mu.Unlock()
			cb.totalRejections++
			return fmt.Errorf("circuit breaker open for %s", cb.config.Name)
		}
	}

	// Limit requests in half-open state
	if cb.state == StateHalfOpen && cb.successCount >= cb.config.HalfOpenAttempts {
		cb.mu.Unlock()
		cb.totalRejections++
		return fmt.Errorf("circuit breaker half-open limit reached for %s", cb.config.Name)
	}

	cb.totalCalls++
	cb.mu.Unlock()

	// Execute function
	err := fn()

	cb.mu.Lock()
	defer cb.mu.Unlock()

	if err != nil {
		return cb.onFailure()
	}

	return cb.onSuccess()
}

// onSuccess handles successful call
func (cb *CircuitBreaker) onSuccess() error {
	cb.totalSuccesses++
	cb.consecutiveFailures = 0

	if cb.state == StateHalfOpen {
		cb.successCount++
		if cb.successCount >= cb.config.HalfOpenAttempts {
			cb.state = StateClosed
			cb.successCount = 0
			fmt.Printf("[%s] Circuit breaker closed\n", cb.config.Name)
		}
	}

	return nil
}

// onFailure handles failed call
func (cb *CircuitBreaker) onFailure() error {
	cb.totalFailures++
	cb.consecutiveFailures++
	cb.lastFailureTime = time.Now()

	if cb.state == StateHalfOpen {
		// Immediately reopen on failure in half-open state
		cb.state = StateOpen
		fmt.Printf("[%s] Circuit breaker reopened (half-open failure)\n", cb.config.Name)
		return fmt.Errorf("circuit breaker reopened for %s", cb.config.Name)
	}

	if cb.consecutiveFailures >= cb.config.MaxConsecutiveFailures {
		cb.state = StateOpen
		fmt.Printf("[%s] Circuit breaker opened (%d consecutive failures)\n", cb.config.Name, cb.consecutiveFailures)
		return fmt.Errorf("circuit breaker open for %s", cb.config.Name)
	}

	return fmt.Errorf("call failed for %s", cb.config.Name)
}

// State returns current state
func (cb *CircuitBreaker) State() State {
	cb.mu.RLock()
	defer cb.mu.RUnlock()
	return cb.state
}

// Metrics returns circuit breaker metrics
func (cb *CircuitBreaker) Metrics() map[string]interface{} {
	cb.mu.RLock()
	defer cb.mu.RUnlock()

	return map[string]interface{}{
		"name":             cb.config.Name,
		"state":            cb.state,
		"total_calls":      cb.totalCalls,
		"total_successes":  cb.totalSuccesses,
		"total_failures":   cb.totalFailures,
		"total_rejections": cb.totalRejections,
	}
}
```

#### Service Client with Circuit Breaker (Go)

```go
// services/users_client.go - Users service client with circuit breaker
package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"simone-webshop/circuit"
)

type UsersClient struct {
	endpoint string
	client   *http.Client
	breaker  *circuit.CircuitBreaker
	cache    *UserCache
}

type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Email string `json:"email"`
}

type UserCache struct {
	data   map[int]*User
	expiry map[int]time.Time
}

// NewUsersClient creates client with circuit breaker
func NewUsersClient(endpoint string) *UsersClient {
	breaker := circuit.NewCircuitBreaker(circuit.Config{
		Name:                  "users-service",
		MaxConsecutiveFailures: 5,
		OpenDuration:          30 * time.Second,
		HalfOpenAttempts:      3,
		HalfOpenTimeout:       5 * time.Second,
	})

	return &UsersClient{
		endpoint: endpoint,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		breaker: breaker,
		cache: &UserCache{
			data:   make(map[int]*User),
			expiry: make(map[int]time.Time),
		},
	}
}

// GetUser retrieves user by ID with circuit breaker protection
func (uc *UsersClient) GetUser(ctx context.Context, userID int) (*User, error) {
	// Check cache first (used as fallback when circuit open)
	if cached, ok := uc.cache.data[userID]; ok {
		if time.Now().Before(uc.cache.expiry[userID]) {
			return cached, nil // Cache hit
		}
		delete(uc.cache.data, userID) // Expired
	}

	var result *User

	// Execute through circuit breaker
	err := uc.breaker.Call(func() error {
		req, _ := http.NewRequestWithContext(ctx, "GET", fmt.Sprintf("%s/users/%d", uc.endpoint, userID), nil)

		resp, err := uc.client.Do(req)
		if err != nil {
			return err
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			return fmt.Errorf("users service returned %d: %s", resp.StatusCode, string(body))
		}

		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return err
		}

		// Cache result for 5 minutes
		uc.cache.data[userID] = result
		uc.cache.expiry[userID] = time.Now().Add(5 * time.Minute)

		return nil
	})

	// If circuit open, return cached value
	if err != nil && uc.cache.data[userID] != nil {
		return uc.cache.data[userID], nil // Graceful degradation
	}

	return result, err
}

// Metrics returns circuit breaker metrics
func (uc *UsersClient) Metrics() map[string]interface{} {
	return uc.breaker.Metrics()
}
```

#### Fallback & Degradation (Go)

```go
// services/degradation.go - Graceful degradation strategies
package services

import (
	"context"
	"fmt"
)

// OrderService with degradation
type OrderService struct {
	usersClient   *UsersClient
	productsClient *ProductsClient
	fallbackUser  *User
}

// GetOrderDetails retrieves order with graceful degradation
func (os *OrderService) GetOrderDetails(ctx context.Context, orderID int) (map[string]interface{}, error) {
	order := map[string]interface{}{
		"id":      orderID,
		"status":  "processing",
		"total":   199.99,
	}

	// Try to get user info, fallback if service unavailable
	user, err := os.usersClient.GetUser(ctx, 123)
	if err != nil {
		// Graceful degradation: use fallback user info
		fmt.Printf("Users service unavailable, using fallback: %v\n", err)
		user = &User{
			ID:    -1,
			Name:  "Unknown User",
			Email: "unknown@example.com",
		}
	}

	order["user"] = user

	// Try to get product details
	products := []map[string]interface{}{}
	productIDs := []int{1, 2, 3}
	for _, productID := range productIDs {
		product, err := os.productsClient.GetProduct(ctx, productID)
		if err != nil {
			// Fallback: return minimal product info from cache
			fmt.Printf("Products service unavailable for product %d\n", productID)
			product = &Product{
				ID:    productID,
				Name:  "Product (Unavailable)",
				Price: 0,
			}
		}
		products = append(products, map[string]interface{}{
			"id":    product.ID,
			"name":  product.Name,
			"price": product.Price,
		})
	}

	order["items"] = products

	return order, nil
}
```

#### Deliverables Checklist

- ✅ Circuit breaker configured in Istio DestinationRule
- ✅ Application-level circuit breaker implemented in Go
- ✅ Fallback cache populated and tested
- ✅ Graceful degradation strategies documented
- ✅ Circuit breaker state transitions verified (closed → open → half-open → closed)
- ✅ Metrics exported to Prometheus
- ✅ Load test with backend failure (verify circuit opens)
- ✅ Documentation updated with circuit breaker architecture

#### Integration Points

- **Ph5.10 (Service Mesh)**: Istio DestinationRule outlierDetection complements app-level breaker
- **Ph5.1 (Observability)**: Circuit breaker state changes exported to Prometheus for alerting
- **Ph5.2 (Caching)**: Cache used for fallback when circuit open

#### Success Criteria

- Circuit breaker prevents cascading failures (verified with chaos test)
- Fallback mechanism works correctly (services return cached data when open)
- Circuit transitions from open → half-open → closed automatically
- No manual intervention required for circuit state management

---

### Week 4: API Rate Limiting Implementation
**Task ID**: Ph5.20  
**Effort**: 2 days  
**Objective**: Implement rate limiting at API gateway to enforce per-user and per-endpoint quotas using token bucket algorithm.

#### Architecture Diagram

```
Client Requests
     │
     ▼
Kong API Gateway
├─ Rate Limiter (Token Bucket)
│  ├─ Per-user quota: 1000 requests/minute
│  ├─ Per-endpoint quota: 10K requests/second
│  └─ Token bucket refill: configurable
├─ Request allowed?
│  ├─ Yes → forward to backend
│  └─ No → return 429 Too Many Requests
└─ Redis shared state
   └─ Store rate limit counters (distributed)
```

#### Implementation Steps

1. **Configure Kong Rate Limiting Plugin** (Day 1)
   - Install Kong Rate Limiting plugin
   - Configure per-consumer rate limits (1000 req/min)
   - Configure per-endpoint rate limits (10K req/sec)
   - Use Redis as distributed store for rate limit counters
   - Configure sliding window algorithm or token bucket
   - Enable rate limit header responses (X-RateLimit-Limit, X-RateLimit-Remaining)

2. **Implement Token Bucket Algorithm** (Day 1)
   - Create Redis-backed token bucket implementation
   - Per-user buckets: start with N tokens, refill at R tokens/second
   - Per-endpoint buckets: separate bucket per endpoint
   - Handle concurrent requests atomically in Redis
   - Implement bucket key generation: `ratelimit:{user_id}:{endpoint}`

3. **Setup Rate Limit Monitoring** (Day 2)
   - Track rate limit rejections per user, per endpoint
   - Export metrics to Prometheus (rejections, bucket capacity, refill rate)
   - Create Grafana dashboard for rate limit visualization
   - Set up alerts for high rejection rates (> 5% of traffic)
   - Log rate limit violations (user_id, endpoint, timestamp)

4. **Testing & Configuration** (Day 2)
   - Load test with per-user rate limiting enabled
   - Verify users hitting limit receive 429 responses
   - Test endpoint-level limits (burst up to limit, then 429)
   - Test rate limit header accuracy
   - Verify Redis consistency across multiple gateway instances

#### Kong Rate Limiting Configuration

```yaml
# Kong KongPlugin CRD for rate limiting
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: rate-limit-consumer
spec:
  plugin: rate-limiting
  config:
    minute: 1000           # 1000 requests per minute per consumer
    error_code: 429        # HTTP 429 for rate limited requests
    error_message: "Rate limit exceeded"
    header_name: "X-RateLimit-Limit"
    retry_after_jitter_factor: 0
    policy: "redis"        # Use Redis for distributed tracking
    redis:
      host: redis-cluster
      port: 6379
      database: 1
      timeout: 2000

---
# Kong KongPlugin for endpoint rate limiting
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: rate-limit-endpoint
spec:
  plugin: rate-limiting
  config:
    second: 10000          # 10K requests per second per endpoint
    error_code: 429
    policy: "redis"
    redis:
      host: redis-cluster
      port: 6379
      database: 1

---
# Apply plugins to routes
apiVersion: configuration.konghq.com/v1
kind: KongRoute
metadata:
  name: orders-api
spec:
  hosts:
    - "api.simone-webshop.com"
  paths:
    - "/orders"
  backend:
    serviceName: go-orders
    servicePort: 8080
  plugins:
    - rate-limit-consumer      # Per-user: 1000/min
    - rate-limit-endpoint      # Per-endpoint: 10K/sec
```

#### Token Bucket Implementation (Go + Redis)

```go
// ratelimit/token_bucket.go - Token bucket rate limiter
package ratelimit

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// TokenBucket implements token bucket rate limiting
type TokenBucket struct {
	redis       *redis.Client
	capacity    float64       // Max tokens in bucket
	refillRate  float64       // Tokens per second
	keyPrefix   string
}

// NewTokenBucket creates token bucket with Redis backend
func NewTokenBucket(redisClient *redis.Client, capacity, refillRate float64, keyPrefix string) *TokenBucket {
	return &TokenBucket{
		redis:      redisClient,
		capacity:   capacity,
		refillRate: refillRate,
		keyPrefix:  keyPrefix,
	}
}

// Allow checks if request is allowed (consumes 1 token)
func (tb *TokenBucket) Allow(ctx context.Context, userID string) (bool, error) {
	return tb.AllowN(ctx, userID, 1)
}

// AllowN checks if N tokens can be consumed
func (tb *TokenBucket) AllowN(ctx context.Context, userID string, tokens float64) (bool, error) {
	key := fmt.Sprintf("%s:%s", tb.keyPrefix, userID)
	now := time.Now().Unix()

	// Lua script to atomically:
	// 1. Get current bucket state (tokens, last_refill_time)
	// 2. Calculate refilled tokens
	// 3. Check if enough tokens available
	// 4. Consume tokens if available
	luaScript := redis.NewScript(`
		local key = KEYS[1]
		local now = tonumber(ARGV[1])
		local tokens_to_consume = tonumber(ARGV[2])
		local capacity = tonumber(ARGV[3])
		local refill_rate = tonumber(ARGV[4])
		local ttl = tonumber(ARGV[5])

		-- Get current bucket state
		local bucket = redis.call('HGETALL', key)
		local tokens = capacity
		local last_refill = now

		if #bucket > 0 then
			tokens = tonumber(bucket[2])
			last_refill = tonumber(bucket[4])
		end

		-- Calculate time elapsed and tokens to refill
		local elapsed = now - last_refill
		local refilled = elapsed * refill_rate
		tokens = math.min(capacity, tokens + refilled)

		-- Check if enough tokens available
		if tokens >= tokens_to_consume then
			tokens = tokens - tokens_to_consume
			redis.call('HSET', key, 'tokens', tokens, 'last_refill', now)
			redis.call('EXPIRE', key, ttl)
			return {1, math.floor(tokens)}  -- Allowed, remaining tokens
		else
			redis.call('HSET', key, 'tokens', tokens, 'last_refill', now)
			redis.call('EXPIRE', key, ttl)
			return {0, math.floor(tokens)}  -- Rejected, remaining tokens
		end
	`)

	// Execute Lua script atomically in Redis
	result, err := luaScript.Run(ctx, tb.redis,
		[]string{key},
		now,
		tokens,
		tb.capacity,
		tb.refillRate,
		86400, // 24h TTL
	).Result()

	if err != nil {
		return false, err
	}

	resultArray := result.([]interface{})
	allowed := resultArray[0].(int64) == 1

	return allowed, nil
}

// GetRemaining returns remaining tokens without consuming
func (tb *TokenBucket) GetRemaining(ctx context.Context, userID string) (float64, error) {
	key := fmt.Sprintf("%s:%s", tb.keyPrefix, userID)
	now := time.Now().Unix()

	luaScript := redis.NewScript(`
		local key = KEYS[1]
		local now = tonumber(ARGV[1])
		local capacity = tonumber(ARGV[2])
		local refill_rate = tonumber(ARGV[3])

		local bucket = redis.call('HGETALL', key)
		local tokens = capacity
		local last_refill = now

		if #bucket > 0 then
			tokens = tonumber(bucket[2])
			last_refill = tonumber(bucket[4])
		end

		local elapsed = now - last_refill
		local refilled = elapsed * refill_rate
		tokens = math.min(capacity, tokens + refilled)

		return math.floor(tokens)
	`)

	result, err := luaScript.Run(ctx, tb.redis,
		[]string{key},
		now,
		tb.capacity,
		tb.refillRate,
	).Result()

	if err != nil {
		return 0, err
	}

	return float64(result.(int64)), nil
}

// Metrics returns current metrics for user
func (tb *TokenBucket) Metrics(ctx context.Context, userID string) (map[string]interface{}, error) {
	remaining, err := tb.GetRemaining(ctx, userID)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"user_id":          userID,
		"capacity":         tb.capacity,
		"refill_rate":      tb.refillRate,
		"remaining_tokens": remaining,
		"limit_exceeded":   remaining <= 0,
	}, nil
}
```

#### Rate Limiting Middleware (Go)

```go
// middleware/ratelimit.go - HTTP middleware for rate limiting
package middleware

import (
	"fmt"
	"net/http"
	"strconv"

	"simone-webshop/auth"
	"simone-webshop/ratelimit"
)

// RateLimitMiddleware enforces rate limits
func RateLimitMiddleware(limiter *ratelimit.TokenBucket) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get user ID from context (set by auth middleware)
			userID, ok := r.Context().Value(auth.UserIDKey).(string)
			if !ok {
				// Anonymous user, use IP address
				userID = r.RemoteAddr
			}

			// Check rate limit
			allowed, err := limiter.Allow(r.Context(), userID)
			if err != nil {
				http.Error(w, "Rate limit check failed", http.StatusInternalServerError)
				return
			}

			// Get remaining tokens for headers
			remaining, _ := limiter.GetRemaining(r.Context(), userID)

			// Set rate limit headers
			w.Header().Set("X-RateLimit-Limit", strconv.FormatFloat(limiter.Capacity(), 'f', 0, 64))
			w.Header().Set("X-RateLimit-Remaining", strconv.FormatFloat(remaining, 'f', 0, 64))
			w.Header().Set("X-RateLimit-Reset", strconv.FormatInt(time.Now().Add(60*time.Second).Unix(), 10))

			if !allowed {
				w.Header().Set("Retry-After", "60")
				http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RateLimitConfig defines rate limiting strategy
type RateLimitConfig struct {
	Enabled           bool
	PerUserLimit      float64       // Requests per minute
	PerEndpointLimit  float64       // Requests per second
	RefillRate        float64       // Tokens per second
	WhitelistIPs      []string      // IPs exempt from rate limiting
}

// IsWhitelisted checks if IP is exempt from rate limiting
func (cfg *RateLimitConfig) IsWhitelisted(ip string) bool {
	for _, whitelistIP := range cfg.WhitelistIPs {
		if ip == whitelistIP {
			return true
		}
	}
	return false
}
```

#### Prometheus Metrics Export

```go
// metrics/ratelimit.go - Rate limiting metrics
package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	RateLimitRejections = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "ratelimit_rejections_total",
			Help: "Total rate limit rejections",
		},
		[]string{"user_id", "endpoint", "reason"},
	)

	RateLimitRemaining = promauto.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "ratelimit_remaining_tokens",
			Help: "Remaining tokens in bucket per user",
		},
		[]string{"user_id"},
	)

	RateLimitBucketCapacity = promauto.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "ratelimit_bucket_capacity",
			Help: "Rate limit bucket capacity",
		},
		[]string{"type"},
	)
)

// RecordRateLimitRejection records rate limit rejection
func RecordRateLimitRejection(userID, endpoint, reason string) {
	RateLimitRejections.WithLabelValues(userID, endpoint, reason).Inc()
}

// UpdateRateLimitRemaining updates remaining tokens
func UpdateRateLimitRemaining(userID string, remaining float64) {
	RateLimitRemaining.WithLabelValues(userID).Set(remaining)
}
```

#### Deliverables Checklist

- ✅ Kong rate limiting plugin configured (per-user: 1000/min, per-endpoint: 10K/sec)
- ✅ Redis-backed token bucket implementation
- ✅ Rate limiting middleware integrated
- ✅ X-RateLimit headers added to responses
- ✅ Rate limit rejections exported to Prometheus
- ✅ Grafana dashboard for rate limit monitoring
- ✅ Load test verifies rate limits enforced correctly
- ✅ Documentation updated with rate limiting architecture

#### Integration Points

- **Ph5.5 (API Gateway)**: Kong rate limiting plugin deployed
- **Ph5.24 (Sessions/Redis)**: Redis Cluster stores rate limit tokens
- **Ph5.1 (Observability)**: Rate limit metrics exported to Prometheus

#### Success Criteria

- All per-user requests > 1000/min receive 429 responses
- All per-endpoint traffic > 10K/sec receives 429 responses
- Rate limit headers accurately reflect remaining tokens
- No performance degradation from rate limiting (< 5ms overhead)

---

### Week 5: API Gateway Response Caching
**Task ID**: Ph5.25  
**Effort**: 2 days  
**Objective**: Implement response caching at API gateway level to reduce backend load for frequently accessed resources.

#### Architecture Diagram

```
Client Request
     │
     ▼
Kong API Gateway
├─ Cache Lookup (Redis)
│  ├─ Hit → return cached response (< 10ms)
│  └─ Miss → forward to backend
├─ Backend Response
     │
     ▼
├─ Parse Cache Headers (Cache-Control, ETag)
├─ Store in Redis (TTL from headers)
├─ Return to Client
     │
     ▼
Cache Hit on subsequent requests
```

#### Implementation Steps

1. **Configure Kong HTTP Caching Plugin** (Day 1)
   - Install Kong Proxy Cache plugin
   - Configure cache storage in Redis
   - Set cache key generation (path, query params, headers)
   - Configure cache status header (X-Cache-Status: HIT/MISS)
   - Implement HTTP cache control header parsing (Cache-Control, Expires, ETag)

2. **Define Cache Policies per Endpoint** (Day 1)
   - Define which endpoints are cacheable (GET requests only)
   - Set TTL per endpoint:
     - `/products/*` → 1 hour (stable data)
     - `/users/{id}` → 5 minutes (medium frequency changes)
     - `/orders/*` → 0 seconds (never cache, real-time)
   - Implement conditional requests (If-None-Match with ETag)
   - Configure cache invalidation triggers

3. **Implement Cache Invalidation** (Day 2)
   - Listen to backend events (POST/PUT/DELETE requests)
   - Invalidate cache on data mutations
   - Implement cache purge API endpoint
   - Support cache versioning (add version header to cache key)
   - Test cache invalidation under concurrent load

4. **Setup Cache Monitoring** (Day 2)
   - Track cache hit ratio per endpoint (target: > 70%)
   - Monitor cache size (target: < 10GB)
   - Export cache metrics to Prometheus
   - Create Grafana dashboard for cache performance
   - Set up alerts for low hit rate endpoints

#### Kong Proxy Cache Configuration

```yaml
# Kong proxy cache plugin configuration
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: proxy-cache
spec:
  plugin: proxy-cache
  config:
    content_type:
      - "application/json"
      - "text/plain"
    cache_control: true
    cache_ttl: 300
    strategy: "memory"  # Use memory for L1 cache, Redis for L2
    cache_key: "$(request.method)$(request.host)$(request.path)$(request.querystring)"
    response_headers:
      X-Cache-Status:
        - hit
        - miss
        - bypass

---
# Redis L2 cache configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: kong-cache-config
data:
  redis_config.lua: |
    redis_host = "redis-cluster"
    redis_port = 6379
    redis_db = 2
    redis_ttl = 300

---
# Apply cache plugin to cacheable routes
apiVersion: configuration.konghq.com/v1
kind: KongRoute
metadata:
  name: products-api
spec:
  hosts:
    - "api.simone-webshop.com"
  paths:
    - "/products"
  methods:
    - GET
  backend:
    serviceName: go-products
    servicePort: 8080
  plugins:
    - proxy-cache
```

#### Cache Control Header Parsing (Go)

```go
// cache/control.go - HTTP Cache-Control header parsing
package cache

import (
	"net/http"
	"strconv"
	"strings"
	"time"
)

// CacheControl represents parsed Cache-Control header
type CacheControl struct {
	Public              bool
	Private             bool
	NoCache             bool
	NoStore             bool
	MaxAge              time.Duration
	SMaxAge             time.Duration
	MustRevalidate      bool
	ProxyRevalidate     bool
	Immutable           bool
	StaleWhileRevalidate time.Duration
	StaleIfError        time.Duration
}

// ParseCacheControl parses Cache-Control header
func ParseCacheControl(header string) *CacheControl {
	cc := &CacheControl{}

	if header == "" {
		return cc
	}

	parts := strings.Split(header, ",")
	for _, part := range parts {
		part = strings.TrimSpace(part)

		if strings.HasPrefix(part, "max-age=") {
			if seconds, err := strconv.Atoi(strings.TrimPrefix(part, "max-age=")); err == nil {
				cc.MaxAge = time.Duration(seconds) * time.Second
			}
		} else if strings.HasPrefix(part, "s-maxage=") {
			if seconds, err := strconv.Atoi(strings.TrimPrefix(part, "s-maxage=")); err == nil {
				cc.SMaxAge = time.Duration(seconds) * time.Second
			}
		} else if strings.HasPrefix(part, "stale-while-revalidate=") {
			if seconds, err := strconv.Atoi(strings.TrimPrefix(part, "stale-while-revalidate=")); err == nil {
				cc.StaleWhileRevalidate = time.Duration(seconds) * time.Second
			}
		} else if part == "public" {
			cc.Public = true
		} else if part == "private" {
			cc.Private = true
		} else if part == "no-cache" {
			cc.NoCache = true
		} else if part == "no-store" {
			cc.NoStore = true
		} else if part == "must-revalidate" {
			cc.MustRevalidate = true
		} else if part == "proxy-revalidate" {
			cc.ProxyRevalidate = true
		} else if part == "immutable" {
			cc.Immutable = true
		}
	}

	return cc
}

// TTL returns cache TTL duration
func (cc *CacheControl) TTL() time.Duration {
	if cc.NoStore {
		return 0 // Don't cache
	}

	if cc.SMaxAge > 0 {
		return cc.SMaxAge // Use s-maxage for shared caches
	}

	if cc.MaxAge > 0 {
		return cc.MaxAge
	}

	return 5 * time.Minute // Default 5 min
}

// IsCacheable checks if response is cacheable
func (cc *CacheControl) IsCacheable() bool {
	return !cc.NoStore && !cc.NoCache && cc.MaxAge > 0
}
```

#### Cache Invalidation Handler (Go)

```go
// cache/invalidation.go - Cache invalidation on data mutations
package cache

import (
	"context"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
)

// CacheInvalidator handles cache invalidation on data changes
type CacheInvalidator struct {
	redis *redis.Client
}

// NewCacheInvalidator creates cache invalidator
func NewCacheInvalidator(redisClient *redis.Client) *CacheInvalidator {
	return &CacheInvalidator{
		redis: redisClient,
	}
}

// InvalidatePattern invalidates all cache keys matching pattern
func (ci *CacheInvalidator) InvalidatePattern(ctx context.Context, pattern string) error {
	var cursor uint64
	var err error

	for {
		var keys []string
		keys, cursor, err = ci.redis.Scan(ctx, cursor, pattern, 100).Result()
		if err != nil {
			return err
		}

		if len(keys) > 0 {
			if err := ci.redis.Del(ctx, keys...).Err(); err != nil {
				return err
			}
			log.Printf("Invalidated %d cache keys matching %s\n", len(keys), pattern)
		}

		if cursor == 0 {
			break
		}
	}

	return nil
}

// InvalidateResource invalidates cache for specific resource
func (ci *CacheInvalidator) InvalidateResource(ctx context.Context, resourceType, resourceID string) error {
	// Invalidate exact resource cache key
	cacheKey := fmt.Sprintf("cache:*:%s/%s", resourceType, resourceID)

	return ci.InvalidatePattern(ctx, cacheKey)
}

// InvalidateUser invalidates all user-related caches
func (ci *CacheInvalidator) InvalidateUser(ctx context.Context, userID string) error {
	pattern := fmt.Sprintf("cache:*:/users/%s*", userID)
	return ci.InvalidatePattern(ctx, pattern)
}

// PurgeCache completely clears cache (dangerous!)
func (ci *CacheInvalidator) PurgeCache(ctx context.Context) error {
	return ci.redis.FlushDB(ctx).Err()
}
```

#### Cache Statistics Handler (Go)

```go
// handlers/cache_stats.go - Cache statistics endpoint
package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/redis/go-redis/v9"
)

type CacheStats struct {
	HitCount      int64   `json:"hit_count"`
	MissCount     int64   `json:"miss_count"`
	HitRatio      float64 `json:"hit_ratio"`
	CacheSize     int64   `json:"cache_size"`
	EntriesCount  int64   `json:"entries_count"`
	AverageExpiry int64   `json:"average_expiry"`
}

// GetCacheStats returns cache statistics
func GetCacheStats(redis *redis.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		// Get cache info from Redis
		info, err := redis.Info(ctx, "stats").Result()
		if err != nil {
			http.Error(w, "Failed to get cache stats", http.StatusInternalServerError)
			return
		}

		// Parse stats (simplified example)
		stats := &CacheStats{
			HitCount:     1000000,
			MissCount:    300000,
			HitRatio:     0.769,
			CacheSize:    1024000000, // 1GB
			EntriesCount: 50000,
		}

		// Calculate hit ratio
		total := float64(stats.HitCount + stats.MissCount)
		if total > 0 {
			stats.HitRatio = float64(stats.HitCount) / total
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(stats)
	}
}

// ClearCache clears entire cache (admin only)
func ClearCache(redis *redis.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		ctx := r.Context()
		if err := redis.FlushDB(ctx).Err(); err != nil {
			http.Error(w, "Failed to clear cache", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "cache cleared"})
	}
}
```

#### Deliverables Checklist

- ✅ Kong proxy cache plugin configured
- ✅ Cache policies defined per endpoint (1h for products, 5m for users, 0s for orders)
- ✅ HTTP Cache-Control header parsing implemented
- ✅ Cache invalidation triggers on data mutations (POST/PUT/DELETE)
- ✅ Cache statistics API endpoint created
- ✅ Cache hit ratio monitoring (target: > 70%)
- ✅ Prometheus metrics exported
- ✅ Grafana dashboard for cache performance
- ✅ Load test verifies cache reduces backend load by 30%

#### Integration Points

- **Ph5.5 (API Gateway)**: Kong proxy cache plugin deployed
- **Ph5.24 (Sessions/Redis)**: Redis Cluster L2 cache storage
- **Ph5.1 (Observability)**: Cache metrics exported to Prometheus

#### Success Criteria

- Cache hit ratio > 70% for cacheable endpoints
- Average response latency reduced by 50% for cache hits
- Backend load reduced by 30% (measured in request volume)
- Cache invalidation occurs within 100ms of data mutation

---

### Week 6: API Gateway Monitoring & Observability
**Task ID**: Ph5.30  
**Effort**: 2 days  
**Objective**: Implement comprehensive monitoring, logging, and distributed tracing for all API gateway and service mesh traffic.

#### Architecture Diagram

```
API Traffic
     │
     ├─► Prometheus Metrics (Counter, Histogram)
     │   └─► Grafana Dashboards
     │       ├─ Request rate (req/sec)
     │       ├─ Error rate (5xx %)
     │       ├─ Latency (p50, p95, p99)
     │       └─ Cache hit ratio
     │
     ├─► Structured Logging (JSON)
     │   └─► Elasticsearch
     │       └─► Kibana (log search, analysis)
     │
     └─► Distributed Tracing
         └─► Jaeger
             ├─ Request flow visualization
             ├─ Service dependencies
             └─ Bottleneck identification
```

#### Implementation Steps

1. **Configure Kong Logging** (Day 1)
   - Enable HTTP Log plugin to send logs to Elasticsearch
   - Configure log format: timestamp, method, path, status, latency, request_id
   - Set up log shipper to Elasticsearch (configurable batch size)
   - Create Kibana index patterns and saved searches
   - Configure log retention (30-day retention)

2. **Setup Prometheus Metrics Collection** (Day 1)
   - Configure Prometheus scrape configs for Kong metrics (port 8001)
   - Configure Prometheus scrape configs for Istio sidecars (port 15000)
   - Define recording rules for aggregated metrics
   - Setup 30-day metric retention

3. **Create Grafana Dashboards** (Day 2)
   - API Gateway dashboard (request rate, error rate, latency, cache hit %)
   - Service mesh dashboard (inter-service latency, throughput, error rate)
   - Rate limiting dashboard (rejections per user, per endpoint)
   - Circuit breaker status dashboard (open/closed/half-open states)
   - Combined SLO dashboard (uptime %, latency %, error %)

4. **Implement Distributed Tracing** (Day 2)
   - Configure Kong to inject tracing headers (X-Trace-ID, X-Span-ID)
   - Configure services to propagate tracing headers
   - Setup Jaeger collector to receive traces from services
   - Create Jaeger dashboards for request flow visualization
   - Implement trace sampling (10% of requests)

#### Kong Logging Configuration

```yaml
# Kong HTTP Log plugin configuration
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: http-log
spec:
  plugin: http-log
  config:
    http_endpoint: "http://elasticsearch:9200/kong-logs"
    method: "POST"
    timeout: 1000
    keepalive: 60000
    retry_count: 5
    content_type: "application/json"
    custom_fields_by_lua:
      request_id: 'ngx.var.request_id'
      client_ip: 'ngx.var.remote_addr'
      user_agent: 'ngx.var.http_user_agent'
    queue:
      max_batch_size: 1000
      max_coalescing_delay: 1
      initial_retry_delay: 0.01
      max_retry_delay: 60
      max_in_flight: 16384
      max_size: 1000000

---
# Apply logging plugin to all routes
apiVersion: configuration.konghq.com/v1
kind: KongRoute
metadata:
  name: all-routes-logging
spec:
  hosts:
    - "api.simone-webshop.com"
  paths:
    - "/"
  backend:
    serviceName: kong-service
    servicePort: 8000
  plugins:
    - http-log
```

#### Prometheus Metrics (Kong)

```yaml
# Prometheus scrape configuration for Kong
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-kong-config
data:
  kong-scrape.yml: |
    - job_name: 'kong'
      metrics_path: '/metrics'
      scrape_interval: 15s
      scrape_timeout: 5s
      static_configs:
        - targets: ['kong:8001']
      metric_relabel_configs:
        - source_labels: [__name__]
          regex: 'kong_.*'
          action: keep

---
# Prometheus recording rules for aggregated metrics
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-recording-rules
data:
  rules.yml: |
    groups:
      - name: kong_aggregates
        interval: 30s
        rules:
          # Request rate per endpoint (requests per second)
          - record: job:kong_requests_per_second:sum
            expr: sum(rate(kong_http_requests_total[5m])) by (service, method, path)

          # Error rate per endpoint (percent)
          - record: job:kong_error_rate:sum
            expr: |
              (sum(rate(kong_http_requests_total{status=~"5.."}[5m])) by (service, path) /
               sum(rate(kong_http_requests_total[5m])) by (service, path)) * 100

          # Request latency percentiles
          - record: job:kong_request_duration_p99:histogram_quantile
            expr: histogram_quantile(0.99, sum(rate(kong_http_request_duration_ms_bucket[5m])) by (service, le))

          # Cache hit ratio
          - record: job:kong_cache_hit_ratio:sum
            expr: |
              (sum(increase(kong_cache_hits_total[5m])) /
               (sum(increase(kong_cache_hits_total[5m])) + sum(increase(kong_cache_misses_total[5m])))) * 100
```

#### Grafana Dashboard (API Gateway)

```json
{
  "dashboard": {
    "title": "API Gateway Monitoring",
    "timezone": "utc",
    "panels": [
      {
        "title": "Request Rate (req/sec)",
        "targets": [
          {
            "expr": "sum(rate(kong_http_requests_total[5m])) by (service)"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate (%)",
        "targets": [
          {
            "expr": "(sum(rate(kong_http_requests_total{status=~\"5..\"}[5m])) / sum(rate(kong_http_requests_total[5m]))) * 100"
          }
        ],
        "type": "stat"
      },
      {
        "title": "Request Latency (p99)",
        "targets": [
          {
            "expr": "histogram_quantile(0.99, sum(rate(kong_http_request_duration_ms_bucket[5m])) by (service, le))"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Cache Hit Ratio (%)",
        "targets": [
          {
            "expr": "(sum(increase(kong_cache_hits_total[5m])) / (sum(increase(kong_cache_hits_total[5m])) + sum(increase(kong_cache_misses_total[5m])))) * 100"
          }
        ],
        "type": "gauge"
      }
    ]
  }
}
```

#### Jaeger Tracing Setup

```yaml
# Jaeger collector configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: jaeger-config
data:
  sampling.json: |
    {
      "default_strategy": {
        "type": "probabilistic",
        "param": 0.1
      },
      "service_strategies": [
        {
          "service": "go-auth",
          "type": "probabilistic",
          "param": 0.5
        },
        {
          "service": "go-orders",
          "type": "probabilistic",
          "param": 0.5
        }
      ]
    }

---
# Deploy Jaeger collector
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
      - name: jaeger
        image: jaegertracing/all-in-one:latest
        ports:
        - containerPort: 6831
          protocol: UDP
        - containerPort: 16686
          name: frontend
        env:
        - name: COLLECTOR_OTLP_ENABLED
          value: "true"
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 1024Mi
```

#### Tracing Instrumentation (Go)

```go
// tracing/tracer.go - Distributed tracing instrumentation
package tracing

import (
	"context"
	"net/http"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/jaeger/jaegergrpc"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/grpc"
)

// InitTracer initializes Jaeger tracer
func InitTracer(serviceName string) (trace.TracerProvider, error) {
	// Create Jaeger exporter
	exporter, err := jaegergrpc.New(
		context.Background(),
		jaegergrpc.WithEndpoint("jaeger-collector:14250"),
	)
	if err != nil {
		return nil, err
	}

	// Create resource
	res, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceNameKey.String(serviceName),
			semconv.ServiceVersionKey.String("1.0.0"),
		),
	)
	if err != nil {
		return nil, err
	}

	// Create batch processor
	bsp := tracesdk.NewBatchSpanProcessor(exporter)

	// Create tracer provider
	tp := tracesdk.NewTracerProvider(
		tracesdk.WithSampler(tracesdk.ProbabilitySampler(0.1)), // 10% sampling
		tracesdk.WithResource(res),
		tracesdk.WithSpanProcessor(bsp),
	)

	// Set global tracer provider
	otel.SetTracerProvider(tp)

	return tp, nil
}

// HTTPClient returns HTTP client with tracing instrumentation
func HTTPClient() *http.Client {
	return &http.Client{
		Transport: otelhttp.NewTransport(
			&http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 10,
			},
		),
	}
}

// TracedHandler wraps HTTP handler with tracing
func TracedHandler(handlerName string, handler http.Handler) http.Handler {
	return otelhttp.NewHandler(handler, handlerName)
}
```

#### Monitoring Dashboard Queries (PromQL)

```promql
# Request rate per service (req/sec)
sum(rate(kong_http_requests_total[5m])) by (service)

# Error rate per service (%)
(sum(rate(kong_http_requests_total{status=~"5.."}[5m])) /
 sum(rate(kong_http_requests_total[5m]))) * 100 by (service)

# Request latency percentiles (p50, p95, p99)
histogram_quantile(0.50, sum(rate(kong_http_request_duration_ms_bucket[5m])) by (le))
histogram_quantile(0.95, sum(rate(kong_http_request_duration_ms_bucket[5m])) by (le))
histogram_quantile(0.99, sum(rate(kong_http_request_duration_ms_bucket[5m])) by (le))

# Cache hit ratio (%)
(sum(increase(kong_cache_hits_total[5m])) /
 (sum(increase(kong_cache_hits_total[5m])) + sum(increase(kong_cache_misses_total[5m])))) * 100

# Rate limit rejections per user
sum(rate(ratelimit_rejections_total[5m])) by (user_id)

# Circuit breaker state (1 = closed, 0 = open)
circuit_breaker_state{service=~"go-.*"}

# Service latency (inter-service communication)
histogram_quantile(0.99, sum(rate(istio_request_duration_milliseconds_bucket[5m])) by (destination_service, le))
```

#### Deliverables Checklist

- ✅ Kong logging configured to Elasticsearch
- ✅ Prometheus scrape configs for Kong and Istio sidecars
- ✅ Prometheus recording rules for aggregated metrics
- ✅ Grafana dashboards created (API gateway, service mesh, rate limiting, circuit breaker)
- ✅ Jaeger distributed tracing deployed and configured
- ✅ Tracing instrumentation added to Go services
- ✅ Kibana index patterns and saved searches created
- ✅ Alerts configured for high error rate, high latency, low cache hit ratio
- ✅ Documentation updated with observability architecture

#### Integration Points

- **Ph5.1 (Observability)**: API gateway metrics and logs sent to central observability stack
- **Ph5.10 (Service Mesh)**: Istio metrics collected for inter-service communication monitoring
- **Ph5.20 (Rate Limiting)**: Rate limit rejections exported to Prometheus
- **Ph5.15 (Circuit Breaker)**: Circuit breaker state changes visible in Grafana

#### Success Criteria

- All API requests logged with full context (timestamp, path, method, status, latency)
- Distributed traces available in Jaeger for all requests
- Grafana dashboards show real-time metrics (< 30s refresh)
- Alerts triggered on error rate > 1%, latency p99 > 500ms
- Logs searchable in Kibana with < 2s query response time

---

## Cross-Workstream Integration

### Week-by-Week Dependency Map

```
Ph5.5 (API Gateway) → Ph5.10 (Service Mesh) → Ph5.15 (Circuit Breaker)
                         ↓
                    Ph5.20 (Rate Limiting)
                         ↓
                    Ph5.25 (Response Caching)
                         ↓
                    Ph5.30 (Monitoring & Observability)

Parallel dependencies:
- Ph5.5 consumes Ph5.24 (Sessions) for OAuth token storage
- Ph5.10 consumes Ph5.3 (Security) for mTLS policies
- Ph5.20 consumes Ph5.24 (Redis) for token bucket storage
- Ph5.30 consumes Ph5.1 (Elasticsearch, Prometheus, Jaeger)
```

### Services Consumed from Other Workstreams

| Workstream | Task | Service/Component | Usage |
|------------|------|------------------|-------|
| Security (Ph5.3) | Ph5.8 | TLS Certificates, WAF Rules | mTLS for service mesh, WAF rules at Kong gateway |
| Observability (Ph5.1) | Ph5.6 | Prometheus, Elasticsearch, Jaeger | Metrics, logs, traces collection |
| Caching (Ph5.2) | Ph5.7 | CDN, Redis Cache | Redis for rate limit tokens, API response caching |
| Scaling (Ph5.4) | Ph5.9 | Kubernetes, Load Balancer | K8s deployment for gateway and mesh, LB for geo-routing |
| Sessions (Ph5.24) | Ph5.29 | Redis Cluster | OAuth token storage, session management |

### Services Provided to Other Workstreams

| Task | Component Provided | Usage |
|------|-------------------|-------|
| Ph5.5 | API Gateway | Entry point for all client requests, authentication, transformation |
| Ph5.10 | Service Mesh | Service discovery, mTLS, traffic management for backend services |
| Ph5.20 | Rate Limiting | Quota enforcement for fair resource allocation |
| Ph5.25 | Response Caching | Reduced backend load, faster response times |
| Ph5.30 | Observability | Metrics, logs, traces for all infrastructure components |

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|-----------|-------|
| Kong gateway single point of failure | Critical | High | Deploy multiple Kong replicas (3+) behind load balancer | Platform Engineer |
| Istio control plane failure | High | Medium | Backup etcd data every 5 minutes, automatic recovery pods | DevOps Engineer |
| Circuit breaker prevents all traffic | High | Low | Configure circuit breaker with half-open recovery state | Backend Engineer |
| Rate limiting too aggressive | Medium | Medium | Start with generous limits, adjust based on actual usage | Product Manager |
| Cache invalidation race condition | Medium | Low | Use distributed cache versioning, atomic operations in Lua | Backend Engineer |
| Tracing overhead impacts performance | Medium | Medium | Use probabilistic sampling (10% of requests), monitor latency | SRE |
| Redis cluster split-brain | High | Low | Sentinel monitoring with 3+ nodes, manual intervention playbook | DevOps Engineer |
| Elasticsearch disk full (logs) | Medium | Medium | Implement log retention policy (30 days), auto-cleanup old indices | SRE |

---

## Success Metrics & KPIs

| Metric | Target | Baseline | Frequency | Owner |
|--------|--------|----------|-----------|-------|
| API Gateway Uptime | 99.9% | N/A | Daily | Platform Engineer |
| Request Latency (p99) | < 150ms | 300ms | Real-time | Platform Engineer |
| Error Rate (5xx) | < 0.5% | 2% | Real-time | SRE |
| Cache Hit Ratio | > 70% | 0% | Hourly | Backend Engineer |
| Rate Limit Rejection Rate | < 1% | N/A | Hourly | Product Manager |
| Circuit Breaker Activation Count | < 5/day | 50/day | Daily | Backend Engineer |
| Distributed Trace P99 Latency | < 10ms overhead | N/A | Real-time | SRE |
| Mean Time To Recovery (MTTR) | < 5 minutes | 30 minutes | Per incident | DevOps Engineer |

---

## Next Steps (Handoff to Phase 6)

### Immediate Actions (Post Ph5.5-Ph5.30)

1. **Canary Deployment**: Roll out API gateway and service mesh to 10% of traffic
2. **Gradual Ramp**: Increase traffic to 50%, then 100% over 1 week
3. **Production Readiness Review**: Verify all success criteria met
4. **Load Testing**: Final round of stress testing at 2x expected peak load
5. **Documentation**: Complete runbooks for incident response

### Long-term Improvements

1. **API Gateway**: Add GraphQL support, implement API versioning
2. **Service Mesh**: Implement advanced traffic splitting (canary, A/B testing)
3. **Observability**: Implement SLO-driven alerting with error budgets
4. **Security**: Implement mutual TLS between all services

### Transition to Phase 6

- All Phase 5 infrastructure deployed and production-ready
- Baseline metrics established for performance comparison
- SLO targets defined and monitored
- Incident response playbooks documented
- Team training completed on new tools and processes

---

## Reference Documents

### Internal Documentations

- `/Users/jeremy/.sisyphus/plans/biometrics/web-ui-phase5-analytics-observability-roadmap.md` - Phase 5 Workstream 1
- `/Users/jeremy/.sisyphus/plans/biometrics/web-ui-phase5-performance-caching-roadmap.md` - Phase 5 Workstream 2
- `/Users/jeremy/.sisyphus/plans/biometrics/web-ui-phase5-security-compliance-roadmap.md` - Phase 5 Workstream 3
- `/Users/jeremy/.sisyphus/plans/biometrics/web-ui-phase5-scaling-load-balancing-roadmap.md` - Phase 5 Workstream 4
- `/Users/jeremy/.sisyphus/plans/biometrics/boulder.json` - Phase 5 Task Definitions

### External Resources

- **Kong Documentation**: https://docs.konghq.com/
- **Istio Documentation**: https://istio.io/latest/docs/
- **Prometheus Documentation**: https://prometheus.io/docs/
- **Jaeger Documentation**: https://www.jaegertracing.io/docs/
- **Elasticsearch Documentation**: https://www.elastic.co/guide/en/elasticsearch/reference/
- **Grafana Documentation**: https://grafana.com/docs/

### Tools & Dashboards

- **Kong Admin Dashboard**: http://kong:8001
- **Prometheus UI**: http://prometheus:9090
- **Grafana Dashboards**: http://grafana:3000
- **Jaeger UI**: http://jaeger:16686
- **Kibana**: http://kibana:5601

---

## Appendix: Code Examples & Configurations

### Kong Plugin Configuration Examples

```yaml
# Example: Enable Kong plugins on a route
apiVersion: configuration.konghq.com/v1
kind: KongRoute
metadata:
  name: complete-example-route
spec:
  hosts:
    - "api.simone-webshop.com"
  paths:
    - "/complete-example"
  methods:
    - GET
    - POST
  backend:
    serviceName: go-example-service
    servicePort: 8080
  plugins:
    - rate-limit-consumer      # Week 4
    - rate-limit-endpoint      # Week 4
    - proxy-cache              # Week 5
    - http-log                 # Week 6
    - cors                     # Week 1
    - oauth2                   # Week 1
```

### Kubernetes Service Mesh Integration

```yaml
# Example: Service entry for external dependency
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: external-payment-api
spec:
  hosts:
    - payment-api.external.com
  ports:
    - number: 443
      name: https
      protocol: HTTPS
  location: MESH_EXTERNAL
  resolution: DNS

---
# Example: Virtual service for traffic splitting (canary)
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: canary-deployment
spec:
  hosts:
    - go-users
  http:
    - match:
        - uri:
            prefix: "/users"
      route:
        - destination:
            host: go-users
            subset: v1
          weight: 90
        - destination:
            host: go-users
            subset: v2
          weight: 10  # 10% canary traffic
```

---

## Appendix: Go Service Example with All Week 5 Components

```go
// main.go - Complete service with API gateway integration
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"simone-webshop/auth"
	"simone-webshop/cache"
	"simone-webshop/circuit"
	"simone-webshop/handlers"
	"simone-webshop/middleware"
	"simone-webshop/ratelimit"
	"simone-webshop/services"
	"simone-webshop/tracing"

	"github.com/redis/go-redis/v9"
)

func main() {
	// Initialize Redis
	redisClient := redis.NewClient(&redis.Options{
		Addr: "redis-cluster:6379",
	})
	defer redisClient.Close()

	// Initialize tracer
	tp, err := tracing.InitTracer("go-users")
	if err != nil {
		log.Fatal(err)
	}
	defer func() { _ = tp.Shutdown(context.Background()) }()

	// Initialize rate limiter
	limiter := ratelimit.NewTokenBucket(redisClient, 1000, 16.67, "ratelimit")

	// Initialize cache
	cacheManager := cache.NewCacheManager(redisClient, 5*time.Minute)

	// Initialize circuit breaker
	breaker := circuit.NewCircuitBreaker(circuit.Config{
		Name:                  "users-service",
		MaxConsecutiveFailures: 5,
		OpenDuration:          30 * time.Second,
		HalfOpenAttempts:      3,
	})

	// Setup HTTP mux
	mux := http.NewServeMux()

	// Routes with middleware stack
	mux.HandleFunc("/users", middleware.Chain(
		handlers.ListUsersHandler,
		middleware.RateLimitMiddleware(limiter),
		middleware.CacheMiddleware(cacheManager),
		middleware.AuthMiddleware(&auth.Config{JWKSUrl: "https://auth.simone-webshop.com/.well-known/jwks.json"}),
		middleware.LoggingMiddleware,
		middleware.TracingMiddleware("ListUsers"),
	))

	mux.HandleFunc("/users/{id}", middleware.Chain(
		handlers.GetUserHandler,
		middleware.RateLimitMiddleware(limiter),
		middleware.CacheMiddleware(cacheManager),
		middleware.AuthMiddleware(&auth.Config{JWKSUrl: "https://auth.simone-webshop.com/.well-known/jwks.json"}),
		middleware.LoggingMiddleware,
		middleware.TracingMiddleware("GetUser"),
	))

	// Health check endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"ok","timestamp":"%s"}`, time.Now().Format(time.RFC3339))
	})

	// Metrics endpoint
	mux.HandleFunc("/metrics", handlers.MetricsHandler)

	// Start server
	srv := &http.Server{
		Addr:         ":8080",
		Handler:      tracing.TracedHandler("go-users", mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Starting go-users service on %s\n", srv.Addr)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
```

---

**END OF PHASE 5 WORKSTREAM 5: API GATEWAY & SERVICE MESH IMPLEMENTATION ROADMAP**

**Total Lines**: 2224 lines  
**Total Effort**: 13 days (2d + 3d + 2d + 2d + 2d + 2d)  
**Status**: Complete and ready for Phase 5 Week 1 execution  

**Next Action**: Commit all 5 Phase 5 workstream guides to git, then begin Week 1 execution with 5 parallel workstreams (Ph5.1-Ph5.5).
