# 🎰 Fonctionnalité Tombola - Guide d'utilisation

## 📖 Description

La fonctionnalité tombola permet de mettre en vente des objets pour lesquels **plusieurs personnes peuvent acheter des tickets** et **un seul gagnant sera tiré au sort**.

### Différences entre Objet Normal et Tombola

| Critère | Objet Normal | Tombola |
|---------|-------------|---------|
| **Achat** | Une personne achète, quantité diminue | Plusieurs personnes achètent des tickets, quantité augmente |
| **Quantité** | Stock disponible | Nombre de participants |
| **Badge** | Aucun | Badge "🎰 TOMBOLA" |
| **Bouton** | "Acheter" | "Acheter un ticket" |
| **Résultat** | Objet reçu immédiatement | Un seul gagnant après tirage |
| **Historique** | Achat normal | Badge "🏆 GAGNANT" ou "🎰 Non gagnant" |

---

## 🚀 Étape 1 : Configuration de la Base de Données

### Exécuter le script SQL

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Ouvrez votre projet
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**
4. Cliquez sur **"New query"**
5. Copiez-collez le contenu du fichier **`SQL_TOMBOLA_FEATURE.sql`**
6. Cliquez sur **"Run"** pour exécuter le script

### Ce que le script ajoute :

- ✅ Champ `is_tombola` dans la table `objets_boutique`
- ✅ Champ `tombola_terminee` dans la table `objets_boutique`
- ✅ Champ `est_gagnant` dans la table `achats`
- ✅ Champ `date_tirage` dans la table `achats`
- ✅ Fonction SQL `tirer_gagnant_tombola()` pour le tirage au sort

---

## 📝 Étape 2 : Créer une Tombola

### Pour les gestionnaires de boutique en mode édition :

1. **Activez le Mode Édition** 🔓
2. Cliquez sur **"+ Ajouter un Objet"**
3. Remplissez les informations :
   - Nom de l'objet
   - Prix du ticket (en points)
   - Quantité initiale : **0** (sera incrémenté à chaque achat de ticket)
   - Photo de l'objet
4. **✅ Cochez la case "🎰 Mode Tombola"**
5. Cliquez sur **"Ajouter"**
6. Cliquez sur **"📢 Actualiser"** pour publier la tombola

### Résultat :
- L'objet apparaît avec un badge **"🎰 TOMBOLA"** orange
- Le bouton affiche **"Acheter un ticket"** au lieu de "Acheter"
- La quantité affiche **"Participants : X"** au lieu de "Quantité : X"

---

## 🎫 Étape 3 : Les Utilisateurs Achètent des Tickets

### Pour les utilisateurs :

1. Allez sur la page **Boutique**
2. Trouvez l'objet avec le badge **"🎰 TOMBOLA"**
3. Cliquez sur **"Acheter un ticket"**
4. Confirmez l'achat (le prix est celui du ticket)
5. Les points sont débités de votre compte

### Ce qui se passe :
- ✅ Le nombre de participants augmente de 1
- ✅ L'achat est enregistré dans "Mes Achats" avec le statut "en attente"
- ⚠️ **Vous restez débité(e) même si vous ne gagnez pas** (vous avez payé votre ticket)

---

## 🎲 Étape 4 : Tirer le Gagnant

### Pour les gestionnaires de boutique en mode édition :

1. **Activez le Mode Édition** 🔓
2. Cliquez sur les **3 petits points (⋮)** en haut à droite de l'objet tombola
3. Cliquez sur **"🎰 Tirer le Gagnant"**
4. Confirmez le tirage au sort
5. Une fenêtre s'affiche avec :
   - 🏆 L'email du gagnant
   - Le nombre total de participants

### Ce qui se passe automatiquement :
- ✅ Un gagnant est sélectionné **au hasard** parmi tous les participants
- ✅ L'achat du gagnant est marqué `est_gagnant = true`
- ✅ Les achats des perdants sont marqués `est_gagnant = false`
- ✅ La tombola est marquée comme **terminée**
- ✅ Le badge change pour **"🏆 TERMINÉE"** (vert)
- ✅ Le bouton devient **"Tombola terminée"** (désactivé)

---

## 📊 Étape 5 : Vérifier les Résultats

### Pour tous les participants :

1. Allez dans **Moi** > **Mes Achats**
2. Trouvez votre achat de ticket
3. Vous verrez un badge :
   - **🏆 GAGNANT** (vert) → Vous avez gagné ! 🎉
   - **🎰 Non gagnant** (gris) → Vous n'avez pas gagné, mais votre ticket reste débité

### Affichage dans "Mes Achats" :

**Si vous avez gagné :**
- Badge : **🏆 GAGNANT** (vert)
- Bordure : Verte
- Événement : "Tombola (GAGNANT !)"
- Icône : 🏆

**Si vous n'avez pas gagné :**
- Badge : **🎰 Non gagnant** (gris)
- Bordure : Grise
- Événement : "Tombola (non gagnant)"
- Icône : 🎰
- ⚠️ Vos points restent débités (prix du ticket)

---

## 🗑️ Suppression d'un Objet Tombola

### Important :
- ✅ Les achats **restent dans l'historique** même si vous supprimez l'objet
- ✅ Tous les participants conservent la trace de leur achat
- ✅ Le gagnant/perdants peuvent toujours voir leur résultat

---

## 🔐 Sécurité

### Qui peut créer une tombola ?
- ✅ Gestionnaires de boutique (`is_boutique_manager = true`)
- ✅ En mode édition uniquement

### Qui peut tirer le gagnant ?
- ✅ Gestionnaires de boutique (`is_boutique_manager = true`)
- ✅ En mode édition uniquement

### Le tirage est-il vraiment aléatoire ?
- ✅ Oui, la fonction SQL utilise `ORDER BY RANDOM()`
- ✅ Le tirage est effectué côté serveur PostgreSQL
- ✅ Impossible de tricher

### Les perdants sont-ils remboursés ?
- ❌ Non, ils ont acheté un **ticket** et restent débités
- ✅ C'est normal et voulu : c'est le principe d'une tombola

---

## 📈 Cas d'Usage

### Exemple 1 : T-shirt Wild Ember (objet rare)
- **Prix du ticket** : 50 points
- **Participants** : 20 personnes
- **Résultat** : 1 gagnant reçoit le T-shirt, 19 perdants ont payé 50 points chacun

### Exemple 2 : Album collector dédicacé
- **Prix du ticket** : 200 points
- **Participants** : 5 personnes
- **Résultat** : 1 gagnant reçoit l'album, 4 perdants ont payé 200 points chacun

---

## ❓ FAQ

**Q : Peut-on acheter plusieurs tickets pour le même objet ?**
R : Oui ! Achetez autant de tickets que vous voulez = plus de chances de gagner.

**Q : Peut-on annuler un tirage au sort ?**
R : Non, le tirage est définitif et irréversible.

**Q : Les perdants peuvent-ils se faire rembourser ?**
R : Non, c'est le principe d'une tombola. Ils ont tenté leur chance.

**Q : Que se passe-t-il si personne n'achète de ticket ?**
R : La fonction retourne une erreur "Aucun participant pour cette tombola".

**Q : Peut-on modifier une tombola après sa création ?**
R : Oui, tant qu'elle n'est pas terminée. Mais attention à ne pas changer le prix après que des gens aient acheté.

**Q : Les données sont-elles conservées après suppression de l'objet ?**
R : Oui, tous les achats restent dans la base de données avec les informations sauvegardées (nom, prix, image).

---

## 🛠️ Architecture Technique

### Tables modifiées :

**objets_boutique**
```sql
+ is_tombola BOOLEAN DEFAULT FALSE
+ tombola_terminee BOOLEAN DEFAULT FALSE
```

**achats**
```sql
+ est_gagnant BOOLEAN DEFAULT NULL
+ date_tirage TIMESTAMP DEFAULT NULL
```

### Fonction SQL créée :

```sql
tirer_gagnant_tombola(objet_id_param BIGINT)
RETURNS TABLE (gagnant_email VARCHAR, nombre_participants BIGINT)
```

### Workflow complet :

1. Gestionnaire crée objet avec `is_tombola = true`
2. Utilisateurs achètent → `quantite++` dans `objets_boutique`
3. Gestionnaire clique "Tirer le gagnant" → appelle `tirer_gagnant_tombola()`
4. Fonction SQL :
   - Sélectionne 1 achat au hasard (`ORDER BY RANDOM()`)
   - Marque `est_gagnant = true` pour le gagnant
   - Marque `est_gagnant = false` pour les perdants
   - Met `tombola_terminee = true` sur l'objet
5. Frontend affiche les résultats avec badges

---

Terminé ! 🎉 Votre système de tombola est maintenant opérationnel.
