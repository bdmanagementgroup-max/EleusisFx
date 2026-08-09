-- Client Dashboard Migration
-- Run in Supabase SQL Editor before deploying dashboard features

-- 1. Client profiles
CREATE TABLE IF NOT EXISTS client_profiles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name text,
  phone        text,
  address_1    text,
  city         text,
  postcode     text,
  country      text,
  avatar_url   text,
  updated_at   timestamptz DEFAULT now()
);
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON client_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own profile insert" ON client_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile update" ON client_profiles FOR UPDATE USING (auth.uid() = user_id);

-- 2. Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subject    text NOT NULL,
  message    text NOT NULL,
  status     text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tickets select" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own tickets insert" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Client documents (null user_id = visible to all clients)
CREATE TABLE IF NOT EXISTS client_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  file_url    text NOT NULL,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or global docs" ON client_documents FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- 4. Client notifications (admin inserts per user; client marks read)
CREATE TABLE IF NOT EXISTS client_notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title      text NOT NULL,
  body       text,
  read_at    timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifs select" ON client_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own notifs update" ON client_notifications FOR UPDATE USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
