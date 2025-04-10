-- Add approach type to discovery paths
ALTER TABLE discovery_paths ADD COLUMN approach_type TEXT NOT NULL DEFAULT 'structured';
ALTER TABLE discovery_paths ADD COLUMN use_ai BOOLEAN NOT NULL DEFAULT false;

-- Add metrics and context tables
CREATE TABLE business_objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  typical_metrics TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE industry_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  context TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE improvement_dimensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('people', 'process', 'technology')),
  description TEXT NOT NULL,
  typical_solutions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add AI conversation tracking
CREATE TABLE discovery_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES discovery_sessions NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  tokens_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed business objectives
INSERT INTO business_objectives (name, description, category, typical_metrics) VALUES
('Revenue Growth', 'Increase top-line revenue through operational improvements', 'financial', 
  ARRAY['Revenue per machine hour', 'OEE impact on revenue', 'New product introduction cycle time']),
('Cost Reduction', 'Reduce operational costs while maintaining quality', 'financial',
  ARRAY['Cost per unit', 'Labor cost per unit', 'Scrap rate cost', 'Energy cost per unit']),
('Quality Improvement', 'Enhance product quality and reduce defects', 'operational',
  ARRAY['First pass yield', 'Defect rate', 'Customer complaint rate', 'Cost of poor quality']),
('Operational Agility', 'Improve ability to respond to demand changes', 'operational',
  ARRAY['Setup time', 'Changeover time', 'Production schedule adherence', 'Order lead time']),
('Compliance & Safety', 'Ensure regulatory compliance and workplace safety', 'risk',
  ARRAY['Safety incidents', 'Compliance violations', 'Environmental metrics', 'Training completion rate']);

-- Seed improvement dimensions
INSERT INTO improvement_dimensions (name, category, description, typical_solutions) VALUES
('Leadership & Culture', 'people', 'Issues related to management approach and organizational culture',
  '{"solutions": ["Leadership development programs", "Culture transformation initiatives", "Communication frameworks"]}'),
('Skills & Training', 'people', 'Gaps in workforce capabilities and knowledge',
  '{"solutions": ["Structured training programs", "Cross-training initiatives", "Skills assessment frameworks"]}'),
('Standard Work', 'process', 'Lack of standardized procedures and best practices',
  '{"solutions": ["Work instruction development", "Process documentation", "Standard operating procedures"]}'),
('Performance Management', 'process', 'Issues with measuring and managing performance',
  '{"solutions": ["KPI frameworks", "Visual management systems", "Daily management systems"]}'),
('Automation', 'technology', 'Opportunities for automated solutions',
  '{"solutions": ["Robotic process automation", "Machine monitoring systems", "Automated quality inspection"]}'),
('Data Systems', 'technology', 'Challenges with data collection and analysis',
  '{"solutions": ["MES implementation", "Real-time monitoring", "Analytics platforms"]}');

-- Seed industry benchmarks
INSERT INTO industry_benchmarks (category, metric_name, metric_value, context, source) VALUES
('high_mix_low_volume', 'setup_time', 
  '{"median_minutes": 45, "top_quartile_minutes": 25, "benchmark_by_complexity": {"low": 20, "medium": 40, "high": 60}}',
  'Based on machine shops with >100 different parts and batch sizes <50',
  'Industry survey 2023'),
('high_mix_low_volume', 'first_pass_yield',
  '{"median_percent": 92, "top_quartile_percent": 97, "by_complexity": {"low": 98, "medium": 95, "high": 90}}',
  'For precision machining operations in aerospace and medical device manufacturing',
  'Manufacturing Excellence Database'),
('high_mix_low_volume', 'labor_cost_percent',
  '{"median_percent": 35, "top_quartile_percent": 28, "range": {"min": 25, "max": 45}}',
  'Labor cost as percentage of revenue for precision manufacturing',
  'Industry benchmark study 2023'); 