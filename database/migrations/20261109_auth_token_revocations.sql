CREATE TABLE IF NOT EXISTS auth_token_revocations (
    token_id VARCHAR(100) PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_token_revocations_expires_at
    ON auth_token_revocations (expires_at);
