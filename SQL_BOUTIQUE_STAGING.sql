-- ============================================
-- SYSTÈME DE BROUILLON POUR LA BOUTIQUE
-- ============================================

-- Ajouter une colonne pour gérer la publication
ALTER TABLE objets_boutique 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

-- Par défaut, tous les objets existants sont publiés
UPDATE objets_boutique SET is_published = TRUE WHERE is_published IS NULL;

-- ============================================
-- UTILISATION :
-- ============================================
-- - Quand un admin ajoute/modifie un objet : is_published = FALSE
-- - Les utilisateurs normaux ne voient que is_published = TRUE
-- - Les admins voient tous les objets
-- - Le bouton "Actualiser la boutique" met is_published = TRUE sur tout
