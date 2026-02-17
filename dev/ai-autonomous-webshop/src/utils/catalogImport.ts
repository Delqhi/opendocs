import type { AdminSupplier, Product } from '../store/shopStore';

export type CatalogImportResult = {
  products: Product[];
  warnings: string[];
};

type AnyRecord = Record<string, unknown>;

const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const toNumber = (v: unknown, fallback = 0) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

const toString = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);

const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  if (typeof v === 'string') {
    // tags separated by comma or space
    if (v.includes(',')) return v.split(',').map((t) => t.trim()).filter(Boolean);
    return v
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 12);
  }
  return [];
};

function guessCategory(raw: AnyRecord, supplierFallback?: string) {
  const c = toString(raw.category) || toString(raw.product_type) || toString(raw.type);
  if (c) return c;
  return supplierFallback || 'Misc';
}

function guessImages(raw: AnyRecord): { image: string; images?: string[] } {
  const image = toString(raw.image) || toString(raw.image_url) || toString(raw.thumbnail) || '';
  const imgs =
    (Array.isArray(raw.images) ? raw.images : undefined) ||
    (typeof raw.image_urls === 'string' ? raw.image_urls.split('|') : undefined) ||
    (typeof raw.images_csv === 'string' ? raw.images_csv.split(',') : undefined) ||
    undefined;

  const list = (imgs ? imgs.map((x) => String(x).trim()).filter(Boolean) : []).filter(Boolean);
  const unique = Array.from(new Set([image, ...list].filter(Boolean)));

  return {
    image: unique[0] ?? '',
    images: unique.length > 1 ? unique : undefined,
  };
}

function normalizeSourceType(supplier: AdminSupplier, raw: AnyRecord): Product['sourceType'] {
  const st = toString(raw.sourceType) || toString(raw.source_type) || toString(raw.source);
  const lower = st.toLowerCase();
  if (lower === 'affiliate') return 'affiliate';
  if (lower === 'own') return 'own';
  if (lower === 'dropship') return 'dropship';

  if (supplier.type === 'affiliate') return 'affiliate';
  if (supplier.type === 'warehouse') return 'own';
  return 'dropship';
}

function toProduct(supplier: AdminSupplier, raw: AnyRecord, warnings: string[]): Product | null {
  const sku = toString(raw.sku) || toString(raw.supplier_sku) || toString(raw.variant_sku) || '';
  const name = toString(raw.name) || toString(raw.title) || '';
  const description =
    toString(raw.description) ||
    toString(raw.short_description) ||
    toString(raw.desc) ||
    '';

  if (!name) {
    warnings.push('Skipped a row with missing name/title');
    return null;
  }

  const { image, images } = guessImages(raw);
  if (!image) {
    warnings.push(`Product "${name}" missing image; consider adding image_url/image`);
  }

  const price = toNumber(raw.price, 0);
  const originalPrice = Math.max(price, toNumber(raw.originalPrice ?? raw.compare_at_price ?? raw.msrp, price));

  // id strategy: supplierId + sku if present, else slug(name)
  const baseId = sku ? `${supplier.id}:${sku}` : `${supplier.id}:${slugify(name)}`;

  const sourceType = normalizeSourceType(supplier, raw);

  const product: Product = {
    id: baseId,
    name,
    description,
    price,
    originalPrice,
    category: guessCategory(raw, ''),
    image,
    images,
    videoUrl: toString(raw.videoUrl) || toString(raw.video_url) || undefined,
    rating: Math.min(5, Math.max(3.8, toNumber(raw.rating, 4.7))),
    reviews: Math.max(0, Math.floor(toNumber(raw.reviews, 0))),
    stock: Math.max(0, Math.floor(toNumber(raw.stock ?? raw.inventory, 100))),
    aiScore: Math.min(99, Math.max(70, Math.floor(toNumber(raw.aiScore ?? raw.ai_score, 90)))),
    trending: Boolean(raw.trending ?? false),
    tags: toStringArray(raw.tags ?? raw.tag_list ?? raw.keywords).slice(0, 12),
    supplier: supplier.name,
    margin: Math.min(90, Math.max(10, Math.floor(toNumber(raw.margin, 55)))),
    aiOptimized: Boolean(raw.aiOptimized ?? true),
    demandScore: Math.min(99, Math.max(60, Math.floor(toNumber(raw.demandScore ?? raw.demand_score, 85)))),
    sold: Math.max(0, Math.floor(toNumber(raw.sold, 0))),
    badge: toString(raw.badge) || undefined,
    sourceType,
    affiliateUrl: sourceType === 'affiliate' ? (toString(raw.affiliateUrl) || toString(raw.affiliate_url) || toString(raw.url) || undefined) : undefined,
    affiliateNetworkId: sourceType === 'affiliate' ? (toString(raw.affiliateNetworkId) || toString(raw.affiliate_network_id) || undefined) : undefined,
    supplierId: supplier.id,
    supplierPrice: toNumber(raw.supplierPrice ?? raw.cost ?? raw.cogs, undefined as unknown as number) || undefined,
    sku: sku || undefined,
    status: (toString(raw.status).toLowerCase() as Product['status']) || 'active',
  };

  return product;
}

function parseCsv(text: string): AnyRecord[] {
  // Very small CSV parser: handles commas and simple quotes.
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const parseLine = (line: string) => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (ch === ',' && !inQuotes) {
        out.push(cur);
        cur = '';
        continue;
      }
      cur += ch;
    }
    out.push(cur);
    return out.map((v) => v.trim());
  };

  const headers = parseLine(lines[0]).map((h) => slugify(h).replace(/-/g, '_'));
  return lines.slice(1).map((l) => {
    const cols = parseLine(l);
    const row: AnyRecord = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });
    return row;
  });
}

export async function importCatalogFromUrl(args: {
  supplier: AdminSupplier;
  url: string;
  format: 'json' | 'csv';
  authHeader?: string;
}): Promise<CatalogImportResult> {
  const { supplier, url, format, authHeader } = args;
  const warnings: string[] = [];

  const headers: Record<string, string> = {};
  if (authHeader && authHeader.includes(':')) {
    const [k, ...rest] = authHeader.split(':');
    const v = rest.join(':').trim();
    if (k && v) headers[k.trim()] = v;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Catalog fetch failed (${res.status})`);
  }

  if (format === 'csv') {
    const text = await res.text();
    const rows = parseCsv(text);
    const products = rows
      .map((r) => toProduct(supplier, r, warnings))
      .filter(Boolean) as Product[];
    return { products, warnings };
  }

  const json = (await res.json()) as unknown;
  const rows: AnyRecord[] = Array.isArray(json)
    ? (json as AnyRecord[])
    : typeof json === 'object' && json && Array.isArray((json as AnyRecord).products)
      ? (((json as AnyRecord).products as unknown[]) as AnyRecord[])
      : typeof json === 'object' && json && Array.isArray((json as AnyRecord).items)
        ? (((json as AnyRecord).items as unknown[]) as AnyRecord[])
        : [];

  if (rows.length === 0) {
    warnings.push('No catalog items found. Expected an array or {products:[...]}');
  }

  const products = rows
    .map((r) => toProduct(supplier, r, warnings))
    .filter(Boolean) as Product[];

  return { products, warnings };
}
