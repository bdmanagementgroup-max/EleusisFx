-- Restore address / account / fee data to past_clients after DocuSign import
-- Step 1: UPDATE records that exist (matched by email)

UPDATE past_clients SET address = '283 Lee St, Manchester, OL81JG, United Kingdom', account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'abbas-21k@hotmail.com';
UPDATE past_clients SET address = '85 Lansdowne Easton, Bristol, United Kingdom BS5 0RZ', account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'abdulaziz.ibrahim9@outlook.com';
UPDATE past_clients SET address = '1725 Newport Avenue, Pasadena CA 91103', account_size_usd = 200000, fee_paid_gbp = 550 WHERE email = 'antoniocosby86@gmail.com';
UPDATE past_clients SET address = '55-25 Brimwood Blvd Scarborough, Ontario', fee_paid_gbp = 550 WHERE email = 'avirajhuria99@gmail.com';
UPDATE past_clients SET address = '753 Megson Terr Milton Ontario, Canada', account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'dontadrew23@gmail.com';
UPDATE past_clients SET address = '43 Langhorne Court NW8 0SD, United Kingdom', account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'doubraprefa@gmail.com';
UPDATE past_clients SET address = '7017 Calamus Ave Woodside NY 11377', account_size_usd = 200000, fee_paid_gbp = 550 WHERE email = 'chungelijah@gmail.com';
UPDATE past_clients SET address = '34 Hamilton Walk, Writh, UK', account_size_usd = 200000 WHERE email = 'bercajelsamed34@gmail.com';
UPDATE past_clients SET address = '359 Jean-Paul Riopelle, St Jerome, QC, Canada', account_size_usd = 200000, fee_paid_gbp = 750 WHERE email = 'agiragency@gmail.com';
UPDATE past_clients SET account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'gordonlam@icloud.com';
UPDATE past_clients SET address = '2 Liddington Road, London, E15 3PJ', account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'helenachikezie@yahoo.com';
UPDATE past_clients SET address = '26 Cheney Row London E175ED', account_size_usd = 200000, fee_paid_gbp = 750 WHERE email = 'jada.walsh.andrews@gmail.com';
UPDATE past_clients SET address = '95 Greenside Drift NE33 3ND', account_size_usd = 70000, fee_paid_gbp = 550 WHERE email = 'jamesmurrayconsulting@outlook.com';
UPDATE past_clients SET address = '775 E 185th St Bronx NY 10460', account_size_usd = 200000, fee_paid_gbp = 550 WHERE email = 'juanfpm0114@gmail.com';
UPDATE past_clients SET address = '214, 19671 40 Street SE Calgary, Alberta, Canada', account_size_usd = 100000, fee_paid_gbp = 450 WHERE email = 'mosesyo8@gmail.com';
UPDATE past_clients SET address = 'Coventry CV61NN', account_size_usd = 20000, fee_paid_gbp = 225 WHERE email = 'medhave@yahoo.com';
UPDATE past_clients SET address = '6924 Mumford Rd Halifax NS', account_size_usd = 200000, fee_paid_gbp = 550 WHERE email = 'mtabbara@dal.ca';
UPDATE past_clients SET address = '30 Gladstone Avenue, London, E126NS, UK', account_size_usd = 200000, fee_paid_gbp = 750 WHERE email = 'junaid_04@hotmail.com';
UPDATE past_clients SET address = '171 Huddleston Crescent Milton, Ontario, Canada', account_size_usd = 200000, fee_paid_gbp = 750 WHERE email = 'mabdulkhaliq85@gmail.com';
UPDATE past_clients SET address = '25 Camp Road Glasgow G696QR', account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'muhammad.iqbal121@outlook.com';
UPDATE past_clients SET address = '42 Forest Rise MK655EX', fee_paid_gbp = 375 WHERE email = 'naz.moughal30@gmail.com';
UPDATE past_clients SET address = '3 St Mary''s Road Rivenhall CM83PE', account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'neiltiley@googlemail.com';
UPDATE past_clients SET account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'nitinpatter@gmail.com';
UPDATE past_clients SET account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'p_omarelin@yahoo.com';
UPDATE past_clients SET account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'ftpratyakshsinghal@gmail.com';
UPDATE past_clients SET address = '220 Green Street Apt 11H Albany NY 12202', account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'rrachid578@yahoo.com';
UPDATE past_clients SET address = '2459 Camilla Rd Canada', fee_paid_gbp = 550 WHERE email = 'robin.talukder@hotmail.com';
UPDATE past_clients SET address = '123 Kruger Rd Markham Ontario L3S3Y9 Canada', account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'ryan_sawh@hotmail.com';
UPDATE past_clients SET address = '231 Hornsey Road, London, N76RZ, UK', account_size_usd = 200000, fee_paid_gbp = 750 WHERE email = 'dripmediainc@gmail.com';
UPDATE past_clients SET account_size_usd = 100000, fee_paid_gbp = 550 WHERE email = 'terryagyemang@icloud.com';
UPDATE past_clients SET address = '100 Hubert, NDP, QC, J6E0E4, Canada', account_size_usd = 200000 WHERE email = 'ouedromeo25@gmail.com';

-- Step 2: INSERT clients not present in DocuSign export

INSERT INTO past_clients (name, address, account_size_usd, fee_paid_gbp, source_file, phase_status, created_at) VALUES ('Abrar Hussain', '68 St Paul''s Rd Coventry CV65DF', NULL, 750, 'seed', 'unknown', NOW()) ON CONFLICT DO NOTHING;
INSERT INTO past_clients (name, address, account_size_usd, fee_paid_gbp, source_file, phase_status, created_at) VALUES ('Brown Yakubu', '25 Boot Terrace Toronto Canada', 100000, 450, 'seed', 'unknown', NOW()) ON CONFLICT DO NOTHING;
INSERT INTO past_clients (name, address, account_size_usd, fee_paid_gbp, source_file, phase_status, created_at) VALUES ('Dur-Re-Shahwah', '34 Dewberry Close BD74EU Bradford UK', 50000, 550, 'seed', 'unknown', NOW()) ON CONFLICT DO NOTHING;
INSERT INTO past_clients (name, address, account_size_usd, fee_paid_gbp, source_file, phase_status, created_at) VALUES ('Jaswinder Ghotra', '30454 Via Victoria Rancho Palos Verdes, CA 90275 USA', 100000, 550, 'seed', 'unknown', NOW()) ON CONFLICT DO NOTHING;
INSERT INTO past_clients (name, address, account_size_usd, fee_paid_gbp, source_file, phase_status, created_at) VALUES ('Mohammad Sidiqui', '34 Dewberry Close BD74EU Bradford UK', 200000, 550, 'seed', 'unknown', NOW()) ON CONFLICT DO NOTHING;
INSERT INTO past_clients (name, address, account_size_usd, fee_paid_gbp, source_file, phase_status, created_at) VALUES ('Mohammed Moghaveleh', 'Flat 7 Canadian House Cardiff', 100000, 550, 'seed', 'unknown', NOW()) ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';