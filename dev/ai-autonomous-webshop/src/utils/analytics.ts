export type AnalyticsEvent = {
  name: string;
  params?: Record<string, unknown>;
  ts: number;
};

const LOG_KEY = 'nexus_analytics_log_v1';

function pushToLocalLog(event: AnalyticsEvent) {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    const prev = raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
    const next = [event, ...prev].slice(0, 200);
    localStorage.setItem(LOG_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function pushToDataLayer(event: AnalyticsEvent) {
  // Google Tag Manager compatible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: event.name,
    ...event.params,
    ts: event.ts,
  });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  const evt: AnalyticsEvent = { name, params, ts: Date.now() };
  if (typeof window !== 'undefined') {
    pushToLocalLog(evt);
    pushToDataLayer(evt);
  }
}

export function trackPageView(page: string, params?: Record<string, unknown>) {
  trackEvent('page_view', { page, ...(params ?? {}) });
}
