# Data Model

## Core Entities

### Customer
Der Endkunde, der im Shop einkauft.
- Persönliche Daten (Name, Email, Telefon)
- Adressen (Lieferung, Rechnung)
- Bestellhistorie

### Product
Ein Produkt im Shop-Katalog.
- Name, Beschreibung, Preis
- Bilder (Array)
- Kategorie
- Varianten (Größe, Farbe)
- Bestand
- Lieferant-Referenz

### Category
Produktkategorien für Navigation und Filter.
- Name, Slug
- Beschreibung
- Bild
- Hierarchie (Parent/Child)

### Order
Eine Kundenbestellung.
- Status (pending, confirmed, processing, shipped, delivered, cancelled)
- Bestellpositionen
- Adressen
- Zahlungsstatus
- Tracking

### OrderItem
Einzelne Position in einer Bestellung.
- Produkt-Referenz
- Menge
- Preis zum Kaufzeitpunkt
- Variante

### Supplier
Lieferant/Dropshipper.
- Kontaktdaten
- Status (pending, approved, rejected)
- API-Endpunkt
- Bewertung

### Review
Kundenbewertung für ein Produkt.
- Bewertung (1-5 Sterne)
- Titel, Inhalt
- Verifiziert (gekauft)
- Hilfreich-Zähler

### SupportTicket
Kundenservice-Anfrage.
- Kanal (WhatsApp, Email, Telegram)
- Status (open, in_progress, resolved)
- Nachrichten

## Relationships

```
Customer 1:N Order
Order 1:N OrderItem
OrderItem N:1 Product
Product N:1 Category
Product N:1 Supplier
Product 1:N Review
Customer 1:N Review
Customer 1:N SupportTicket
```
