-- Nightly cron: process expired class registrations (no-shows) for all schools.
-- Runs at 05:39 UTC = 23:39 Mexico City (America/Mexico_City, UTC-6).
-- Marks past undeducted registrations as no_show and deducts one class per student.

create extension if not exists pg_cron with schema extensions;

-- Remove existing job if present (idempotent)
do $$
begin
  if exists (select 1 from cron.job where jobname = 'process_expired_registrations_nightly') then
    perform cron.unschedule('process_expired_registrations_nightly');
  end if;
end;
$$;

-- Schedule: 39 5 * * * = 05:39 UTC daily = 23:39 Mexico City
select cron.schedule(
  'process_expired_registrations_nightly',
  '39 5 * * *',
  $cmd$
do $body$
declare
  r record;
begin
  for r in select id from public.schools where class_registration_enabled = true
  loop
    perform public.process_expired_registrations(r.id);
  end loop;
end;
$body$;
$cmd$
);
