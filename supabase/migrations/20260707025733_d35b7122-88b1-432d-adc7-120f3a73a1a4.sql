
-- ============ user_memory ============
CREATE TABLE public.user_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fact text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  confidence numeric NOT NULL DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  source text NOT NULL DEFAULT 'chat',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_memory TO authenticated;
GRANT ALL ON public.user_memory TO service_role;
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memory" ON public.user_memory FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX user_memory_user_active_idx ON public.user_memory (user_id, active);

-- ============ journeys ============
CREATE TABLE public.journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subtitle text,
  category text NOT NULL DEFAULT 'general',
  target_date date,
  progress_pct integer NOT NULL DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  milestone_count integer NOT NULL DEFAULT 0,
  last_active_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journeys TO authenticated;
GRANT ALL ON public.journeys TO service_role;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journeys" ON public.journeys FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX journeys_user_idx ON public.journeys (user_id, last_active_at DESC);

-- ============ achievements catalog ============
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🏅',
  tier text NOT NULL DEFAULT 'bronze',
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone signed in can view achievements" ON public.achievements FOR SELECT TO authenticated USING (true);

-- ============ user_achievements ============
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own achievements" ON public.user_achievements FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ user_streaks ============
CREATE TABLE public.user_streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_active_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_streaks TO authenticated;
GRANT ALL ON public.user_streaks TO service_role;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own streak" ON public.user_streaks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ phrases ============
CREATE TABLE public.phrases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kanji text NOT NULL,
  romaji text NOT NULL,
  meaning text NOT NULL,
  cultural_note text,
  level text NOT NULL DEFAULT 'N5',
  published_on date NOT NULL DEFAULT (now()::date),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.phrases TO authenticated;
GRANT ALL ON public.phrases TO service_role;
ALTER TABLE public.phrases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone signed in can view phrases" ON public.phrases FOR SELECT TO authenticated USING (true);

-- ============ hiring_posts ============
CREATE TABLE public.hiring_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  role text NOT NULL,
  location text NOT NULL,
  url text,
  tags text[] NOT NULL DEFAULT '{}',
  published_on date NOT NULL DEFAULT (now()::date),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hiring_posts TO authenticated;
GRANT ALL ON public.hiring_posts TO service_role;
ALTER TABLE public.hiring_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone signed in can view hiring posts" ON public.hiring_posts FOR SELECT TO authenticated USING (true);

-- ============ cultural_insights ============
CREATE TABLE public.cultural_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  concept text NOT NULL,
  body text NOT NULL,
  published_on date NOT NULL DEFAULT (now()::date),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cultural_insights TO authenticated;
GRANT ALL ON public.cultural_insights TO service_role;
ALTER TABLE public.cultural_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone signed in can view cultural insights" ON public.cultural_insights FOR SELECT TO authenticated USING (true);

-- ============ user_documents ============
CREATE TABLE public.user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'note',
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_documents TO authenticated;
GRANT ALL ON public.user_documents TO service_role;
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own documents" ON public.user_documents FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX user_documents_user_idx ON public.user_documents (user_id, updated_at DESC);

-- ============ user_plans ============
CREATE TABLE public.user_plans (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free',
  credits_used integer NOT NULL DEFAULT 0,
  credits_limit integer NOT NULL DEFAULT 100,
  billing_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_plans TO authenticated;
GRANT ALL ON public.user_plans TO service_role;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own plan" ON public.user_plans FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ updated_at triggers (reuse existing public.update_updated_at_column) ============
CREATE TRIGGER trg_user_memory_updated BEFORE UPDATE ON public.user_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_journeys_updated BEFORE UPDATE ON public.journeys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_achievements_updated BEFORE UPDATE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_user_achievements_updated BEFORE UPDATE ON public.user_achievements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_user_streaks_updated BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_phrases_updated BEFORE UPDATE ON public.phrases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_hiring_updated BEFORE UPDATE ON public.hiring_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cultural_updated BEFORE UPDATE ON public.cultural_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_documents_updated BEFORE UPDATE ON public.user_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.user_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ seed achievements catalog ============
INSERT INTO public.achievements (code, title, description, icon, tier, criteria) VALUES
  ('first_chat',        'First Steps',         'Sent your very first message to Yuki.',          '🌱', 'bronze', '{"messages":1}'),
  ('week_streak',       'Weekly Devotee',      'Chatted with Yuki 7 days in a row.',             '🔥', 'silver', '{"streak":7}'),
  ('month_streak',      'Japan Committed',     'Chatted with Yuki 30 days in a row.',            '⛩️', 'gold',   '{"streak":30}'),
  ('n5_ready',          'N5 Ready',            'Learned 100 essential phrases.',                 '🎌', 'silver', '{"phrases":100}'),
  ('n1_ready',          'N1 Ready',            'Reached advanced Japanese fluency milestones.',  '🎓', 'gold',   '{"phrases":2000}'),
  ('rirekisho_done',    'Rirekisho Ready',     'Generated your first Japanese résumé.',          '📄', 'silver', '{"documents":1}'),
  ('trip_planner',      'Trip Planner',        'Saved your first itinerary.',                    '🗾', 'bronze', '{"itineraries":1}'),
  ('memory_master',     'Memory Master',       'Yuki remembers 25 facts about you.',             '🧠', 'silver', '{"memory":25}'),
  ('japan_explorer',    'Japan Explorer',      'Explored travel, language, and work topics.',    '🧭', 'gold',   '{"categories":3}')
ON CONFLICT (code) DO NOTHING;
