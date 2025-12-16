-- Create admin_users table to track which users are admins
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.admin_users enable row level security;

-- Only admins can view the admin_users table
create policy "Allow admins to view admin_users"
  on public.admin_users for select
  using (auth.uid() = id);

-- Only existing admins can insert (manually add first admin via Supabase dashboard or SQL)
create policy "Allow admins to insert admin_users"
  on public.admin_users for insert
  with check (auth.uid() = id);

-- Update RLS policies for prashad to allow admins to manage items
create policy "Allow admins to insert prashad"
  on public.prashad for insert
  with check (
    exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid()
    )
  );

create policy "Allow admins to update prashad"
  on public.prashad for update
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid()
    )
  );

create policy "Allow admins to delete prashad"
  on public.prashad for delete
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid()
    )
  );
