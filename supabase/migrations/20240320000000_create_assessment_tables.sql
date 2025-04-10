-- Create enum for assessment categories
CREATE TYPE assessment_category AS ENUM (
  'plant_layout',
  'lean_manufacturing',
  'planning_scheduling',
  'production_efficiency',
  'changeovers',
  'maintenance',
  'quality',
  'warehouse_logistics',
  'automation',
  'plant_management'
);

-- Create table for assessment questions
CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category assessment_category NOT NULL,
  question TEXT NOT NULL,
  description TEXT,
  weight INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create table for assessment responses
CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  question_id UUID REFERENCES assessment_questions NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, question_id)
);

-- Create table for assessment sessions
CREATE TABLE assessment_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create table for discovery paths
CREATE TABLE discovery_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create table for discovery questions
CREATE TABLE discovery_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID REFERENCES discovery_paths NOT NULL,
  question TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  next_question_logic JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create table for discovery sessions
CREATE TABLE discovery_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  path_id UUID REFERENCES discovery_paths NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  current_question UUID REFERENCES discovery_questions,
  responses JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_sessions ENABLE ROW LEVEL SECURITY;

-- Questions are readable by all authenticated users
CREATE POLICY "Questions are readable by all users"
  ON assessment_questions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Responses are only readable/writable by the user who created them
CREATE POLICY "Users can manage their own responses"
  ON assessment_responses FOR ALL
  USING (auth.uid() = user_id);

-- Sessions are only readable/writable by the user who created them
CREATE POLICY "Users can manage their own assessment sessions"
  ON assessment_sessions FOR ALL
  USING (auth.uid() = user_id);

-- Discovery paths are readable by all authenticated users
CREATE POLICY "Discovery paths are readable by all users"
  ON discovery_paths FOR SELECT
  USING (auth.role() = 'authenticated');

-- Discovery questions are readable by all authenticated users
CREATE POLICY "Discovery questions are readable by all users"
  ON discovery_questions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Discovery sessions are only readable/writable by the user who created them
CREATE POLICY "Users can manage their own discovery sessions"
  ON discovery_sessions FOR ALL
  USING (auth.uid() = user_id); 