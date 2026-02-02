-- Ajouter les champs pour le système de synchronisation
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS admin_deleted BOOLEAN DEFAULT false;

-- Publier tous les challenges existants et les rendre non supprimés
UPDATE challenges SET published = true, admin_deleted = false WHERE published IS NULL OR admin_deleted IS NULL;
