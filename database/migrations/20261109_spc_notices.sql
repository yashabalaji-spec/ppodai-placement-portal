CREATE TABLE IF NOT EXISTS spc_notices (
    id BIGSERIAL PRIMARY KEY,
    sender_user_id VARCHAR(100) NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,
    drive_id VARCHAR(100)
        REFERENCES placement_drives(id) ON DELETE SET NULL,
    message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
    audience_type VARCHAR(20) NOT NULL
        CHECK (audience_type IN ('all', 'branches', 'semesters', 'students')),
    target_branches VARCHAR(20)[] NOT NULL DEFAULT '{}',
    target_semesters INTEGER[] NOT NULL DEFAULT '{}',
    target_usns VARCHAR(50)[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_spc_notices_sender_created
    ON spc_notices (sender_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_spc_notices_branches
    ON spc_notices USING GIN (target_branches);

CREATE INDEX IF NOT EXISTS idx_spc_notices_usns
    ON spc_notices USING GIN (target_usns);
