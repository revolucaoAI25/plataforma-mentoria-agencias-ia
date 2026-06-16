-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS mentoring_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mentoring_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES mentoring_slots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(slot_id)
);

CREATE TABLE IF NOT EXISTS mentoring_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  quota_amount INT NOT NULL DEFAULT 1,
  quota_period TEXT NOT NULL DEFAULT 'total',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mentoring_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view slots" ON mentoring_slots FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Service full slots" ON mentoring_slots FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users view own bookings" ON mentoring_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bookings" ON mentoring_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bookings" ON mentoring_bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service full bookings" ON mentoring_bookings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users view own quota" ON mentoring_quotas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service full quotas" ON mentoring_quotas FOR ALL USING (true) WITH CHECK (true);
