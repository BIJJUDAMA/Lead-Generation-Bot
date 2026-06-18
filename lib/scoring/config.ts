export const SCORING_CONFIG = {
  funding: { steps: [80, 40, 20], cap: 160 },
  hiring: { steps: [70, 35, 20, 15], cap: 160 },
  growth: { steps: [50, 25, 15], cap: 120 }
};

export const RECENCY_MULTIPLIER = {
  recent: 1.0, // <= 90 days
  stale: 0.9   // > 90 days - Reduced penalty
};

export const TIER_THRESHOLDS = {
  high: 40,
  medium: 15
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
