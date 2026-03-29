-- Migration 002: Webhook tables for outbound delivery and inbound ingestion

-- Outbound webhook subscriptions
CREATE TABLE webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  url VARCHAR(2048) NOT NULL,
  secret VARCHAR(255) NOT NULL,
  event_types TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_subs_provider ON webhook_subscriptions(provider_id, is_active);

-- Outbound webhook delivery log
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status_code INTEGER,
  response_body TEXT,
  attempt_count INTEGER DEFAULT 0,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_sub ON webhook_deliveries(subscription_id, created_at DESC);

-- Inbound webhook ingested events (idempotent on source + external_event_id)
CREATE TABLE webhook_ingested_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(100) NOT NULL,
  external_event_id VARCHAR(255),
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  signature_valid BOOLEAN NOT NULL DEFAULT true,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_webhook_ingest_idempotency
  ON webhook_ingested_events(source, external_event_id)
  WHERE external_event_id IS NOT NULL;

CREATE INDEX idx_webhook_ingest_unprocessed
  ON webhook_ingested_events(processed, created_at)
  WHERE processed = false;
