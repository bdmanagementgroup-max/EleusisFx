-- Inbound emails received at admin@eleusisfx.uk via Resend
CREATE TABLE IF NOT EXISTS received_emails (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_id    text,
  from_address text NOT NULL,
  from_name    text,
  subject      text,
  text_body    text,
  html_body    text,
  received_at  timestamptz DEFAULT now(),
  read_at      timestamptz
);

-- Enable RLS with no policies = only service role (admin client) can access
ALTER TABLE received_emails ENABLE ROW LEVEL SECURITY;
