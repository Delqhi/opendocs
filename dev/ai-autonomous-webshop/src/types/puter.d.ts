export {};

declare global {
  type PuterAIChatChunk = {
    text?: string;
  };

  type PuterAIChatResponse = AsyncIterable<PuterAIChatChunk> | { text?: string };

  type PuterAI = {
    chat: (
      prompt: string,
      options?: {
        model?: string;
        stream?: boolean;
        // puter.js supports other params, keep minimal/forward compatible
        [k: string]: unknown;
      }
    ) => Promise<PuterAIChatResponse>;
  };

  type Puter = {
    ai: PuterAI;
  };

  interface Window {
    puter?: Puter;
  }
}
