# 🛍️ SIMONE-WEBSHOP-01

**Vollautomatisierter KI-Dropshipping-Shop für Simone Schulze**

> Besser als Shopify - Vollständig KI-gesteuert mit n8n Workflow-Automatisierung

---

## 🎯 FEATURES

### Shop-Frontend
- ✅ Modernes Dark-Mode Design
- ✅ Produktkatalog mit Kategorien & Filter
- ✅ Warenkorb mit Slide-Drawer
- ✅ Checkout mit Stripe, PayPal, Klarna
- ✅ Kundenkonto & Bestellhistorie
- ✅ KI-Chat-Assistent (24/7)

### Vollautomatisierung
- ✅ **Lieferanten-Recherche**: KI findet automatisch die besten Lieferanten
- ✅ **Trend-Analyse**: Täglich beste Produkte identifizieren
- ✅ **Automatische Bestellungen**: Kunde bestellt → Lieferant erhält Order
- ✅ **Zahlungsabwicklung**: Stripe + PayPal + Klarna
- ✅ **Rechnungen**: Automatische Generierung & Versand
- ✅ **Kundenservice**: KI-Chat beantwortet 80% der Fragen
- ✅ **Social Media**: Automatische Posts auf allen Plattformen

### Integrationen
| Integration | Status | Beschreibung |
|------------|--------|--------------|
| n8n | ✅ | 20+ Workflows für Vollautomatisierung |
| Stripe | ✅ | Kreditkarten, Apple Pay, Google Pay |
| PayPal | ✅ | Klassische PayPal-Zahlung |
| Klarna | ✅ | Kauf auf Rechnung, Ratenzahlung |
| ClawdBot | ✅ | Social Media Automation |
| eBay | ✅ | Produkt-Sync & Bestellimport |
| Gmail | ✅ | E-Mail-Versand |
| WhatsApp | ✅ | Kundenkommunikation |

---

## 🚀 SCHNELLSTART

### 1. Voraussetzungen

```bash
# Docker & Docker Compose installiert
docker --version
docker-compose --version

# Node.js 20+ installiert
node --version
```

### 2. Projekt einrichten

```bash
# Projekt klonen
git clone https://github.com/your-org/simone-webshop-01.git
cd simone-webshop-01

# Environment-Datei erstellen
cp .env.example .env

# .env bearbeiten und API-Keys eintragen
nano .env
```

### 3. Starten

```bash
# Entwicklung
./start.sh dev

# Produktion
./start.sh prod

# Mit Social Media (ClawdBot)
./start.sh social
```

### 4. Zugriff

| Service | URL | Login |
|---------|-----|-------|
| Shop | http://localhost:3000 | - |
| Admin | http://localhost:3000/admin | simone@example.com |
| n8n | http://localhost:5678 | admin / simone2026 |

---

## 📁 PROJEKTSTRUKTUR

```
simone-webshop-01/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Endpoints
│   │   ├── admin/              # Admin Dashboard
│   │   ├── products/           # Produktseiten
│   │   ├── cart/               # Warenkorb
│   │   ├── checkout/           # Checkout
│   │   └── account/            # Kundenkonto
│   ├── components/             # React Components
│   │   ├── ui/                 # Basis-UI
│   │   ├── ai/                 # KI-Chat
│   │   ├── cart/               # Warenkorb
│   │   ├── products/           # Produkte
│   │   └── layout/             # Layout
│   ├── lib/                    # Utilities
│   └── types/                  # TypeScript Types
├── n8n-workflows/              # n8n Workflow-Dateien
├── supabase/                   # Datenbank-Schema
├── docker/                     # Docker-Configs
├── .clawdbot/                  # ClawdBot-Konfiguration
├── docker-compose.yml          # Docker Stack
├── Dockerfile                  # App Container
├── start.sh                    # Startup Script
└── README.md                   # Diese Datei
```

---

## ⚙️ KONFIGURATION

### Benötigte API-Keys

| API | Zweck | Kosten |
|-----|-------|--------|
| OpenCode Zen | KI-Chat | ✅ KOSTENLOS |
| Mistral | Bild-Erkennung | ✅ KOSTENLOS |
| Stripe | Zahlungen | Pay-per-use |
| PayPal | Zahlungen | Pay-per-use |
| Klarna | Zahlungen | Pay-per-use |

### n8n Workflows importieren

1. Öffne n8n: http://localhost:5678
2. Gehe zu **Settings → Import**
3. Importiere alle Dateien aus `n8n-workflows/`
4. Aktiviere die Workflows

---

## 🤖 KI-AGENTEN

### 1. Lieferanten-Recherche
- Läuft täglich um 6:00 Uhr
- Sucht neue Dropshipping-Lieferanten
- Speichert in Datenbank zur Genehmigung

### 2. Trend-Analyse
- Läuft stündlich
- Analysiert Google Trends, Amazon, eBay
- Aktualisiert Trending-Score der Produkte

### 3. Kundenservice
- 24/7 aktiv im Chat
- Beantwortet 80% der Fragen automatisch
- Eskaliert komplexe Fälle an Support

### 4. Bestell-Automatisierung
- Trigger: Neue Bestellung
- Kauft automatisch beim Lieferanten
- Sendet Tracking an Kunden

---

## 📊 ADMIN DASHBOARD

### One-Click Aktionen
- ✅ Lieferant genehmigen/ablehnen
- ✅ Produkt aktivieren/deaktivieren
- ✅ Bestellung stornieren
- ✅ Rückerstattung initiieren

### Statistiken
- 📈 Tagesumsatz
- 📦 Offene Bestellungen
- ⭐ Kundenbewertungen
- 📱 Social Media Engagement

---

## 🔧 WARTUNG

### Logs anzeigen
```bash
./start.sh logs
```

### Dienste neustarten
```bash
./start.sh stop
./start.sh prod
```

### Datenbank-Backup
```bash
docker exec simone-webshop-postgres pg_dump -U simone simone_shop > backup.sql
```

---

## 📞 SUPPORT

Bei Fragen oder Problemen:
- 📧 E-Mail: support@sin-enterprise.com
- 💬 Chat: Im Admin-Dashboard
- 📱 WhatsApp: +49 XXX XXXXXXX

---

**Version:** 1.0.0  
**Erstellt für:** Simone Schulze  
**Datum:** Januar 2026  
**Powered by:** SIN Enterprise Templates

*"Vollautomatisierter E-Commerce - Sie müssen nur noch genehmigen."*
