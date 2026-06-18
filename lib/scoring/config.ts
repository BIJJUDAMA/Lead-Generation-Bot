export const SCORING_CONFIG = {
  funding: { steps: [60, 30, 15], cap: 120 },
  hiring: { steps: [50, 25, 15, 10], cap: 120 },
  growth: { steps: [40, 20, 10], cap: 100 }
};

export const RECENCY_MULTIPLIER = {
  recent: 1.0, // <= 90 days
  stale: 0.7   // > 90 days - Slight penalty
};

export const TIER_THRESHOLDS = {
  high: 50,
  medium: 20
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
