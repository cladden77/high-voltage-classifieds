-- Adds a welcome_email_sent boolean to users profile table
alter table if exists public.users
  add column if not exists welcome_email_sent boolean default false;



