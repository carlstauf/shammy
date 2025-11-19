CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

CREATE SCHEMA IF NOT EXISTS shammy;
ALTER DATABASE shammy SET search_path TO shammy, public;

CREATE TABLE IF NOT EXISTS shammy.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS shammy.connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES shammy.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  airbyte_source_id UUID,
  airbyte_destination_id UUID,
  airbyte_connection_id UUID,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  credentials_encrypted TEXT,
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  sync_frequency_hours INTEGER DEFAULT 24,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE TABLE IF NOT EXISTS shammy.sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES shammy.connections(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  records_synced INTEGER DEFAULT 0,
  bytes_synced BIGINT DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_connections_user_id ON shammy.connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON shammy.connections(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_connection_id ON shammy.sync_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON shammy.sync_logs(started_at DESC);

CREATE OR REPLACE FUNCTION shammy.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON shammy.users
  FOR EACH ROW
  EXECUTE FUNCTION shammy.update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON shammy.connections
  FOR EACH ROW
  EXECUTE FUNCTION shammy.update_updated_at_column();

CREATE OR REPLACE FUNCTION shammy.create_user_schema(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  schema_name TEXT := 'user_' || REPLACE(p_user_id::TEXT, '-', '_');
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);

  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.emails (
      id TEXT PRIMARY KEY,
      thread_id TEXT,
      subject TEXT,
      from_email TEXT,
      from_name TEXT,
      to_emails TEXT[],
      cc_emails TEXT[],
      bcc_emails TEXT[],
      date TIMESTAMPTZ,
      snippet TEXT,
      body_text TEXT,
      body_html TEXT,
      labels TEXT[],
      attachments JSONB,
      synced_at TIMESTAMPTZ DEFAULT NOW()
    )
  ', schema_name);

  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_%I_emails_fts
    ON %I.emails
    USING GIN (to_tsvector(''english'', COALESCE(subject, '''') || '' '' || COALESCE(body_text, '''')))
  ', REPLACE(p_user_id::TEXT, '-', '_'), schema_name);

  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.github_commits (
      sha TEXT PRIMARY KEY,
      repo TEXT NOT NULL,
      message TEXT,
      author_name TEXT,
      author_email TEXT,
      author_date TIMESTAMPTZ,
      committer_name TEXT,
      committer_email TEXT,
      committer_date TIMESTAMPTZ,
      additions INTEGER,
      deletions INTEGER,
      total_changes INTEGER,
      files_changed TEXT[],
      url TEXT,
      synced_at TIMESTAMPTZ DEFAULT NOW()
    )
  ', schema_name);

  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.calendar_events (
      id TEXT PRIMARY KEY,
      summary TEXT,
      description TEXT,
      location TEXT,
      start_time TIMESTAMPTZ,
      end_time TIMESTAMPTZ,
      all_day BOOLEAN DEFAULT FALSE,
      attendees JSONB,
      organizer JSONB,
      status TEXT,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ,
      synced_at TIMESTAMPTZ DEFAULT NOW()
    )
  ', schema_name);

  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.files (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT,
      mime_type TEXT,
      size BIGINT,
      content_text TEXT,
      metadata JSONB,
      source TEXT,
      created_at TIMESTAMPTZ,
      modified_at TIMESTAMPTZ,
      synced_at TIMESTAMPTZ DEFAULT NOW()
    )
  ', schema_name);

  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_%I_files_fts
    ON %I.files
    USING GIN (to_tsvector(''english'', COALESCE(name, '''') || '' '' || COALESCE(content_text, '''')))
  ', REPLACE(p_user_id::TEXT, '-', '_'), schema_name);
END;
$$ LANGUAGE plpgsql;

GRANT ALL PRIVILEGES ON SCHEMA shammy TO shammy;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA shammy TO shammy;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA shammy TO shammy;
