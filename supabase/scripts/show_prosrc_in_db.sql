-- Run this in Supabase SQL Editor.
-- has_new_message: new logic + phrase present. has_new_message_strict: regex (don.+t) so any apostrophe matches.
-- has_ascii_apostrophe: true when prosrc has the message (prosrc stores don''t = two ASCII 27 chars).
-- Second query: exact char(s) between "don" and "t" in prosrc (hex 27=ASCII ', e28099=curly ').

SELECT
  current_database() AS db,
  (SELECT length(prosrc) FROM pg_proc WHERE proname = 'register_for_class') AS prosrc_length,
  (SELECT prosrc LIKE '%v_effective_balance%' FROM pg_proc WHERE proname = 'register_for_class') AS has_new_vars,
  (SELECT prosrc LIKE '%v_registered_count%' FROM pg_proc WHERE proname = 'register_for_class') AS has_registered_count,
  (SELECT (prosrc LIKE '%v_effective_balance%' AND prosrc LIKE '%have enough classes in your package%') FROM pg_proc WHERE proname = 'register_for_class') AS has_new_message,
  (SELECT prosrc ~ 'You don.+t have enough classes in your package' FROM pg_proc WHERE proname = 'register_for_class') AS has_new_message_strict,
  (SELECT prosrc LIKE '%You don''''t have enough classes in your package%' FROM pg_proc WHERE proname = 'register_for_class') AS has_ascii_apostrophe,
  (SELECT prosrc LIKE '%have enough classes in your package%' FROM pg_proc WHERE proname = 'register_for_class') AS has_full_message_phrase;

-- Deep research: what is actually between "don" and "t" in the stored message? (ASCII apostrophe = hex 27, curly U+2019 = e28099)
SELECT
  (SELECT (regexp_match(prosrc, 'don(.+?)t have'))[1] AS chars_between_don_t FROM pg_proc WHERE proname = 'register_for_class'),
  (SELECT encode(convert_to((regexp_match(prosrc, 'don(.+?)t have'))[1], 'UTF8'), 'hex') AS hex FROM pg_proc WHERE proname = 'register_for_class'),
  (SELECT length((regexp_match(prosrc, 'don(.+?)t have'))[1]) AS num_chars FROM pg_proc WHERE proname = 'register_for_class');
