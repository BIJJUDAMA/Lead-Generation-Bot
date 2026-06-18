export const SCORING_CONFIG = {
  funding: { steps: [300, 150, 75], cap: 600 },
  hiring: { steps: [250, 125, 60, 30], cap: 600 },
  growth: { steps: [200, 100, 50], cap: 450 }
};

export const RECENCY_MULTIPLIER = {
  recent: 1.0, // <= 90 days
  stale: 0.7   // > 90 days - Penalty maintained
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
