import { NextRequest, NextResponse } from 'next/server'

// OpenCode Zen API (FREE - grok-code model)
const OPENCODE_API_URL = 'https://api.opencode.ai/v1/chat/completions'

const SYSTEM_PROMPT = `Du bist der freundliche KI-Assistent für Simone's Online-Shop. Du hilfst Kunden auf Deutsch bei:

1. **Produktberatung**: Empfiehlst passende Produkte basierend auf den Kundenwünschen
2. **Bestellstatus**: Gibst Auskunft über Bestellungen (wenn Bestellnummer genannt wird)
3. **Versandfragen**: Informierst über Lieferzeiten und Versandkosten
4. **Rückgaben**: Erklärst das 30-Tage-Rückgaberecht
5. **Allgemeine Fragen**: Beantwortest Fragen zum Shop

**Wichtige Infos:**
- Kostenloser Versand ab 50€ Bestellwert
- Lieferzeit: 2-4 Werktage
- 30 Tage Rückgaberecht
- Sichere Zahlung mit Stripe, PayPal, Klarna
- 2 Jahre Garantie auf alle Produkte

**Stil:**
- Freundlich und hilfsbereit
- Kurze, prägnante Antworten
- Verwende Emojis sparsam aber passend
- Bei Produktfragen, verweise auf die Produktseite

Du antwortest NUR auf Deutsch.`

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  context?: {
    currentPage?: string
    cartItems?: number
    userId?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, context }: ChatRequest = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Nachrichten sind erforderlich' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENCODE_ZEN_API_KEY

    if (!apiKey) {
      console.error('OPENCODE_ZEN_API_KEY not configured')
      return NextResponse.json(
        { error: 'API-Schlüssel nicht konfiguriert' },
        { status: 500 }
      )
    }

    // Build context-aware system prompt
    let enhancedSystemPrompt = SYSTEM_PROMPT
    if (context?.currentPage) {
      enhancedSystemPrompt += `\n\nDer Kunde befindet sich aktuell auf: ${context.currentPage}`
    }
    if (context?.cartItems) {
      enhancedSystemPrompt += `\n\nDer Kunde hat ${context.cartItems} Artikel im Warenkorb.`
    }

    // Prepare messages for API
    const apiMessages: ChatMessage[] = [
      { role: 'system', content: enhancedSystemPrompt },
      ...messages.slice(-10), // Keep last 10 messages for context
    ]

    // Call OpenCode Zen API
    const response = await fetch(OPENCODE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-code',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenCode API error:', response.status, errorText)
      
      // Fallback response if API fails
      return NextResponse.json({
        message: 'Entschuldigung, ich bin gerade nicht erreichbar. Bitte versuche es später erneut oder kontaktiere unseren Support unter support@simones-shop.de.',
        success: false,
      })
    }

    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json({
        message: 'Entschuldigung, ich konnte deine Anfrage nicht verarbeiten. Bitte versuche es erneut.',
        success: false,
      })
    }

    return NextResponse.json({
      message: assistantMessage,
      success: true,
      usage: data.usage,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { 
        error: 'Ein Fehler ist aufgetreten',
        message: 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuche es später erneut.',
        success: false,
      },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'AI Chat',
    model: 'grok-code (OpenCode Zen)',
    language: 'de',
  })
}
