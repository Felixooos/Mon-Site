-- Correction : Ajouter la politique UPDATE manquante pour les challenges
-- Cette politique permet de modifier les challenges (nécessaire pour la synchronisation)

DROP POLICY IF EXISTS "Tout le monde peut modifier des challenges" ON challenges;

CREATE POLICY "Tout le monde peut modifier des challenges"
  ON challenges FOR UPDATE
  USING (true);

-- Vérification : Liste toutes les politiques sur la table challenges
-- SELECT * FROM pg_policies WHERE tablename = 'challenges';
