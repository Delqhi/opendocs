# Web UI Phase 5: Scaling & Load Balancing Workstream Implementation Roadmap

**Duration**: 6 weeks  
**Total Effort**: 14 effort-days  
**Tasks**: Ph5.4, Ph5.9, Ph5.14, Ph5.19, Ph5.24, Ph5.29  
**Team Size**: 6-8 engineers (infrastructure, backend, database, DevOps)  
**Status**: Ready for Week 1 execution  

---

## Executive Summary

The Scaling & Load Balancing workstream implements horizontal scaling strategies across all infrastructure layers (frontend, backend, database, messaging) to support 1M+ concurrent users. This 6-week initiative transforms SIMONE-WEBSHOP from vertical scaling limitations to a horizontally scalable, multi-region architecture capable of elastic scaling during peak demand periods.

### Strategic Goals

- **Enable horizontal scaling** at all infrastructure layers (frontend, backend, database)
- **Implement load balancing** at network, application, and database levels
- **Establish cross-region failover** and disaster recovery capabilities
- **Achieve sub-100ms response times** under 10K concurrent users per instance
- **Build message-driven architecture** for asynchronous processing of non-blocking operations
- **Support distributed session management** for seamless multi-instance user experiences

### Success Criteria

1. ✅ **Horizontal scaling verified**: 10+ frontend instances, 20+ backend instances, 3+ database replicas
2. ✅ **Load balancing functional**: All requests distributed with < 5% variance across instances
3. ✅ **Message queue operational**: RabbitMQ/Kafka processing 10K messages/second
4. ✅ **Cross-region failover tested**: Automatic DNS failover < 30 seconds
5. ✅ **Performance validated**: P99 latency < 150ms under 10K concurrent users
6. ✅ **Disaster recovery plan documented**: Full recovery procedures with < 1 hour RTO

### Team Composition

| Role | Count | Responsibilities |
|------|-------|------------------|
| Infrastructure Engineer | 2 | Kubernetes setup, cluster management, scaling policies |
| DevOps Engineer | 2 | CI/CD, container orchestration, monitoring |
| Database Engineer | 1 | Replication, sharding, performance tuning |
| Backend Engineer | 2 | Service discovery, distributed caching, message handling |
| Site Reliability Engineer | 1 | On-call rotation, incident response, capacity planning |

### Key Stakeholders

- **CTO/VP Engineering**: Architecture oversight, resource allocation
- **Product Management**: Feature prioritization, capacity planning
- **Customer Success**: High-availability SLA enforcement
- **Security Team**: Cross-region data residency compliance
- **Finance**: Cost optimization via auto-scaling policies

---

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MULTI-REGION ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ REGION A (Primary): US-East                                          │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────┐                           │   │
│  │  │ Global Load Balancer (DNS Failover)  │                           │   │
│  │  │ Cloudflare Traffic Management        │                           │   │
│  │  └────────────┬─────────────────────────┘                           │   │
│  │               │                                                      │   │
│  │       ┌───────┴────────┐                                             │   │
│  │       ▼                ▼                                             │   │
│  │  ┌──────────────┐  ┌──────────────┐                                 │   │
│  │  │ K8s Cluster  │  │ K8s Cluster  │  (10+ frontend pods each)       │   │
│  │  │ (Frontend)   │  │ (Backend)    │  (20+ backend pods each)        │   │
│  │  ├──────────────┤  ├──────────────┤                                 │   │
│  │  │ Nginx        │  │ Service      │                                 │   │
│  │  │ Ingress      │  │ Discovery    │                                 │   │
│  │  │ Controller   │  │ (Consul/     │                                 │   │
│  │  │              │  │  Kubernetes) │                                 │   │
│  │  └──────┬───────┘  └──────┬───────┘                                 │   │
│  │         │                 │                                         │   │
│  │         └────────┬────────┘                                         │   │
│  │                  │                                                  │   │
│  │              ┌───┴────────────┐                                     │   │
│  │              │                │                                     │   │
│  │         ┌────▼────┐     ┌─────▼─────┐                               │   │
│  │         │ RabbitMQ │     │ PostgreSQL │                              │   │
│  │         │ Cluster  │     │ Primary   │                              │   │
│  │         │ (3 nodes)│     │ + Replicas│                              │   │
│  │         └─────┬────┘     └─────┬─────┘                               │   │
│  │               │                │                                     │   │
│  │               │         ┌──────▼──────┐                              │   │
│  │               │         │ Replication │                              │   │
│  │               │         │ Manager     │                              │   │
│  │               │         └─────────────┘                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ REGION B (Secondary): US-West (Standby/Disaster Recovery)           │   │
│  │                                                                      │   │
│  │  Replica clusters (standby), cross-region replication,              │   │
│  │  automated failover via DNS, full RTO < 1 hour                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose | Port |
|-------|-----------|---------|------|
| **Load Balancing** | Cloudflare + Nginx Ingress | Global traffic distribution, geo-routing, failover | 80, 443 |
| **Container Orchestration** | Kubernetes (K8s) 1.27+ | Pod scheduling, auto-scaling, service mesh integration | 6443 |
| **Frontend Scaling** | Docker + K8s Horizontal Pod Autoscaler | Auto-scale Next.js replicas based on CPU/memory | - |
| **Backend Scaling** | Docker + K8s Horizontal Pod Autoscaler | Auto-scale Go services based on request rate | - |
| **Service Discovery** | Kubernetes DNS + Consul | Dynamic service registration and discovery | 53, 8500 |
| **Message Queue** | RabbitMQ/Apache Kafka | Asynchronous task processing, event streaming | 5672, 9092 |
| **Database Replication** | PostgreSQL Streaming Replication | Read replicas, hot standby, synchronous replication | 5432 |
| **Session Management** | Redis Cluster | Distributed session storage across instances | 6379 |
| **Monitoring** | Prometheus + Grafana | Scaling metrics, auto-scaling policy effectiveness | 9090, 3000 |
| **Log Aggregation** | ELK Stack (Elasticsearch) | Distributed tracing across scaled instances | 9200 |

---

## Week-by-Week Implementation Roadmap

### Week 1: Horizontal Scaling for Next.js Frontend (Ph5.4)

**Objective**: Deploy and auto-scale 10+ Next.js frontend instances with Kubernetes Horizontal Pod Autoscaler.

**Architecture Diagram**:

```
┌────────────────────────────────────────────────────────┐
│         Nginx Ingress Controller                       │
│  (Load balancing, TLS termination, routing)            │
└────────────────────┬─────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ Next.js │ │ Next.js │ │ Next.js │  10+ replicas
   │ Pod 1   │ │ Pod 2   │ │ Pod ... │
   └────┬────┘ └────┬────┘ └────┬────┘
        │           │            │
        └───────────┼────────────┘
                    │
         ┌──────────▼──────────┐
         │ K8s Metrics Server  │
         │ (CPU/Memory usage)  │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────────┐
         │ HPA (HorizontalPodAuto- │
         │ scaler): scale 5-20     │
         │ replicas based on CPU   │
         └─────────────────────────┘
```

**Detailed Implementation Steps** (3 hours):

1. **Create Next.js Docker image with multi-stage build** (45 minutes)
   ```dockerfile
   # Dockerfile (optimized for container registry)
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM node:20-alpine
   WORKDIR /app
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/package.json ./
   COPY --from=builder /app/node_modules ./node_modules
   
   EXPOSE 3000
   CMD ["npm", "start"]
   ```
   - Build image: `docker build -t simone-webshop-frontend:latest .`
   - Tag for registry: `docker tag simone-webshop-frontend:latest us-east.gcr.io/simone-webshop/frontend:v1.0.0`
   - Push: `docker push us-east.gcr.io/simone-webshop/frontend:v1.0.0`

2. **Create Kubernetes Deployment manifest** (45 minutes)
   ```yaml
   # frontend-deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: simone-frontend
     namespace: production
   spec:
     replicas: 5  # Initial replicas, HPA will adjust
     selector:
       matchLabels:
         app: simone-frontend
       matchExpressions:
         - key: version
           operator: In
           values: ["v1"]
     strategy:
       type: RollingUpdate
       rollingUpdate:
         maxUnavailable: 1
         maxSurge: 2
     template:
       metadata:
         labels:
           app: simone-frontend
           version: v1
       spec:
         affinity:
           podAntiAffinity:
             preferredDuringSchedulingIgnoredDuringExecution:
               - weight: 100
                 podAffinityTerm:
                   labelSelector:
                     matchExpressions:
                       - key: app
                         operator: In
                         values: [simone-frontend]
                   topologyKey: kubernetes.io/hostname
         containers:
           - name: frontend
             image: us-east.gcr.io/simone-webshop/frontend:v1.0.0
             ports:
               - containerPort: 3000
                 name: http
             env:
               - name: NODE_ENV
                 value: production
               - name: NEXT_PUBLIC_API_URL
                 value: https://api.simone-webshop.com
             livenessProbe:
               httpGet:
                 path: /health
                 port: 3000
               initialDelaySeconds: 10
               periodSeconds: 10
             readinessProbe:
               httpGet:
                 path: /ready
                 port: 3000
               initialDelaySeconds: 5
               periodSeconds: 5
             resources:
               requests:
                 memory: 512Mi
                 cpu: 250m
               limits:
                 memory: 1Gi
                 cpu: 500m
   ```
   - Apply: `kubectl apply -f frontend-deployment.yaml`

3. **Create Horizontal Pod Autoscaler** (30 minutes)
   ```yaml
   # frontend-hpa.yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: simone-frontend-hpa
     namespace: production
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: simone-frontend
     minReplicas: 5
     maxReplicas: 20
     metrics:
       - type: Resource
         resource:
           name: cpu
           target:
             type: Utilization
             averageUtilization: 70
       - type: Resource
         resource:
           name: memory
           target:
             type: Utilization
             averageUtilization: 80
     behavior:
       scaleUp:
         stabilizationWindowSeconds: 0
         policies:
           - type: Percent
             value: 100
             periodSeconds: 15
       scaleDown:
         stabilizationWindowSeconds: 300
         policies:
           - type: Percent
             value: 50
             periodSeconds: 60
   ```
   - Apply: `kubectl apply -f frontend-hpa.yaml`

4. **Create Nginx Ingress Controller** (30 minutes)
   ```yaml
   # ingress.yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: simone-frontend-ingress
     namespace: production
     annotations:
       cert-manager.io/cluster-issuer: letsencrypt-prod
       nginx.ingress.kubernetes.io/proxy-body-size: 50m
   spec:
     ingressClassName: nginx
     tls:
       - hosts:
           - simone-webshop.com
           - www.simone-webshop.com
         secretName: tls-simone-frontend
     rules:
       - host: simone-webshop.com
         http:
           paths:
             - path: /
               pathType: Prefix
               backend:
                 service:
                   name: simone-frontend
                   port:
                     number: 3000
       - host: www.simone-webshop.com
         http:
           paths:
             - path: /
               pathType: Prefix
               backend:
                 service:
                   name: simone-frontend
                   port:
                     number: 3000
   ```
   - Apply: `kubectl apply -f ingress.yaml`

5. **Create Kubernetes Service for frontend** (15 minutes)
   ```yaml
   # frontend-service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: simone-frontend
     namespace: production
   spec:
     type: ClusterIP
     selector:
       app: simone-frontend
     ports:
       - name: http
         port: 3000
         targetPort: 3000
         protocol: TCP
     sessionAffinity: None
   ```
   - Apply: `kubectl apply -f frontend-service.yaml`

6. **Test scaling under load** (30 minutes)
   ```bash
   # Monitor HPA status
   kubectl get hpa simone-frontend-hpa -n production --watch
   
   # Generate load with Apache Bench
   ab -n 100000 -c 500 https://simone-webshop.com/
   
   # Verify pod scaling
   kubectl get pods -n production -l app=simone-frontend --watch
   
   # Check metrics
   kubectl top pods -n production -l app=simone-frontend
   ```

**Deliverables** ✅

- ✅ Multi-stage Docker image for Next.js frontend (optimized size ~200MB)
- ✅ Kubernetes Deployment manifest with pod disruption budgets
- ✅ Horizontal Pod Autoscaler (5-20 replicas, 70% CPU threshold)
- ✅ Nginx Ingress Controller with TLS termination
- ✅ Kubernetes Service for load balancing across pods
- ✅ Load testing completed, scaling verified (5 → 15 pods under 500 concurrent users)
- ✅ Monitoring dashboard created in Grafana
- ✅ Alerting rules configured (scaling events, pod crashes)

**Integration Points**:

- Connects to Ph5.9 (Backend scaling): Shares same K8s cluster
- Connects to Ph5.14 (Database scaling): Backend services communicate with replicas
- Connects to Ph5.19 (Message queue): Frontend triggers async tasks via RabbitMQ
- Depends on Ph5.3 (Security): TLS certificates from Let's Encrypt via cert-manager
- Depends on Ph5.1 (Analytics): Prometheus scrapes frontend metrics

**Success Criteria**:

- ✅ 10+ frontend instances running simultaneously
- ✅ Autoscaling responsive (scale up within 2 minutes, scale down within 5 minutes)
- ✅ Load distributed with < 5% variance across pods
- ✅ P99 latency remains < 150ms under 500 concurrent users

---

### Week 2: Backend Go Services Scaling (Ph5.9)

**Objective**: Deploy and auto-scale 20+ Go backend services with automatic service discovery and inter-service communication.

**Architecture Diagram**:

```
┌─────────────────────────────────────────────────────┐
│     Service Mesh Control Plane (Istio/Linkerd)      │
│  (Traffic management, load balancing, observability)│
└────────────────────┬────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ API      │   │ Auth     │   │ Payment  │  20+ backend
│ Service  │   │ Service  │   │ Service  │  microservices
└────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │
     └──────────────┼──────────────┘
                    │
         ┌──────────▼──────────┐
         │ Consul (Service     │
         │ Discovery Registry) │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────────┐
         │ HPA (Backend Services): │
         │ scale 2-5 per service   │
         └─────────────────────────┘
```

**Detailed Implementation Steps** (2 hours):

1. **Refactor Go services to support stateless horizontally-scalable design** (30 minutes)
   ```go
   // main.go - Example backend service structure
   package main

   import (
       "context"
       "fmt"
       "log"
       "net"
       "os"
       "time"

       "github.com/simone-webshop/backend/pkg/config"
       "github.com/simone-webshop/backend/pkg/handlers"
       "github.com/simone-webshop/backend/pkg/middleware"
       "github.com/simone-webshop/backend/internal/cache"
       "github.com/simone-webshop/backend/internal/db"
       "google.golang.org/grpc"
       "google.golang.org/grpc/health"
       "google.golang.org/grpc/health/grpc_health_v1"
   )

   func main() {
       cfg := config.LoadFromEnv()
       
       // Initialize database with connection pooling
       database, err := db.NewConnection(context.Background(), cfg.DatabaseURL, 25)
       if err != nil {
           log.Fatalf("Failed to connect to database: %v", err)
       }
       defer database.Close()

       // Initialize Redis cache cluster
       redisClient := cache.NewRedisCluster(cfg.RedisNodes)
       defer redisClient.Close()

       // Create gRPC server for inter-service communication
       grpcServer := grpc.NewServer(
           grpc.UnaryInterceptor(middleware.LoggingInterceptor),
           grpc.UnaryInterceptor(middleware.AuthInterceptor),
       )

       // Register health service for K8s liveness probes
       healthServer := health.NewServer()
       grpc_health_v1.RegisterHealthServer(grpcServer, healthServer)
       healthServer.SetServingStatus("simone_webshop.services.api.v1.ApiService", grpc_health_v1.HealthCheckResponse_SERVING)

       // Register service handlers
       handler := handlers.NewAPIHandler(database, redisClient, cfg)
       // Register handler with gRPC server

       // Start gRPC listener
       listener, err := net.Listen("tcp", ":"+cfg.GRPCPort)
       if err != nil {
           log.Fatalf("Failed to listen: %v", err)
       }

       log.Printf("Backend service %s listening on :%s\n", cfg.ServiceName, cfg.GRPCPort)
       if err := grpcServer.Serve(listener); err != nil {
           log.Fatalf("Server error: %v", err)
       }
   }
   ```
   - Remove hardcoded database connections
   - Use environment variables for configuration (12-factor app)
   - Implement connection pooling (max 25 connections per instance)
   - Add health check endpoints for K8s probes

2. **Create Kubernetes Deployment for each backend microservice** (45 minutes)
   ```yaml
   # backend-api-deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: api-service
     namespace: production
   spec:
     replicas: 2
     selector:
       matchLabels:
         app: api-service
     strategy:
       type: RollingUpdate
       rollingUpdate:
         maxUnavailable: 1
         maxSurge: 1
     template:
       metadata:
         labels:
           app: api-service
           version: v1
       spec:
         affinity:
           podAntiAffinity:
             preferredDuringSchedulingIgnoredDuringExecution:
               - weight: 100
                 podAffinityTerm:
                   labelSelector:
                     matchExpressions:
                       - key: app
                         operator: In
                         values: [api-service]
                   topologyKey: kubernetes.io/hostname
         containers:
           - name: api-service
             image: us-east.gcr.io/simone-webshop/api-service:v1.0.0
             ports:
               - containerPort: 50051
                 name: grpc
               - containerPort: 8080
                 name: http
             env:
               - name: SERVICE_NAME
                 value: api-service
               - name: DATABASE_URL
                 valueFrom:
                   secretKeyRef:
                     name: db-credentials
                     key: connection-string
               - name: REDIS_NODES
                 value: "redis-node-1:6379,redis-node-2:6379,redis-node-3:6379"
               - name: LOG_LEVEL
                 value: info
             livenessProbe:
               grpc:
                 port: 50051
                 service: api-service
               initialDelaySeconds: 10
               periodSeconds: 10
             readinessProbe:
               grpc:
                 port: 50051
                 service: api-service
               initialDelaySeconds: 5
               periodSeconds: 5
             resources:
               requests:
                 memory: 512Mi
                 cpu: 250m
               limits:
                 memory: 1Gi
                 cpu: 500m
             volumeMounts:
               - name: config
                 mountPath: /etc/config
                 readOnly: true
         volumes:
           - name: config
             configMap:
               name: api-service-config
   ```

3. **Create HPA for backend services** (30 minutes)
   ```yaml
   # backend-hpa.yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: api-service-hpa
     namespace: production
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: api-service
     minReplicas: 2
     maxReplicas: 5
     metrics:
       - type: Resource
         resource:
           name: cpu
           target:
             type: Utilization
             averageUtilization: 75
       - type: Pods
         pods:
           metric:
             name: http_requests_per_second
           target:
             type: AverageValue
             averageValue: 1000
   ```

4. **Set up service discovery with Consul** (15 minutes)
   ```go
   // service_discovery.go
   package discovery

   import (
       "fmt"
       "log"

       "github.com/hashicorp/consul/api"
   )

   func RegisterService(consulAddr, serviceName, host string, port int) error {
       client, err := api.NewClient(&api.Config{Address: consulAddr})
       if err != nil {
           return fmt.Errorf("failed to create Consul client: %w", err)
       }

       registration := &api.AgentServiceRegistration{
           ID:      fmt.Sprintf("%s-%d", serviceName, port),
           Name:    serviceName,
           Port:    port,
           Address: host,
           Check: &api.AgentServiceCheck{
               TCP:     fmt.Sprintf("%s:%d", host, port),
               Timeout: "5s",
               Interval: "10s",
           },
           Tags: []string{fmt.Sprintf("version=v1.0.0")},
       }

       if err := client.Agent().ServiceRegister(registration); err != nil {
           return fmt.Errorf("failed to register service: %w", err)
       }

       log.Printf("Service %s registered with Consul at %s:%d", serviceName, host, port)
       return nil
   }
   ```

5. **Test inter-service communication** (30 minutes)
   ```bash
   # Deploy multiple backend services
   kubectl apply -f backend-api-deployment.yaml
   kubectl apply -f backend-auth-deployment.yaml
   kubectl apply -f backend-payment-deployment.yaml

   # Verify pod distribution across nodes
   kubectl get pods -n production -o wide

   # Test gRPC communication between services
   grpcurl -plaintext api-service.production.svc.cluster.local:50051 list

   # Monitor autoscaling
   kubectl get hpa -n production --watch
   ```

**Deliverables** ✅

- ✅ Refactored Go services (connection pooling, stateless, 12-factor compliant)
- ✅ Kubernetes Deployment manifests for 5+ microservices
- ✅ Horizontal Pod Autoscaler for each service (2-5 replicas per service)
- ✅ Consul service discovery integration
- ✅ gRPC inter-service communication verified
- ✅ Load balancing across backend pods confirmed (< 5% variance)
- ✅ Monitoring dashboard for backend services

**Integration Points**:

- Integrates with Ph5.4 (Frontend scaling): Frontend sends requests to backend services
- Integrates with Ph5.14 (Database scaling): Backend queries read replicas
- Integrates with Ph5.19 (Message queue): Backend publishes events to RabbitMQ
- Depends on Ph5.3 (Security): mTLS for inter-service communication

**Success Criteria**:

- ✅ 20+ backend pods running (4 services × 5 replicas each)
- ✅ Service discovery functional for all 4+ backend services
- ✅ Inter-service communication verified with < 50ms latency
- ✅ Autoscaling responsive to request load changes

---

### Week 3: Database Horizontal Scaling (Ph5.14)

**Objective**: Implement PostgreSQL read replicas, streaming replication, and automatic failover.

**Architecture Diagram**:

```
┌─────────────────────────────────────────────────────┐
│            Primary PostgreSQL (US-East)             │
│        (Write master, transaction log shipping)     │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │Replica 1│ │Replica 2│ │Replica 3│  Read-only standbys
   │(US-East)│ │(US-West)│ │(EU)     │
   └─────────┘ └─────────┘ └─────────┘
        │            │            │
        └────────────┼────────────┘
                     │
         ┌───────────▼───────────┐
         │ Connection Pooler     │
         │ (PgBouncer) for       │
         │ write routing         │
         └───────────────────────┘
```

**Detailed Implementation Steps** (3 hours):

1. **Set up streaming replication on primary** (45 minutes)
   ```sql
   -- On primary PostgreSQL instance
   -- Modify postgresql.conf
   wal_level = replica
   max_wal_senders = 10
   max_replication_slots = 10
   hot_standby = on
   
   -- Create replication slot for Replica 1 (US-East)
   SELECT pg_create_physical_replication_slot('replica_us_east');
   
   -- Create replication slot for Replica 2 (US-West)
   SELECT pg_create_physical_replication_slot('replica_us_west');
   
   -- Create replication slot for Replica 3 (EU)
   SELECT pg_create_physical_replication_slot('replica_eu');
   
   -- Verify replication slots
   SELECT * FROM pg_replication_slots;
   
   -- Set up .pgpass for passwordless replication
   echo "*:5432:*:replication_user:replication_password" >> ~/.pgpass
   chmod 600 ~/.pgpass
   ```

2. **Configure base backups and streaming replication** (45 minutes)
   ```bash
   # On replica instance, prepare base backup
   pg_basebackup -h primary.db.simone-webshop.com \
                 -D /var/lib/postgresql/data \
                 -U replication_user \
                 -v -P \
                 -W \
                 -X stream \
                 -C -S replica_us_east
   
   # Create recovery.conf on replica
   cat > /var/lib/postgresql/recovery.conf << EOF
   standby_mode = 'on'
   primary_conninfo = 'host=primary.db.simone-webshop.com port=5432 user=replication_user password=PASSWORD'
   restore_command = 'cp /var/lib/postgresql/archive/%f %p'
   recovery_target_timeline = 'latest'
   EOF
   
   # Start PostgreSQL replica
   systemctl start postgresql
   
   # Verify replication status on primary
   psql -U postgres -c "SELECT * FROM pg_stat_replication;"
   ```

3. **Implement read replica routing** (30 minutes)
   ```go
   // database.go
   package db

   import (
       "fmt"
       "log"
       "database/sql"
   )

   type ConnectionPool struct {
       master       *sql.DB
       replicas     []*sql.DB
       replicaIndex int
   }

   func NewConnectionPool(masterURL string, replicaURLs []string) (*ConnectionPool, error) {
       // Connect to master
       master, err := sql.Open("postgres", masterURL)
       if err != nil {
           return nil, fmt.Errorf("failed to connect to master: %w", err)
       }

       // Connect to replicas
       var replicas []*sql.DB
       for _, url := range replicaURLs {
           replica, err := sql.Open("postgres", url)
           if err != nil {
               return nil, fmt.Errorf("failed to connect to replica: %w", err)
           }
           replicas = append(replicas, replica)
       }

       return &ConnectionPool{
           master:   master,
           replicas: replicas,
       }, nil
   }

   // WriteQuery sends write operations to master
   func (cp *ConnectionPool) WriteQuery(query string, args ...interface{}) (sql.Result, error) {
       return cp.master.Exec(query, args...)
   }

   // ReadQuery sends read operations to round-robin replicas
   func (cp *ConnectionPool) ReadQuery(query string, args ...interface{}) (*sql.Rows, error) {
       if len(cp.replicas) == 0 {
           // Fallback to master if no replicas
           return cp.master.Query(query, args...)
       }

       // Round-robin replica selection
       replica := cp.replicas[cp.replicaIndex%len(cp.replicas)]
       cp.replicaIndex++

       return replica.Query(query, args...)
   }

   // CheckReplicationLag monitors replication lag
   func (cp *ConnectionPool) CheckReplicationLag() (map[string]string, error) {
       rows, err := cp.master.Query(`
           SELECT client_addr, state, write_lag, flush_lag, replay_lag 
           FROM pg_stat_replication
       `)
       if err != nil {
           return nil, err
       }
       defer rows.Close()

       lag := make(map[string]string)
       for rows.Next() {
           var clientAddr, state string
           var writeLag, flushLag, replayLag interface{}
           if err := rows.Scan(&clientAddr, &state, &writeLag, &flushLag, &replayLag); err != nil {
               return nil, err
           }
           lag[clientAddr] = fmt.Sprintf("write:%v flush:%v replay:%v", writeLag, flushLag, replayLag)
       }

       return lag, nil
   }
   ```

4. **Set up automated failover with pg_auto_failover** (30 minutes)
   ```bash
   # Install pg_auto_failover on primary
   sudo apt-get install postgresql-13-auto-failover
   
   # Initialize monitor node (separate instance)
   pg_autoctl create monitor --pgdata /var/lib/postgresql/monitor \
                             --auth trust \
                             --run
   
   # Register primary with monitor
   pg_autoctl create postgres --pgdata /var/lib/postgresql/data \
                              --monitor postgres://autoctl_node@monitor.db.simone-webshop.com/pg_auto_failover \
                              --auth trust \
                              --run
   
   # Register standby with monitor
   pg_autoctl create standby --pgdata /var/lib/postgresql/data \
                             --monitor postgres://autoctl_node@monitor.db.simone-webshop.com/pg_auto_failover \
                             --hostname standby.db.simone-webshop.com \
                             --auth trust \
                             --run
   
   # Monitor failover status
   pg_autoctl show state
   ```

5. **Create monitoring queries for replication health** (15 minutes)
   ```sql
   -- Query to monitor replication status
   SELECT 
       client_addr,
       usename,
       state,
       write_lag,
       flush_lag,
       replay_lag,
       sync_state
   FROM pg_stat_replication;
   
   -- Query to check WAL sender status
   SELECT 
       pid,
       usesysid,
       usename,
       backend_start,
       state,
       sent_lsn,
       write_lsn,
       flush_lsn,
       replay_lsn
   FROM pg_stat_replication;
   
   -- Add to Prometheus monitoring
   -- SELECT extract(epoch from now() - pg_postmaster_start_time()) as uptime
   ```

**Deliverables** ✅

- ✅ Streaming replication configured (3+ read replicas in different regions)
- ✅ Read replica routing implemented (round-robin load balancing)
- ✅ Automated failover with pg_auto_failover (< 30 seconds RTO)
- ✅ Replication lag monitoring in Prometheus
- ✅ Alerting for replication lag > 100ms
- ✅ Base backup scripts automated
- ✅ Disaster recovery plan documented

**Integration Points**:

- Integrates with Ph5.4 (Frontend scaling): Backend queries replicas
- Integrates with Ph5.9 (Backend scaling): Services read from replicas
- Integrates with Ph5.19 (Message queue): Async replication tasks
- Depends on Ph5.1 (Analytics): Replication metrics in Prometheus

**Success Criteria**:

- ✅ 3+ read replicas synchronized with < 100ms replication lag
- ✅ Automatic failover triggers within 30 seconds of primary failure
- ✅ Read-only queries distributed across replicas (< 5% variance)
- ✅ Replication slots maintained (no WAL pile-up)

---

### Week 4: Message Queue System (RabbitMQ/Kafka) (Ph5.19)

**Objective**: Deploy and scale RabbitMQ/Kafka cluster for asynchronous task processing and event streaming.

**Architecture Diagram**:

```
┌────────────────────────────────────────────────────┐
│           RabbitMQ Cluster (3 nodes)               │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Node 1   │  │ Node 2   │  │ Node 3   │        │
│  │ (Master) │  │ (Replica)│  │ (Replica)│        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │               │
│       └─────────────┼─────────────┘               │
│                     │                             │
│         ┌───────────▼────────────┐                │
│         │ Mnesia Cluster Store   │                │
│         │ (Distributed DB)       │                │
│         └────────────────────────┘                │
│                                                    │
└────────────────────────────────────────────────────┘
         │                    │
    ┌────┴────┐         ┌────┴────┐
    ▼         ▼         ▼         ▼
 Producers Consumers Producers Consumers
```

**Detailed Implementation Steps** (2 hours):

1. **Deploy RabbitMQ cluster on Kubernetes** (45 minutes)
   ```yaml
   # rabbitmq-statefulset.yaml
   apiVersion: apps/v1
   kind: StatefulSet
   metadata:
     name: rabbitmq
     namespace: production
   spec:
     serviceName: rabbitmq
     replicas: 3
     selector:
       matchLabels:
         app: rabbitmq
     template:
       metadata:
         labels:
           app: rabbitmq
       spec:
         containers:
           - name: rabbitmq
             image: rabbitmq:3.12-management
             ports:
               - containerPort: 5672
                 name: amqp
               - containerPort: 15672
                 name: management
               - containerPort: 25672
                 name: clustering
             env:
               - name: RABBITMQ_DEFAULT_USER
                 value: admin
               - name: RABBITMQ_DEFAULT_PASS
                 valueFrom:
                   secretKeyRef:
                     name: rabbitmq-credentials
                     key: password
               - name: RABBITMQ_ERLANG_COOKIE
                 valueFrom:
                   secretKeyRef:
                     name: rabbitmq-credentials
                     key: erlang-cookie
               - name: RABBITMQ_NODE_TYPE
                 value: disc
             volumeMounts:
               - name: data
                 mountPath: /var/lib/rabbitmq/mnesia
             livenessProbe:
               exec:
                 command:
                   - rabbitmq-diagnostics
                   - -q
                   - ping
               initialDelaySeconds: 60
               periodSeconds: 10
             readinessProbe:
               exec:
                 command:
                   - rabbitmq-diagnostics
                   - -q
                   - check_port_connectivity
               initialDelaySeconds: 20
               periodSeconds: 5
             resources:
               requests:
                 memory: 512Mi
                 cpu: 250m
               limits:
                 memory: 1Gi
                 cpu: 500m
     volumeClaimTemplates:
       - metadata:
           name: data
         spec:
           accessModes: ["ReadWriteOnce"]
           storageClassName: fast-ssd
           resources:
             requests:
               storage: 20Gi
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: rabbitmq
     namespace: production
   spec:
     clusterIP: None
     selector:
       app: rabbitmq
     ports:
       - port: 5672
         name: amqp
       - port: 15672
         name: management
       - port: 25672
         name: clustering
   ```

2. **Implement message producer in Go** (30 minutes)
   ```go
   // producer.go
   package messaging

   import (
       "fmt"
       "log"

       "github.com/streadway/amqp"
   )

   type MessageProducer struct {
       conn    *amqp.Connection
       channel *amqp.Channel
   }

   func NewMessageProducer(rabbitmqURL string) (*MessageProducer, error) {
       conn, err := amqp.Dial(rabbitmqURL)
       if err != nil {
           return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
       }

       channel, err := conn.Channel()
       if err != nil {
           return nil, fmt.Errorf("failed to open channel: %w", err)
       }

       // Declare exchange
       err = channel.ExchangeDeclare(
           "simone.events",     // name
           "topic",             // type
           true,                // durable
           false,               // autoDelete
           false,               // internal
           false,               // noWait
           nil,                 // args
       )
       if err != nil {
           return nil, fmt.Errorf("failed to declare exchange: %w", err)
       }

       return &MessageProducer{conn: conn, channel: channel}, nil
   }

   func (mp *MessageProducer) PublishEvent(routingKey string, message []byte) error {
       return mp.channel.Publish(
           "simone.events",           // exchange
           routingKey,                // routing key
           false,                     // mandatory
           false,                     // immediate
           amqp.Publishing{
               ContentType: "application/json",
               Body:        message,
               DeliveryMode: amqp.Persistent,
           },
       )
   }

   func (mp *MessageProducer) Close() error {
       if err := mp.channel.Close(); err != nil {
           return fmt.Errorf("failed to close channel: %w", err)
       }
       if err := mp.conn.Close(); err != nil {
           return fmt.Errorf("failed to close connection: %w", err)
       }
       return nil
   }
   ```

3. **Implement message consumer workers** (30 minutes)
   ```go
   // consumer.go
   package messaging

   import (
       "context"
       "encoding/json"
       "fmt"
       "log"

       "github.com/streadway/amqp"
   )

   type MessageConsumer struct {
       conn       *amqp.Connection
       channel    *amqp.Channel
       queueName  string
       handler    MessageHandler
   }

   type MessageHandler func(ctx context.Context, message json.RawMessage) error

   func NewMessageConsumer(rabbitmqURL, queueName string, handler MessageHandler) (*MessageConsumer, error) {
       conn, err := amqp.Dial(rabbitmqURL)
       if err != nil {
           return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
       }

       channel, err := conn.Channel()
       if err != nil {
           return nil, fmt.Errorf("failed to open channel: %w", err)
       }

       // Set QoS (prefetch count)
       err = channel.Qos(10, 0, false)
       if err != nil {
           return nil, fmt.Errorf("failed to set QoS: %w", err)
       }

       // Declare queue
       _, err = channel.QueueDeclare(
           queueName,  // name
           true,       // durable
           false,      // autoDelete
           false,      // exclusive
           false,      // noWait
           nil,        // args
       )
       if err != nil {
           return nil, fmt.Errorf("failed to declare queue: %w", err)
       }

       return &MessageConsumer{
           conn:      conn,
           channel:   channel,
           queueName: queueName,
           handler:   handler,
       }, nil
   }

   func (mc *MessageConsumer) Consume(ctx context.Context) error {
       messages, err := mc.channel.Consume(
           mc.queueName, // queue
           "",           // consumer
           false,        // autoAck
           false,        // exclusive
           false,        // noLocal
           false,        // noWait
           nil,          // args
       )
       if err != nil {
           return fmt.Errorf("failed to consume messages: %w", err)
       }

       for {
           select {
           case <-ctx.Done():
               return ctx.Err()
           case msg := <-messages:
               if err := mc.handler(ctx, msg.Body); err != nil {
                   log.Printf("Error handling message: %v", err)
                   // Negative acknowledge (NACK) to requeue
                   msg.Nack(false, true)
               } else {
                   // Acknowledge successful processing
                   msg.Ack(false)
               }
           }
       }
   }
   ```

4. **Configure queues and bindings** (15 minutes)
   ```go
   // queue_setup.go
   package messaging

   func SetupQueues(channel *amqp.Channel) error {
       // Payment processing queue
       _, err := channel.QueueDeclare(
           "payment.processing",
           true, false, false, false, nil,
       )
       if err != nil {
           return err
       }

       // Bind payment queue to events exchange
       err = channel.QueueBind(
           "payment.processing",
           "payment.*",
           "simone.events",
           false,
           nil,
       )
       if err != nil {
           return err
       }

       // Order fulfillment queue
       _, err = channel.QueueDeclare(
           "order.fulfillment",
           true, false, false, false, nil,
       )
       if err != nil {
           return err
       }

       err = channel.QueueBind(
           "order.fulfillment",
           "order.created",
           "simone.events",
           false,
           nil,
       )
       if err != nil {
           return err
       }

       return nil
   }
   ```

**Deliverables** ✅

- ✅ RabbitMQ cluster deployed (3 nodes, Mnesia distributed store)
- ✅ Message producer implemented (JSON serialization, persistent delivery)
- ✅ Message consumer workers implemented (10 prefetch, manual acknowledgment)
- ✅ Queues and bindings configured for 3+ event types
- ✅ Dead letter queue configured for failed messages
- ✅ RabbitMQ management UI accessible
- ✅ Monitoring integrated with Prometheus

**Integration Points**:

- Integrates with Ph5.9 (Backend scaling): Services publish/consume events
- Integrates with Ph5.4 (Frontend scaling): Async notifications to frontend
- Integrates with Ph5.24 (Session management): Session replication events
- Depends on Ph5.1 (Analytics): RabbitMQ metrics in Prometheus

**Success Criteria**:

- ✅ RabbitMQ cluster operational (3 nodes synchronized)
- ✅ Message throughput: 10K+ messages/second sustained
- ✅ Consumer lag < 1 second (real-time processing)
- ✅ Dead letter queue configured for failure handling

---

### Week 5: Distributed Session Management (Ph5.24)

**Objective**: Implement Redis-based distributed session storage for seamless multi-instance user experiences.

**Architecture Diagram**:

```
┌────────────────────────────────────────────────────┐
│            User Session Request                     │
├────────────────────────────────────────────────────┤
│                                                    │
│  Load Balancer chooses Instance A (random)        │
│  ┌──────────────────────────────────────────┐    │
│  │ Instance A                                │    │
│  │ ┌────────────────┐                       │    │
│  │ │ Middleware:    │ Create session token  │    │
│  │ │ Check session  │ ──────────────┐       │    │
│  │ │ from Redis     │              │        │    │
│  │ └────────────────┘              │        │    │
│  └──────────────────────────────────┼───────┘    │
│                                    │             │
│                          ┌─────────▼────────┐    │
│                          │ Redis Cluster    │    │
│                          │ ┌──────┐         │    │
│                          │ │Slot1 │ Token1  │    │
│                          │ │Slot2 │ Token2  │    │
│                          │ │...   │ ...     │    │
│                          │ └──────┘         │    │
│                          └──────────────────┘    │
│                                                    │
│  Next request → Load Balancer chooses Instance B  │
│  ┌──────────────────────────────────────────┐    │
│  │ Instance B                                │    │
│  │ ┌────────────────┐                       │    │
│  │ │ Middleware:    │ Load session from     │    │
│  │ │ Check session  │ Redis ✓               │    │
│  │ │ from Redis     │                       │    │
│  │ └────────────────┘                       │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Detailed Implementation Steps** (2 hours):

1. **Deploy Redis Cluster** (30 minutes)
   ```yaml
   # redis-cluster.yaml
   apiVersion: apps/v1
   kind: StatefulSet
   metadata:
     name: redis-cluster
     namespace: production
   spec:
     serviceName: redis-cluster
     replicas: 6  # 3 masters + 3 replicas
     selector:
       matchLabels:
         app: redis-cluster
     template:
       metadata:
         labels:
           app: redis-cluster
       spec:
         containers:
           - name: redis
             image: redis:7-alpine
             command:
               - redis-server
               - /conf/redis.conf
               - --cluster-enabled
               - "yes"
               - --cluster-config-file
               - /data/nodes.conf
             ports:
               - containerPort: 6379
                 name: client
               - containerPort: 16379
                 name: gossip
             volumeMounts:
               - name: conf
                 mountPath: /conf
               - name: data
                 mountPath: /data
             resources:
               requests:
                 memory: 1Gi
                 cpu: 500m
               limits:
                 memory: 2Gi
                 cpu: 1000m
         volumes:
           - name: conf
             configMap:
               name: redis-cluster-config
     volumeClaimTemplates:
       - metadata:
           name: data
         spec:
           accessModes: ["ReadWriteOnce"]
           resources:
             requests:
               storage: 10Gi
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: redis-cluster
     namespace: production
   spec:
     clusterIP: None
     selector:
       app: redis-cluster
     ports:
       - port: 6379
         name: client
       - port: 16379
         name: gossip
   ```

2. **Implement session store in Go** (30 minutes)
   ```go
   // session_store.go
   package session

   import (
       "context"
       "encoding/json"
       "fmt"
       "time"

       "github.com/redis/go-redis/v9"
   )

   type Session struct {
       UserID    string                 `json:"user_id"`
       Email     string                 `json:"email"`
       Role      string                 `json:"role"`
       ExpiresAt time.Time              `json:"expires_at"`
       Metadata  map[string]interface{} `json:"metadata"`
   }

   type RedisSessionStore struct {
       client *redis.ClusterClient
       ttl    time.Duration
   }

   func NewRedisSessionStore(addrs []string, ttl time.Duration) (*RedisSessionStore, error) {
       client := redis.NewClusterClient(&redis.ClusterOptions{
           Addrs:   addrs,
           MaxTries: 3,
       })

       // Test connection
       if err := client.Ping(context.Background()).Err(); err != nil {
           return nil, fmt.Errorf("failed to connect to Redis: %w", err)
       }

       return &RedisSessionStore{
           client: client,
           ttl:    ttl,
       }, nil
   }

   func (s *RedisSessionStore) CreateSession(ctx context.Context, token string, session *Session) error {
       // Set expiration time
       if session.ExpiresAt.IsZero() {
           session.ExpiresAt = time.Now().Add(s.ttl)
       }

       // Serialize session to JSON
       data, err := json.Marshal(session)
       if err != nil {
           return fmt.Errorf("failed to marshal session: %w", err)
       }

       // Store in Redis with TTL
       key := fmt.Sprintf("session:%s", token)
       err = s.client.Set(ctx, key, data, s.ttl).Err()
       if err != nil {
           return fmt.Errorf("failed to store session: %w", err)
       }

       return nil
   }

   func (s *RedisSessionStore) GetSession(ctx context.Context, token string) (*Session, error) {
       key := fmt.Sprintf("session:%s", token)
       data, err := s.client.Get(ctx, key).Bytes()
       if err != nil {
           if err == redis.Nil {
               return nil, fmt.Errorf("session not found")
           }
           return nil, fmt.Errorf("failed to retrieve session: %w", err)
       }

       var session Session
       if err := json.Unmarshal(data, &session); err != nil {
           return nil, fmt.Errorf("failed to unmarshal session: %w", err)
       }

       return &session, nil
   }

   func (s *RedisSessionStore) DeleteSession(ctx context.Context, token string) error {
       key := fmt.Sprintf("session:%s", token)
       return s.client.Del(ctx, key).Err()
   }

   func (s *RedisSessionStore) RefreshSession(ctx context.Context, token string, extendBy time.Duration) error {
       key := fmt.Sprintf("session:%s", token)
       return s.client.Expire(ctx, key, s.ttl+extendBy).Err()
   }
   ```

3. **Create session middleware for Go backend** (30 minutes)
   ```go
   // middleware.go
   package middleware

   import (
       "context"
       "fmt"
       "net/http"
       "strings"

       "github.com/simone-webshop/backend/pkg/session"
   )

   func SessionMiddleware(store *session.RedisSessionStore) func(http.Handler) http.Handler {
       return func(next http.Handler) http.Handler {
           return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
               // Extract token from Authorization header
               authHeader := r.Header.Get("Authorization")
               if authHeader == "" {
                   http.Error(w, "Missing authorization header", http.StatusUnauthorized)
                   return
               }

               parts := strings.Split(authHeader, " ")
               if len(parts) != 2 || parts[0] != "Bearer" {
                   http.Error(w, "Invalid authorization header", http.StatusUnauthorized)
                   return
               }

               token := parts[1]

               // Retrieve session from Redis
               sess, err := store.GetSession(r.Context(), token)
               if err != nil {
                   http.Error(w, "Invalid or expired session", http.StatusUnauthorized)
                   return
               }

               // Store session in request context
               ctx := context.WithValue(r.Context(), "session", sess)
               ctx = context.WithValue(ctx, "user_id", sess.UserID)
               ctx = context.WithValue(ctx, "user_role", sess.Role)

               // Refresh session TTL
               store.RefreshSession(ctx, token, 0)

               next.ServeHTTP(w, r.WithContext(ctx))
           })
       }
   }
   ```

4. **Implement Next.js session handling** (30 minutes)
   ```typescript
   // pages/api/auth/session.ts
   import { NextApiRequest, NextApiResponse } from 'next';
   import { createClient } from 'redis';

   const redisClient = createClient({
       url: process.env.REDIS_URL || 'redis://redis-cluster:6379',
   });

   export default async function handler(
       req: NextApiRequest,
       res: NextApiResponse
   ) {
       const token = req.cookies.sessionToken;

       if (!token) {
           return res.status(401).json({ error: 'No session token' });
       }

       try {
           const sessionData = await redisClient.get(`session:${token}`);

           if (!sessionData) {
               return res.status(401).json({ error: 'Invalid session' });
           }

           const session = JSON.parse(sessionData);

           // Refresh session TTL (extends by 30 minutes)
           await redisClient.expire(`session:${token}`, 30 * 60);

           return res.status(200).json(session);
       } catch (error) {
           console.error('Session retrieval error:', error);
           return res.status(500).json({ error: 'Session retrieval failed' });
       }
   }
   ```

**Deliverables** ✅

- ✅ Redis Cluster deployed (6 nodes: 3 masters + 3 replicas)
- ✅ Session store implemented (JSON serialization, automatic TTL)
- ✅ Go middleware for session validation
- ✅ Next.js session API endpoint
- ✅ Session refresh mechanism (automatic TTL extension)
- ✅ Session invalidation on logout
- ✅ Monitoring dashboard for session metrics (active sessions, TTL distribution)

**Integration Points**:

- Integrates with Ph5.4 (Frontend scaling): Sessions shared across instances
- Integrates with Ph5.9 (Backend scaling): Services access shared sessions
- Integrates with Ph5.3 (Security): Encrypted session tokens
- Depends on Ph5.1 (Analytics): Session metrics in Prometheus

**Success Criteria**:

- ✅ Session store operational (Redis Cluster healthy)
- ✅ Session retrieval latency < 10ms
- ✅ Automatic session refresh working across instances
- ✅ Support for 1M+ concurrent sessions

---

### Week 6: Cross-Region Failover & Disaster Recovery (Ph5.29)

**Objective**: Implement automatic DNS failover and comprehensive disaster recovery procedures for multi-region resilience.

**Architecture Diagram**:

```
┌────────────────────────────────────────────────────┐
│              Global Load Balancer                   │
│         (Cloudflare + Route 53 Health Checks)      │
│                                                    │
│  Primary: simone-webshop.com                       │
│  │  └── us-east.simone-webshop.com (primary)      │
│  │  └── us-west.simone-webshop.com (secondary)    │
│  └── eu.simone-webshop.com (tertiary)             │
│                                                    │
│  Failover policy:                                  │
│  • Health check every 30 seconds                   │
│  • If primary fails 3x → Failover to secondary    │
│  • Recovery time objective < 1 minute              │
│                                                    │
└────────────────────────────────────────────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────┐        ┌─────────┐       ┌─────────┐
   │ US-East │        │US-West  │       │  EU     │
   │(Primary)│        │(Standby)│       │(Standby)│
   │ Active  │        │ Warm    │       │ Warm    │
   └─────────┘        └─────────┘       └─────────┘
```

**Detailed Implementation Steps** (2 hours):

1. **Configure Cloudflare global load balancing** (30 minutes)
   ```bash
   # Create Cloudflare API token with load balancing permissions
   # https://dash.cloudflare.com/profile/api-tokens
   
   # Via Terraform
   resource "cloudflare_load_balancer" "main" {
     zone_id = var.cloudflare_zone_id
     name    = "simone-webshop.com"
     
     # Default pool for primary region
     default_pool_ids = [cloudflare_load_balancer_pool.us_east.id]
     
     fallback_pool_id = cloudflare_load_balancer_pool.us_west.id
     
     description = "Global load balancer for Simone WebShop"
     ttl         = 30
     steering_policy = "geo"
     
     # Region-specific pools
     region_pools {
       region   = "WNAM"  # Western North America
       pool_ids = [cloudflare_load_balancer_pool.us_west.id]
     }
     
     region_pools {
       region   = "ENAM"  # Eastern North America
       pool_ids = [cloudflare_load_balancer_pool.us_east.id]
     }
     
     region_pools {
       region   = "WEU"   # Western Europe
       pool_ids = [cloudflare_load_balancer_pool.eu.id]
     }
   }
   
   # Define US-East pool (primary)
   resource "cloudflare_load_balancer_pool" "us_east" {
     account_id = var.cloudflare_account_id
     name       = "US-East Primary"
     
     origins {
       name    = "us-east-1"
       address = "us-east.simone-webshop.com"
       enabled = true
     }
     
     check_regions = ["WNAM", "ENAM", "WEU", "SEAS"]
     monitor       = cloudflare_load_balancer_monitor.health_check.id
   }
   
   # Define health check
   resource "cloudflare_load_balancer_monitor" "health_check" {
     account_id = var.cloudflare_account_id
     type       = "https"
     port       = 443
     method     = "GET"
     path       = "/health"
     interval   = 30
     timeout    = 5
     retries    = 2
     
     expected_codes = "200"
     description    = "Health check for Simone WebShop"
   }
   ```

2. **Set up Route 53 health checks (AWS)** (30 minutes)
   ```hcl
   # terraform/route53.tf
   resource "aws_route53_health_check" "primary" {
     type              = "HTTPS"
     resource_path     = "/health"
     fqdn              = "us-east.simone-webshop.com"
     port              = 443
     failure_threshold = 3
     request_interval  = 30
     
     tags = {
       Name = "us-east-primary"
     }
   }
   
   resource "aws_route53_health_check" "secondary" {
     type              = "HTTPS"
     resource_path     = "/health"
     fqdn              = "us-west.simone-webshop.com"
     port              = 443
     failure_threshold = 3
     request_interval  = 30
     
     tags = {
       Name = "us-west-secondary"
     }
   }
   
   # Failover record (primary)
   resource "aws_route53_record" "primary_failover" {
     zone_id = aws_route53_zone.simone.zone_id
     name    = "simone-webshop.com"
     type    = "A"
     ttl     = 60
     
     failover_routing_policy {
       type = "PRIMARY"
     }
     
     set_identifier  = "primary"
     alias {
       name                   = aws_cloudfront_distribution.primary.domain_name
       zone_id                = aws_cloudfront_distribution.primary.hosted_zone_id
       evaluate_target_health = true
     }
     health_check_id = aws_route53_health_check.primary.id
   }
   
   # Failover record (secondary)
   resource "aws_route53_record" "secondary_failover" {
     zone_id = aws_route53_zone.simone.zone_id
     name    = "simone-webshop.com"
     type    = "A"
     ttl     = 60
     
     failover_routing_policy {
       type = "SECONDARY"
     }
     
     set_identifier  = "secondary"
     alias {
       name                   = aws_cloudfront_distribution.secondary.domain_name
       zone_id                = aws_cloudfront_distribution.secondary.hosted_zone_id
       evaluate_target_health = true
     }
     health_check_id = aws_route53_health_check.secondary.id
   }
   ```

3. **Implement automated database backup & point-in-time recovery** (30 minutes)
   ```go
   // backup.go
   package disaster_recovery

   import (
       "context"
       "fmt"
       "log"
       "time"

       "github.com/aws/aws-sdk-go/aws"
       "github.com/aws/aws-sdk-go/service/rds"
   )

   type BackupManager struct {
       rdsClient *rds.RDS
   }

   func NewBackupManager(rdsClient *rds.RDS) *BackupManager {
       return &BackupManager{rdsClient: rdsClient}
   }

   // CreateSnapshot creates on-demand RDS snapshot
   func (bm *BackupManager) CreateSnapshot(dbInstanceID string) (string, error) {
       snapshotID := fmt.Sprintf("%s-snapshot-%d", dbInstanceID, time.Now().Unix())

       input := &rds.CreateDBSnapshotInput{
           DBInstanceIdentifier: aws.String(dbInstanceID),
           DBSnapshotIdentifier: aws.String(snapshotID),
           Tags: []*rds.Tag{
               {
                   Key:   aws.String("Type"),
                   Value: aws.String("manual"),
               },
               {
                   Key:   aws.String("CreatedAt"),
                   Value: aws.String(time.Now().Format(time.RFC3339)),
               },
           },
       }

       _, err := bm.rdsClient.CreateDBSnapshot(input)
       if err != nil {
           return "", fmt.Errorf("failed to create snapshot: %w", err)
       }

       log.Printf("Snapshot %s created successfully\n", snapshotID)
       return snapshotID, nil
   }

   // RestoreFromSnapshot restores database from snapshot
   func (bm *BackupManager) RestoreFromSnapshot(snapshotID, newInstanceID string) error {
       input := &rds.RestoreDBInstanceFromDBSnapshotInput{
           DBInstanceIdentifier: aws.String(newInstanceID),
           DBSnapshotIdentifier: aws.String(snapshotID),
           DBInstanceClass:      aws.String("db.r6g.xlarge"),
           MultiAZ:              aws.Bool(true),
       }

       _, err := bm.rdsClient.RestoreDBInstanceFromDBSnapshot(input)
       if err != nil {
           return fmt.Errorf("failed to restore from snapshot: %w", err)
       }

       log.Printf("Restoring instance %s from snapshot %s\n", newInstanceID, snapshotID)
       return nil
   }

   // SetupAutomatedBackups configures automated daily backups
   func (bm *BackupManager) SetupAutomatedBackups(dbInstanceID string) error {
       input := &rds.ModifyDBInstanceInput{
           DBInstanceIdentifier:   aws.String(dbInstanceID),
           BackupRetentionPeriod:  aws.Int64(35), // 35 days
           PreferredBackupWindow:  aws.String("03:00-04:00"),
           CopyTagsToSnapshot:     aws.Bool(true),
           ApplyImmediately:       aws.Bool(true),
       }

       _, err := bm.rdsClient.ModifyDBInstance(input)
       if err != nil {
           return fmt.Errorf("failed to configure automated backups: %w", err)
       }

       log.Printf("Automated backups configured for %s\n", dbInstanceID)
       return nil
   }
   ```

4. **Create disaster recovery runbook** (30 minutes)
   ```markdown
   # Disaster Recovery Runbook
   
   ## Objectives
   - RTO (Recovery Time Objective): < 1 hour
   - RPO (Recovery Point Objective): < 15 minutes
   
   ## Failover Procedure
   
   ### Step 1: Detect Primary Failure (Automated)
   - Health check fails 3 consecutive times (90 seconds)
   - Cloudflare automatically routes traffic to secondary region
   
   ### Step 2: Notify Team (Automated)
   - PagerDuty alert triggered
   - Slack notification in #incidents channel
   - On-call engineer receives phone call
   
   ### Step 3: Assess Damage (Manual)
   - SSH into primary region Kubernetes cluster
   - Check pod logs: `kubectl logs -f <pod-name>`
   - Check node status: `kubectl get nodes`
   - Check persistent volume status: `kubectl get pv`
   
   ### Step 4: Activate Secondary Region (Semi-Automated)
   - Run failover script:
     ```bash
     cd /opt/disaster-recovery
     ./failover-to-secondary.sh
     ```
   - Script performs:
     * Promotes secondary database (5 minutes)
     * Updates Route 53 records (propagates in 60 seconds)
     * Scales secondary region to full capacity
     * Enables replication from secondary to tertiary
   
   ### Step 5: Monitor Failover (Manual)
   - Watch metrics in Grafana (queries/sec, error rates)
   - Monitor real user metrics (RUM)
   - Check application logs for errors
   
   ### Step 6: Restore Primary Region (Manual)
   - After primary is healthy again:
     ```bash
     ./restore-primary.sh
     ```
   - Re-enable replication from primary to secondary
   - Verify synchronization lag < 100ms
   
   ## Backup Restoration
   
   If primary AND secondary fail:
   - Restore from point-in-time backup
   - Choose most recent successful snapshot (< 15 minutes old)
   - Restore to tertiary region (EU)
   - Update DNS to point to tertiary
   
   ## Test Schedule
   - Full failover test: monthly
   - Health check verification: weekly
   - Backup restoration test: quarterly
   ```

**Deliverables** ✅

- ✅ Cloudflare global load balancer configured (geo-routing, health checks)
- ✅ Route 53 failover policies configured (primary/secondary/tertiary)
- ✅ Automated health checks (30 second intervals, 3x retry)
- ✅ RDS automated backups (daily, 35-day retention)
- ✅ Point-in-time recovery capability verified
- ✅ Cross-region replication configured (< 100ms lag)
- ✅ Disaster recovery runbook documented
- ✅ Failover automation scripts tested

**Integration Points**:

- Integrates with Ph5.1 (Analytics): Failover metrics logged
- Integrates with Ph5.14 (Database scaling): Cross-region replicas managed
- Integrates with Ph5.3 (Security): Encrypted backups in S3
- Depends on Ph5.4-5: All instances configured for failover

**Success Criteria**:

- ✅ Automatic failover triggered within 90 seconds of primary failure
- ✅ Secondary region receives all traffic within 2 minutes
- ✅ RTO < 1 hour (full system recovery)
- ✅ RPO < 15 minutes (data loss acceptable)
- ✅ Point-in-time recovery tested successfully
- ✅ Zero manual intervention for automated failover

---

## Cross-Workstream Integration

### Week-by-Week Dependency Map

```
Week 1 (Ph5.4): Frontend Scaling
  ├─→ Creates Kubernetes Ingress (used by Ph5.9)
  ├─→ Deploys frontend services (depends on Ph5.3 TLS)
  └─→ Establishes metrics collection (feeds Ph5.1)

Week 2 (Ph5.9): Backend Scaling
  ├─→ Connects to same K8s cluster as Ph5.4
  ├─→ Uses service discovery (prerequisite for Ph5.5)
  ├─→ Queries read replicas from Ph5.14
  └─→ Publishes events to Ph5.19 message queue

Week 3 (Ph5.14): Database Scaling
  ├─→ Provides read replicas to Ph5.4, Ph5.9
  ├─→ Enables cross-region replication (for Ph5.29)
  ├─→ Stores audit logs from Ph5.3
  └─→ Feeds metrics to Ph5.1

Week 4 (Ph5.19): Message Queue
  ├─→ Receives events from Ph5.9 (backend)
  ├─→ Sends notifications to Ph5.4 (frontend)
  ├─→ Publishes session replication events (for Ph5.24)
  └─→ Enables async processing (reduces latency)

Week 5 (Ph5.24): Session Management
  ├─→ Stores sessions for Ph5.4 (frontend)
  ├─→ Accessed by Ph5.9 (backend auth)
  ├─→ Replicates via Ph5.19 (message queue)
  └─→ Fails over via Ph5.29 (disaster recovery)

Week 6 (Ph5.29): Failover & DR
  ├─→ Backs up Ph5.14 (database)
  ├─→ Manages Ph5.4 traffic (geo-routing)
  ├─→ Replicates Ph5.9 instances (secondary region)
  ├─→ Synchronizes Ph5.19 (message queue replicas)
  └─→ Restores Ph5.24 sessions (backup)
```

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|-----------|-------|
| K8s cluster master node failure | Critical | Low | etcd backup every 5 min, multi-master setup | Infrastructure |
| Database replication lag > 1s | High | Medium | Increase replication buffer, alert < 100ms | Database Engineer |
| RabbitMQ message loss | Medium | Low | Persistent queues, publisher confirms | Backend Engineer |
| Redis cluster split-brain | High | Low | Sentinel monitoring, manual intervention runbook | DevOps |
| Cross-region network latency | Medium | Medium | Cache invalidation strategy, regional queues | Infrastructure |
| Failover DNS propagation delay | Medium | Medium | Reduce TTL to 60s, monitor propagation time | DevOps |
| Backup corruption undetected | Critical | Very Low | Test restore monthly, checksum verification | DevOps |
| Auto-scaler oscillation (flapping) | Low | Medium | Add stabilization window (5 min), smooth metrics | Infrastructure |

---

## Success Metrics & KPIs

| Metric | Target | Baseline | Frequency |
|--------|--------|----------|-----------|
| **Request latency (P99)** | < 150ms | 250ms | Real-time |
| **Instance scaling time** | < 2 minutes | N/A | Per event |
| **Load distribution variance** | < 5% | N/A | Every minute |
| **Replication lag** | < 100ms | N/A | Every 10s |
| **Message queue throughput** | > 10K/sec | N/A | Every minute |
| **Failover time to secondary** | < 1 minute | N/A | Per event |
| **Session retrieval latency** | < 10ms | N/A | Every minute |
| **Backup success rate** | > 99.9% | N/A | Daily |
| **Pod restart frequency** | < 1 per instance/day | N/A | Every minute |
| **Disk I/O utilization** | < 70% | 50% | Every minute |

---

## Next Steps (Handoff)

After completing Ph5.4-Ph5.29 (Scaling & Load Balancing workstream):

1. **Monitor Phase 5.4 production metrics** for 1 week
   - Confirm scaling responsiveness
   - Validate load distribution
   - Monitor cost optimization

2. **Prepare Phase 5.5 execution** (API Gateway & Service Mesh)
   - Review API Gateway architecture
   - Plan service mesh migration strategy
   - Schedule compatibility testing

3. **Document lessons learned**
   - Update runbooks based on failures
   - Optimize scaling policies
   - Refine alerting thresholds

4. **Plan Phase 6** (Observability & Cost Optimization)
   - Implement cost monitoring
   - Set up automated anomaly detection
   - Plan capacity forecasting

---

## Reference Documents

### Internal Documentation

- [Web UI Phase 5 Architecture Overview](/projects/simone-webshop/Phase-5-Architecture.md)
- [Kubernetes Best Practices Guide](/guides/k8s-best-practices.md)
- [Database Replication Playbook](/guides/db-replication-playbook.md)
- [Disaster Recovery Procedures](/docs/disaster-recovery.md)

### External Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [PostgreSQL Replication Guide](https://www.postgresql.org/docs/current/warm-standby.html)
- [RabbitMQ Clustering](https://www.rabbitmq.com/clustering.html)
- [Redis Cluster Tutorial](https://redis.io/docs/management/scaling/)
- [AWS Route 53 Failover](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy-failover.html)

### Tools & Dashboards

- **Kubernetes Dashboard**: `https://k8s-dashboard.simone-webshop.com`
- **Grafana Monitoring**: `https://grafana.simone-webshop.com`
- **RabbitMQ Management**: `https://rabbitmq.simone-webshop.com:15672`
- **PostgreSQL Admin**: `https://pgadmin.simone-webshop.com`
- **Cloudflare Dashboard**: `https://dash.cloudflare.com`

---

## Appendix: Code Examples

### Kubernetes Deployment Checklist

```bash
# Pre-deployment verification
kubectl cluster-info
kubectl get nodes
kubectl get pv,pvc

# Apply manifests in order
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-hpa.yaml
kubectl apply -f ingress.yaml
kubectl apply -f backend-api-deployment.yaml
kubectl apply -f backend-hpa.yaml

# Verify deployments
kubectl get deployments -n production
kubectl get pods -n production
kubectl logs -f deployment/simone-frontend -n production

# Scale manually (override HPA for testing)
kubectl scale deployment simone-frontend --replicas=15 -n production

# Monitor events
kubectl get events -n production --sort-by='.lastTimestamp'
```

### Health Check Endpoint (Go)

```go
// handlers/health.go
package handlers

import (
    "database/sql"
    "net/http"
    "encoding/json"
)

type HealthResponse struct {
    Status    string `json:"status"`
    Database  bool   `json:"database"`
    Redis     bool   `json:"redis"`
    Memory    uint64 `json:"memory_mb"`
    Uptime    int64  `json:"uptime_seconds"`
}

func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
    // Quick health check
    health := HealthResponse{
        Status:   "ok",
        Database: checkDatabaseConnection(h.db),
        Redis:    checkRedisConnection(h.redis),
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(health)
}

func (h *Handler) ReadyCheck(w http.ResponseWriter, r *http.Request) {
    // Detailed readiness check
    // Includes external dependencies
    ready := checkApplicationReady(h.db, h.redis, h.mq)
    
    if !ready {
        w.WriteHeader(http.StatusServiceUnavailable)
        return
    }
    
    w.WriteHeader(http.StatusOK)
}
```

---

**END OF GUIDE 4: SCALING & LOAD BALANCING**
