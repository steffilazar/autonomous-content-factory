export interface AmbiguousStatement {
  original_text: string;
  reason: string;
  suggested_clarification: string;
}

export interface FactSheet {
  source_title: string;
  extraction_date: string;
  confidence_score: number;
  product_name: string;
  product_category: string;
  one_line_summary: string;
  primary_value_proposition: string;
  supporting_benefits: string[];
  core_features: {
    name: string;
    description: string;
    is_unique_differentiator: boolean;
  }[];
  technical_specs: Record<string, string>;
  target_audience: {
    primary: string;
    secondary?: string;
    pain_points: string[];
  };
  pricing: {
    model: string;
    tiers?: { name: string; price: string; features: string[] }[];
    free_trial?: string;
  } | null;
  ambiguous_statements: AmbiguousStatement[];
  missing_critical_info: string[];
}
