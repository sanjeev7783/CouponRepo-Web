-- Create prashad table for storing temple food offerings
create table if not exists public.prashad (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  meal_time text not null check (meal_time in ('breakfast', 'lunch', 'dinner')),
  image_url text,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.prashad enable row level security;

-- Allow anyone to view prashad items (for public display)
create policy "Allow public to view prashad"
  on public.prashad for select
  using (true);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger set_prashad_updated_at
  before update on public.prashad
  for each row
  execute function public.handle_updated_at();
