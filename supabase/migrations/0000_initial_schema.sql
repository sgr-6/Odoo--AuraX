-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Table: companies
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  created_at timestamptz default now()
);

-- Table: users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) not null,
  login_id text unique not null,
  email text unique not null,
  role text not null check (role in ('admin', 'employee')),
  must_change_password boolean not null default true,
  created_at timestamptz default now()
);

-- Table: employees
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null unique,
  company_id uuid references public.companies(id) not null,
  full_name text not null,
  phone text,
  address text,
  avatar_url text,
  job_title text,
  department text,
  date_of_joining date not null,
  created_at timestamptz default now()
);

-- Table: attendance
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) not null,
  company_id uuid references public.companies(id) not null,
  date date not null,
  check_in timestamptz,
  check_out timestamptz,
  status text check (status in ('present', 'absent', 'half-day', 'leave')),
  work_hours numeric,
  extra_hours numeric,
  unique (employee_id, date)
);

-- Table: leave_requests
create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) not null,
  company_id uuid references public.companies(id) not null,
  leave_type text check (leave_type in ('paid', 'sick', 'unpaid')),
  start_date date not null,
  end_date date not null,
  remarks text,
  attachment_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.users(id),
  created_at timestamptz default now()
);

-- Table: leave_balances
create table public.leave_balances (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) not null,
  leave_type text check (leave_type in ('paid', 'sick', 'unpaid')),
  allocated_days numeric not null default 0,
  used_days numeric not null default 0,
  unique (employee_id, leave_type)
);

-- Table: salary_structures
create table public.salary_structures (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) not null unique,
  company_id uuid references public.companies(id) not null,
  monthly_wage numeric not null default 0,
  basic numeric default 0,
  hra numeric default 0,
  standard_allowance numeric default 0,
  performance_bonus numeric default 0,
  travel_allowance numeric default 0,
  fixed_allowance numeric default 0,
  pf_rate numeric default 12,
  professional_tax numeric default 200,
  updated_at timestamptz default now()
);

-- Indexes
create index idx_users_company_id on public.users(company_id);
create index idx_employees_company_id on public.employees(company_id);
create index idx_attendance_company_id on public.attendance(company_id);
create index idx_attendance_employee_id on public.attendance(employee_id);
create index idx_attendance_date on public.attendance(date);
create index idx_leave_requests_company_id on public.leave_requests(company_id);
create index idx_leave_requests_employee_id on public.leave_requests(employee_id);
create index idx_leave_requests_status on public.leave_requests(status);
create index idx_leave_balances_employee_id on public.leave_balances(employee_id);
create index idx_salary_structures_company_id on public.salary_structures(company_id);

-- Enable RLS
alter table public.companies enable row level security;
alter table public.users enable row level security;
alter table public.employees enable row level security;
alter table public.attendance enable row level security;
alter table public.leave_requests enable row level security;
alter table public.leave_balances enable row level security;
alter table public.salary_structures enable row level security;

-- Storage setup for buckets
insert into storage.buckets (id, name, public) values ('company-logos', 'company-logos', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('leave-attachments', 'leave-attachments', false) on conflict do nothing;
