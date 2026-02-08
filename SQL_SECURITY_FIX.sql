-- ==========================================
-- CORRECTION DE SÉCURITÉ - TABLE ETUDIANTS
-- ==========================================
-- Ce script protège la table etudiants contre les modifications non autorisées
-- notamment pour empêcher les utilisateurs de se donner les droits admin

-- 0. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Tout le monde peut lire les étudiants" ON etudiants;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur profil" ON etudiants;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur profil (sans privilèges)" ON etudiants;
DROP POLICY IF EXISTS "Interdire suppression étudiants" ON etudiants;

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

-- 0. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Tout le monde peut lire les transactions" ON transactions;
DROP POLICY IF EXISTS "Création transactions contrôlée" ON transactions;
DROP POLICY IF EXISTS "Interdire modification transactions" ON transactions;
DROP POLICY IF EXISTS "Seuls admins peuvent supprimer transactions" ON transactions;

-- 1. Activer Row Level Security sur la table transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 2. LECTURE : Tous les utilisateurs peuvent voir toutes les transactions
-- (nécessaire pour l'historique et les statistiques)
CREATE POLICY "Tout le monde peut lire les transactions" ON transactions
  FOR SELECT
  USING (true);

-- 3. INSERTION : Seuls les admins peuvent créer des transactions (cadeaux de points)
-- Les transactions système (NFC, achats) doivent utiliser service_role
CREATE POLICY "Création transactions contrôlée" ON transactions
  FOR INSERT
  WITH CHECK (
    -- Option 1 : Transaction admin (cadeau de points) - vérifier que l'admin est légitime
    (
      admin_email IS NOT NULL
      AND destinataire_email IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM etudiants 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_admin = true
      )
    )
    -- Option 2 : Transaction système (NFC, achats boutique) - BLOQUÉE pour tous
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
-- SÉCURISATION TABLE ACHATS
-- ==========================================
-- Protège la table achats contre les fausses validations d'achat

-- 1. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Tout le monde peut lire les achats" ON achats;
DROP POLICY IF EXISTS "Les utilisateurs voient leurs propres achats" ON achats;
DROP POLICY IF EXISTS "Les utilisateurs peuvent acheter" ON achats;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs achats" ON achats;
DROP POLICY IF EXISTS "Seuls gestionnaires peuvent créer achats" ON achats;
DROP POLICY IF EXISTS "Seuls gestionnaires peuvent modifier achats" ON achats;
DROP POLICY IF EXISTS "Seuls gestionnaires peuvent supprimer achats" ON achats;
DROP POLICY IF EXISTS "Seuls admins peuvent valider achats" ON achats;
DROP POLICY IF EXISTS "Interdire modification achats" ON achats;
DROP POLICY IF EXISTS "Interdire suppression achats" ON achats;

-- 2. Activer Row Level Security sur la table achats
ALTER TABLE achats ENABLE ROW LEVEL SECURITY;

-- 3. LECTURE : Tout le monde peut voir les achats
CREATE POLICY "Tout le monde peut lire les achats" ON achats
  FOR SELECT
  USING (true);

-- 4. INSERTION : Les utilisateurs peuvent acheter pour eux-mêmes
-- Les gestionnaires boutique peuvent créer des achats pour n'importe qui (ex: retrait admin)
CREATE POLICY "Les utilisateurs peuvent créer leurs achats" ON achats
  FOR INSERT
  WITH CHECK (
    -- Soit c'est son propre achat
    acheteur_email = auth.jwt() ->> 'email'
    -- Soit c'est un gestionnaire boutique (pour retraits admin)
    OR EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_boutique_manager = true
    )
  );

-- 5. MISE À JOUR : Seuls les gestionnaires boutique peuvent modifier les achats
CREATE POLICY "Seuls gestionnaires peuvent modifier achats" ON achats
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_boutique_manager = true
    )
  );

-- 6. SUPPRESSION : Seuls les gestionnaires boutique peuvent supprimer des achats
CREATE POLICY "Seuls gestionnaires peuvent supprimer achats" ON achats
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_boutique_manager = true
    )
  );

-- ==========================================
-- SÉCURISATION TABLE NFC_TAGS
-- ==========================================
-- Protège la table nfc_tags contre la création de faux tags

-- 1. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Tout le monde peut lire les tags NFC" ON nfc_tags;
DROP POLICY IF EXISTS "Seuls admins peuvent créer tags NFC" ON nfc_tags;
DROP POLICY IF EXISTS "Seuls admins peuvent modifier tags NFC" ON nfc_tags;
DROP POLICY IF EXISTS "Seuls admins peuvent supprimer tags NFC" ON nfc_tags;

-- 2. Activer Row Level Security sur la table nfc_tags
ALTER TABLE nfc_tags ENABLE ROW LEVEL SECURITY;

-- 3. LECTURE : Tout le monde peut voir les tags NFC
CREATE POLICY "Tout le monde peut lire les tags NFC" ON nfc_tags
  FOR SELECT
  USING (true);

-- 4. INSERTION : Seuls les admins peuvent créer des tags NFC
CREATE POLICY "Seuls admins peuvent créer tags NFC" ON nfc_tags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- 5. MISE À JOUR : Seuls les admins peuvent modifier les tags NFC
CREATE POLICY "Seuls admins peuvent modifier tags NFC" ON nfc_tags
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- 6. SUPPRESSION : Seuls les admins peuvent supprimer des tags NFC
CREATE POLICY "Seuls admins peuvent supprimer tags NFC" ON nfc_tags
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- ==========================================
-- SÉCURISATION TABLE OBJETS_BOUTIQUE
-- ==========================================
-- Protège la table objets_boutique contre les modifications non autorisées

-- 1. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Tout le monde peut lire les objets boutique" ON objets_boutique;
DROP POLICY IF EXISTS "Tout le monde peut voir les objets" ON objets_boutique;
DROP POLICY IF EXISTS "Seuls gestionnaires peuvent créer objets" ON objets_boutique;
DROP POLICY IF EXISTS "Seuls les gestionnaires peuvent ajouter des objets" ON objets_boutique;
DROP POLICY IF EXISTS "Seuls gestionnaires peuvent modifier objets" ON objets_boutique;
DROP POLICY IF EXISTS "Seuls les gestionnaires peuvent modifier des objets" ON objets_boutique;
DROP POLICY IF EXISTS "Seuls gestionnaires peuvent supprimer objets" ON objets_boutique;
DROP POLICY IF EXISTS "Seuls les gestionnaires peuvent supprimer des objets" ON objets_boutique;

-- 2. Activer Row Level Security sur la table objets_boutique
ALTER TABLE objets_boutique ENABLE ROW LEVEL SECURITY;

-- 3. LECTURE : Tout le monde peut voir les objets de la boutique
CREATE POLICY "Tout le monde peut lire les objets boutique" ON objets_boutique
  FOR SELECT
  USING (true);

-- 4. INSERTION : Seuls les gestionnaires boutique peuvent créer des objets
CREATE POLICY "Seuls gestionnaires peuvent créer objets" ON objets_boutique
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_boutique_manager = true
    )
  );

-- 5. MISE À JOUR : Seuls les gestionnaires boutique peuvent modifier les objets
CREATE POLICY "Seuls gestionnaires peuvent modifier objets" ON objets_boutique
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_boutique_manager = true
    )
  );

-- 6. SUPPRESSION : Seuls les gestionnaires boutique peuvent supprimer des objets
CREATE POLICY "Seuls gestionnaires peuvent supprimer objets" ON objets_boutique
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_boutique_manager = true
    )
  );

-- ==========================================
-- SÉCURISATION TABLE CHALLENGES
-- ==========================================
-- Protège la table challenges contre les modifications non autorisées

-- 1. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Tout le monde peut lire les challenges" ON challenges;
DROP POLICY IF EXISTS "Seuls admins peuvent créer challenges" ON challenges;
DROP POLICY IF EXISTS "Seuls admins peuvent modifier challenges" ON challenges;
DROP POLICY IF EXISTS "Seuls admins peuvent supprimer challenges" ON challenges;

-- 2. Activer Row Level Security sur la table challenges
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- 3. LECTURE : Tout le monde peut voir les challenges publiés
CREATE POLICY "Tout le monde peut lire les challenges" ON challenges
  FOR SELECT
  USING (true);

-- 4. INSERTION : Seuls les admins peuvent créer des challenges
CREATE POLICY "Seuls admins peuvent créer challenges" ON challenges
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- 5. MISE À JOUR : Seuls les admins peuvent modifier les challenges
CREATE POLICY "Seuls admins peuvent modifier challenges" ON challenges
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- 6. SUPPRESSION : Seuls les admins peuvent supprimer des challenges
CREATE POLICY "Seuls admins peuvent supprimer challenges" ON challenges
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- ==========================================
-- SÉCURISATION TABLE CHALLENGE_VALIDATIONS
-- ==========================================
-- Protège la table challenge_validations contre les fausses validations

-- 1. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Tout le monde peut lire les validations" ON challenge_validations;
DROP POLICY IF EXISTS "Seuls admins peuvent créer validations" ON challenge_validations;
DROP POLICY IF EXISTS "Interdire modification validations" ON challenge_validations;
DROP POLICY IF EXISTS "Seuls admins peuvent supprimer validations" ON challenge_validations;

-- 2. Activer Row Level Security sur la table challenge_validations
ALTER TABLE challenge_validations ENABLE ROW LEVEL SECURITY;

-- 3. LECTURE : Tout le monde peut voir les validations
CREATE POLICY "Tout le monde peut lire les validations" ON challenge_validations
  FOR SELECT
  USING (true);

-- 4. INSERTION : Seuls les admins peuvent créer des validations
CREATE POLICY "Seuls admins peuvent créer validations" ON challenge_validations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- 5. MISE À JOUR : Personne ne peut modifier une validation une fois créée
CREATE POLICY "Interdire modification validations" ON challenge_validations
  FOR UPDATE
  USING (false);

-- 6. SUPPRESSION : Seuls les admins peuvent supprimer des validations
CREATE POLICY "Seuls admins peuvent supprimer validations" ON challenge_validations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM etudiants 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- ==========================================
-- TRIGGER : GESTION AUTOMATIQUE DES QUANTITÉS
-- ==========================================
-- Ce trigger met à jour automatiquement la quantité dans objets_boutique
-- quand un achat est créé, évitant ainsi les problèmes de RLS

-- 1. Créer la fonction trigger
CREATE OR REPLACE FUNCTION update_quantite_apres_achat()
RETURNS TRIGGER AS $$
DECLARE
  objet_record RECORD;
BEGIN
  -- Si l'achat n'a pas d'objet_id (ex: retrait admin), ne rien faire
  IF NEW.objet_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Récupérer l'objet acheté
  SELECT * INTO objet_record
  FROM objets_boutique
  WHERE id = NEW.objet_id;
  
  -- Si l'objet n'existe pas, ne rien faire
  IF objet_record IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Si c'est une tombola, incrémenter le nombre de participants
  IF objet_record.is_tombola = true THEN
    UPDATE objets_boutique
    SET quantite = quantite + 1
    WHERE id = NEW.objet_id;
  -- Si c'est un objet normal, décrémenter la quantité
  ELSE
    UPDATE objets_boutique
    SET quantite = quantite - 1
    WHERE id = NEW.objet_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS trigger_update_quantite ON achats;

-- 3. Créer le trigger
CREATE TRIGGER trigger_update_quantite
  AFTER INSERT ON achats
  FOR EACH ROW
  EXECUTE FUNCTION update_quantite_apres_achat();

-- ==========================================
-- NOTES IMPORTANTES
-- ==========================================
-- ⚠️ Après avoir exécuté ce script dans Supabase :
-- 1. Les utilisateurs NE POURRONT PLUS modifier is_admin ou is_boutique_manager
-- 2. Pour donner les droits admin, utilisez la console Supabase ou un script avec service_role
-- 3. Le fichier admin_creation.js utilise déjà service_role, donc il fonctionnera toujours
-- 4. La clé service_role dans admin_creation.js NE DOIT JAMAIS être exposée côté client
-- 5. TOUTES les tables sont maintenant sécurisées avec Row Level Security (RLS)
-- 6. Les actions sensibles nécessitent maintenant d'être admin ou gestionnaire boutique
-- 7. Les quantités d'objets sont maintenant gérées automatiquement par trigger SQL
