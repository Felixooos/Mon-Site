# 🔒 CORRECTION DE SÉCURITÉ IMPORTANTE

## ⚠️ Failles de sécurité identifiées

Vos amis ont pu devenir admin car **la table `etudiants` n'avait AUCUNE protection** contre les modifications directes en base de données.

### Problème principal
N'importe quel utilisateur authentifié pouvait exécuter cette commande dans la console du navigateur :
```javascript
await supabase.from('etudiants')
  .update({ is_admin: true })
  .eq('email', 'leur-email@centralelille.fr')
```

## ✅ Solution appliquée

### 1. Sécurisation de la base de données

J'ai créé le fichier **`SQL_SECURITY_FIX.sql`** qui :

- **Active le Row Level Security** sur la table `etudiants`
- **Empêche toute modification** des champs `is_admin` et `is_boutique_manager` via l'API publique
- Permet aux utilisateurs de voir tous les profils (pour le classement)
- Permet aux utilisateurs de modifier leur propre profil (nom, solde) SAUF les privilèges
- Bloque complètement les suppressions d'étudiants

### 2. Protection du fichier sensible

J'ai ajouté **`admin_creation.js`** au `.gitignore` pour éviter que la clé `service_role` ne soit exposée publiquement sur GitHub.

> ⚠️ **CRITIQUE** : Le fichier `admin_creation.js` contient une clé `service_role` qui donne tous les droits sur votre base Supabase. Il ne doit JAMAIS être accessible depuis le web ou versionné sur GitHub.

## 📋 Instructions pour appliquer le correctif

### Étape 1 : Exécuter le script SQL dans Supabase

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Ouvrez votre projet : `pkzdzbhykshhnipzxpeu`
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**
4. Cliquez sur **"New query"**
5. Copiez-collez le contenu du fichier **`SQL_SECURITY_FIX.sql`**
6. Cliquez sur **"Run"** pour exécuter le script

### Étape 2 : Vérifier que ça fonctionne

Après avoir exécuté le script, testez :

1. Connectez-vous avec un compte non-admin
2. Ouvrez la console du navigateur (F12)
3. Essayez d'exécuter :
   ```javascript
   await supabase.from('etudiants')
     .update({ is_admin: true })
     .eq('email', 'votre.email@centralelille.fr')
   ```
4. Vous devriez obtenir une **erreur de permission** 🎉

### Étape 3 : Retirer les droits admin aux utilisateurs non autorisés

1. Dans Supabase, allez dans **"Table Editor"**
2. Sélectionnez la table **`etudiants`**
3. Pour chaque utilisateur qui s'est donné les droits admin de façon illégitime :
   - Cliquez sur la ligne
   - Changez `is_admin` à `false`
   - Enregistrez

## 🔐 Comment gérer les admins maintenant ?

### Pour ajouter un admin légitime :

**Option 1 : Via la console Supabase**
1. Allez dans "Table Editor" > table `etudiants`
2. Trouvez l'utilisateur
3. Changez `is_admin` à `true`

**Option 2 : Via le script admin_creation.js (en local uniquement)**
1. Modifiez le fichier `admin_creation.js` pour ajouter l'email de l'admin
2. Exécutez le script **en local** :
   ```bash
   node admin_creation.js
   ```
3. ⚠️ Ne JAMAIS déployer ce fichier sur le web

## 🛡️ Sécurité renforcée

Les utilisateurs peuvent maintenant :
- ✅ Voir le classement et les profils
- ✅ Modifier leur propre nom, photo, etc.
- ✅ Faire des transactions
- ❌ **NE PEUVENT PLUS** se donner les droits admin
- ❌ **NE PEUVENT PLUS** se donner les droits gestionnaire boutique
- ❌ **NE PEUVENT PLUS** supprimer des comptes

Seuls vous (via la console Supabase ou le script avec service_role en local) pouvez gérer les privilèges.

## ℹ️ Informations techniques

Le correctif utilise les **Row Level Security Policies** de PostgreSQL/Supabase qui vérifient :
- L'identité de l'utilisateur via `auth.jwt() ->> 'email'`
- Que les champs sensibles ne sont pas modifiés lors d'une mise à jour
- Que seuls les nouveaux comptes peuvent être créés avec is_admin = false

Ces règles sont appliquées **côté serveur** et ne peuvent PAS être contournées par le code JavaScript côté client.

---

Si vous avez des questions, n'hésitez pas ! 🚀
