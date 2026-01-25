-- Créer la table pour stocker les codes OTP temporaires
CREATE TABLE otp_codes (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at_timestamp TIMESTAMP DEFAULT NOW()
);

-- Index pour des recherches rapides
CREATE INDEX idx_otp_email_code ON otp_codes(email, code);
CREATE INDEX idx_otp_expires ON otp_codes(expires_at);

-- Politiques de sécurité (RLS)
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Permettre à tout le monde d'insérer des codes OTP
CREATE POLICY "Allow insert otp_codes" ON otp_codes
  FOR INSERT
  WITH CHECK (true);

-- Permettre à tout le monde de lire les codes OTP (nécessaire pour vérifier)
CREATE POLICY "Allow select otp_codes" ON otp_codes
  FOR SELECT
  USING (true);

-- Permettre à tout le monde de supprimer les codes OTP utilisés
CREATE POLICY "Allow delete otp_codes" ON otp_codes
  FOR DELETE
  USING (true);
