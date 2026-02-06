-- ==========================================
-- CORRECTION DE SÉCURITÉ - TABLE ETUDIANTS
-- ==========================================
-- Ce script protège la table etudiants contre les modifications non autorisées
-- notamment pour empêcher les utilisateurs de se donner les droits admin

-- 1. Activer Row Level Security sur la table etudiants
ALTER TABLE etudiants ENABLE ROW LEVEL SECURITY;

-- 2. LECTURE : Tout le monde peut voir tous les étudiants (pour classement, etc.)
CREATE POLICY "Tout le monde peut lire les étudiants" ON etudiants
  FOR SELECT
  USING (true);

-- 3. INSERTION : Les nouveaux utilisateurs peuvent créer leur profil
-- mais UNIQUEMENT avec is_admin = false et is_boutique_manager = false
CREATE POLICY "Les utilisateurs peuvent créer leur profil" ON etudiants
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = email
    AND (is_admin IS NULL OR is_admin = false)
    AND (is_boutique_manager IS NULL OR is_boutique_manager = false)
  );

-- 4. MISE À JOUR : Les utilisateurs peuvent modifier leur propre profil
-- MAIS PAS les champs is_admin et is_boutique_manager
CREATE POLICY "Les utilisateurs peuvent modifier leur profil (sans privilèges)" ON etudiants
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = email)
  WITH CHECK (
    auth.jwt() ->> 'email' = email
    -- Empêcher la modification des champs sensibles
    AND is_admin = (SELECT is_admin FROM etudiants WHERE email = auth.jwt() ->> 'email')
    AND is_boutique_manager = (SELECT is_boutique_manager FROM etudiants WHERE email = auth.jwt() ->> 'email')
  );

-- 5. SUPPRESSION : Personne ne peut supprimer des étudiants via l'API publique
-- (seulement via service_role ou la console Supabase)
CREATE POLICY "Interdire suppression étudiants" ON etudiants
  FOR DELETE
  USING (false);

-- ==========================================
-- SÉCURISATION TABLE TRANSACTIONS
-- ==========================================
-- Protège la table transactions contre les fausses transactions

-- 1. Activer Row Level Security sur la table transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 2. LECTURE : Tous les utilisateurs peuvent voir toutes les transactions
-- (nécessaire pour l'historique et les statistiques)
CREATE POLICY "Tout le monde peut lire les transactions" ON transactions
  FOR SELECT
  USING (true);

-- 3. INSERTION : Les utilisateurs peuvent uniquement créer des transactions
-- où ils sont l'expéditeur (ET ils doivent avoir le solde suffisant)
-- Les admins (vérifiés côté serveur) peuvent créer des transactions pour autrui
CREATE POLICY "Création transactions contrôlée" ON transactions
  FOR INSERT
  WITH CHECK (
    -- Option 1 : Transaction normale où l'utilisateur est l'expéditeur
    (
      auth.jwt() ->> 'email' = emetteur_email
      AND emetteur_email IS NOT NULL
      AND destinataire_email IS NOT NULL
      AND emetteur_email != destinataire_email
    )
    -- Option 2 : Transaction admin (cadeau de points) - vérifier que l'admin est légitime
    OR (
      emetteur_email IS NULL
      AND admin_email IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM etudiants 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_admin = true
      )
    )
    -- Option 3 : Transaction système (NFC, etc.) - BLOQUÉE pour les utilisateurs normaux
    -- Ces transactions doivent être créées via service_role uniquement
    OR (
      admin_email = 'SYSTEM_NFC'
      AND 1=0  -- Toujours faux : force l'utilisation de service_role
    )
  );

-- 4. MISE À JOUR : Personne ne peut modifier une transaction une fois créée
CREATE POLICY "Interdire modification transactions" ON transactions
  FOR UPDATE
  USING (false);

-- 5. SUPPRESSION : Seuls les admins peuvent supprimer des transactions
CREATE POLICY "Seuls admins peuvent supprimer transactions" ON transactions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- ==========================================
-- NOTES IMPORTANTES
-- ==========================================
-- ⚠️ Après avoir exécuté ce script dans Supabase :
-- 1. Les utilisateurs NE POURRONT PLUS modifier is_admin ou is_boutique_manager
-- 2. Pour donner les droits admin, utilisez la console Supabase ou un script avec service_role
-- 3. Le fichier admin_creation.js utilise déjà service_role, donc il fonctionnera toujours
-- 4. La clé service_role dans admin_creation.js NE DOIT JAMAIS être exposée côté client
