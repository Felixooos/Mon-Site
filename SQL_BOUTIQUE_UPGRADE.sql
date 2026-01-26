-- ============================================
-- MISE À JOUR BOUTIQUE : Système de tailles
-- ============================================

-- 1. Ajouter la colonne "taille" à la table objets_boutique
ALTER TABLE objets_boutique 
ADD COLUMN IF NOT EXISTS taille TEXT DEFAULT 'petit';

-- 2. Mettre à jour les objets existants selon leur type
-- (Convertir les anciens "principal" en "gros" et "petit" en "petit")
UPDATE objets_boutique
SET taille = CASE
  WHEN type = 'principal' THEN 'gros'
  WHEN type = 'petit' THEN 'petit'
  ELSE 'petit'
END;

-- 3. On peut garder la colonne "type" pour compatibilité ou la supprimer
-- Si tu veux la supprimer plus tard :
-- ALTER TABLE objets_boutique DROP COLUMN type;

-- TERMINÉ ! 🎉
-- Maintenant tu peux créer des objets en choisissant :
-- - 'petit' : occupe 1/3 de la largeur
-- - 'moyen' : occupe 2/3 de la largeur
-- - 'gros' : occupe toute la largeur
