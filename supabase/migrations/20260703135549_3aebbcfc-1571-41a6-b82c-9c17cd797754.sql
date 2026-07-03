
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO anon, authenticated;
GRANT ALL ON public.conversations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO anon, authenticated;
GRANT ALL ON public.messages TO service_role;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "demo access conversations" ON public.conversations;
CREATE POLICY "demo access conversations" ON public.conversations
  FOR ALL TO anon, authenticated
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

DROP POLICY IF EXISTS "demo access messages" ON public.messages;
CREATE POLICY "demo access messages" ON public.messages
  FOR ALL TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = '00000000-0000-0000-0000-000000000000'::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = '00000000-0000-0000-0000-000000000000'::uuid));
