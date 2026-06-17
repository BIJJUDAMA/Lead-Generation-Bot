export const SCORING_CONFIG = {
  funding: { steps: [35, 15, 5], cap: 55 },
  hiring: { steps: [30, 15, 10, 5], cap: 60 },
  growth: { steps: [20, 10, 5], cap: 35 }
};

export const RECENCY_MULTIPLIER = {
  recent: 1.0, // <= 90 days
  stale: 0.5   // > 90 days
};

export const TIER_THRESHOLDS = {
  high: 75,
  medium: 40
};

/**
 * Maps AI classifications to our internal scoring categories
 */
export const CLASSIFICATION_MAP: Record<string, keyof typeof SCORING_CONFIG> = {
  "Funding": "funding",
  "Hiring": "hiring",
  "Expansion": "growth",
  "Product Launch": "growth",
  "Other": "growth"
};
