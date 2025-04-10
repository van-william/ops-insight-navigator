-- Create benchmarks tables
CREATE TABLE benchmark_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES benchmark_categories NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  context TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE benchmark_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;

-- Everyone can read benchmarks
CREATE POLICY "Everyone can read benchmark categories"
  ON benchmark_categories FOR SELECT
  USING (true);

CREATE POLICY "Everyone can read benchmarks"
  ON benchmarks FOR SELECT
  USING (true);

-- Seed benchmark categories
INSERT INTO benchmark_categories (name, description) VALUES
('Financial Metrics', 'Key financial performance indicators for high-mix low-volume manufacturing'),
('Operational Metrics', 'Core operational performance metrics for manufacturing efficiency'),
('Quality Metrics', 'Quality control and assurance benchmarks');

-- Seed benchmarks from Perplexity research
WITH categories AS (
  SELECT id, name FROM benchmark_categories
)
INSERT INTO benchmarks (category_id, metric_name, metric_value, context, source) VALUES
-- Financial Metrics
((SELECT id FROM categories WHERE name = 'Financial Metrics'),
 'Labor Cost Percentage',
 '{"median_percent": 35, "top_quartile_percent": 28, "range": {"min": 25, "max": 45}}',
 'Labor cost as percentage of revenue for precision manufacturing',
 'Industry benchmark study 2023'),

((SELECT id FROM categories WHERE name = 'Financial Metrics'),
 'Cost of Poor Quality',
 '{"range": {"min": 5, "max": 30}, "unit": "percent_of_sales", "target": "below_10"}',
 'COPQ ranges from 5% to 30% of gross sales in manufacturing companies',
 'Quality Digest'),

-- Operational Metrics
((SELECT id FROM categories WHERE name = 'Operational Metrics'),
 'Setup Time',
 '{"median_minutes": 45, "top_quartile_minutes": 25, "benchmark_by_complexity": {"low": 20, "medium": 40, "high": 60}}',
 'Based on machine shops with >100 different parts and batch sizes <50',
 'Industry survey 2023'),

((SELECT id FROM categories WHERE name = 'Operational Metrics'),
 'OEE for Job Shops',
 '{"world_class": 85, "typical_range": {"min": 60, "max": 75}, "low_performers": {"min": 40, "max": 60}}',
 'Overall Equipment Effectiveness for high-mix low-volume operations',
 'Manufacturing Excellence Database'),

-- Quality Metrics
((SELECT id FROM categories WHERE name = 'Quality Metrics'),
 'First Pass Yield',
 '{"median_percent": 92, "top_quartile_percent": 97, "by_complexity": {"low": 98, "medium": 95, "high": 90}}',
 'For precision machining operations in aerospace and medical device manufacturing',
 'Manufacturing Excellence Database'),

((SELECT id FROM categories WHERE name = 'Quality Metrics'),
 'Scrap Rate',
 '{"best_in_class": 0.5, "industry_average": 2.5, "laggards": 5, "unit": "percent"}',
 'Percentage of material scrapped in precision manufacturing',
 'Industry survey 2023'); 