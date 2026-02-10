-- ==========================================
-- GESTION DE L'ORDRE DES OBJETS
-- ==========================================
-- Permet de définir un ordre d'affichage personnalisé dans la boutique

-- Ajouter la colonne ordre (plus petit = affiché en premier)
ALTER TABLE objets_boutique 
ADD COLUMN IF NOT EXISTS ordre INTEGER DEFAULT NULL;

-- Définir l'ordre actuel basé sur la date de création
-- (les plus anciens ont un numéro plus petit)
UPDATE objets_boutique
SET ordre = (
  SELECT COUNT(*) 
  FROM objets_boutique AS o2 
  WHERE o2.created_at <= objets_boutique.created_at
)
WHERE ordre IS NULL;

-- ==========================================
-- EXEMPLES D'UTILISATION
-- ==========================================
-- 
-- Pour mettre un objet en PREMIER:
-- UPDATE objets_boutique SET ordre = 1 WHERE id = 123;
--
-- Pour mettre un objet en DERNIER:
-- UPDATE objets_boutique SET ordre = 9999 WHERE id = 456;
--
-- Pour échanger deux objets:
-- UPDATE objets_boutique SET ordre = 5 WHERE id = 111;
-- UPDATE objets_boutique SET ordre = 3 WHERE id = 222;
