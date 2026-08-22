create table public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

alter table public.otp_codes enable row level security;
