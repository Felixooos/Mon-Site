-- Ajouter les colonnes pour sauvegarder les infos de l'objet au moment de l'achat
-- Comme ça, même si l'objet est supprimé, l'historique reste intact

ALTER TABLE achats
ADD COLUMN IF NOT EXISTS nom_objet TEXT,
ADD COLUMN IF NOT EXISTS image_objet TEXT;

-- Remplir les données existantes depuis la table objets_boutique
UPDATE achats
SET 
  nom_objet = objets_boutique.nom,
  image_objet = objets_boutique.image_url
FROM objets_boutique
WHERE achats.objet_id = objets_boutique.id
  AND achats.nom_objet IS NULL;
