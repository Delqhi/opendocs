# Shell Specification

## Overview
Die Application Shell ist das persistente Layout, das alle Seiten umgibt. Sie enthält die Navigation, den Warenkorb-Drawer und den AI-Chat-Widget.

## Layout Pattern
- **Header**: Sticky top navigation
- **Main**: Content area with padding
- **Footer**: Full-width footer with links
- **Overlays**: Cart drawer (right), Mobile menu (full), Chat widget (bottom-right)

## Navigation Structure

### Main Navigation (Desktop)
- Logo (links) → Homepage
- Navigation Links (center): Home, Produkte, Kategorien
- Actions (rechts): Suche, Warenkorb, Account

### Mobile Navigation
- Logo (links)
- Hamburger Menu (rechts) → Full-screen overlay
- Cart icon with badge

### User Menu
- Nicht eingeloggt: "Anmelden" / "Registrieren"
- Eingeloggt: Avatar, Name, Dropdown mit Mein Konto, Bestellungen, Abmelden

## Persistent Elements

### Cart Drawer
- Slide-in von rechts
- Liste der Warenkorb-Items
- Summe und Checkout-Button
- Schließen-Button

### AI Chat Widget
- Floating button (bottom-right)
- Expandable chat window
- "KI-Assistent" branding

## Responsive Behavior

### Desktop (lg+)
- Full navigation visible
- Cart drawer 400px width

### Tablet (md)
- Navigation in hamburger menu
- Cart drawer 400px width

### Mobile (sm)
- Hamburger menu
- Cart drawer full width
- Simplified footer

## Dark Mode
- Default: Dark mode enabled
- Background: gray-950/900
- Text: white/gray-300
- Accents: fuchsia-500, cyan-500
