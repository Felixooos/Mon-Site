-- ==========================================
-- FONCTIONNALITÉ TOMBOLA GRATUITE
-- ==========================================
-- Permet de créer des tombolas gratuites avec limite de 1 par personne

-- 1. Ajouter le champ is_tombola à la table objets_boutique
ALTER TABLE objets_boutique 
ADD COLUMN IF NOT EXISTS is_tombola BOOLEAN DEFAULT FALSE;

-- 2. Ajouter le champ is_gratuit pour marquer les objets gratuits
ALTER TABLE objets_boutique 
ADD COLUMN IF NOT EXISTS is_gratuit BOOLEAN DEFAULT FALSE;

-- 3. Ajouter le champ max_par_personne pour limiter les achats
ALTER TABLE objets_boutique 
ADD COLUMN IF NOT EXISTS max_par_personne INTEGER DEFAULT NULL;

-- 4. Ajouter les champs pour la gestion du tirage (pour les tombolas dont il faut tirer un gagnant)
ALTER TABLE objets_boutique 
ADD COLUMN IF NOT EXISTS tombola_terminee BOOLEAN DEFAULT FALSE;

-- 5. Ajouter le champ est_gagnant à la table achats pour les tombolas avec tirage
ALTER TABLE achats 
ADD COLUMN IF NOT EXISTS est_gagnant BOOLEAN DEFAULT NULL;

-- 6. Ajouter le champ date_tirage pour savoir quand le tirage a eu lieu
ALTER TABLE achats 
ADD COLUMN IF NOT EXISTS date_tirage TIMESTAMP DEFAULT NULL;

-- ==========================================
-- FONCTION POUR VÉRIFIER SI L'UTILISATEUR A DÉJÀ ACHETÉ
-- ==========================================
CREATE OR REPLACE FUNCTION a_deja_achete_objet(user_email VARCHAR(255), objet_id_param BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_achats INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_achats
  FROM achats
  WHERE acheteur_email = user_email
    AND objet_id = objet_id_param;
  
  RETURN count_achats > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION a_deja_achete_objet(VARCHAR, BIGINT) TO authenticated;

-- ==========================================
-- FONCTION POUR TIRER LE GAGNANT D'UNE TOMBOLA
-- ==========================================
-- Cette fonction SQL tire un gagnant au hasard parmi tous les participants
-- À utiliser pour les tombolas avec tirage (non gratuites généralement)

CREATE OR REPLACE FUNCTION tirer_gagnant_tombola(objet_id_param BIGINT)
RETURNS TABLE (
  gagnant_email VARCHAR(255),
  nombre_participants BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achat_gagnant achats%ROWTYPE;
  nb_participants BIGINT;
BEGIN
  -- Vérifier que l'objet existe et est une tombola
  IF NOT EXISTS (
    SELECT 1 FROM objets_boutique 
    WHERE id = objet_id_param AND is_tombola = true
  ) THEN
    RAISE EXCEPTION 'Cet objet n''est pas une tombola';
  END IF;

  -- Compter le nombre de participants
  SELECT COUNT(*) INTO nb_participants
  FROM achats
  WHERE objet_id = objet_id_param;

  IF nb_participants = 0 THEN
    RAISE EXCEPTION 'Aucun participant pour cette tombola';
  END IF;

  -- Sélectionner un gagnant au hasard
  SELECT * INTO achat_gagnant
  FROM achats
  WHERE objet_id = objet_id_param
  ORDER BY RANDOM()
  LIMIT 1;

  -- Marquer le gagnant
  UPDATE achats
  SET est_gagnant = true,
      date_tirage = NOW()
  WHERE id = achat_gagnant.id;

  -- Marquer les perdants
  UPDATE achats
  SET est_gagnant = false,
      date_tirage = NOW()
  WHERE objet_id = objet_id_param
    AND id != achat_gagnant.id;

  -- Marquer la tombola comme terminée
  UPDATE objets_boutique
  SET tombola_terminee = true
  WHERE id = objet_id_param;

  -- Retourner les infos
  RETURN QUERY
  SELECT achat_gagnant.acheteur_email, nb_participants;
END;
$$;

GRANT EXECUTE ON FUNCTION tirer_gagnant_tombola(BIGINT) TO authenticated;

-- ==========================================
-- NOTES D'UTILISATION
-- ==========================================
-- 
-- Pour créer une tombola GRATUITE avec limite de 1 par personne:
-- INSERT INTO objets_boutique (nom, prix, quantite, is_tombola, is_gratuit, max_par_personne)
-- VALUES ('Tombola Gratuite', 0, 1000, true, true, 1);
--
-- Pour une tombola PAYANTE classique avec tirage au sort:
-- INSERT INTO objets_boutique (nom, prix, quantite, is_tombola, is_gratuit)
-- VALUES ('Tombola Premium', 50, 0, true, false);
--
-- Pour un objet normal avec limite d'achat:
-- INSERT INTO objets_boutique (nom, prix, quantite, max_par_personne)
-- VALUES ('Objet Limité', 100, 50, 1);
