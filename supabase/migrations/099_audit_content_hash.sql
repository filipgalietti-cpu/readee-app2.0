-- Add content_hash to content_audit_findings so the audit can
-- skip re-judging assets that haven't changed since last pass.
--
-- The auditor computes a sha256 over the canonical asset fields
-- at scan time:
--   image:          image_url + prompt
--   audio:          audio_url + ttsScript
--   step audio:     audio_url + step.ttsScript
--   question text:  prompt + choices.join("|") + correct
--
-- On the next audit run, before calling an expensive judge, we
-- look for a recent pass finding (same target+finding_type) with
-- the same hash. If found within the freshness window, we skip
-- the judge call entirely.
--
-- Cost impact: ~$10/audit pass currently spent on TTS+vision
-- judges for already-clean content. After this change, that
-- approaches $0 for the unchanged majority — only churn pays.

alter table public.content_audit_findings
  add column if not exists content_hash text;

create index if not exists content_audit_findings_skip_idx
  on public.content_audit_findings (target_kind, target_id, finding_type, content_hash, severity)
  where status = 'fixed' or severity = 'pass';
