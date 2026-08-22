-- RLS Helpers
create or replace function public.current_user_company_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select company_id from users where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select role from users where id = auth.uid();
$$;

create or replace function public.current_employee_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select id from employees where user_id = auth.uid();
$$;

-- Companies Policies
create policy "Users can view their own company"
  on public.companies for select
  using (id = public.current_user_company_id());

create policy "Admins can update their own company"
  on public.companies for update
  using (id = public.current_user_company_id() and public.current_user_role() = 'admin');

-- Users Policies
create policy "Users can view users in their company"
  on public.users for select
  using (company_id = public.current_user_company_id());

create policy "Admins can insert users in their company"
  on public.users for insert
  with check (company_id = public.current_user_company_id() and public.current_user_role() = 'admin');

create policy "Admins can update users in their company"
  on public.users for update
  using (company_id = public.current_user_company_id() and public.current_user_role() = 'admin');

create policy "Users can update their own password requirement"
  on public.users for update
  using (id = auth.uid());

-- Employees Policies
create policy "Users can view employees in their company"
  on public.employees for select
  using (company_id = public.current_user_company_id());

create policy "Admins can insert employees in their company"
  on public.employees for insert
  with check (company_id = public.current_user_company_id() and public.current_user_role() = 'admin');

create policy "Admins can update employees in their company"
  on public.employees for update
  using (company_id = public.current_user_company_id() and public.current_user_role() = 'admin');

create policy "Employees can update their own specific fields"
  on public.employees for update
  using (user_id = auth.uid());

-- Attendance Policies
create policy "Admins can view attendance in their company"
  on public.attendance for select
  using (company_id = public.current_user_company_id() and public.current_user_role() = 'admin');

create policy "Employees can view their own attendance"
  on public.attendance for select
  using (employee_id = public.current_employee_id());

create policy "Employees can insert their own attendance"
  on public.attendance for insert
  with check (employee_id = public.current_employee_id() and company_id = public.current_user_company_id());

create policy "Employees can update their own attendance (checkout)"
  on public.attendance for update
  using (employee_id = public.current_employee_id());

create policy "Admins can update attendance in their company"
  on public.attendance for update
  using (company_id = public.current_user_company_id() and public.current_user_role() = 'admin');

-- Leave Requests Policies
create policy "Admins can view leave requests in their company"
  on public.leave_requests for select
  using (company_id = public.current_user_company_id() and public.current_user_role() = 'admin');

create policy "Employees can view their own leave requests"
  on public.leave_requests for select
  using (employee_id = public.current_employee_id());

create policy "Employees can insert their own leave requests"
  on public.leave_requests for insert
  with check (employee_id = public.current_employee_id() and company_id = public.current_user_company_id());

create policy "Admins can update leave requests in their company"
  on public.leave_requests for update
  using (company_id = public.current_user_company_id() and public.current_user_role() = 'admin');

-- Leave Balances Policies
create policy "Admins can view leave balances in their company"
  on public.leave_balances for select
  using (employee_id in (select id from public.employees where company_id = public.current_user_company_id()) and public.current_user_role() = 'admin');

create policy "Employees can view their own leave balances"
  on public.leave_balances for select
  using (employee_id = public.current_employee_id());

create policy "Admins can insert leave balances in their company"
  on public.leave_balances for insert
  with check (employee_id in (select id from public.employees where company_id = public.current_user_company_id()) and public.current_user_role() = 'admin');

create policy "Admins can update leave balances in their company"
  on public.leave_balances for update
  using (employee_id in (select id from public.employees where company_id = public.current_user_company_id()) and public.current_user_role() = 'admin');

-- Salary Structures Policies
create policy "Admins can view salary structures in their company"
  on public.salary_structures for select
  using (company_id = public.current_user_company_id() and public.current_user_role() = 'admin');

create policy "Employees can view their own salary structures"
  on public.salary_structures for select
  using (employee_id = public.current_employee_id());

create policy "Admins can insert salary structures in their company"
  on public.salary_structures for insert
  with check (company_id = public.current_user_company_id() and public.current_user_role() = 'admin');

create policy "Admins can update salary structures in their company"
  on public.salary_structures for update
  using (company_id = public.current_user_company_id() and public.current_user_role() = 'admin');
