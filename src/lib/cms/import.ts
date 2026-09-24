import { CATEGORIES, PROPERTY_TYPES, STATUSES, newId, slugify, type Category, type Property, type PropertyStatus, type PropertyType } from "@/lib/cms/schema";

/* ------------------------------------------------------------------------------------------------
 * Importing properties from a spreadsheet, in the browser.
 *
 * 1. `parseDelimited` reads CSV / TSV / semicolon text (quoted fields included).
 * 2. `mapColumns` matches column headings to property fields by name (price, sqft, beds, …).
 * 3. Or `aiMap` asks an AI model (OpenAI, Gemini or Claude, with the user's own key, called straight
 *    from the browser) to do the mapping against the schema and return JSON.
 * 4. `normalizeProperty` turns either result into a valid Property (numbers parsed from "AED 2.95M"
 *    or "1,450 sq ft", category inferred from the type, slug from the name) and lists what it had
 *    to guess or could not read.
 * ---------------------------------------------------------------------------------------------- */

export interface Sheet {
  headers: string[];
  rows: string[][];
}

export function parseDelimited(text: string): Sheet {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim()) ?? "";
  const delimiter = [
    ["\t", (firstLine.match(/\t/g) ?? []).length],
    [";", (firstLine.match(/;/g) ?? []).length],
    [",", (firstLine.match(/,/g) ?? []).length],
  ].sort((a, b) => (b[1] as number) - (a[1] as number))[0][0] as string;
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  const [headers = [], ...data] = rows;
  return { headers: headers.map((h) => h.trim()), rows: data };
}

/** Column heading synonyms -> property field. */
const SYNONYMS: Record<string, string[]> = {
  name: ["name", "title", "property", "project", "listing", "unit"],
  community: ["community", "location", "area name", "district", "neighbourhood", "neighborhood", "where"],
  category: ["category", "segment", "sector"],
  type: ["type", "property type", "unit type", "kind"],
  status: ["status", "completion", "ready", "stage"],
  priceAed: ["price", "price aed", "aed", "asking", "asking price", "cost", "amount"],
  areaSqft: ["area", "size", "sqft", "sq ft", "square feet", "built up area", "bua", "area sqft"],
  bedrooms: ["bedrooms", "beds", "bed", "br", "bedroom"],
  bathrooms: ["bathrooms", "baths", "bath", "ba", "bathroom"],
  unitsAvailable: ["units", "units available", "available", "availability", "stock"],
  handover: ["handover", "completion date", "delivery", "ready by"],
  developer: ["developer", "builder", "brand"],
  images: ["images", "image", "photos", "photo", "pictures", "image url", "image urls", "cover"],
  highlights: ["highlights", "features", "amenities", "usps", "selling points"],
  description: ["description", "summary", "details", "about", "notes"],
  featured: ["featured", "highlight", "promoted"],
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

export function matchHeaders(headers: string[]): Record<number, string> {
  const map: Record<number, string> = {};
  const used = new Set<string>();
  headers.forEach((h, i) => {
    const n = norm(h);
    for (const [field, names] of Object.entries(SYNONYMS)) {
      if (used.has(field)) continue;
      if (names.includes(n) || names.some((x) => n === norm(x))) {
        map[i] = field;
        used.add(field);
        return;
      }
    }
  });
  // second pass: partial matches
  headers.forEach((h, i) => {
    if (map[i]) return;
    const n = norm(h);
    for (const [field, names] of Object.entries(SYNONYMS)) {
      if (used.has(field)) continue;
      if (names.some((x) => n.includes(norm(x)))) {
        map[i] = field;
        used.add(field);
        return;
      }
    }
  });
  return map;
}

export function mapColumns(sheet: Sheet): { records: Record<string, unknown>[]; mapping: Record<number, string> } {
  const mapping = matchHeaders(sheet.headers);
  const records = sheet.rows.map((row) => {
    const rec: Record<string, unknown> = {};
    row.forEach((cell, i) => {
      const field = mapping[i];
      if (field) rec[field] = cell;
    });
    return rec;
  });
  return { records, mapping };
}

/** "AED 2.95M" -> 2950000, "1,450 sq ft" -> 1450, "640k" -> 640000 */
export function parseNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const s = v.toLowerCase().replace(/,/g, "").trim();
  const m = s.match(/(-?\d+(?:\.\d+)?)\s*(m|mn|million|k|thousand|bn|b|billion)?/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  const unit = m[2];
  if (unit && /^(m|mn|million)$/.test(unit)) n *= 1_000_000;
  else if (unit && /^(k|thousand)$/.test(unit)) n *= 1_000;
  else if (unit && /^(bn|b|billion)$/.test(unit)) n *= 1_000_000_000;
  return Math.round(n);
}

function inferCategory(typeText: string, categoryText: string): Category {
  const c = norm(categoryText);
  const found = CATEGORIES.find((x) => c && norm(x).startsWith(c.slice(0, 5)));
  if (found) return found;
  const t = norm(typeText);
  if (/villa|townhouse|mansion/.test(t)) return "Villas";
  if (/warehouse|logistic|industrial|storage|factory/.test(t)) return "Warehouse";
  if (/office|retail|shop|commercial|showroom|clinic|plot/.test(t)) return "Commercial";
  return "Residential";
}

function inferType(typeText: string, category: Category): PropertyType {
  const t = norm(typeText);
  const direct = PROPERTY_TYPES.find((x) => t.includes(norm(x)));
  if (direct) return direct;
  if (/studio|flat|apt/.test(t)) return "Apartment";
  if (/shop|store/.test(t)) return "Retail";
  if (/land/.test(t)) return "Plot";
  return category === "Villas" ? "Villa" : category === "Warehouse" ? "Warehouse" : category === "Commercial" ? "Office" : "Apartment";
}

function inferStatus(s: string, handover: string): PropertyStatus {
  const t = norm(`${s} ${handover}`);
  if (/off ?plan|under construction|launch|q[1-4]|20[2-3]\d/.test(t) && !/ready/.test(norm(s))) return "Off-plan";
  return STATUSES[0];
}

const list = (v: unknown, sep = /[;|\n]/) => (Array.isArray(v) ? v.map(String) : typeof v === "string" ? v.split(sep).map((x) => x.trim()).filter(Boolean) : []);
const str = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

/** One raw record -> a Property, with a list of what was guessed or missing. */
export function normalizeProperty(raw: Record<string, unknown>, existing?: Property): { property: Property; issues: string[] } {
  const issues: string[] = [];
  const name = str(raw.name) || existing?.name || "";
  if (!name) issues.push("no name");
  const category = raw.category || raw.type ? inferCategory(str(raw.type), str(raw.category)) : (existing?.category ?? "Residential");
  const type = inferType(str(raw.type), category);
  const priceAed = parseNumber(raw.priceAed) ?? existing?.priceAed ?? 0;
  if (!priceAed) issues.push("no price");
  const areaSqft = parseNumber(raw.areaSqft) ?? existing?.areaSqft ?? 0;
  if (!areaSqft) issues.push("no size");
  const handover = str(raw.handover) || existing?.handover || "Ready";
  const status = raw.status || raw.handover ? inferStatus(str(raw.status), handover) : (existing?.status ?? "Ready");
  const beds = parseNumber(raw.bedrooms);
  const baths = parseNumber(raw.bathrooms);
  const units = parseNumber(raw.unitsAvailable);
  const images = list(raw.images).map((s) => s.trim()).filter((s) => /^(https?:\/\/|\/)/.test(s));
  if (list(raw.images).length && !images.length) issues.push("photo links must start with http or /");
  const featuredText = norm(str(raw.featured));
  const property: Property = {
    id: existing?.id ?? newId("p"),
    slug: existing?.slug ?? slugify(str(raw.slug) || name),
    name,
    category,
    community: str(raw.community) || existing?.community || "",
    type,
    status,
    priceAed,
    areaSqft,
    bedrooms: beds ?? existing?.bedrooms ?? (category === "Residential" || category === "Villas" ? null : null),
    bathrooms: baths ?? existing?.bathrooms ?? null,
    unitsAvailable: units ?? existing?.unitsAvailable ?? null,
    handover: status === "Ready" && !str(raw.handover) ? "Ready" : handover,
    developer: str(raw.developer) || existing?.developer || "",
    images: images.length ? images : (existing?.images ?? []),
    highlights: list(raw.highlights).length ? list(raw.highlights) : (existing?.highlights ?? []),
    description: str(raw.description) || existing?.description || "",
    featured: featuredText ? /^(yes|true|1|y|featured)$/.test(featuredText) : (existing?.featured ?? false),
    archived: existing?.archived ?? false,
    order: existing?.order ?? 50,
    updatedAt: new Date().toISOString(),
  };
  if (!property.community) issues.push("no community");
  if (!property.images.length) issues.push("no photos yet");
  return { property, issues };
}

/* ----------------------------------- AI mapping ---------------------------------------------- */

export type AiProvider = "openai" | "gemini" | "anthropic";
export const AI_DEFAULT_MODELS: Record<AiProvider, string> = { openai: "gpt-4o-mini", gemini: "gemini-2.0-flash", anthropic: "claude-sonnet-5" };
export const AI_LABELS: Record<AiProvider, string> = { openai: "OpenAI (ChatGPT)", gemini: "Google Gemini", anthropic: "Anthropic (Claude)" };

const SYSTEM_PROMPT = `You convert a real-estate spreadsheet into JSON for a Dubai property website.
Return ONLY a JSON object of the form {"properties": [ ... ]} where each item has these keys:
name (string), community (string), category (one of ${CATEGORIES.join(", ")}), type (one of ${PROPERTY_TYPES.join(", ")}), status (Ready or Off-plan),
priceAed (number, AED), areaSqft (number), bedrooms (number or null; 0 for a studio), bathrooms (number or null), unitsAvailable (number or null),
handover (string like "Ready" or "Q4 2027"), developer (string), images (array of URL strings), highlights (array of short strings), description (string), featured (boolean).
Parse figures like "AED 2.95M" or "1,450 sq ft" into plain numbers. Infer category from the type when missing (villas and townhouses -> Villas; warehouses -> Warehouse; offices, retail -> Commercial; everything else Residential). Never invent prices or sizes: use null when a value is missing. Keep names as written.`;

function extractJson(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?/m, "").replace(/```$/m, "").trim();
  const start = cleaned.indexOf("{");
  const startArr = cleaned.indexOf("[");
  const from = start === -1 ? startArr : startArr === -1 ? start : Math.min(start, startArr);
  return JSON.parse(cleaned.slice(from));
}

export async function aiMap(sheetText: string, provider: AiProvider, apiKey: string, model = AI_DEFAULT_MODELS[provider]): Promise<Record<string, unknown>[]> {
  if (!apiKey) throw new Error("Add your API key first");
  let text = "";
  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, temperature: 0, response_format: { type: "json_object" }, messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: sheetText }] }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? `OpenAI error ${res.status}`);
    text = data.choices?.[0]?.message?.content ?? "";
  } else if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model, max_tokens: 8000, temperature: 0, system: SYSTEM_PROMPT, messages: [{ role: "user", content: sheetText }] }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? `Anthropic error ${res.status}`);
    text = (data.content ?? []).map((c: { text?: string }) => c.text ?? "").join("");
  } else {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nSPREADSHEET:\n${sheetText}` }] }], generationConfig: { temperature: 0, responseMimeType: "application/json" } }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? `Gemini error ${res.status}`);
    text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  }
  const parsed = extractJson(text) as { properties?: unknown } | unknown[];
  const arr = Array.isArray(parsed) ? parsed : Array.isArray((parsed as { properties?: unknown }).properties) ? ((parsed as { properties: unknown[] }).properties) : null;
  if (!arr) throw new Error("The model did not return a list of properties");
  return arr.filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null);
}
