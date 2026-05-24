-- Create user_stamps table linked to Supabase Auth users
create table public.user_stamps (
    user_id uuid primary key references auth.users(id) on delete cascade,
    earned_stamps integer default 1 not null check (earned_stamps >= 0 and earned_stamps <= 5),
    total_stamps integer default 5 not null check (total_stamps = 5),
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.user_stamps enable row level security;

-- Create policy to allow users to read their own stamp card
create policy "Allow users to read their own stamp card"
on public.user_stamps
for select
to authenticated
using (auth.uid() = user_id);

-- Create policy to allow users to insert/update their own stamp card
create policy "Allow users to insert/update their own stamp card"
on public.user_stamps
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Trigger to automatically create a stamp card for new users on signup
create or replace function public.handle_new_user_stamps()
returns trigger as $$
begin
    insert into public.user_stamps (user_id, earned_stamps, total_stamps)
    values (new.id, 1, 5); -- Starts with 1 welcome stamp!
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created_stamps
    after insert on auth.users
    for each row execute procedure public.handle_new_user_stamps();
