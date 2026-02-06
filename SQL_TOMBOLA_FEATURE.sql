-- ==========================================
-- FONCTIONNALITÉ TOMBOLA POUR LA BOUTIQUE
-- ==========================================
-- Permet de mettre des objets en mode tombola où plusieurs personnes
-- achètent des tickets et un seul gagnant est tiré au sort

-- 1. Ajouter le champ is_tombola à la table objets_boutique
ALTER TABLE objets_boutique 
ADD COLUMN IF NOT EXISTS is_tombola BOOLEAN DEFAULT FALSE;

-- 2. Ajouter le champ tombola_terminee pour savoir si le tirage a été fait
ALTER TABLE objets_boutique 
ADD COLUMN IF NOT EXISTS tombola_terminee BOOLEAN DEFAULT FALSE;

-- 3. Ajouter le champ est_gagnant à la table achats
-- NULL = achat normal (pas une tombola)
-- TRUE = a gagné la tombola
-- FALSE = a acheté un ticket mais n'a pas gagné
ALTER TABLE achats 
ADD COLUMN IF NOT EXISTS est_gagnant BOOLEAN DEFAULT NULL;

-- 4. Ajouter le champ date_tirage pour savoir quand le tirage a eu lieu
ALTER TABLE achats 
ADD COLUMN IF NOT EXISTS date_tirage TIMESTAMP DEFAULT NULL;

-- ==========================================
-- FONCTION POUR TIRER LE GAGNANT
-- ==========================================
-- Cette fonction SQL tire un gagnant au hasard parmi tous les participants
-- Elle est appelée depuis le frontend quand l'admin clique sur "Tirer le gagnant"

CREATE OR REPLACE FUNCTION tirer_gagnant_tombola(objet_id_param BIGINT)
RETURNS TABLE (
  gagnant_email VARCHAR(255),
  nombre_participants BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Permet d'exécuter avec les permissions de la fonction
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

-- ==========================================
-- POLITIQUE RLS POUR LA FONCTION
-- ==========================================
-- Permettre aux gestionnaires de boutique d'exécuter la fonction

GRANT EXECUTE ON FUNCTION tirer_gagnant_tombola(BIGINT) TO authenticated;

-- ==========================================
-- NOTES
-- ==========================================
-- Après avoir exécuté ce script :
-- 1. Les objets peuvent être marqués comme tombola (is_tombola = true)
-- 2. Quand quelqu'un achète un objet tombola, c'est un "ticket"
-- 3. L'admin peut appeler la fonction tirer_gagnant_tombola(objet_id)
-- 4. Un seul achat sera marqué est_gagnant = true
-- 5. Les autres seront marqués est_gagnant = false
-- 6. Tous restent dans la table achats même si l'objet est supprimé
-- 7. Tout le monde reste débité (ils ont payé leur ticket)
