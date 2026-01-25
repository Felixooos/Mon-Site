console.log("📢 LE SCRIPT SE LANCE...");
console.log("1. Chargement des librairies...");
import { createClient } from '@supabase/supabase-js'

// ⚠️ CLÉ SERVICE_ROLE (SECRET) :
const supabaseUrl = 'https://pkzdzbhykshhnipzxpeu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBremR6Ymh5a3NoaG5pcHp4cGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI3MjU1NSwiZXhwIjoyMDg0ODQ4NTU1fQ.aMWH-3wzgtmCRp4FLMPtS_ECrshdUH6HANWflCLz800'

console.log("2. Connexion à Supabase...");
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const utilisateurs = [
  { email: 'arthur.roi@centralelille.fr', code: '84920112', solde: 1500 },
  { email: 'lea.dubois@centralelille.fr', code: '11029384', solde: 200 },
  { email: 'thomas.bg@centralelille.fr', code: '55930211', solde: 0 },
  { email: 'julie.petit@centralelille.fr', code: '77482910', solde: 50 },
  { email: 'lucas.gamer@centralelille.fr', code: '99382019', solde: 100 },
  { email: 'emma.boss@centralelille.fr', code: '33441122', solde: 9999 },
  { email: 'hugo.dormeur@centralelille.fr', code: '66554433', solde: 10 },
  { email: 'chloe.star@centralelille.fr', code: '12341234', solde: 450 },
  { email: 'nathan.pro@centralelille.fr', code: '98765432', solde: 1200 },
  { email: 'zoe.artist@centralelille.fr', code: '56789012', solde: 300 }
]

async function lancerLaMoulinette() {
  console.log("3. Démarrage de la boucle...");

  try {
    // Petit test pour voir si la clé marche
    const { data, error } = await supabase.from('etudiants').select('count').single();
    if (error) {
        console.error("❌ ERREUR CRITIQUE : La connexion échoue. Vérifie ta clé Service Role !");
        console.error(error.message);
        return;
    }
    console.log("✅ Connexion réussie, c'est parti !");

    for (const user of utilisateurs) {
      console.log(`\nTraitement de ${user.email}...`);

      // 1. Création AUTH
      const { error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.code,
        email_confirm: true
      })

      if (authError) console.log(`   -> Auth info : ${authError.message} (Peut-être déjà créé)`)
      else console.log(`   -> ✅ Auth OK`)

      // 2. Création DATA
      const { error: dbError } = await supabase
        .from('etudiants')
        .upsert({ 
          email: user.email, 
          code_perso: user.code, 
          solde: user.solde 
        }, { onConflict: 'email' })

      if (dbError) console.log(`   -> ❌ Table Erreur : ${dbError.message}`)
      else console.log(`   -> ✅ Table OK (${user.solde} points)`)
    }
  } catch (e) {
      console.error("💥 GROS PLANTAGE :", e);
  }

  console.log("\n🏁 Terminé !");
}

lancerLaMoulinette()
