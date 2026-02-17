-- One-time: link all admins to Auth users by matching email.
-- Updates admins.user_id where admin has real email and auth.users has matching email.

UPDATE public.admins a
SET user_id = u.id
FROM auth.users u
WHERE a.user_id IS NULL
  AND a.email IS NOT NULL
  AND trim(a.email) != ''
  AND a.email NOT LIKE '%@admins.bailadmin.local'
  AND a.email NOT LIKE '%@temp.bailadmin.local'
  AND lower(trim(a.email)) = lower(trim(u.email));
