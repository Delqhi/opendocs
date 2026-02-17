import type { ChatMessage, ShopSettings } from '../store/shopStore';

export type AIChatRole = 'system' | 'user' | 'assistant';

export type AIChatMessage = {
  role: AIChatRole;
  content: string;
};

export class AIClientError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'AIClientError';
  }
}

const toAIChatMessages = (messages: ChatMessage[]): AIChatMessage[] =>
  messages.map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));

const safeJson = async <T,>(res: Response): Promise<T> => {
  try {
    return (await res.json()) as T;
  } catch (e) {
    throw new AIClientError('Invalid JSON response from AI provider', e);
  }
};

const normalizeBaseUrl = (url: string) => url.replace(/\/$/g, '');

export async function aiChatComplete(args: {
  settings: ShopSettings;
  messages: ChatMessage[];
  system?: string;
  signal?: AbortSignal;
}): Promise<string> {
  const { settings, messages, system, signal } = args;
  const provider = settings.aiProvider;
  
  // PRIMARY LLM FEB 2026: NVIDIA / Kimi K2.5 (Multimodal)
  const model = settings.aiModel || 'nvidia/kimi-k2.5-multimodal';
  const temperature = settings.aiTemperature;

  const userMessages = toAIChatMessages(messages);
  const finalMessages: AIChatMessage[] = system
    ? [{ role: 'system', content: system }, ...userMessages]
    : userMessages;

  if (provider === 'puter') {
    // Puter.js (User-Pays model): runs entirely in the browser without your API keys.
    // Requires: <script src="https://js.puter.com/v2/"></script> in index.html
    if (typeof window === 'undefined' || !window.puter?.ai?.chat) {
      throw new AIClientError('Puter.js not available. Ensure the script is loaded.');
    }

    const prompt = finalMessages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    // Puter streaming API returns an async iterable.
    const res = await window.puter.ai.chat(prompt, {
      model,
      stream: true,
      temperature,
    });

    // If it is async iterable, collect chunks.
    const maybeAsync = res as unknown;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAsyncIterable = (obj: any): obj is AsyncIterable<any> => obj && typeof obj[Symbol.asyncIterator] === 'function';

    if (isAsyncIterable(maybeAsync)) {
      let out = '';
      for await (const part of maybeAsync) {
        if (signal?.aborted) throw new AIClientError('Request aborted');
        out += (part?.text ?? '');
      }
      return out.trim();
    }

    // Non-stream fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return String((maybeAsync as any)?.text ?? '').trim();
  }

  if (provider === 'ollama') {
    const baseUrl = normalizeBaseUrl(settings.aiBaseUrl || 'http://localhost:11434');
    const url = `${baseUrl}/api/chat`;

    type OllamaResponse = {
      message?: { role: string; content: string };
      response?: string;
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        messages: finalMessages,
        options: {
          temperature,
          num_predict: settings.aiMaxTokens,
        },
      }),
      signal,
    });

    if (!res.ok) {
      throw new AIClientError(`Ollama request failed (${res.status})`);
    }

    const data = await safeJson<OllamaResponse>(res);
    return (data.message?.content || data.response || '').trim();
  }

  if (provider === 'openai') {
    const key = settings.aiApiKey;
    if (!key) throw new AIClientError('OpenAI API key missing');

    type OpenAIResponse = {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: settings.aiMaxTokens,
        messages: finalMessages,
      }),
      signal,
    });

    if (!res.ok) {
      throw new AIClientError(`OpenAI request failed (${res.status})`);
    }

    const data = await safeJson<OpenAIResponse>(res);
    return (data.choices?.[0]?.message?.content || '').trim();
  }

  if (provider === 'anthropic') {
    const key = settings.aiApiKey;
    if (!key) throw new AIClientError('Anthropic API key missing');

    // Anthropic Messages API
    type AnthropicResponse = {
      content?: Array<{ type: string; text?: string }>;
    };

    // Anthropic doesn't accept "system" in messages array; it's a separate field.
    const sys = system ?? undefined;
    const anthropicMessages = userMessages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: settings.aiMaxTokens,
        temperature,
        system: sys,
        messages: anthropicMessages,
      }),
      signal,
    });

    if (!res.ok) {
      throw new AIClientError(`Anthropic request failed (${res.status})`);
    }

    const data = await safeJson<AnthropicResponse>(res);
    const text = data.content?.map((c) => c.text || '').join('\n') || '';
    return text.trim();
  }

  if (provider === 'custom' || provider === 'puter') {
     // Puter logic already handled above, this is for any other custom provider
  }

  // NVIDIA NIM API (Standard 2026)
  if (model.includes('nvidia')) {
    const key = settings.nvidiaApiKey || settings.aiApiKey;
    if (!key) throw new AIClientError('NVIDIA API key missing');

    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: settings.aiMaxTokens,
        messages: finalMessages,
      }),
      signal,
    });

    if (!res.ok) {
      throw new AIClientError(`NVIDIA request failed (${res.status})`);
    }

    const data = await safeJson<{ choices?: Array<{ message?: { content?: string } }> }>(res);
    return (data.choices?.[0]?.message?.content || '').trim();
  }

  // Fallback / Custom
  const baseUrl = settings.aiBaseUrl;
  if (!baseUrl) throw new AIClientError('Custom AI base URL missing');

  type CustomResponse = { content?: string; text?: string; message?: string };

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(settings.aiApiKey ? { Authorization: `Bearer ${settings.aiApiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      temperature,
      maxTokens: settings.aiMaxTokens,
      messages: finalMessages,
    }),
    signal,
  });

  if (!res.ok) {
    throw new AIClientError(`Custom AI request failed (${res.status})`);
  }

  const data = await safeJson<CustomResponse>(res);
  return (data.content || data.text || data.message || '').trim();
}
