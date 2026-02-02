# Instructions pour activer les Challenges

## 1. Créer/Mettre à jour les tables dans Supabase

### Si c'est la première fois :
1. Ouvre ton dashboard Supabase
2. Va dans l'onglet "SQL Editor"
3. Copie tout le contenu du fichier `SQL_CHALLENGES.sql`
4. Colle-le dans l'éditeur SQL
5. Clique sur "Run" pour exécuter le script

### Si les tables existent déjà (avec l'ancien système facile/moyen/difficile) :
1. Ouvre ton dashboard Supabase
2. Va dans l'onglet "SQL Editor"
3. Copie tout le contenu du fichier `SQL_CHALLENGES_UPDATE.sql`
4. Colle-le dans l'éditeur SQL
5. Clique sur "Run" pour exécuter le script (⚠️ cela supprimera tous les challenges existants)

## 2. Fonctionnalités implémentées

### Pour tous les utilisateurs :
- ✅ Voir les challenges du jour dans 3 niveaux de points (50, 150, 300 points)
- ✅ Voir combien de personnes ont réussi chaque défi
- ✅ Voir leurs propres challenges validés marqués comme "✅ Complété"
- ✅ Les points gagnés apparaissent dans "Mes Gains" dans l'onglet "Moi"

### Pour les admins :
- ✅ Ajouter de nouveaux challenges (bouton "➕ Ajouter un Challenge")
- ✅ Choisir automatiquement les points selon le niveau (50, 150 ou 300 points)
- ✅ Valider un challenge pour un utilisateur spécifique
- ✅ Chercher un utilisateur par nom pour valider son challenge
- ✅ Supprimer des challenges
- ✅ Les points sont automatiquement ajoutés au solde de l'utilisateur
- ✅ Une transaction est enregistrée dans "Mes Gains"

## 3. Comment utiliser

### Ajouter un challenge (Admin) :
1. Va dans l'onglet "Challenge" du menu
2. Sélectionne le niveau de points souhaité (50, 150 ou 300)
3. Clique sur "➕ Ajouter un Challenge"
4. Remplis le formulaire :
   - **Niveau** : Choisis entre 💰 50 Points, 💰💰 150 Points, ou 💰💰💰 300 Points
   - **Titre** : ex "Boire 2L d'eau"
   - **Description** : ex "Bois 2 litres d'eau dans la journée"
   - ⚠️ Les points sont **automatiquement** définis selon le niveau choisi !
5. Clique sur "Ajouter"

### Valider un challenge pour un utilisateur (Admin) :
1. Va dans l'onglet "Challenge"
2. Trouve le challenge à valider
3. Clique sur "✓ Valider pour un utilisateur"
4. Tape le nom de l'utilisateur dans la barre de recherche
5. Sélectionne l'utilisateur
6. Clique sur "Valider"
7. L'utilisateur recevra automatiquement les points !

### Pour un utilisateur normal :
1. Va dans "Challenge"
2. Parcours les défis dans les 3 niveaux de points
3. Quand un admin te valide un défi, tu verras :
   - Le défi marqué comme "✅ Complété"
   - Les points ajoutés à ton solde
   - La transaction dans "Mes Gains" (onglet Moi)

## 4. Structure des tables

### Table `challenges`
- `id` : Identifiant unique
- `difficulte` : '50' | '150' | '300' (représente les points)
- `titre` : Titre du challenge
- `description` : Description détaillée
- `points` : 50 | 150 | 300 (déduit automatiquement de la difficulté)
- `created_at` : Date de création

### Table `challenge_validations`
- `id` : Identifiant unique
- `challenge_id` : Référence au challenge
- `user_id` : ID de l'utilisateur
- `user_email` : Email de l'utilisateur
- `validated_by_admin` : Email de l'admin qui a validé
- `validated_at` : Date de validation

## 5. Exemples de challenges

### 50 Points (💰) :
- Boire 2L d'eau dans la journée
- Faire 50 pompes
- Marcher 10 000 pas
- Lire 30 pages d'un livre

### 150 Points (💰💰) :
- Faire 100 pompes
- Courir 5km
- Méditer 30 minutes
- Ne pas utiliser son téléphone pendant 3h

### 300 Points (💰💰💰) :
- Courir 10km
- Faire 500 pompes dans la journée
- Jeûner 24h
- Ne pas utiliser les réseaux sociaux pendant 24h

## 6. Notes importantes

- Les challenges peuvent être complétés par plusieurs personnes
- Un utilisateur ne peut valider un challenge qu'une seule fois
- Les admins peuvent supprimer des challenges avec le bouton 🗑️
- Les challenges supprimés suppriment aussi toutes leurs validations
- Les points sont ajoutés instantanément au solde de l'utilisateur
- **Les points sont automatiquement déterminés par le niveau choisi** (50, 150 ou 300)
