# Product Roadmap

## Sections Overview

### Section 1: Storefront
**ID:** `storefront`
**Description:** Die öffentliche Shop-Oberfläche mit Produktkatalog, Suche und Kategorien.
**Priority:** High
**Screens:** Homepage, Produktliste, Produktdetails, Kategorieseiten

### Section 2: Cart & Checkout
**ID:** `cart-checkout`
**Description:** Warenkorb und kompletter Checkout-Prozess mit Multi-Payment-Integration.
**Priority:** High
**Screens:** Warenkorb, Checkout (Adresse, Versand, Zahlung, Bestätigung)

### Section 3: Account
**ID:** `account`
**Description:** Kundenbereich mit Bestellhistorie, Adressen und Einstellungen.
**Priority:** Medium
**Screens:** Dashboard, Bestellungen, Bestelldetails, Adressen, Profil

### Section 4: Admin
**ID:** `admin`
**Description:** Administrations-Dashboard für Simone mit Statistiken und Lieferanten-Genehmigung.
**Priority:** High
**Screens:** Dashboard, Bestellungen, Produkte, Lieferanten, Einstellungen

## Development Order
1. Storefront (Foundation)
2. Cart & Checkout (Core Commerce)
3. Account (Customer Experience)
4. Admin (Management)

## Dependencies
- Storefront → Cart & Checkout (Products needed for cart)
- Cart & Checkout → Account (Orders needed for history)
- All sections → Admin (Overview of all data)
