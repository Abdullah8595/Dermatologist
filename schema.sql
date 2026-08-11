CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  reference VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(255) NOT NULL,
  service VARCHAR(100) NOT NULL,
  preferred_date DATE NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_date_idx ON appointments (preferred_date);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments (status);
