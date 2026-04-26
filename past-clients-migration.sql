-- past_clients table for Eleusis FX
CREATE TABLE IF NOT EXISTS past_clients (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  email        text,
  phone        text,
  address      text,
  account_size_usd integer,
  fee_paid_gbp     integer,
  challenge    text,
  source_file  text,
  notes        text,
  created_at   timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE past_clients ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write
CREATE POLICY "admin_all" ON past_clients
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Seed data
INSERT INTO past_clients (name, address, account_size_usd, fee_paid_gbp, challenge, source_file) VALUES
  ('Abbas Khan', '283 Lee St, Manchester,  OL81JG ,United Kingdom', 100000, 550, NULL, 'Abbas Khan.pdf'),
  ('Abdulaziz Ibrahim sheekh', '85 lansdowne Easton ,Bristol ,United Kingdom  Bs5 0rz', 100000, 550, NULL, 'Abdulaziz Ibrahim sheekh.pdf'),
  ('Abrar Hussain', '68 St Paul’s Rd Coventry CV65DF', NULL, 750, NULL, 'Abrar Hussain.pdf'),
  ('Antonio Cosby-Spikes', '1725 Newport Avenue,  Pasadena CA 91103', 200000, 550, NULL, 'Antonio Cosby-Spikes.pdf'),
  ('Aviraj Huria', '55-25 brimwood blvd scarborough  ontario', NULL, 550, NULL, 'Aviraj Huria 2.pdf'),
  ('Brown Yakubu', '25 Boot Terrace Toronto Canada', 100000, 450, NULL, 'Brown Yakubu.pdf'),
  ('Donta Thomlinson', '753 Megson Terr Milton Ontario  Canada', 100000, 550, NULL, 'Donta Thomlinson.pdf'),
  ('Doubra Prefa', '43 Langhorne Court NW8  OSD ,United Kingdom', 100000, 550, NULL, 'Doubra Prefa.pdf'),
  ('Dur-Re-Shahwah', '34 Dewberry Close BD74EU  Bradford UK', 50000, 550, NULL, 'Dur-Re-Shahwar Barkat.pdf'),
  ('Elijah Chung', '7017 Calamus Ave Woodside NY  11377', 200000, 550, NULL, 'Elija Chung.pdf'),
  ('Elsamed Barcaj', '34 Hamilton Walk, Writh, Uk', 200000, NULL, NULL, 'Elsamed Barcaj Agreement.pdf'),
  ('Francis Perreault', '359 Jean-Paul Riopelle, St  Jerome, QC, Canada', 200000, 750, NULL, 'Francis Perreault.pdf'),
  ('Gordon Lam', NULL, 100000, 550, NULL, 'Gordon Lam.pdf'),
  ('Helena Chikezie', '2 Liddington Road, London, E15 3PJ', 100000, 550, NULL, 'Helena Chikezie Agreement.pdf'),
  ('Jada Andrews', '26 Cheney row London E175ED', 200000, 750, NULL, 'Jada Andrews.pdf'),
  ('James Murray', '95 Greenside Drift Ne33 3ND', 70000, 550, NULL, 'James Murray - Recovery £70k.pdf'),
  ('Jaswinder Ghotra', '30454 Via Victoria Rancho Palos  Verdes, CA 90275 USA', 100000, 550, NULL, 'Jaswinder Ghotra.pdf'),
  ('Juan Paulino', '775 E 185th St Bronx NY 10460', 200000, 550, NULL, 'Juan Paulino.pdf'),
  ('Luke Francis', '214, 19671 40 Street SE Calgary, Alberta, Canada', 100000, 450, NULL, 'Luke Francis Agreement.pdf'),
  ('Medhanie Bereket', 'Coventry CV61NN', 20000, 225, NULL, 'Medhanie Bereket.pdf'),
  ('Moe Tabbara', '6924 Mumford Rd Halifax NS', 200000, 550, NULL, 'Moe Tabbara.pdf'),
  ('Mohammad Sidiqui', '34 Dewberry Close BD74EU  Bradford UK', 200000, 550, NULL, 'Mohammad Sidiqui.pdf'),
  ('Mohammed Junaid', '30 Gladstone Avenue, London,  E126NS, UK', 200000, 750, NULL, 'Mohammed Junaid.pdf'),
  ('Mohammed Moghaveleh', 'flat 7 Canadian House  Cardiff', 100000, 550, NULL, 'Mohammed Moghaveleh.pdf'),
  ('Mohd Saad Abdul Khalistan', '171 Huddleston  Crescent Milton, Ontario, Canada', 200000, 750, NULL, 'Mohd Khaliq.pdf'),
  ('Muhammad Iqbal', '25 Camp Road Glasgow  G696QR', 100000, 550, NULL, 'Muhammad Iqbal.pdf'),
  ('Nazam Moughal', '42 Forest Rise MK655EX', NULL, 375, NULL, 'Nazam Moughal.pdf'),
  ('Neil Tiley', '3 st Mary’s road Rivenhall Cm83pe', 100000, 550, NULL, 'Neil Tiley.pdf'),
  ('Nitin Kumar', NULL, 100000, 550, NULL, 'Nitin Kumar.pdf'),
  ('Omarelin Paulino', NULL, 100000, 550, NULL, 'Omarelin Paulino.pdf'),
  ('Pratyaksh Singhal', NULL, 100000, 550, NULL, 'Pratyaksh Singhal.pdf'),
  ('Rachid Sabin', '220 Green Street apt 11H Albany NY  12202', 100000, 550, NULL, 'Rachid Sanon.pdf'),
  ('Robin Talukder', '2459 Camilla Rd Canada', NULL, 550, NULL, 'Robin Talukder.pdf'),
  ('Ryan Sawh', '123 Kruger Rd Markham Ontario  L3S3Y9 Canada', 100000, 550, NULL, 'Ryan Sawh Agreement.pdf'),
  ('Sara Teklu', '231 Hornsy Road, London, N76RZ, UK', 200000, 750, NULL, 'Sara Teklu.pdf'),
  ('Terry Agyemang', NULL, 100000, 550, NULL, 'Terry Agyemang.pdf'),
  ('Ouedraogo Cheick Tidiane Romeo', '100 hubert, NDP, QC,  J6E0E4, CANADA', 200000, NULL, NULL, 'Romeo Quadraogo.pdf');