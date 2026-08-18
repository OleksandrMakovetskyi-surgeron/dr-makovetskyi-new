# Dr Makovetskyi — Supabase + Vercel

1. Supabase → SQL Editor → виконайте `schema.sql`.
2. У Supabase Authentication використайте свого admin-користувача.
3. Додайте його в `admin_users`:
```sql
insert into public.admin_users(user_id,email,role,is_active)
values ('AUTH_USER_UUID','your@email.com','admin',true)
on conflict(user_id) do update set is_active=true,role='admin';
```
4. Завантажте всі файли в корінь GitHub-репозиторію.
5. Vercel → Import Git Repository → Deploy.
6. Сайт: `/`
7. CMS: `/admin.html`

`config.js` містить browser-safe publishable key. Не додавайте service_role/secret key.
