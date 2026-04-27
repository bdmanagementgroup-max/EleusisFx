-- past_clients table for Eleusis FX
-- Safe to re-run: drops existing policy before recreating

CREATE TABLE IF NOT EXISTS past_clients (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  email            text,
  phone            text,
  address          text,
  account_size_usd integer,
  fee_paid_gbp     integer,
  challenge        text,
  challenge_result text,
  source_file      text,
  notes            text,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE past_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all" ON past_clients;

CREATE POLICY "admin_all" ON past_clients
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Seed data (safe to re-run only if table is empty)
INSERT INTO past_clients (name, address, account_size_usd, fee_paid_gbp)
SELECT * FROM (VALUES
  ('Abbas Khan', '283 Lee St, Manchester, OL81JG, United Kingdom', 100000, 550),
  ('Abdulaziz Ibrahim sheekh', '85 Lansdowne Easton, Bristol, United Kingdom BS5 0RZ', 100000, 550),
  ('Abrar Hussain', '68 St Paul''s Rd Coventry CV65DF', NULL, 750),
  ('Antonio Cosby-Spikes', '1725 Newport Avenue, Pasadena CA 91103', 200000, 550),
  ('Aviraj Huria', '55-25 Brimwood Blvd Scarborough, Ontario', NULL, 550),
  ('Brown Yakubu', '25 Boot Terrace Toronto Canada', 100000, 450),
  ('Donta Thomlinson', '753 Megson Terr Milton Ontario, Canada', 100000, 550),
  ('Doubra Prefa', '43 Langhorne Court NW8 0SD, United Kingdom', 100000, 550),
  ('Dur-Re-Shahwah', '34 Dewberry Close BD74EU Bradford UK', 50000, 550),
  ('Elijah Chung', '7017 Calamus Ave Woodside NY 11377', 200000, 550),
  ('Elsamed Barcaj', '34 Hamilton Walk, Writh, UK', 200000, NULL),
  ('Francis Perreault', '359 Jean-Paul Riopelle, St Jerome, QC, Canada', 200000, 750),
  ('Gordon Lam', NULL, 100000, 550),
  ('Helena Chikezie', '2 Liddington Road, London, E15 3PJ', 100000, 550),
  ('Jada Andrews', '26 Cheney Row London E175ED', 200000, 750),
  ('James Murray', '95 Greenside Drift NE33 3ND', 70000, 550),
  ('Jaswinder Ghotra', '30454 Via Victoria Rancho Palos Verdes, CA 90275 USA', 100000, 550),
  ('Juan Paulino', '775 E 185th St Bronx NY 10460', 200000, 550),
  ('Luke Francis', '214, 19671 40 Street SE Calgary, Alberta, Canada', 100000, 450),
  ('Medhanie Bereket', 'Coventry CV61NN', 20000, 225),
  ('Moe Tabbara', '6924 Mumford Rd Halifax NS', 200000, 550),
  ('Mohammad Sidiqui', '34 Dewberry Close BD74EU Bradford UK', 200000, 550),
  ('Mohammed Junaid', '30 Gladstone Avenue, London, E126NS, UK', 200000, 750),
  ('Mohammed Moghaveleh', 'Flat 7 Canadian House Cardiff', 100000, 550),
  ('Mohd Saad Abdul Khalistan', '171 Huddleston Crescent Milton, Ontario, Canada', 200000, 750),
  ('Muhammad Iqbal', '25 Camp Road Glasgow G696QR', 100000, 550),
  ('Nazam Moughal', '42 Forest Rise MK655EX', NULL, 375),
  ('Neil Tiley', '3 St Mary''s Road Rivenhall CM83PE', 100000, 550),
  ('Nitin Kumar', NULL, 100000, 550),
  ('Omarelin Paulino', NULL, 100000, 550),
  ('Pratyaksh Singhal', NULL, 100000, 550),
  ('Rachid Sabin', '220 Green Street Apt 11H Albany NY 12202', 100000, 550),
  ('Robin Talukder', '2459 Camilla Rd Canada', NULL, 550),
  ('Ryan Sawh', '123 Kruger Rd Markham Ontario L3S3Y9 Canada', 100000, 550),
  ('Sara Teklu', '231 Hornsey Road, London, N76RZ, UK', 200000, 750),
  ('Terry Agyemang', NULL, 100000, 550),
  ('Ouedraogo Cheick Tidiane Romeo', '100 Hubert, NDP, QC, J6E0E4, Canada', 200000, NULL)
) AS v(name, address, account_size_usd, fee_paid_gbp)
WHERE NOT EXISTS (SELECT 1 FROM past_clients LIMIT 1);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
