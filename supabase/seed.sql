-- Seed assessment questions
INSERT INTO assessment_questions (category, question, description, weight) VALUES
-- Plant Layout
('plant_layout', 'How effectively is your plant layout organized for high-mix production?', 'Consider work cell flexibility, material staging areas, and changeover efficiency', 3),
('plant_layout', 'Are your machining centers and assembly areas properly sequenced?', 'Evaluate process flow and minimize transport between operations', 2),
('plant_layout', 'How well does your layout accommodate varying batch sizes?', 'Consider space flexibility and WIP storage requirements', 2),
('plant_layout', 'How effective is your material flow between operations?', 'Consider distance, handling methods, and staging areas', 2),
('plant_layout', 'What is the level of workplace organization in production areas?', 'Evaluate 5S implementation and visual management', 3),

-- Lean Manufacturing
('lean_manufacturing', 'How mature is your 5S implementation in machining and assembly areas?', 'Evaluate tool organization, cleanliness, and standard work practices', 2),
('lean_manufacturing', 'How effective is your visual management system for high-mix production?', 'Consider setup instructions, quality standards, and production status', 2),
('lean_manufacturing', 'What level of standardization exists in your changeover processes?', 'Evaluate SMED implementation and quick-change fixtures', 3),
('lean_manufacturing', 'How well are your value streams mapped and optimized?', 'Consider process mapping, waste identification, and improvement initiatives', 3),
('lean_manufacturing', 'How effective is your pull system implementation?', 'Evaluate kanban systems, supermarkets, and WIP control', 2),

-- Planning & Scheduling
('planning_scheduling', 'How effectively do you manage customer order variations?', 'Consider forecast accuracy and capacity planning for varying demand', 3),
('planning_scheduling', 'How well do you optimize machine loading and job sequencing?', 'Evaluate setup reduction opportunities and batch optimization', 3),
('planning_scheduling', 'What is your scheduling effectiveness for rush orders?', 'Consider impact on regular production and resource allocation', 2),
('planning_scheduling', 'How well do you manage production constraints?', 'Evaluate bottleneck identification and capacity optimization', 3),
('planning_scheduling', 'How effective is your material requirements planning?', 'Consider lead time accuracy and inventory optimization', 2),

-- Production Efficiency
('production_efficiency', 'What is your OEE across different product families?', 'Consider setup time, cycle time variations, and quality rates', 3),
('production_efficiency', 'How effectively do you manage bottleneck operations?', 'Evaluate constraint management and throughput optimization', 3),
('production_efficiency', 'What is your first-time-right rate for new setups?', 'Consider setup validation and operator training effectiveness', 2),
('production_efficiency', 'How well do you track and improve cycle times?', 'Evaluate process monitoring and improvement initiatives', 2),
('production_efficiency', 'What is your approach to capacity planning?', 'Consider equipment utilization and workforce flexibility', 3),

-- Changeovers
('changeovers', 'How standardized are your setup procedures?', 'Evaluate documentation, tool organization, and validation steps', 3),
('changeovers', 'What is your average setup time for different product families?', 'Consider tool changes, program loading, and first piece inspection', 3),
('changeovers', 'How effectively do you manage setup-related quality issues?', 'Evaluate first piece inspection and process validation', 2),
('changeovers', 'How well do you prepare for upcoming changeovers?', 'Consider pre-staging, tool preparation, and documentation', 2),
('changeovers', 'What methods do you use to reduce setup times?', 'Evaluate quick-change fixtures, standardized tooling, and process improvements', 3),

-- Maintenance
('maintenance', 'How proactive is your maintenance program for critical equipment?', 'Consider PM compliance, predictive maintenance, and downtime tracking', 3),
('maintenance', 'What is your mean time between failures for key machines?', 'Evaluate equipment reliability and maintenance effectiveness', 2),
('maintenance', 'How effectively do you manage tool life and replacement?', 'Consider tool management system and wear monitoring', 2),
('maintenance', 'What is your approach to preventive maintenance scheduling?', 'Evaluate PM frequency, compliance, and effectiveness', 3),
('maintenance', 'How do you manage maintenance spare parts?', 'Consider inventory levels, critical spares, and supplier relationships', 2),

-- Quality
('quality', 'How robust are your in-process quality checks?', 'Evaluate inspection methods, frequency, and documentation', 3),
('quality', 'What is your process capability across different product types?', 'Consider Cpk values and stability for key characteristics', 3),
('quality', 'How effective is your non-conformance management system?', 'Evaluate root cause analysis and corrective actions', 2),
('quality', 'How well do you manage measurement systems?', 'Consider gage R&R, calibration, and measurement processes', 2),
('quality', 'What is your approach to quality planning for new products?', 'Evaluate PFMEA, control plans, and inspection planning', 3),

-- Warehouse & Logistics
('warehouse_logistics', 'How efficiently do you manage raw material inventory?', 'Consider stock accuracy, turnover, and availability', 2),
('warehouse_logistics', 'How effective is your WIP management system?', 'Evaluate tracking, storage, and movement of in-process parts', 3),
('warehouse_logistics', 'What is your finished goods inventory accuracy?', 'Consider cycle counting and shipment preparation', 2),
('warehouse_logistics', 'How well organized is your warehouse layout?', 'Evaluate storage efficiency, picking routes, and material flow', 3),
('warehouse_logistics', 'What systems do you use for inventory tracking?', 'Consider barcode/RFID systems, cycle counting, and accuracy', 2),

-- Automation
('automation', 'How automated are your machining processes?', 'Consider CNC utilization, robotic loading, and process monitoring', 2),
('automation', 'What level of automation exists in your quality inspection?', 'Evaluate CMM usage, in-process gauging, and data collection', 2),
('automation', 'How integrated is your production data collection?', 'Consider MES implementation and real-time monitoring', 3),
('automation', 'What is your approach to process control automation?', 'Evaluate SPC, automated adjustments, and process monitoring', 3),
('automation', 'How well do you utilize automated material handling?', 'Consider AGVs, conveyors, and automated storage systems', 2),

-- Plant Management
('plant_management', 'How effective is your production meeting structure?', 'Consider daily huddles, problem-solving sessions, and action tracking', 2),
('plant_management', 'What is your approach to continuous improvement?', 'Evaluate kaizen events, operator suggestions, and implementation', 3),
('plant_management', 'How well do you manage tribal knowledge and skills transfer?', 'Consider documentation, training, and cross-training programs', 3),
('plant_management', 'How do you measure and improve productivity?', 'Consider KPIs, performance tracking, and improvement initiatives', 2),
('plant_management', 'What is your approach to workforce development?', 'Evaluate training programs, skill matrices, and career development', 3);

-- Update discovery paths for high-mix low-volume context
INSERT INTO discovery_paths (name, description, category) VALUES
('Setup Time Reduction', 'Systematic analysis of changeover processes and improvement opportunities', 'efficiency'),
('Quality Control Enhancement', 'Investigation of quality issues in high-mix production', 'quality'),
('Machine Utilization', 'Analysis of equipment effectiveness and bottleneck management', 'efficiency'),
('Inventory Optimization', 'Assessment of inventory levels and WIP management', 'logistics'),
('Process Standardization', 'Evaluation of standard work and documentation effectiveness', 'quality');

-- Update discovery paths to enable AI for some
UPDATE discovery_paths SET use_ai = true, approach_type = 'ai-guided' WHERE name = 'Quality Control Enhancement';
UPDATE discovery_paths SET use_ai = true, approach_type = 'ai-guided' WHERE name = 'Machine Utilization';

-- Seed discovery questions for Setup Time Reduction path
WITH path AS (SELECT id FROM discovery_paths WHERE name = 'Setup Time Reduction' LIMIT 1)
INSERT INTO discovery_questions (path_id, question, sequence, next_question_logic) VALUES
((SELECT id FROM path), 'What are your current average setup times by machine type?', 1, '{"type": "range", "ranges": [{"min": 0, "max": 30, "next": 2}, {"min": 30, "max": 1000, "next": 3}]}'),
((SELECT id FROM path), 'Have you implemented SMED methodology?', 2, '{"type": "linear", "next": 4}'),
((SELECT id FROM path), 'Which operations have the longest setup times?', 3, '{"type": "linear", "next": 4}'),
((SELECT id FROM path), 'What percentage of setup activities are external vs. internal?', 4, '{"type": "linear", "next": 5}'),
((SELECT id FROM path), 'How do you validate first piece quality after setup?', 5, null); 