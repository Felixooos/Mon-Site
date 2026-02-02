-- Ajouter le champ pour le système de synchronisation de la boutique
ALTER TABLE objets_boutique ADD COLUMN IF NOT EXISTS admin_deleted BOOLEAN DEFAULT false;

-- Rendre tous les objets existants non supprimés
UPDATE objets_boutique SET admin_deleted = false WHERE admin_deleted IS NULL;
