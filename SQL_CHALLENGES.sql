-- ==================== TABLES POUR LES CHALLENGES ====================

-- Table des challenges
CREATE TABLE IF NOT EXISTS challenges (
  id BIGSERIAL PRIMARY KEY,
  difficulte VARCHAR(20) NOT NULL CHECK (difficulte IN ('50', '150', '300')),
  titre VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL CHECK (points IN (50, 150, 300)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des validations de challenges
CREATE TABLE IF NOT EXISTS challenge_validations (
  id BIGSERIAL PRIMARY KEY,
  challenge_id BIGINT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES etudiants(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  validated_by_admin VARCHAR(255) NOT NULL,
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_email)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_challenges_difficulte ON challenges(difficulte);
CREATE INDEX IF NOT EXISTS idx_challenge_validations_challenge_id ON challenge_validations(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_validations_user_email ON challenge_validations(user_email);

-- Activer RLS (Row Level Security)
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_validations ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les challenges
CREATE POLICY "Les challenges sont visibles par tous"
  ON challenges FOR SELECT
  USING (true);

-- Politique : Tout le monde peut lire les validations
CREATE POLICY "Les validations sont visibles par tous"
  ON challenge_validations FOR SELECT
  USING (true);

-- Politique : Tout le monde peut insérer des challenges (on gérera les admins côté client)
CREATE POLICY "Tout le monde peut créer des challenges"
  ON challenges FOR INSERT
  WITH CHECK (true);

-- Politique : Tout le monde peut supprimer des challenges (on gérera les admins côté client)
CREATE POLICY "Tout le monde peut supprimer des challenges"
  ON challenges FOR DELETE
  USING (true);

-- Politique : Tout le monde peut insérer des validations
CREATE POLICY "Tout le monde peut valider des challenges"
  ON challenge_validations FOR INSERT
  WITH CHECK (true);

-- Politique : Tout le monde peut supprimer des validations
CREATE POLICY "Tout le monde peut supprimer des validations"
  ON challenge_validations FOR DELETE
  USING (true);

-- Données de test (facultatif)
-- INSERT INTO challenges (difficulte, titre, description, points) VALUES
-- ('facile', 'Boire 2L d''eau', 'Bois 2 litres d''eau dans la journée', 50),
-- ('moyen', 'Faire 100 pompes', 'Fais 100 pompes dans la journée (tu peux les répartir)', 150),
-- ('difficile', 'Courir 10km', 'Cours 10 kilomètres d''affilée', 300);
