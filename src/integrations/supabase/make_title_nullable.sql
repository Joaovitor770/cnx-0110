-- Make title nullable to support Image Only slides
alter table public.hero_slides alter column title drop not null;
