-- Optional per-classroom 4-digit PIN for student sign-in. When set,
-- the /class/[code] name-tile picker requires the student to enter
-- the PIN after tapping their tile. Used by schools where classroom
-- iPads/Chromebooks are shared between students — prevents a student
-- from signing in as a classmate.
--
-- Null = no PIN (name tile alone signs in, current behavior).

alter table public.classrooms
  add column student_pin text
    check (student_pin is null or student_pin ~ '^[0-9]{4}$');
