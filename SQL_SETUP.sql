s-- Créer la table pour stocker les codes OTP temporaires
CREATE TABLE otp_codes (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(8) NOT NULL,
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

-- Ajouter le champ is_boutique_manager à la table etudiants
ALTER TABLE etudiants ADD COLUMN IF NOT EXISTS is_boutique_manager BOOLEAN DEFAULT FALSE;

-- Table pour les objets de la boutique
CREATE TABLE IF NOT EXISTS objets_boutique (
  id BIGSERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prix INTEGER NOT NULL,
  image_url TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('principal', 'petit')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table pour les achats
CREATE TABLE IF NOT EXISTS achats (
  id BIGSERIAL PRIMARY KEY,
  acheteur_email VARCHAR(255) NOT NULL,
  objet_id BIGINT NOT NULL REFERENCES objets_boutique(id) ON DELETE CASCADE,
  prix_paye INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Politiques RLS pour objets_boutique
ALTER TABLE objets_boutique ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les objets" ON objets_boutique
  FOR SELECT
  USING (true);

CREATE POLICY "Seuls les gestionnaires peuvent ajouter des objets" ON objets_boutique
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_boutique_manager = true
    )
  );

CREATE POLICY "Seuls les gestionnaires peuvent modifier des objets" ON objets_boutique
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_boutique_manager = true
    )
  );

CREATE POLICY "Seuls les gestionnaires peuvent supprimer des objets" ON objets_boutique
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_boutique_manager = true
    )
  );

-- Politiques RLS pour achats
ALTER TABLE achats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs voient leurs propres achats" ON achats
  FOR SELECT
  USING (acheteur_email = auth.jwt() ->> 'email');

CREATE POLICY "Les utilisateurs peuvent acheter" ON achats
  FOR INSERT
  WITH CHECK (acheteur_email = auth.jwt() ->> 'email');
