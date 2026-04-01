-- Migration: Enable RLS on all unprotected public tables
-- Applied: 2026-04-01
-- Projects: production (alxrmusieuzgssynktxg) + staging (lestdpwifhlvkbsgaxgj)

-- Enable RLS on all 21 unprotected production tables
ALTER TABLE activity_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_processing_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_team_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_phones            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambiguity_queue           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE callback_attempts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE callback_requests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_phone_channels    ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_ref_sequences        ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_review_queue        ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_thread_links        ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudge_log                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudge_templates           ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_deal_updates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_rules            ENABLE ROW LEVEL SECURITY;

-- Client-readable tables: scoped policies

-- activity_log: authenticated users can read logs for their accessible deals
CREATE POLICY "activity_log_select" ON activity_log
  FOR SELECT TO authenticated
  USING (deal_id IN (SELECT id FROM deals));

CREATE POLICY "activity_log_insert" ON activity_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- settings: global read-only config
CREATE POLICY "settings_select" ON settings
  FOR SELECT TO authenticated
  USING (true);

-- allowed_phones: users manage their own rows
CREATE POLICY "allowed_phones_all" ON allowed_phones
  FOR ALL TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- audit_log: users see their own entries only
CREATE POLICY "audit_log_select" ON audit_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- nudge_templates: any authenticated user (blocks anon access)
CREATE POLICY "nudge_templates_all" ON nudge_templates
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- workflow_rules: creator owns their rules
CREATE POLICY "workflow_rules_all" ON workflow_rules
  FOR ALL TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
