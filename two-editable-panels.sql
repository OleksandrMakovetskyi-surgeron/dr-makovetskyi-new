create table if not exists public.treatment_info_cards(
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text,
  published boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.treatment_info_cards enable row level security;

drop policy if exists "public treatment info" on public.treatment_info_cards;
create policy "public treatment info"
on public.treatment_info_cards
for select
to anon, authenticated
using (published = true or public.is_admin());

drop policy if exists "admin treatment info" on public.treatment_info_cards;
create policy "admin treatment info"
on public.treatment_info_cards
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.treatment_info_cards(title,description,url,published,sort_order)
select * from (values
('Пупкова грижа','Симптоми, діагностика та методи лікування.','pupkova-gryzha.html',true,1),
('Пахова грижа','Консультація та варіанти операції.','pakhova-gryzha.html',true,2),
('Жовчнокам’яна хвороба','Камені жовчного міхура та хірургічне лікування.','zhovchnokamiana-khvoroba.html',true,3),
('Лапароскопічна хірургія','Малоінвазивні операції та підготовка.','laparoskopichna-khirurhiia.html',true,4),
('Проктологія','Делікатна консультація та діагностика.','proktolohiia.html',true,5)
) as x(title,description,url,published,sort_order)
where not exists (select 1 from public.treatment_info_cards);

insert into public.site_settings(key,value) values
('patient_section_title','Важливо для пацієнта'),
('patient_section_intro','Інтерактивні матеріали, памʼятки та файли для підготовки.'),
('treatment_info_eyebrow','Детальніше про лікування'),
('treatment_info_title','Інформація за напрямками'),
('treatment_info_intro','Окремі сторінки з інформацією для пацієнтів.')
on conflict(key) do nothing;
