// Single home for fixed vocabulary and approved copy. Edit here, nowhere else.

export const BRAND = "ANANT";
export const TAGLINE = "Understand any company in 60 seconds";
// Placeholder until the legal entity is registered.
export const COPYRIGHT = "© 2026 ANANT";
export const DISCLAIMER =
  "ANANT is for education only. It does not provide stock tips, investment advice or recommendations.";

// Three explainers anyone can watch without signing in, to try the product.
// The notebook note and the quiz stay behind login.
export const SAMPLE_SLUGS = ["eternal", "reliance", "nykaa"] as const;

export const PART_KINDS = ["SELLS", "EARNS", "SIZE", "RIVALS", "WATCH"] as const;
export type PartKind = (typeof PART_KINDS)[number];

export const PART_TITLES: Record<PartKind, string> = {
  SELLS: "What it sells",
  EARNS: "How it earns",
  SIZE: "How big it is",
  RIVALS: "Who it competes with",
  WATCH: "What to watch",
};

// Five parts share the sixty seconds equally.
export const EXPLAINER_SECONDS = 60;
export const PART_SECONDS = EXPLAINER_SECONDS / PART_KINDS.length;

export const COMPANY_TYPES = ["listed", "startup", "model"] as const;
export type CompanyType = (typeof COMPANY_TYPES)[number];

// Controlled industry vocabulary. Add a slug only if none fits.
export const INDUSTRIES = {
  "food-tech-quick-commerce": "Food tech & quick commerce",
  retail: "Retail",
  "beauty-ecommerce": "Beauty e-commerce",
  "fashion-ecommerce": "Fashion e-commerce",
  "fintech-payments": "Fintech & payments",
  "lending-fintech": "Lending fintech",
  insurtech: "Insurtech",
  banking: "Banking",
  "eyewear-retail": "Eyewear retail",
  fmcg: "FMCG",
  automobiles: "Automobiles",
  "it-services": "IT services",
  pharma: "Pharma",
  telecom: "Telecom",
  "ed-tech": "Ed-tech",
  "logistics-delivery": "Logistics & delivery",
  "travel-hospitality": "Travel & hospitality",
  "energy-utilities": "Energy & utilities",
  "metals-materials": "Metals & materials",
  "real-estate": "Real estate",
  saas: "SaaS",
  "consumer-electronics-d2c": "Consumer electronics & D2C",
  aviation: "Aviation",
  conglomerate: "Conglomerate",
  // Added in batch 001 where nothing above fit.
  "nbfc-lending": "NBFCs & lending",
  "capital-markets": "Brokers & capital markets",
  "consumer-durables": "Consumer durables & paints",
  chemicals: "Chemicals",
  "cement-building-materials": "Cement & building materials",
  "construction-infrastructure": "Construction & infrastructure",
  "capital-goods": "Capital goods & defence",
  "oil-gas-fuels": "Oil, gas & coal",
  "healthcare-services": "Hospitals & diagnostics",
  "internet-classifieds": "Internet classifieds",
  "textiles-apparel": "Textiles & apparel",
  "media-entertainment": "Media, gaming & entertainment",
  "consumer-services": "Consumer services",
  // Added for global (US/EU) coverage.
  semiconductors: "Semiconductors",
  biotech: "Biotech",
  "aerospace-defense": "Aerospace & defence",
  "internet-software": "Internet & software",
  restaurants: "Restaurants & food service",
  "luxury-goods": "Luxury goods",
} as const;
export type IndustrySlug = keyof typeof INDUSTRIES;

// Where a figure sits when the seed gives no explicit part_kind: by position.
export const DEFAULT_FIGURE_PARTS: PartKind[] = ["SIZE", "EARNS"];

export const NOTE_WORDS = 30;
// Original seed entries carry two questions; v2 entries must carry exactly three.
export const MIN_QUIZ_QUESTIONS = 2;
export const V2_QUIZ_QUESTIONS = 3;
// Longer parts were approved in Oct 2026 in place of the 3-line limit.
export const PART_MAX_CHARS = 420;
export const REVIEW_STATES = ["unreviewed", "approved"] as const;
