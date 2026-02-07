# 🔒 CORRECTION DE SÉCURITÉ IMPORTANTE - MISE À JOUR COMPLÈTE

## ⚠️ Failles de sécurité identifiées

Vos amis ont pu devenir admin car **TOUTES vos tables n'avaient AUCUNE protection** contre les modifications directes en base de données.

### Problèmes identifiés

**1. Table `etudiants` non protégée**
N'importe qui pouvait se donner les droits admin :
```javascript
await supabase.from('etudiants')
  .update({ is_admin: true })
  .eq('email', 'leur-email@centralelille.fr')
```

**2. Tables sensibles exposées (marquées UNRESTRICTED)**
- `achats` - Création de faux achats et validation sans paiement
- `nfc_tags` - Création de faux tags NFC pour obtenir des points gratuits
- `objets_boutique` - Modification des prix/stocks à volonté
- `transactions` - Création de fausses transactions pour se donner des points
- `challenges` - Création/suppression arbitraire de défis
- `challenge_validations` - Auto-validation de défis pour gagner des points

## ✅ Solution appliquée - Sécurisation COMPLÈTE

### Tables maintenant protégées

Le fichier **`SQL_SECURITY_FIX.sql`** a été **complété** pour sécuriser TOUTES les tables :

#### 1️⃣ **Table `etudiants`**
- ✅ Row Level Security (RLS) activé
- ✅ Tout le monde peut voir les profils (classement)
- ✅ Les utilisateurs peuvent modifier leur propre profil
- ❌ **BLOQUÉ** : Modification de `is_admin` et `is_boutique_manager`
- ❌ **BLOQUÉ** : Suppression de comptes

#### 2️⃣ **Table `transactions`**
- ✅ RLS activé
- ✅ Tout le monde peut voir l'historique
- ✅ Seuls les vrais admins peuvent créer des transactions (cadeaux de points)
- ✅ Les transactions système (NFC, achats) nécessitent service_role
- ❌ **BLOQUÉ** : Modification de transactions existantes
- ❌ **BLOQUÉ** : Suppression (sauf pour les admins)
- ❌ **BLOQUÉ** : Création de fausses transactions par des non-admins

#### 3️⃣ **Table `achats`**
- ✅ RLS activé
- ✅ Tout le monde peut voir les achats
- ✅ Seuls les gestionnaires boutique peuvent créer/modifier/supprimer
- ❌ **BLOQUÉ** : Utilisateurs normaux ne peuvent plus créer de faux achats

#### 4️⃣ **Table `nfc_tags`**
- ✅ RLS activé
- ✅ Tout le monde peut voir les tags
- ✅ Seuls les admins peuvent créer/modifier/supprimer
- ❌ **BLOQUÉ** : Création de faux tags NFC

#### 5️⃣ **Table `objets_boutique`**
- ✅ RLS activé
- ✅ Tout le monde peut voir les objets
- ✅ Seuls les gestionnaires boutique peuvent créer/modifier/supprimer
- ❌ **BLOQUÉ** : Modification des prix ou stocks par des utilisateurs normaux

#### 6️⃣ **Table `challenges`**
- ✅ RLS activé
- ✅ Tout le monde peut voir les challenges
- ✅ Seuls les admins peuvent créer/modifier/supprimer
- ❌ **BLOQUÉ** : Création de faux défis

#### 7️⃣ **Table `challenge_validations`**
- ✅ RLS activé
- ✅ Tout le monde peut voir les validations
- ✅ Seuls les admins peuvent valider des challenges
- ❌ **BLOQUÉ** : Auto-validation de défis
- ❌ **BLOQUÉ** : Modification de validations existantes

## 📋 Instructions pour appliquer le correctif

### ⚠️ IMPORTANT : À faire IMMÉDIATEMENT

### Étape 1 : Retirer les droits admin aux utilisateurs non autorisés

**AVANT** d'exécuter le script SQL, retirez les droits aux utilisateurs non autorisés :

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Ouvrez votre projet
3. Dans le menu de gauche, cliquez sur **"Table Editor"**
4. Sélectionnez la table **`etudiants`**
5. Pour chaque utilisateur qui s'est donné les droits admin de façon illégitime :
   - Cliquez sur la ligne
   - Changez `is_admin` à `false`
   - Changez `is_boutique_manager` à `false` (si nécessaire)
   - Enregistrez

### Étape 2 : Exécuter le script SQL de sécurité

1. Dans Supabase, allez dans **"SQL Editor"** (menu de gauche)
2. Cliquez sur **"New query"**
3. Copiez-collez **tout le contenu** du fichier **`SQL_SECURITY_FIX.sql`**
4. Cliquez sur **"Run"** pour exécuter le script
5. Attendez la confirmation (peut prendre 5-10 secondes)

### Étape 3 : Vérifier que ça fonctionne

Après avoir exécuté le script, testez la sécurité :

**Test 1 : Bloquer la modification is_admin**
1. Connectez-vous avec un compte non-admin
2. Ouvrez la console du navigateur (F12)
3. Essayez :
   ```javascript
   await supabase.from('etudiants')
     .update({ is_admin: true })
     .eq('email', 'votre.email@centralelille.fr')
   ```
4. ✅ Vous devriez obtenir une **erreur de permission**

**Test 2 : Bloquer la validation de défis**
1. En tant qu'utilisateur normal, essayez :
   ```javascript
   await supabase.from('challenge_validations').insert({
     challenge_id: 1,
     user_id: 1,
     user_email: 'votre.email@centralelille.fr'
   })
   ```
2. ✅ Vous devriez obtenir une **erreur de permission**

**Test 3 : Bloquer la création de fausses transactions**
1. En tant qu'utilisateur normal, essayez :
   ```javascript
   await supabase.from('transactions').insert({
     destinataire_email: 'votre.email@centralelille.fr',
     montant: 10000,
     raison: 'Cadeau',
     admin_email: 'faux.admin@centralelille.fr'
   })
   ```
2. ✅ Vous devriez obtenir une **erreur de permission**

## 🔐 Comment gérer les admins maintenant ?

### Pour ajouter un admin légitime :

**Option 1 : Via la console Supabase (RECOMMANDÉ)**
1. Allez dans **"Table Editor"** > table `etudiants`
2. Trouvez l'utilisateur
3. Changez `is_admin` à `true`
4. Enregistrez

**Option 2 : Via le script admin_creation.js (en local uniquement)**
1. Modifiez le fichier `admin_creation.js` pour ajouter l'email de l'admin
2. Exécutez le script **en local UNIQUEMENT** :
   ```bash
   node admin_creation.js
   ```
3. ⚠️ Ne JAMAIS déployer ce fichier sur le web

## 🛡️ Résumé de la sécurité

### Ce qui est maintenant PROTÉGÉ

| Table | Lecture | Création | Modification | Suppression |
|-------|---------|----------|--------------|-------------|
| `etudiants` | 🌍 Tous | 👤 Soi-même (sans privilèges admin) | 👤 Soi-même (sans privilèges admin) | ❌ Personne |
| `transactions` | 🌍 Tous | � Admins uniquement | ❌ Personne | 👑 Admins |
| `achats` | 🌍 Tous | 🛒 Gestionnaires | 🛒 Gestionnaires | 🛒 Gestionnaires |
| `nfc_tags` | 🌍 Tous | 👑 Admins | 👑 Admins | 👑 Admins |
| `objets_boutique` | 🌍 Tous | 🛒 Gestionnaires | 🛒 Gestionnaires | 🛒 Gestionnaires |
| `challenges` | 🌍 Tous | 👑 Admins | 👑 Admins | 👑 Admins |
| `challenge_validations` | 🌍 Tous | 👑 Admins | ❌ Personne | 👑 Admins |

Légende :
- 🌍 Tous = Tous les utilisateurs
- 👤 Soi-même = Uniquement pour ses propres données
- 👑 Admins = Uniquement les admins vérifiés
- 🛒 Gestionnaires = Uniquement les gestionnaires boutique
- ❌ Personne = Bloqué pour tous (seulement via service_role ou console)

## ℹ️ Actions à surveiller

Après avoir appliqué le correctif, surveillez votre base de données :

1. **Vérifiez régulièrement les admins** : Allez dans la table `etudiants` et vérifiez que seules les personnes autorisées ont `is_admin = true`

2. **Consultez les logs Supabase** : Dans votre dashboard Supabase, allez dans "Logs" pour voir les tentatives d'accès bloquées

3. **Ne partagez JAMAIS** votre clé `service_role` qui se trouve dans `admin_creation.js`

## 🚨 En cas de problème

Si après avoir appliqué le correctif :
- Les utilisateurs légitimes ne peuvent plus faire certaines actions
- Les admins ne peuvent plus gérer la boutique
- Il y a des erreurs dans la console

Contactez-moi avec les détails de l'erreur pour ajuster les politiques.

- Que seuls les nouveaux comptes peuvent être créés avec is_admin = false

Ces règles sont appliquées **côté serveur** et ne peuvent PAS être contournées par le code JavaScript côté client.

---

Si vous avez des questions, n'hésitez pas ! 🚀
