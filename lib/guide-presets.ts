export type GuideType = "country" | "city";

export interface GuidePreset {
  key: string;
  type: GuideType;
  keyword: string;
  country: string;
  city?: string;
  metaTitle: string;
  costRange?: string;
  priority: number;
}

const COUNTRY_COST_RANGES: Record<string, string> = {
  spain: "€3,200–€5,500",
  greece: "€2,800–€5,000",
  "czech-republic": "€2,500–€4,500",
  turkey: "€2,000–€4,000",
  portugal: "€3,000–€5,200",
  "north-macedonia": "€2,200–€3,800",
};

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function computeSlug(
  type: GuideType,
  country: string,
  city?: string,
): string {
  if (type === "country") {
    return `/guides/${country}-ivf-guide`;
  }
  return `/guides/${country}/${city}-ivf-guide`;
}

export function computeTitle(
  type: GuideType,
  country: string,
  city?: string,
): string {
  if (type === "city" && city) {
    return `IVF in ${titleCase(city)}: Clinics, Real Costs & Patient Insights`;
  }
  return `IVF in ${titleCase(country)}: Clinics, Costs & Patient Guide`;
}

export function computeMetaDescription(city: string, costRange: string): string {
  const name = titleCase(city);
  return `IVF clinics in ${name} tracked by MedCover. Average cost ${costRange}. Real patient data, hidden costs revealed, clinics ranked by Truth Score.`;
}

export function getCostRangeForCountry(country: string): string {
  return COUNTRY_COST_RANGES[country] ?? "€2,500–€5,000";
}

export const CITY_PRESETS: GuidePreset[] = [
  {
    key: "barcelona",
    type: "city",
    keyword: "ivf barcelona",
    country: "spain",
    city: "barcelona",
    metaTitle:
      "IVF in Barcelona 2026 — Clinics, Real Costs & Verified Data | MedCover",
    costRange: "€3,200–€5,500",
    priority: 85,
  },
  {
    key: "madrid",
    type: "city",
    keyword: "ivf madrid",
    country: "spain",
    city: "madrid",
    metaTitle:
      "IVF in Madrid 2026 — Clinics, Real Costs & Verified Data | MedCover",
    costRange: "€3,200–€5,500",
    priority: 85,
  },
  {
    key: "valencia",
    type: "city",
    keyword: "ivf valencia",
    country: "spain",
    city: "valencia",
    metaTitle:
      "IVF in Valencia 2026 — Clinics, Real Costs & Verified Data | MedCover",
    costRange: "€3,200–€5,500",
    priority: 85,
  },
  {
    key: "athens",
    type: "city",
    keyword: "ivf athens",
    country: "greece",
    city: "athens",
    metaTitle:
      "IVF in Athens 2026 — Clinics, Real Costs & Verified Data | MedCover",
    costRange: "€2,800–€5,000",
    priority: 85,
  },
  {
    key: "thessaloniki",
    type: "city",
    keyword: "ivf thessaloniki",
    country: "greece",
    city: "thessaloniki",
    metaTitle:
      "IVF in Thessaloniki 2026 — Clinics, Real Costs & Verified Data | MedCover",
    costRange: "€2,800–€5,000",
    priority: 85,
  },
  {
    key: "prague",
    type: "city",
    keyword: "ivf prague",
    country: "czech-republic",
    city: "prague",
    metaTitle:
      "IVF in Prague 2026 — Clinics, Real Costs & Verified Data | MedCover",
    costRange: "€2,500–€4,500",
    priority: 85,
  },
  {
    key: "brno",
    type: "city",
    keyword: "ivf brno",
    country: "czech-republic",
    city: "brno",
    metaTitle:
      "IVF in Brno 2026 — Clinics, Real Costs & Verified Data | MedCover",
    costRange: "€2,500–€4,500",
    priority: 85,
  },
  {
    key: "istanbul",
    type: "city",
    keyword: "ivf istanbul",
    country: "turkey",
    city: "istanbul",
    metaTitle:
      "IVF in Istanbul 2026 — Clinics, Real Costs & Verified Data | MedCover",
    costRange: "€2,000–€4,000",
    priority: 85,
  },
  {
    key: "ankara",
    type: "city",
    keyword: "ivf ankara",
    country: "turkey",
    city: "ankara",
    metaTitle:
      "IVF in Ankara 2026 — Clinics, Real Costs & Verified Data | MedCover",
    costRange: "€2,000–€4,000",
    priority: 85,
  },
  {
    key: "lisbon",
    type: "city",
    keyword: "ivf lisbon",
    country: "portugal",
    city: "lisbon",
    metaTitle:
      "IVF in Lisbon 2026 — Clinics, Real Costs & Verified Data | MedCover",
    costRange: "€3,000–€5,200",
    priority: 85,
  },
  {
    key: "porto",
    type: "city",
    keyword: "ivf porto",
    country: "portugal",
    city: "porto",
    metaTitle:
      "IVF in Porto 2026 — Clinics, Real Costs & Verified Data | MedCover",
    costRange: "€3,000–€5,200",
    priority: 85,
  },
  {
    key: "skopje",
    type: "city",
    keyword: "ivf skopje",
    country: "north-macedonia",
    city: "skopje",
    metaTitle:
      "IVF in Skopje 2026 — Clinics, Real Costs & Verified Data | MedCover",
    costRange: "€2,200–€3,800",
    priority: 85,
  },
];

export const COUNTRY_PRESETS: GuidePreset[] = [
  {
    key: "spain",
    type: "country",
    keyword: "ivf spain",
    country: "spain",
    metaTitle:
      "IVF in Spain 2026 — Clinics, Real Costs & Verified Data | MedCover",
    priority: 90,
  },
  {
    key: "greece",
    type: "country",
    keyword: "ivf greece",
    country: "greece",
    metaTitle:
      "IVF in Greece 2026 — Clinics, Real Costs & Verified Data | MedCover",
    priority: 90,
  },
  {
    key: "czech-republic",
    type: "country",
    keyword: "ivf czech republic",
    country: "czech-republic",
    metaTitle:
      "IVF in Czech Republic 2026 — Clinics, Real Costs & Verified Data | MedCover",
    priority: 90,
  },
  {
    key: "turkey",
    type: "country",
    keyword: "ivf turkey",
    country: "turkey",
    metaTitle:
      "IVF in Turkey 2026 — Clinics, Real Costs & Verified Data | MedCover",
    priority: 90,
  },
  {
    key: "portugal",
    type: "country",
    keyword: "ivf portugal",
    country: "portugal",
    metaTitle:
      "IVF in Portugal 2026 — Clinics, Real Costs & Verified Data | MedCover",
    priority: 90,
  },
  {
    key: "north-macedonia",
    type: "country",
    keyword: "ivf north macedonia",
    country: "north-macedonia",
    metaTitle:
      "IVF in North Macedonia 2026 — Clinics, Real Costs & Verified Data | MedCover",
    priority: 90,
  },
];

export const ALL_PRESETS = [...CITY_PRESETS, ...COUNTRY_PRESETS];

export const DEFAULT_PRESET = CITY_PRESETS[0];

export function getPresetsForType(type: GuideType): GuidePreset[] {
  return type === "city" ? CITY_PRESETS : COUNTRY_PRESETS;
}

export function applyPresetToForm(preset: GuidePreset) {
  const slug = computeSlug(preset.type, preset.country, preset.city);
  const title = computeTitle(preset.type, preset.country, preset.city);
  const costRange =
    preset.costRange ?? getCostRangeForCountry(preset.country);
  const metaDescription =
    preset.type === "city" && preset.city
      ? computeMetaDescription(preset.city, costRange)
      : `IVF clinics in ${titleCase(preset.country)} tracked by MedCover. Real patient data, hidden costs revealed, clinics ranked by Truth Score.`;

  return {
    guideType: preset.type,
    presetKey: preset.key,
    country: preset.country,
    city: preset.city ?? "",
    keyword: preset.keyword,
    slug,
    title,
    metaTitle: preset.metaTitle,
    metaDescription,
    priority: preset.priority,
  };
}

export function createDefaultFormState(siteId: number) {
  const applied = applyPresetToForm(DEFAULT_PRESET);
  return {
    ...applied,
    siteId,
    resetCheckpoint: true,
    autoPoll: true,
    autoPublish: false,
  };
}

export function getPreviewUrl(siteId: number, slug: string): string {
  const domain = siteId === 2 ? "www.medcover.io" : "www.medcover.io";
  return `https://${domain}${slug}/`;
}
