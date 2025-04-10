-- Add more benchmarks from Perplexity research
WITH categories AS (
  SELECT id, name FROM benchmark_categories
)
INSERT INTO benchmarks (category_id, metric_name, metric_value, context, source) VALUES
-- Financial Metrics
((SELECT id FROM categories WHERE name = 'Financial Metrics'),
 'Manufacturing Overhead',
 '{
   "typical_components": [
     "Utilities and facility costs",
     "Indirect labor and supervision",
     "Equipment maintenance",
     "Property taxes"
   ],
   "reduction_strategies": [
     "Facility space optimization",
     "Equipment maintenance efficiency",
     "Energy management",
     "Resource reuse"
   ]
 }',
 'Key components and strategies for overhead cost management in HMLV environments',
 'Manufacturing Excellence Database'),

-- Operational Metrics
((SELECT id FROM categories WHERE name = 'Operational Metrics'),
 'WIP Inventory Turns',
 '{
   "best_in_class": {"turns_per_year": 24, "days": 15},
   "industry_average": {"turns_per_year": 12, "days": 30},
   "laggards": {"turns_per_year": 6, "days": 60}
 }',
 'Work-in-Process inventory turnover rates for high-mix manufacturing',
 'Industry survey 2023'),

((SELECT id FROM categories WHERE name = 'Operational Metrics'),
 'SMED Performance',
 '{
   "world_class": {"minutes": "<10"},
   "competitive": {"minutes": "10-30"},
   "average": {"minutes": "30-60"},
   "needs_improvement": {"minutes": ">60"}
 }',
 'Single-Minute Exchange of Die benchmarks for quick changeovers',
 'Toyota Production System benchmarks'),

((SELECT id FROM categories WHERE name = 'Operational Metrics'),
 'Schedule Adherence',
 '{
   "best_in_class": 95,
   "competitive": {"min": 85, "max": 95},
   "industry_average": {"min": 75, "max": 85},
   "unit": "percent"
 }',
 'Percentage of jobs completed on schedule in HMLV production',
 'Manufacturing Excellence Database'),

-- Quality Metrics
((SELECT id FROM categories WHERE name = 'Quality Metrics'),
 'Process Capability (Cpk)',
 '{
   "world_class": {"min": 1.67},
   "capable": {"min": 1.33, "max": 1.67},
   "marginal": {"min": 1.0, "max": 1.33},
   "not_capable": {"max": 1.0}
 }',
 'Process capability index for critical characteristics in precision manufacturing',
 'Quality Management Standards'),

((SELECT id FROM categories WHERE name = 'Quality Metrics'),
 'Customer Complaint Rate',
 '{
   "best_in_class": {"per_million": "<50"},
   "competitive": {"per_million": "50-200"},
   "industry_average": {"per_million": "200-500"},
   "needs_improvement": {"per_million": ">500"}
 }',
 'Customer complaints per million units shipped in precision manufacturing',
 'Industry Quality Report 2023'),

((SELECT id FROM categories WHERE name = 'Quality Metrics'),
 'Rework Cost',
 '{
   "best_in_class": {"percent_of_sales": "<1"},
   "competitive": {"percent_of_sales": "1-3"},
   "industry_average": {"percent_of_sales": "3-5"},
   "needs_improvement": {"percent_of_sales": ">5"}
 }',
 'Cost of rework as a percentage of sales revenue',
 'Manufacturing Excellence Database'); 