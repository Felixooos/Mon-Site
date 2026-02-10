# 🎁 Guide Tombola Gratuite

## 📖 Description

La fonctionnalité de **tombola gratuite** permet de créer des objets que les utilisateurs peuvent obtenir **gratuitement** (0 points), mais avec une **limite de 1 par personne**. C'est parfait pour :

- Offrir des goodies gratuits
- Créer des promotions limitées
- Récompenser tous les participants

---

## 🚀 Étape 1 : Configuration de la Base de Données

### Exécuter le script SQL

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Ouvrez votre projet
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**
4. Cliquez sur **"New query"**
5. Copiez-collez le contenu du fichier **`SQL_TOMBOLA_GRATUITE.sql`**
6. Cliquez sur **"Run"** pour exécuter le script

### Ce que le script ajoute :

- ✅ Champ `is_tombola` dans la table `objets_boutique`
- ✅ Champ `is_gratuit` dans la table `objets_boutique`
- ✅ Champ `max_par_personne` dans la table `objets_boutique`
- ✅ Champ `tombola_terminee` dans la table `objets_boutique`
- ✅ Champs pour la gestion du tirage dans la table `achats`

---

## 🎁 Étape 2 : Créer une Tombola Gratuite

### Pour les gestionnaires de boutique en mode édition :

1. **Activez le Mode Édition** 🔓
2. Cliquez sur **"+ Ajouter un Objet"** (bouton flottant rouge en bas à droite)
3. Remplissez les informations :
   - **Nom de l'objet** : Ex: "Sticker Wild Ember"
   - **Taille** : Petit, Moyen ou Gros
   - **Prix** : Laissez à 0 (sera automatiquement mis à 0 si vous cochez "Gratuit")
   - **Quantité** : Mettez un grand nombre (ex: 1000) car sera géré automatiquement
   - **Photo** : Uploadez une image ou collez une URL
4. **✅ Cochez la case "🎰 Mode Tombola"**
5. **✅ Cochez la case "🎁 GRATUIT"** (cette option n'est disponible que si "Mode Tombola" est coché)
6. Cliquez sur **"Ajouter"**

### Résultat :

L'objet apparaît dans la boutique avec :
- Badge **"🎰 TOMBOLA"** orange
- Badge **"🎁 GRATUIT"** bleu
- Prix affiché : **"0 (GRATUIT)"**
- Bouton : **"🎁 Participer GRATUITEMENT"**
- Bordure bleue autour de l'objet

---

## 🎫 Étape 3 : Les Utilisateurs Participent

### Pour les utilisateurs :

1. Allez sur la page **Boutique**
2. Trouvez l'objet avec les badges **"🎰 TOMBOLA"** et **"🎁 GRATUIT"**
3. Cliquez sur **"🎁 Participer GRATUITEMENT"**
4. Confirmez la participation
5. **Aucun point n'est débité** de votre compte

### Limitations :

- ⚠️ **1 participation maximum par personne**
- ⚠️ Si vous essayez de participer une deuxième fois, vous verrez le message :  
  _"Vous avez déjà participé à cette tombola ! Limite : 1 par personne."_

---

## 📊 Différences entre les Types d'Objets

| Critère | Objet Normal | Tombola Gratuite | Tombola Payante |
|---------|--------------|------------------|-----------------|
| **Prix** | Variable | 0 (GRATUIT) | Variable (ex: 50) |
| **Achat** | Une personne achète | Tout le monde peut participer | Plusieurs achètent des tickets |
| **Quantité** | Stock disponible | Nombre de participants | Nombre de participants |
| **Limite** | Aucune (ou personnalisée) | **1 par personne** | Aucune |
| **Badge** | Aucun | 🎰 TOMBOLA + 🎁 GRATUIT | 🎰 TOMBOLA |
| **Bouton** | "Acheter" | "🎁 Participer GRATUITEMENT" | "Acheter un ticket" |
| **Points** | Débités | **Non débités** | Débités |

---

## 🎨 Personnalisation Visuelle

Les objets tombola gratuite se distinguent par :

1. **Bordure bleue** (`#00b8d4`) au lieu de rouge
2. **Deux badges** :
   - Orange : 🎰 TOMBOLA
   - Bleu : 🎁 GRATUIT
3. **Prix affiché** : "0 (GRATUIT)" en bleu
4. **Bouton bleu** avec texte "🎁 Participer GRATUITEMENT"

---

## 🔧 Modifier une Tombola Gratuite

1. **Activez le Mode Édition** 🔓
2. Cliquez sur les **3 petits points (⋮)** en haut à droite de l'objet
3. Cliquez sur **"Modifier"**
4. Modifiez les informations souhaitées
5. Les cases "Mode Tombola" et "GRATUIT" restent cochées
6. Cliquez sur **"Modifier"**

---

## ❓ Questions Fréquentes

### Q : Puis-je créer un objet gratuit qui n'est PAS une tombola ?

**Non**, actuellement l'option "GRATUIT" n'est disponible que si "Mode Tombola" est coché.  
Si vous voulez un objet gratuit normal, mettez le prix à 0 (mais les gens pourront en acheter plusieurs).

### Q : Que se passe-t-il si quelqu'un essaie de participer deux fois ?

Il verra le message d'erreur : _"Vous avez déjà participé à cette tombola ! Limite : 1 par personne."_

### Q : Les participants sont-ils débités de points ?

**Non**, si c'est une tombola gratuite, aucun point n'est débité.

### Q : Comment voir qui a participé ?

Dans Supabase :
1. Allez dans **"Table Editor"**
2. Ouvrez la table **`achats`**
3. Filtrez par `objet_id` pour voir tous les participants
4. Vous verrez les emails de tous les participants et `prix_paye = 0`

### Q : Puis-je changer la limite de 1 par personne ?

Actuellement, non. La limite est automatiquement fixée à 1 pour les objets gratuits.  
Si vous voulez modifier cela, il faut modifier le code dans `main.js` :

```javascript
max_par_personne: isGratuit ? 1 : null // Changez le 1 par le nombre souhaité
```

---

## 🎯 Cas d'Usage

### Exemple 1 : Goodies Gratuits

**Situation** : Vous voulez offrir 100 stickers gratuits, 1 par personne.

**Configuration** :
- Nom : "Sticker Wild Ember"
- Prix : 0
- Quantité : 1000
- ✅ Mode Tombola
- ✅ GRATUIT

**Résultat** : Chaque personne peut obtenir 1 sticker gratuitement.

---

### Exemple 2 : Promotion Flash

**Situation** : Premier arrivé, premier servi pour un objet gratuit limité.

**Configuration** :
- Nom : "T-shirt Édition Limitée"
- Prix : 0
- Quantité : 1000
- ✅ Mode Tombola
- ✅ GRATUIT

**Résultat** : Tout le monde peut participer gratuitement, 1 fois seulement.

---

## 🛠️ Support Technique

Si vous rencontrez des problèmes :

1. Vérifiez que le script SQL a bien été exécuté
2. Vérifiez que les deux cases sont bien cochées ("Mode Tombola" + "GRATUIT")
3. Vérifiez que le prix est bien à 0
4. Rechargez la page (F5)

---

## 📝 Résumé Rapide

Pour créer une tombola gratuite :

1. ✅ Exécuter `SQL_TOMBOLA_GRATUITE.sql` dans Supabase
2. ✅ Ajouter un objet en mode édition
3. ✅ Cocher "🎰 Mode Tombola"
4. ✅ Cocher "🎁 GRATUIT"
5. ✅ Ajouter l'objet
6. ✅ Les utilisateurs peuvent participer **1 fois**, **gratuitement** !

---

**Astuce** : Pour une tombola payante classique (avec tirage au sort), cochez seulement "🎰 Mode Tombola" sans cocher "🎁 GRATUIT".
