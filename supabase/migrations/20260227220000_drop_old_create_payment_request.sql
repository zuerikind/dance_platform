-- Fix: remove the old 6-parameter overload of create_payment_request so only the
-- 7-parameter version (with p_slot_id) exists. Otherwise Postgres cannot choose
-- when the client calls with 7 args and all schools get "Could not choose the
-- best candidate function" when submitting a payment request.

DROP FUNCTION IF EXISTS public.create_payment_request(text, text, text, numeric, text, uuid);

-- The 7-parameter version (with p_slot_id uuid DEFAULT NULL) from
-- 20260227210000_aure_package_slots.sql remains and is used for all schools;
-- p_slot_id is NULL for non-Aure / non-slot purchases (e.g. clase suelta).
