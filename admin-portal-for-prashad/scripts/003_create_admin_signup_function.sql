-- Create a database function that bypasses RLS to add admin users during signup
-- This function will be called from the application after user signs up
create or replace function public.create_admin_user(user_id uuid, user_email text)
returns void
language plpgsql
security definer -- This allows the function to bypass RLS
set search_path = public
as $$
begin
  insert into public.admin_users (id, email)
  values (user_id, user_email)
  on conflict (id) do nothing;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.create_admin_user(uuid, text) to authenticated;
