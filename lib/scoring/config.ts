export const SCORING_CONFIG = {
  funding: { steps: [50, 25, 10], cap: 100 },
  hiring: { steps: [40, 20, 15, 10], cap: 100 },
  growth: { steps: [30, 15, 10], cap: 75 }
};

export const RECENCY_MULTIPLIER = {
  recent: 1.0, // <= 90 days
  stale: 0.8   // > 90 days
};

export const TIER_THRESHOLDS = {
  high: 60,
  medium: 30
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
