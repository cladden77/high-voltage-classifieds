-- Create throttle table to avoid spamming message email notifications
create table if not exists public.message_email_throttle (
  recipient_id uuid not null,
  conversation_id uuid not null,
  last_sent_at timestamptz not null default now(),
  primary key (recipient_id, conversation_id)
);

-- Optional: add index for fast lookups
create index if not exists idx_message_email_throttle_recipient on public.message_email_throttle(recipient_id);

-- RLS optional (we'll access with service role from API)
alter table public.message_email_throttle enable row level security;

-- Allow service role to manage throttle rows (admin client bypasses RLS, but this keeps it explicit)
drop policy if exists "Service can manage throttle" on public.message_email_throttle;
create policy "Service can manage throttle" on public.message_email_throttle
  for all using (true) with check (true);



