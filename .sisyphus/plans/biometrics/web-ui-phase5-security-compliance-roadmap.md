# Phase 5 Security & Compliance Workstream Implementation Roadmap

**Workstream**: Security & Compliance  
**Duration**: 6 weeks (13 effort-days)  
**Tasks**: Ph5.3, Ph5.8, Ph5.13, Ph5.18, Ph5.23, Ph5.28  
**Team Size**: 3 engineers (security architect, backend engineer, compliance specialist)  
**Status**: Ready for Week 1 Execution  

---

## Executive Summary

The Security & Compliance workstream establishes enterprise-grade security controls, compliance frameworks, and data protection mechanisms across the SIMONE-WEBSHOP-01 platform. This 6-week initiative hardens authentication (OAuth 2.0/OIDC), implements end-to-end encryption, establishes comprehensive audit logging, deploys Web Application Firewall (WAF), and ensures GDPR/CCPA compliance.

### Strategic Goals

1. **Zero-Trust Security**: Implement OAuth 2.0 + OpenID Connect with role-based access control
2. **Data Protection**: End-to-end encryption with TLS 1.3 and perfect forward secrecy
3. **Regulatory Compliance**: Full GDPR/CCPA compliance with data subject rights automation
4. **Threat Prevention**: Web Application Firewall with rate limiting and attack detection
5. **Audit & Accountability**: Tamper-proof audit logging for all security-critical operations
6. **Defense in Depth**: Layered security headers (CSP, HSTS, SRI)

### Success Criteria

- **Authentication**: Zero OAuth 2.0 vulnerabilities in security audit
- **Encryption**: 100% of data in transit encrypted with TLS 1.3
- **Compliance**: 100% GDPR/CCPA compliance attestation
- **WAF**: 99.9% of common web attacks blocked by WAF rules
- **Audit Logging**: 100% of security-critical operations logged with immutable timestamps
- **Mean Time to Detect (MTTD)**: Security incidents detected within 5 minutes

### Team Composition

| Role | Count | Responsibilities |
|------|-------|------------------|
| Security Architect | 1 | OAuth/OIDC design, encryption strategy, WAF configuration |
| Backend Engineer | 1 | Audit logging implementation, encryption integration, WAF rules |
| Compliance Specialist | 1 | GDPR/CCPA framework, data retention, consent management |

### Stakeholders

- **CISO/Security Team**: Overall security posture approval
- **Legal/Compliance**: GDPR/CCPA attestation, data subject rights
- **Product**: Feature authentication, user consent flows
- **Infrastructure**: WAF/CDN integration, TLS certificate management
- **Support**: User consent/data deletion workflows

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SECURITY & COMPLIANCE STACK                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐   │
│  │  OAuth 2.0/     │    │  TLS 1.3 Certs   │    │  WAF Rules  │   │
│  │  OIDC Provider  │    │  (Let's Encrypt) │    │ (ModSec)    │   │
│  │  (Auth0/Okta)   │    │                  │    │             │   │
│  └────────┬────────┘    └────────┬─────────┘    └──────┬──────┘   │
│           │                      │                     │            │
│           ▼                      ▼                     ▼            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │               NEXT.JS / GO BACKEND SERVICES                  │  │
│  │  ┌─────────────────┬──────────────────┬──────────────────┐   │  │
│  │  │ RBAC Middleware │ Encryption Layer │  WAF Integration │   │  │
│  │  └─────────────────┴──────────────────┴──────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│           │                      │                     │            │
│           ▼                      ▼                     ▼            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   AUDIT LOGGING LAYER                        │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │  Postgres Audit Table | Elasticsearch Log Aggregation │ │  │
│  │  │  (Immutable, append-only, tamper-proof)              │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│           │                      │                     │            │
│           ▼                      ▼                     ▼            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           GDPR/CCPA COMPLIANCE FRAMEWORK                     │  │
│  │  ┌─────────────┬──────────────┬──────────────────────────┐  │  │
│  │  │ Data Subject│ Consent Mgmt │ Retention / Deletion     │  │  │
│  │  │ Rights API  │ (Cookie)     │ Workflows               │  │  │
│  │  └─────────────┴──────────────┴──────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose | Port |
|-------|-----------|---------|------|
| **Authentication** | Auth0 / Okta | OAuth 2.0 + OIDC provider | External |
| **TLS/Encryption** | Let's Encrypt + mkcert | Certificate management | 443 |
| **WAF** | ModSecurity + Cloudflare WAF | Attack detection/prevention | CDN |
| **Audit Logging** | PostgreSQL + Elasticsearch | Immutable audit trail | 5432, 9200 |
| **GDPR/CCPA** | Custom APIs + Stripe/Braintree | Data subject rights, consent | 3000, 8000 |
| **Session Management** | Redis (from Ph5.2) | Token storage + revocation | 6379 |
| **Observability** | Prometheus/ELK (from Ph5.1) | Security event monitoring | 9090, 5601 |

---

## Week-by-Week Implementation Roadmap

### Week 1: OAuth 2.0 + OpenID Connect + RBAC (Ph5.3)

**Objective**: Establish zero-trust authentication and role-based access control with OAuth 2.0 and OpenID Connect providers. Replace all hardcoded authentication with delegated OAuth flows.

**Architecture Diagram**:
```
┌──────────────────┐
│   User Browser   │
└────────┬─────────┘
         │
         │ 1. Click "Login"
         ▼
┌──────────────────────────┐     ┌─────────────────┐
│  Next.js Frontend        │────▶│  Auth0/Okta     │
│  (Callback: /auth/cb)    │     │  (Provider)     │
└──────────────────────────┘     └────────┬────────┘
         ▲                                │
         │ 5. Access Token               │ 2. Redirect to provider
         │    + ID Token                 │    + PKCE code_challenge
         │                               │
         │ 4. POST /api/auth/callback    ▼
         │                      ┌──────────────────────┐
         │                      │ User authenticates   │
         │                      │ (MFA if enabled)     │
         │                      └──────────────────────┘
         │
    ┌────┴─────────────────────────────────────────┐
    │                                              │
    ▼                                              ▼
┌──────────────────────┐             ┌──────────────────────┐
│  Next.js API Route   │             │  Go Backend Service  │
│  /api/auth/callback  │             │  /api/protected      │
│                      │             │                      │
│ 1. Verify ID token   │             │ 1. Validate JWT      │
│ 2. Extract OIDC      │             │ 2. Check roles       │
│    claims            │             │ 3. Load permissions  │
│ 3. Create session    │             │ 4. Execute action    │
│ 4. Store in Redis    │             │ 5. Audit log call    │
└──────────────────────┘             └──────────────────────┘
```

**Detailed Implementation Steps** (3 hours minimum):

1. **Step 1: Auth Provider Setup (45 minutes)**
   - Choose provider: Auth0 (recommended) or Okta
   - Create tenant/organization
   - Configure application (type: Single Page App / Web App)
   - Set callback URLs: `https://yourdomain.com/auth/callback`
   - Set allowed logout URLs: `https://yourdomain.com`
   - Enable OpenID Connect scope (id_token, profile, email)
   - Generate client ID and client secret (store in `.env`)
   - Enable MFA for sensitive operations

2. **Step 2: Next.js OAuth Integration (60 minutes)**
   - Install `next-auth` v5 (NextAuth.js):
     ```bash
     npm install next-auth@latest @auth/core
     ```
   - Create `app/api/auth/[...nextauth]/route.ts`:
     ```typescript
     import NextAuth from "next-auth";
     import OAuthProvider from "next-auth/providers/oauth";
     
     export const authOptions = {
       providers: [
         OAuthProvider({
           id: "auth0",
           name: "Auth0",
           type: "oauth",
           wellKnown: `https://${process.env.AUTH0_DOMAIN}/.well-known/openid-configuration`,
           authorization: {
             params: { scope: "openid profile email" }
           },
           idToken: true,
           checks: ["state", "pkce"],
           clientId: process.env.AUTH0_CLIENT_ID,
           clientSecret: process.env.AUTH0_CLIENT_SECRET,
           profile(profile) {
             return {
               id: profile.sub,
               name: profile.name,
               email: profile.email,
               roles: profile["https://yourdomain.com/roles"] || []
             }
           }
         })
       ],
       callbacks: {
         async jwt({ token, user, account }) {
           if (account) {
             token.accessToken = account.access_token;
             token.idToken = account.id_token;
           }
           if (user) {
             token.roles = user.roles;
           }
           return token;
         },
         async session({ session, token }) {
           session.user.accessToken = token.accessToken;
           session.user.roles = token.roles;
           return session;
         }
       },
       session: { strategy: "jwt" }
     };
     
     const handler = NextAuth(authOptions);
     export { handler as GET, handler as POST };
     ```
   - Create login button in `app/components/LoginButton.tsx`:
     ```typescript
     "use client";
     import { signIn } from "next-auth/react";
     
     export function LoginButton() {
       return (
         <button onClick={() => signIn("auth0")}>
           Sign In with Auth0
         </button>
       );
     }
     ```
   - Add environment variables to `.env.local`:
     ```
     AUTH0_DOMAIN=yourdomain.auth0.com
     AUTH0_CLIENT_ID=your_client_id
     AUTH0_CLIENT_SECRET=your_client_secret
     NEXTAUTH_SECRET=your_secret_key
     NEXTAUTH_URL=https://yourdomain.com
     ```

3. **Step 3: Go Backend JWT Validation (45 minutes)**
   - Create JWT validation middleware in Go:
     ```go
     package middleware
     
     import (
       "github.com/golang-jwt/jwt/v5"
       "net/http"
       "strings"
     )
     
     type Claims struct {
       Sub   string   `json:"sub"`
       Email string   `json:"email"`
       Roles []string `json:"https://yourdomain.com/roles"`
       jwt.RegisteredClaims
     }
     
     func ValidateJWT(next http.Handler) http.Handler {
       return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
         authHeader := r.Header.Get("Authorization")
         if authHeader == "" {
           http.Error(w, "missing token", http.StatusUnauthorized)
           return
         }
         
         tokenString := strings.TrimPrefix(authHeader, "Bearer ")
         token, err := jwt.ParseWithClaims(
           tokenString,
           &Claims{},
           func(token *jwt.Token) (interface{}, error) {
             // Fetch JWKS from Auth0
             return getAuth0PublicKey(token.Header["kid"].(string))
           },
         )
         
         if err != nil || !token.Valid {
           http.Error(w, "invalid token", http.StatusUnauthorized)
           return
         }
         
         claims := token.Claims.(*Claims)
         r.Header.Set("X-User-ID", claims.Sub)
         r.Header.Set("X-User-Email", claims.Email)
         r.Header.Set("X-User-Roles", strings.Join(claims.Roles, ","))
         
         next.ServeHTTP(w, r)
       })
     }
     ```

4. **Step 4: Role-Based Access Control (RBAC) (45 minutes)**
   - Create roles table in PostgreSQL:
     ```sql
     CREATE TABLE roles (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name VARCHAR(255) UNIQUE NOT NULL,
       description TEXT,
       created_at TIMESTAMP DEFAULT NOW()
     );
     
     CREATE TABLE role_permissions (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
       permission VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT NOW()
     );
     
     CREATE TABLE user_roles (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id VARCHAR(255) NOT NULL, -- Auth0 sub
       role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
       assigned_at TIMESTAMP DEFAULT NOW()
     );
     
     CREATE INDEX idx_user_roles ON user_roles(user_id);
     CREATE INDEX idx_role_permissions ON role_permissions(role_id);
     ```
   - Create RBAC middleware in Go:
     ```go
     func RequireRole(roles ...string) func(http.Handler) http.Handler {
       return func(next http.Handler) http.Handler {
         return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
           userRoles := strings.Split(r.Header.Get("X-User-Roles"), ",")
           
           allowed := false
           for _, userRole := range userRoles {
             for _, requiredRole := range roles {
               if userRole == requiredRole {
                 allowed = true
                 break
               }
             }
           }
           
           if !allowed {
             http.Error(w, "forbidden", http.StatusForbidden)
             return
           }
           
           next.ServeHTTP(w, r)
         })
       }
     }
     
     // Usage:
     r.HandleFunc("/api/admin/users", RequireRole("admin")(http.HandlerFunc(ListUsers))).Methods("GET")
     ```

5. **Step 5: Session Management via Redis (30 minutes)**
   - Configure session storage in Redis:
     ```go
     type SessionStore struct {
       redis *redis.Client
     }
     
     func (s *SessionStore) CreateSession(ctx context.Context, userID string, roles []string) (string, error) {
       sessionID := uuid.New().String()
       sessionData := map[string]interface{}{
         "user_id": userID,
         "roles":   roles,
         "created": time.Now(),
       }
       
       err := s.redis.HSet(ctx, "session:"+sessionID, sessionData).Err()
       if err != nil {
         return "", err
       }
       
       // Set 1-hour expiration
       s.redis.Expire(ctx, "session:"+sessionID, time.Hour)
       return sessionID, nil
     }
     ```

**Deliverables** (✅ checkboxes):
- ✅ Auth0/Okta tenant configured with OAuth 2.0 + OIDC
- ✅ Next.js login flow integrated with NextAuth.js
- ✅ Go backend JWT validation middleware implemented
- ✅ RBAC tables in PostgreSQL created
- ✅ RBAC enforcement middleware in Go routes
- ✅ Session management via Redis
- ✅ MFA enabled for sensitive operations
- ✅ Login/logout flows tested end-to-end
- ✅ JWKS validation tested with real tokens

**Integration Points**:
- **With Analytics (Ph5.1)**: Log authentication events (login, logout, failed attempts) to Elasticsearch
- **With Performance (Ph5.2)**: Cache JWKS from Auth0 in Redis (TTL: 1 hour)
- **With Scaling (Ph5.4)**: Distribute session store across Redis cluster
- **With API Gateway (Ph5.5)**: Enforce JWT validation at gateway level

**Success Criteria**:
- OAuth 2.0 login successful for test users
- JWT tokens valid and verifiable
- RBAC permissions enforced on protected routes
- Zero hardcoded credentials in codebase
- MFA prompts for admin operations
- Sessions persist across backend instances (Redis)

---

### Week 2: End-to-End Encryption + HTTPS Hardening (Ph5.8)

**Objective**: Implement TLS 1.3 with perfect forward secrecy, enforce HTTPS across all endpoints, and add encryption for sensitive data at rest.

**Architecture Diagram**:
```
┌─────────────────────────────────────────────────────────┐
│           CLIENT BROWSER                                │
│  ┌─────────────────────────────────────────────────────┐│
│  │ TLS Handshake:                                      ││
│  │ 1. ClientHello (TLS 1.3)                            ││
│  │ 2. ServerHello + Key Share (Ephemeral ECDHE)        ││
│  │ 3. Finished (encrypted with derived key)            ││
│  │ PFS: Session keys cannot decrypt past traffic       ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                        │ TLS 1.3 + ECDHE
                        │ (Perfect Forward Secrecy)
                        ▼
┌─────────────────────────────────────────────────────────┐
│           CLOUDFLARE CDN / REVERSE PROXY                │
│  ┌─────────────────────────────────────────────────────┐│
│  │ HSTS Header: max-age=31536000; includeSubDomains   ││
│  │ Security Headers: CSP, X-Frame-Options, X-Content  ││
│  │ Certificate Pinning: Pin certificate hash          ││
│  │ Certificate Validation: Let's Encrypt + Auto-Renewal││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
         │ TLS 1.3 (Reverse Proxy)
         ▼
┌─────────────────────────────────────────────────────────┐
│           GO BACKEND SERVICES                           │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Data Encryption at Rest:                            ││
│  │ - Sensitive fields: AES-256-GCM encrypted          ││
│  │ - Keys stored in HashiCorp Vault (HSM)             ││
│  │ - Database: Encrypted columns + per-record keys    ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Detailed Implementation Steps** (3 hours minimum):

1. **Step 1: TLS 1.3 Certificate Setup (45 minutes)**
   - Generate Let's Encrypt certificate via certbot:
     ```bash
     # Install certbot
     sudo apt-get install certbot python3-certbot-nginx
     
     # Generate wildcard certificate
     sudo certbot certonly --dns-cloudflare \
       -d yourdomain.com \
       -d "*.yourdomain.com" \
       --agree-tos --non-interactive
     
     # Verify certificate
     openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout
     ```
   - Configure Cloudflare SSL/TLS mode:
     - Go to Cloudflare Dashboard → SSL/TLS → Full (Strict)
     - Upload origin certificate (Let's Encrypt)
     - Enable HSTS (max-age=31536000, includeSubDomains)
     - Enable Opportunistic Encryption (HTTP/2 to HTTP/1.1)

2. **Step 2: HTTPS Enforcement & HSTS (30 minutes)**
   - Go backend HTTPS enforcement:
     ```go
     package main
     
     import (
       "crypto/tls"
       "net/http"
     )
     
     func main() {
       // TLS 1.3 only
       tlsConfig := &tls.Config{
         MinVersion:   tls.VersionTLS13,
         CipherSuites: []uint16{
           tls.TLS_AES_256_GCM_SHA384,
           tls.TLS_CHACHA20_POLY1305_SHA256,
           tls.TLS_AES_128_GCM_SHA256,
         },
         PreferServerCipherSuites: true,
         CurvePreferences: []tls.CurveID{
           tls.CurveP256,
           tls.X25519,
         },
       }
       
       server := &http.Server{
         Addr:      ":443",
         TLSConfig: tlsConfig,
         Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
           // HSTS Header
           w.Header().Set("Strict-Transport-Security", 
             "max-age=31536000; includeSubDomains; preload")
           
           // Certificate pinning (optional)
           w.Header().Set("Public-Key-Pins", 
             `pin-sha256="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="; max-age=2592000; includeSubDomains`)
           
           w.WriteHeader(http.StatusOK)
         }),
       }
       
       // Load certificates
       server.ListenAndServeTLS(
         "/etc/letsencrypt/live/yourdomain.com/fullchain.pem",
         "/etc/letsencrypt/live/yourdomain.com/privkey.pem",
       )
     }
     ```
   - Redirect HTTP to HTTPS:
     ```go
     go func() {
       httpServer := &http.Server{
         Addr: ":80",
         Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
           http.Redirect(w, r, "https://"+r.Host+r.RequestURI, http.StatusMovedPermanently)
         }),
       }
       httpServer.ListenAndServe()
     }()
     ```

3. **Step 3: Data Encryption at Rest (AES-256-GCM) (60 minutes)**
   - Create encryption service in Go:
     ```go
     package crypto
     
     import (
       "crypto/aes"
       "crypto/cipher"
       "crypto/rand"
       "encoding/hex"
       "io"
     )
     
     type EncryptionService struct {
       masterKey []byte // 32 bytes for AES-256
     }
     
     func NewEncryptionService(masterKey []byte) *EncryptionService {
       if len(masterKey) != 32 {
         panic("key must be 32 bytes for AES-256")
       }
       return &EncryptionService{masterKey: masterKey}
     }
     
     func (e *EncryptionService) Encrypt(plaintext string) (string, error) {
       cipher, err := aes.NewCipher(e.masterKey)
       if err != nil {
         return "", err
       }
       
       gcm, err := cipher.NewGCM()
       if err != nil {
         return "", err
       }
       
       nonce := make([]byte, gcm.NonceSize())
       if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
         return "", err
       }
       
       ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
       return hex.EncodeToString(ciphertext), nil
     }
     
     func (e *EncryptionService) Decrypt(ciphertext string) (string, error) {
       ct, err := hex.DecodeString(ciphertext)
       if err != nil {
         return "", err
       }
       
       cipher, err := aes.NewCipher(e.masterKey)
       if err != nil {
         return "", err
       }
       
       gcm, err := cipher.NewGCM()
       if err != nil {
         return "", err
       }
       
       nonceSize := gcm.NonceSize()
       plaintext, err := gcm.Open(nil, ct[:nonceSize], ct[nonceSize:], nil)
       return string(plaintext), err
     }
     ```
   - Encrypt sensitive user data in PostgreSQL:
     ```go
     type User struct {
       ID            string
       Email         string // encrypted in DB
       Phone         string // encrypted in DB
       SSN           string // encrypted in DB
     }
     
     func (u *User) Encrypt(encSvc *EncryptionService) error {
       var err error
       u.Email, err = encSvc.Encrypt(u.Email)
       if err != nil {
         return err
       }
       u.Phone, err = encSvc.Encrypt(u.Phone)
       if err != nil {
         return err
       }
       u.SSN, err = encSvc.Encrypt(u.SSN)
       if err != nil {
         return err
       }
       return nil
     }
     
     func (u *User) Decrypt(encSvc *EncryptionService) error {
       var err error
       u.Email, err = encSvc.Decrypt(u.Email)
       if err != nil {
         return err
       }
       u.Phone, err = encSvc.Decrypt(u.Phone)
       if err != nil {
         return err
       }
       u.SSN, err = encSvc.Decrypt(u.SSN)
       if err != nil {
         return err
       }
       return nil
     }
     ```
   - Store encryption keys in HashiCorp Vault:
     ```go
     import "github.com/hashicorp/vault/api"
     
     func getEncryptionKeyFromVault(vaultAddr, vaultToken string) ([]byte, error) {
       config := &api.Config{
         Address: vaultAddr,
       }
       client, err := api.NewClient(config)
       if err != nil {
         return nil, err
       }
       client.SetToken(vaultToken)
       
       secret, err := client.Logical().Read("secret/data/encryption/master-key")
       if err != nil {
         return nil, err
       }
       
       data := secret.Data["data"].(map[string]interface{})
       keyStr := data["key"].(string)
       return hex.DecodeString(keyStr)
     }
     ```

4. **Step 4: Certificate Pinning (30 minutes)**
   - Extract certificate public key hash:
     ```bash
     openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem \
       -pubkey -noout | \
       openssl pkey -pubin -outform DER | \
       openssl dgst -sha256 -binary | \
       openssl enc -base64
     ```
   - Add certificate pinning header to responses:
     ```go
     w.Header().Set("Public-Key-Pins", 
       `pin-sha256="YOUR_CERT_HASH="; max-age=2592000; includeSubDomains`)
     ```
   - Configure certificate pinning in Next.js (for API calls):
     ```typescript
     // lib/api-client.ts
     import https from 'https';
     
     const pinning = {
       pins: ['YOUR_CERT_HASH'],
       hostname: 'yourdomain.com'
     };
     
     const httpsAgent = new https.Agent({
       rejectUnauthorized: true,
       secureOptions: 
         require('constants').SSL_OP_NO_SSLv3 |
         require('constants').SSL_OP_NO_SSLv2 |
         require('constants').SSL_OP_NO_TLSv1 |
         require('constants').SSL_OP_NO_TLSv1_1
     });
     ```

5. **Step 5: Automatic Certificate Renewal (15 minutes)**
   - Configure certbot auto-renewal:
     ```bash
     # Test renewal (dry run)
     sudo certbot renew --dry-run
     
     # Configure systemd timer for auto-renewal (twice daily)
     sudo systemctl enable certbot.timer
     sudo systemctl start certbot.timer
     sudo systemctl list-timers certbot.timer
     ```

**Deliverables** (✅ checkboxes):
- ✅ TLS 1.3 certificate installed (Let's Encrypt)
- ✅ HSTS header configured (max-age=31536000)
- ✅ All HTTP traffic redirects to HTTPS
- ✅ Go backend enforces TLS 1.3 only
- ✅ Encryption at rest (AES-256-GCM) implemented
- ✅ Encryption keys stored in Vault
- ✅ Sensitive data fields encrypted in PostgreSQL
- ✅ Certificate pinning implemented
- ✅ Auto-renewal configured (certbot)
- ✅ All security headers present in responses
- ✅ SSL Labs rating: A+ (100/100)

**Integration Points**:
- **With Analytics (Ph5.1)**: Log TLS handshake failures and encryption operations
- **With Audit Logging (Ph5.13)**: Log all encryption/decryption operations
- **With API Gateway (Ph5.5)**: WAF validates HTTPS before processing

**Success Criteria**:
- 100% of traffic encrypted with TLS 1.3
- Zero unencrypted sensitive data at rest
- Certificate renewal automated (never expires)
- SSL Labs A+ rating
- Perfect Forward Secrecy verified

---

### Week 3: Comprehensive Audit Logging (Ph5.13)

**Objective**: Implement immutable, tamper-proof audit logging for all security-critical operations with centralized log aggregation and long-term retention.

**Detailed Implementation Steps** (3 hours minimum):

1. **Step 1: Audit Log Schema (45 minutes)**
   - Create PostgreSQL audit table:
     ```sql
     CREATE TABLE audit_logs (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       event_type VARCHAR(50) NOT NULL, -- 'LOGIN', 'CREATE_USER', 'DELETE_DATA', 'AUTH_FAILED'
       user_id VARCHAR(255) NOT NULL,
       action VARCHAR(255) NOT NULL, -- 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
       table_name VARCHAR(255),
       old_values JSONB,
       new_values JSONB,
       ip_address INET NOT NULL,
       user_agent TEXT,
       status VARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILED'
       error_message TEXT,
       created_at TIMESTAMP DEFAULT NOW() NOT NULL,
       -- Immutability: Add hash of previous record for chain-of-trust
       previous_hash VARCHAR(64),
       current_hash VARCHAR(64) GENERATED ALWAYS AS (
         encode(
           digest(
             id::text || event_type || user_id || action || created_at::text || previous_hash,
             'sha256'
           ),
           'hex'
         )
       ) STORED
     );
     
     CREATE INDEX idx_audit_user ON audit_logs(user_id);
     CREATE INDEX idx_audit_event ON audit_logs(event_type);
     CREATE INDEX idx_audit_timestamp ON audit_logs(created_at DESC);
     CREATE INDEX idx_audit_action ON audit_logs(action);
     
     -- Make table append-only (prevent updates/deletes)
     ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
     CREATE POLICY audit_logs_no_delete ON audit_logs AS (USING FALSE);
     CREATE POLICY audit_logs_no_update ON audit_logs AS (USING FALSE);
     ```

2. **Step 2: Audit Logging Service (60 minutes)**
   - Create Go audit service:
     ```go
     package audit
     
     import (
       "context"
       "database/sql"
       "encoding/json"
       "net"
       "time"
     )
     
     type AuditLogger struct {
       db *sql.DB
     }
     
     type AuditEvent struct {
       EventType    string
       UserID       string
       Action       string
       TableName    *string
       OldValues    map[string]interface{}
       NewValues    map[string]interface{}
       IPAddress    string
       UserAgent    string
       Status       string
       ErrorMessage *string
     }
     
     func (a *AuditLogger) Log(ctx context.Context, event AuditEvent) error {
       oldValuesJSON, _ := json.Marshal(event.OldValues)
       newValuesJSON, _ := json.Marshal(event.NewValues)
       
       query := `
         INSERT INTO audit_logs 
         (event_type, user_id, action, table_name, old_values, new_values, ip_address, user_agent, status, error_message, previous_hash)
         SELECT 
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
           (SELECT current_hash FROM audit_logs ORDER BY created_at DESC LIMIT 1)
         RETURNING id
       `
       
       var logID string
       err := a.db.QueryRowContext(ctx, query,
         event.EventType,
         event.UserID,
         event.Action,
         event.TableName,
         string(oldValuesJSON),
         string(newValuesJSON),
         event.IPAddress,
         event.UserAgent,
         event.Status,
         event.ErrorMessage,
       ).Scan(&logID)
       
       return err
     }
     
     // Middleware to extract IP and User-Agent
     func extractClientInfo(r *http.Request) (ip, userAgent string) {
       ip = r.Header.Get("X-Forwarded-For")
       if ip == "" {
         ip, _, _ = net.SplitHostPort(r.RemoteAddr)
       }
       userAgent = r.Header.Get("User-Agent")
       return
     }
     ```

3. **Step 3: Elasticsearch Log Aggregation (45 minutes)**
   - Install and configure Elasticsearch:
     ```bash
     # Docker Compose
     services:
       elasticsearch:
         image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
         environment:
           - discovery.type=single-node
           - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
           - xpack.security.enabled=true
           - xpack.security.enrollment.enabled=true
           - ELASTIC_PASSWORD=changeme
         ports:
           - "9200:9200"
         volumes:
           - elasticsearch-data:/usr/share/elasticsearch/data
     ```
   - Stream PostgreSQL logs to Elasticsearch:
     ```go
     import "github.com/elastic/go-elasticsearch/v8"
     
     type LogShipper struct {
       esClient *elasticsearch.Client
     }
     
     func (l *LogShipper) ShipLogs(ctx context.Context, event AuditEvent) error {
       body, _ := json.Marshal(map[string]interface{}{
         "timestamp":    time.Now().UTC().Format(time.RFC3339),
         "event_type":   event.EventType,
         "user_id":      event.UserID,
         "action":       event.Action,
         "ip_address":   event.IPAddress,
         "status":       event.Status,
         "@timestamp":   time.Now().UTC(),
       })
       
       res, err := l.esClient.Index(
         "audit-logs-"+time.Now().Format("2006.01.02"),
         bytes.NewReader(body),
       )
       defer res.Body.Close()
       
       return err
     }
     ```

4. **Step 4: Log Retention & Archival (30 minutes)**
   - Configure retention policy:
     ```sql
     -- Archive old logs to cold storage (S3) after 90 days
     CREATE OR REPLACE FUNCTION archive_old_audit_logs() RETURNS void AS $$
     DECLARE
       archive_date TIMESTAMP;
     BEGIN
       archive_date := NOW() - INTERVAL '90 days';
       
       -- Export to CSV (for S3)
       COPY (SELECT * FROM audit_logs WHERE created_at < archive_date)
       TO PROGRAM 'aws s3 cp /dev/stdin s3://yourbucket/audit-logs/'
       WITH (FORMAT CSV);
       
       -- Delete from hot storage
       DELETE FROM audit_logs WHERE created_at < archive_date;
     END;
     $$ LANGUAGE plpgsql;
     
     -- Schedule daily
     SELECT cron.schedule('archive_audit_logs', '0 2 * * *', 'SELECT archive_old_audit_logs()');
     ```

5. **Step 5: Log Verification & Integrity (30 minutes)**
   - Create log verification function:
     ```sql
     CREATE OR REPLACE FUNCTION verify_audit_log_chain() RETURNS TABLE(valid BOOLEAN, msg TEXT) AS $$
     DECLARE
       rec RECORD;
       expected_hash VARCHAR(64);
     BEGIN
       FOR rec IN SELECT id, current_hash, previous_hash FROM audit_logs ORDER BY created_at
       LOOP
         -- Verify hash chain
         SELECT current_hash INTO expected_hash FROM audit_logs 
           WHERE created_at = (SELECT MAX(created_at) FROM audit_logs WHERE created_at < rec.created_at);
         
         IF rec.previous_hash IS NOT NULL AND rec.previous_hash != expected_hash THEN
           RETURN QUERY SELECT FALSE, 'Hash chain broken at log ID: ' || rec.id::text;
         END IF;
       END LOOP;
       
       RETURN QUERY SELECT TRUE, 'Audit log chain verified successfully';
     END;
     $$ LANGUAGE plpgsql;
     ```

**Deliverables** (✅ checkboxes):
- ✅ PostgreSQL audit_logs table with hash chain
- ✅ Append-only RLS policies enforced
- ✅ Audit logging service in Go
- ✅ Elasticsearch cluster for log aggregation
- ✅ Log shipping pipeline operational
- ✅ Retention policy (90-day hot, S3 cold storage)
- ✅ Log verification function
- ✅ Kibana dashboard for audit log search
- ✅ All security-critical operations logged

**Integration Points**:
- **With Analytics (Ph5.1)**: Visualize audit logs in Kibana/Grafana
- **With GDPR/CCPA (Ph5.23)**: Use audit logs to demonstrate data handling compliance

**Success Criteria**:
- Zero missed audit log entries
- Log chain integrity verified (100%)
- Zero unauthorized log deletion attempts
- Mean Time to Detect (MTTD): < 5 minutes

---

### Week 4: Security Hardening (CSP, HSTS, SRI) (Ph5.18)

**Objective**: Implement defense-in-depth security headers to prevent XSS, clickjacking, and code injection attacks.

**Detailed Implementation Steps** (2 hours):

1. **Step 1: Content Security Policy (CSP) (45 minutes)**
   - Implement CSP middleware:
     ```go
     func CSPMiddleware(next http.Handler) http.Handler {
       return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
         csp := `
           default-src 'none';
           script-src 'self' https://cdn.jsdelivr.net;
           style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline';
           img-src 'self' data: https:;
           font-src 'self' https://fonts.googleapis.com;
           connect-src 'self' https://api.yourdomain.com;
           frame-ancestors 'none';
           base-uri 'self';
           form-action 'self';
         `
         w.Header().Set("Content-Security-Policy", csp)
         w.Header().Set("Content-Security-Policy-Report-Only", csp)
         next.ServeHTTP(w, r)
       })
     }
     ```

2. **Step 2: HSTS (Already in Ph5.8 - reference)**
   - Verify HSTS header (12 months, include subdomains)

3. **Step 3: Subresource Integrity (SRI) (45 minutes)**
   - Add SRI hashes to external script/style tags in Next.js:
     ```typescript
     // lib/sri-hashes.ts
     export const sriHashes = {
       'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js':
         'sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP28nIhpAfkWXzXWHx3M/47LVeNfRj2',
       'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css':
         'sha384-1BmE4kWBq78iYhFldwKuhfstnjc3f1caKN4t0xqml1Xo0EMf1fcOFplOCK36H0bF'
     };
     
     // components/ExternalScript.tsx
     'use client';
     import Script from 'next/script';
     import { sriHashes } from '@/lib/sri-hashes';
     
     export function ExternalBootstrap() {
       return (
         <>
           <Script
             src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
             integrity={sriHashes['https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js']}
             crossOrigin="anonymous"
           />
         </>
       );
     }
     ```

4. **Step 4: Additional Security Headers (30 minutes)**
   - Implement all security headers:
     ```go
     func SecurityHeadersMiddleware(next http.Handler) http.Handler {
       return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
         // XSS Protection
         w.Header().Set("X-XSS-Protection", "1; mode=block")
         
         // Clickjacking Protection
         w.Header().Set("X-Frame-Options", "DENY")
         
         // MIME Sniffing Protection
         w.Header().Set("X-Content-Type-Options", "nosniff")
         
         // Referrer Policy
         w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
         
         // Permissions Policy (formerly Feature Policy)
         w.Header().Set("Permissions-Policy", 
           "accelerometer=(), camera=(), microphone=(), geolocation=()")
         
         next.ServeHTTP(w, r)
       })
     }
     ```

**Deliverables** (✅ checkboxes):
- ✅ Content Security Policy (CSP) enforced
- ✅ HSTS headers configured
- ✅ Subresource Integrity (SRI) on external scripts
- ✅ X-Frame-Options set to DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy configured
- ✅ Security headers tested with SecurityHeaders.com

**Success Criteria**:
- SecurityHeaders.com grade: A+
- Zero CSP violations reported
- Zero XSS/clickjacking vulnerabilities in penetration test

---

### Week 5: GDPR/CCPA Compliance Framework (Ph5.23)

**Objective**: Implement automated data subject rights (access, deletion, portability) and consent management to achieve GDPR/CCPA compliance.

**Detailed Implementation Steps** (2 hours):

1. **Step 1: Data Subject Rights APIs (60 minutes)**
   - Implement data access endpoint:
     ```go
     func GetUserData(w http.ResponseWriter, r *http.Request) {
       userID := r.Header.Get("X-User-ID")
       
       // Fetch all user data
       query := `
         SELECT id, email, name, phone, address, created_at, last_login
         FROM users WHERE id = $1
       `
       
       var userData map[string]interface{}
       err := db.QueryRow(query, userID).Scan(&userData)
       
       // Add account activity
       activityQuery := `
         SELECT timestamp, event, details FROM user_activity WHERE user_id = $1
       `
       
       // Return in portable format (JSON)
       w.Header().Set("Content-Type", "application/json")
       json.NewEncoder(w).Encode(userData)
     }
     
     // DELETE /api/users/{id}/data (right to deletion)
     func DeleteUserData(w http.ResponseWriter, r *http.Request) {
       userID := r.PathValue("id")
       
       // Start transaction
       tx, _ := db.BeginTx(r.Context(), nil)
       defer tx.Rollback()
       
       // Anonymize personal data
       tx.ExecContext(r.Context(), 
         "UPDATE users SET email = 'anonymized', name = 'Deleted User', phone = NULL WHERE id = $1",
         userID)
       
       // Delete activity logs
       tx.ExecContext(r.Context(),
         "DELETE FROM user_activity WHERE user_id = $1",
         userID)
       
       // Log deletion request
       LogAuditEvent(&AuditEvent{
         EventType: "USER_DATA_DELETED",
         UserID: userID,
         Status: "SUCCESS",
       })
       
       tx.Commit()
       w.WriteHeader(http.StatusNoContent)
     }
     ```

2. **Step 2: Consent Management (45 minutes)**
   - Create consent table:
     ```sql
     CREATE TABLE user_consents (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id VARCHAR(255) NOT NULL,
       consent_type VARCHAR(50) NOT NULL, -- 'MARKETING', 'ANALYTICS', 'THIRD_PARTY'
       given BOOLEAN NOT NULL,
       given_at TIMESTAMP,
       expires_at TIMESTAMP,
       ip_address INET,
       user_agent TEXT,
       created_at TIMESTAMP DEFAULT NOW()
     );
     
     CREATE INDEX idx_user_consents ON user_consents(user_id);
     ```
   - Consent check middleware:
     ```go
     func RequireConsent(consentType string) func(http.Handler) http.Handler {
       return func(next http.Handler) http.Handler {
         return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
           userID := r.Header.Get("X-User-ID")
           
           // Check if user has given consent
           query := `SELECT given FROM user_consents WHERE user_id = $1 AND consent_type = $2`
           var hasConsent bool
           err := db.QueryRow(query, userID, consentType).Scan(&hasConsent)
           
           if err != nil || !hasConsent {
             http.Error(w, "consent required", http.StatusForbidden)
             return
           }
           
           next.ServeHTTP(w, r)
         })
       }
     }
     ```

3. **Step 3: Data Retention Policies (15 minutes)**
   - Implement automatic data cleanup:
     ```sql
     -- Delete analytics data after 1 year
     DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '1 year';
     
     -- Anonymize user activity after 2 years
     UPDATE user_activity SET details = 'ANONYMIZED' WHERE created_at < NOW() - INTERVAL '2 years';
     
     -- Schedule via cron
     SELECT cron.schedule('cleanup_old_data', '0 1 * * *', 
       'DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL 1 year');
     ```

**Deliverables** (✅ checkboxes):
- ✅ Data access API (/api/users/{id}/data)
- ✅ Data deletion API (/api/users/{id}/data DELETE)
- ✅ Data portability (JSON export)
- ✅ Consent management table + APIs
- ✅ Consent enforcement via middleware
- ✅ Automated data retention policies
- ✅ GDPR privacy notice in UI
- ✅ DPA (Data Processing Agreement) signed with vendors

**Success Criteria**:
- All 6 GDPR articles (13, 15, 16, 17, 20, 21) implemented
- CCPA data deletion requests processed within 45 days
- Consent opt-in rate tracked and reported

---

### Week 6: Web Application Firewall (WAF) (Ph5.28)

**Objective**: Deploy and configure Web Application Firewall to detect and block common web attacks (SQLi, XSS, DDoS, etc.).

**Detailed Implementation Steps** (2 hours):

1. **Step 1: Cloudflare WAF Configuration (60 minutes)**
   - Enable Cloudflare WAF:
     - Dashboard → Security → WAF Rules
     - Enable "OWASP ModSecurity Core Rule Set"
     - Create custom rules:
       ```
       (cf.threat_score > 30) -> Block
       (http.request.method in ["POST" "PUT"] AND 
        http.request.body.size > 10000000) -> Block  # >10MB POST
       (http.referer contains "<?php") -> Block  # SQLi detection
       (cf.bot_management.score < 30) -> Challenge  # Low bot score
       ```

2. **Step 2: Rate Limiting (30 minutes)**
   - Configure per-IP rate limits:
     ```
     Rate limiting rule:
     - 100 requests per 10 seconds per IP -> Block
     - 1000 requests per 60 seconds per IP -> Block
     - Whitelist: /health, /metrics
     ```

3. **Step 3: DDoS Protection (15 minutes)**
   - Enable HTTP Flood Protection:
     - Sensitivity: High
     - Mitigate: Challenge
     - Origin Pull: Enabled

4. **Step 4: ModSecurity (Local) (15 minutes)**
   - Deploy ModSecurity module in nginx (if running locally):
     ```
     location / {
       modsecurity on;
       modsecurity_rules_file /etc/nginx/modsec/main.conf;
       proxy_pass http://backend;
     }
     ```

**Deliverables** (✅ checkboxes):
- ✅ Cloudflare WAF enabled
- ✅ OWASP CRS rules active
- ✅ Custom rate limiting rules
- ✅ DDoS protection configured
- ✅ WAF logs reviewed (zero false positives)
- ✅ Penetration test: OWASP Top 10 verified

**Success Criteria**:
- 99.9% of common web attacks blocked
- Zero false positive blocks on legitimate traffic
- OWASP Top 10 assessment: PASS

---

## Cross-Workstream Integration

### Ph5.3 (OAuth) Provides:
- `X-User-ID`, `X-User-Email`, `X-User-Roles` headers → Ph5.18 (CSP uses user context)
- Authentication tokens → Ph5.5 (API Gateway validates)

### Ph5.8 (Encryption) Provides:
- Encrypted user data → Ph5.13 (audit logs include encrypted values)
- TLS certificates → Ph5.5 (API Gateway uses for mTLS)

### Ph5.13 (Audit Logging) Provides:
- Security event logs → Ph5.1 (Elasticsearch/Kibana for visualization)
- Compliance audit trail → Ph5.23 (GDPR/CCPA evidence)

### Ph5.18 (Security Headers) Provides:
- CSP nonce → Next.js inline scripts (Ph5.2 caching ensures nonce rotation)

### Ph5.23 (GDPR/CCPA) Provides:
- Consent status → Ph5.3 (RBAC enforces marketing audience restrictions)
- Data deletion → Ph5.13 (audit logs show compliance)

### Ph5.28 (WAF) Provides:
- Attack prevention → All workstreams (protects entire platform)
- Rate limiting → Ph5.2 (supplements cache-based rate limiting)

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|-----------|-------|
| OAuth provider downtime | High | Low | Implement backup auth method (local session + TOTP) | Security Architect |
| TLS cert expiration | High | Very Low | Certbot auto-renewal + monitoring alerts | Infrastructure |
| Audit log tampering | Critical | Very Low | Hash chain + immutable storage (Vault/Glacier) | Compliance Specialist |
| GDPR fines (€20M) | Critical | Low | Legal review of consent workflows | Legal |
| WAF false positives | Medium | Medium | Tuning + whitelist legitimate IPs | Security Architect |
| Encryption key loss | Critical | Very Low | Multi-region Vault replication | Infrastructure |

---

## Success Metrics & KPIs

| Metric | Target | Baseline | Frequency |
|--------|--------|----------|-----------|
| **OAuth login success rate** | 99.5% | 0% (no OAuth) | Daily |
| **TLS handshake time** | <100ms | 0ms | Daily |
| **Encryption/decryption latency** | <10ms | N/A | Daily |
| **Audit log write latency** | <5ms | N/A | Daily |
| **WAF false positive rate** | <0.1% | 0% | Weekly |
| **GDPR data deletion compliance** | 100% within 45 days | 0% | Monthly |
| **Security incidents detected by WAF** | >90% | N/A | Daily |
| **Mean Time to Detect (MTTD)** | <5 minutes | N/A | Weekly |
| **Mean Time to Respond (MTTR)** | <30 minutes | N/A | Weekly |

---

## Next Steps (Handoff to Ph5.29)

After Week 6 (Ph5.28) completion:

1. **Security audit** by external firm (2-3 weeks)
   - Penetration test
   - Code review
   - Compliance validation (GDPR/CCPA)

2. **Incident response drill** (1 week)
   - Simulate security breach
   - Verify alert/response procedures
   - Document lessons learned

3. **Security training** for all engineers (ongoing)
   - OWASP Top 10 deep dive
   - Secure coding practices
   - Incident response procedures

4. **Phase 5.29-30** (Week 7+)
   - Scaling & Load Balancing (Ph5.29)
   - API Gateway & Service Mesh (Ph5.30)

---

## Reference Documents

### Internal
- `/biometrics/ARCHITECTURE.md` - Overall platform architecture
- `/biometrics/docs/GDPR-compliance-checklist.md` - GDPR requirements
- `/biometrics/docs/CCPA-compliance-checklist.md` - CCPA requirements

### External
- **OAuth 2.0**: https://tools.ietf.org/html/rfc6749
- **OpenID Connect**: https://openid.net/connect/
- **GDPR**: https://gdpr-info.eu/
- **CCPA**: https://oag.ca.gov/privacy/ccpa
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **TLS 1.3**: https://tools.ietf.org/html/rfc8446

### Tools & Dashboards
- **Auth0 Dashboard**: https://manage.auth0.com
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Elasticsearch Kibana**: http://localhost:5601
- **Security Headers Tester**: https://securityheaders.com

---

## Appendix: Configuration Examples

### Example: .env.local (Never commit)
```
AUTH0_DOMAIN=yourdomain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
ENCRYPTION_MASTER_KEY=your_aes_256_key_hex_encoded
VAULT_ADDR=https://vault.yourdomain.com
VAULT_TOKEN=your_token
```

### Example: docker-compose.yml (Elasticsearch)
```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=true
      - ELASTIC_PASSWORD=changeme
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

### Example: Next.js Security Headers (next.config.js)
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'accelerometer=(), camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};
```

---

**WORKSTREAM COMPLETE**

All 6 weeks (Ph5.3, Ph5.8, Ph5.13, Ph5.18, Ph5.23, Ph5.28) of the Security & Compliance workstream are now fully documented. Ready for Week 1 execution.

