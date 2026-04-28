-- Teacher onboarding answers. Captured during the first-time
-- onboarding wizard so the rest of the app can personalize:
--   - default_grade  : seeds new classroom defaults, AI prompt grade band
--   - school_hint    : free-text school name (no directory autocomplete)
--   - class_setting  : "classroom" | "resource_room" | "tutoring" |
--                      "homeschool" | "after_school"  (steers AI tone)
--   - intent         : the "what brings you to Readee" pick — drives
--                      which dashboard rail and which AI tool to demo
--                      first. e.g. "phonics_gaps", "below_grade",
--                      "above_grade", "ell", "parent_comm", "exploring"
--
-- All nullable. Onboarding wizard writes them in one server action.

alter table public.profiles
  add column if not exists default_grade text
    check (default_grade is null or default_grade in ('K','1st','2nd','3rd','4th','Mixed')),
  add column if not exists school_hint text,
  add column if not exists class_setting text
    check (class_setting is null or class_setting in (
      'classroom','resource_room','tutoring','homeschool','after_school'
    )),
  add column if not exists intent text
    check (intent is null or intent in (
      'phonics_gaps','below_grade','above_grade','ell','parent_comm','exploring'
    ));
