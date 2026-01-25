import './style.css'
import { supabase } from './supabaseClient'

// ==================== GESTION DES ONGLETS DU MENU ====================
const formInscription = document.querySelector('#form-inscription')
const formConnexion = document.querySelector('#form-connexion')
const tabNouveau = document.querySelector('#tab-nouveau')
const tabConnu = document.querySelector('#tab-connu')

tabNouveau.addEventListener('click', () => {
  formInscription.style.display = 'block'
  formConnexion.style.display = 'none'
  tabNouveau.style.background = '#ddd'
  tabConnu.style.background = 'white'
})

tabConnu.addEventListener('click', () => {
  formInscription.style.display = 'none'
  formConnexion.style.display = 'block'
  tabNouveau.style.background = 'white'
  tabConnu.style.background = '#ddd'
})

// ==================== LOGIQUE SUPABASE ====================

const homeScreen = document.querySelector('#home-screen')
const loginScreen = document.querySelector('#login-screen')
const otpScreen = document.querySelector('#otp-screen')
const welcomeScreen = document.querySelector('#welcome-screen')
const leaderboard = document.querySelector('#leaderboard')
const searchUsers = document.querySelector('#search-users')
const userName = document.querySelector('#user-name')
const userSolde = document.querySelector('#user-solde')
const userRank = document.querySelector('#user-rank')
const btnAddPoints = document.querySelector('#btn-add-points')

let currentUserEmail = ''
let allUsers = []
let jeSuisAdmin = false
let emailAdmin = ''

function setEcran(nom) {
  homeScreen.classList.add('hidden')
  loginScreen.classList.add('hidden')
  otpScreen.classList.add('hidden')
  welcomeScreen.classList.add('hidden')
  
  if (nom === 'home') homeScreen.classList.remove('hidden')
  if (nom === 'login') loginScreen.classList.remove('hidden')
  if (nom === 'otp') otpScreen.classList.remove('hidden')
  if (nom === 'welcome') welcomeScreen.classList.remove('hidden')
}

// ==================== 1. INSCRIPTION (Envoi du mail OTP) ====================
document.querySelector('#btn-send-otp').addEventListener('click', async () => {
  const email = document.querySelector('#email-inscription').value.trim().toLowerCase()
  
  if (!email) {
    alert('Entre ton email !')
    return
  }

  // Vérifier que l'email est d'une école autorisée
  const domainesAutorises = ['centralelille.fr', 'iteem.centralelille.fr', 'enscl.centralelille.fr']
  const domainEmail = email.split('@')[1]
  
  if (!domainEmail || !domainesAutorises.includes(domainEmail)) {
    alert('⚠️ Adresse mail etudiante non conforme.\n\nTu dois utiliser:\n• centralelille.fr\n• iteem.centralelille.fr\n• enscl.centralelille.fr')
    return
  }

  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) alert("Erreur: " + error.message)
  else {
    alert('Code envoyé ! Vérifie tes mails.')
    setEcran('otp')
    localStorage.setItem('emailTemp', email)
  }
})

// ==================== 2. VALIDATION DU CODE REÇU PAR MAIL (Création du compte) ====================
document.querySelector('#btn-verify').addEventListener('click', async () => {
  const email = localStorage.getItem('emailTemp')
  const token = document.querySelector('#otp').value.trim()
  
  if (!email) {
    alert('Email manquant !')
    return
  }

  if (!token || token.length !== 8) {
    alert('Le code doit contenir exactement 8 chiffres !')
    return
  }

  const { error, data } = await supabase.auth.verifyOtp({ email, token, type: 'email'})
  
  if (error) {
    console.error("Erreur OTP:", error)
    alert("Code faux !")
    return
  }

  console.log("OTP vérifié, session créée:", data)
  
  setTimeout(() => {
    checkSession()
  }, 500)
})

// ==================== 3. CONNEXION DIRECTE (Code uniquement) 🚀 ====================
document.querySelector('#btn-login-code').addEventListener('click', async () => {
  const code = document.querySelector('#code-connexion').value.trim()

  if (!code || code.length < 6) {
    alert('Rentre ton code !')
    return
  }

  const { data: student } = await supabase
    .from('etudiants')
    .select('email, code_perso')
    .eq('code_perso', code)
    .single()

  if (!student) {
    alert("Code incorrect !")
    return
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: student.email,
    password: code
  })

  if (error) alert("Erreur de connexion: " + error.message)
  else checkSession()
})

// ==================== 4. VERIFICATION SESSION & CREATION PROFIL ====================
async function checkSession() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  console.log("Session check:", { session, sessionError })
  
  if (session) {
    console.log("Session trouvée pour:", session.user.email)
    await gererEtudiant(session.user.email)
    setEcran('welcome')
  } else {
    console.log("Pas de session trouvée")
    setEcran('home')
  }
}

// ==================== 5. GESTION BASE DE DONNEES + MOT DE PASSE MAGIQUE ====================
async function gererEtudiant(emailUser) {
  console.log("gererEtudiant appelé pour:", emailUser)
  
  let { data: etudiant, error: searchError } = await supabase
    .from('etudiants')
    .select('*')
    .eq('email', emailUser)
    .single()

  console.log("Recherche étudiant:", { etudiant, searchError })

  // SI C'EST UN NOUVEAU (Première fois qu'il met son code mail)
  if (!etudiant && searchError?.code === 'PGRST116') {
    console.log("Création du compte...")
    
    let codeOtp = document.querySelector('#otp').value
    
    if (!codeOtp) {
      codeOtp = Math.floor(100000 + Math.random() * 900000).toString()
      console.warn("Code OTP vide, génération d'un code de secours:", codeOtp)
    }

    console.log("Code OTP utilisé:", codeOtp)

    const { error: errorUpdate } = await supabase.auth.updateUser({ password: codeOtp })
    
    if (errorUpdate) {
      console.error("Erreur mot de passe:", errorUpdate)
      alert("Erreur lors de la création du compte: " + errorUpdate.message)
      return
    }

    console.log("Mot de passe défini avec succès")

    const { data: nouveau, error: insertError } = await supabase
      .from('etudiants')
      .insert([{ email: emailUser, code_perso: codeOtp, solde: 0 }])
      .select()
      .single()

    if (insertError) {
      console.error("Erreur insertion étudiant:", insertError)
      alert("Erreur lors de l'enregistrement")
      return
    }
      
    etudiant = nouveau
    console.log("Étudiant créé:", etudiant)
    alert(`✅ Compte créé ! Ton code de connexion est : ${codeOtp}\n\nNote-le bien, il te servira de mot de passe !`)
  }

  if (etudiant) {
    console.log("Affichage du profil, solde:", etudiant.solde)
    jeSuisAdmin = etudiant.is_admin || false
    jeSuisBoutiqueManager = etudiant.is_boutique_manager || false
    emailAdmin = etudiant.email
    if (jeSuisAdmin) console.log("👑 MODE ADMIN ACTIVÉ")
    if (jeSuisBoutiqueManager) {
      console.log("🛍️ MODE GESTIONNAIRE BOUTIQUE ACTIVÉ")
      // Afficher le sous-onglet de gestion boutique
      document.querySelector('#sous-tab-gerer-boutique').style.display = 'block'
    }
    displayWelcomeScreen(emailUser)
  } else {
    console.warn("Étudiant non trouvé après vérification")
  }
}

async function displayWelcomeScreen(userEmail) {
  currentUserEmail = userEmail
  try {
    const { data: users, error } = await supabase
      .from('etudiants')
      .select('*')
      .order('solde', { ascending: false })
    
    if (error) {
      console.error("Erreur récupération utilisateurs:", error)
      allUsers = []
    } else {
      allUsers = users || []
    }
    
    // Trouver la place de l'utilisateur connecté
    const userIndex = allUsers.findIndex(u => u.email === userEmail)
    if (userIndex >= 0) {
      const currentUser = allUsers[userIndex]
      const displayName = userEmail.split('@')[0]
      const rank = userIndex + 1
      const rankText = rank === 1 ? '🥇 1ère place' : rank === 2 ? '🥈 2ème place' : rank === 3 ? '🥉 3ème place' : `${rank}ème place`
      
      userRank.textContent = rankText
      userName.textContent = displayName.toUpperCase()
      userSolde.textContent = `💰 ${currentUser.solde} points`
    }
    
    afficherClassement(allUsers)
  } catch (err) {
    console.error("Erreur displayWelcomeScreen:", err)
  }
}

async function addPointsHandler() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      alert("Tu dois être connecté !")
      return
    }

    const { data: student, error: fetchError } = await supabase
      .from('etudiants')
      .select('solde')
      .eq('email', session.user.email)
      .single()

    if (fetchError || !student) {
      console.error("Erreur récupération étudiant:", fetchError)
      alert("Erreur : impossible de récupérer ton profil")
      return
    }

    const newBalance = student.solde + 10
    const { error: updateError } = await supabase
      .from('etudiants')
      .update({ solde: newBalance })
      .eq('email', session.user.email)

    if (updateError) {
      console.error("Erreur mise à jour:", updateError)
      alert("Erreur : impossible de mettre à jour les points")
      return
    }

    // Rafraîchir le classement
    const { data: users } = await supabase
      .from('etudiants')
      .select('*')
      .order('solde', { ascending: false })
    
    allUsers = users || []
    afficherClassement(allUsers)
    alert('✅ +10 points ! 🎉')
  } catch (err) {
    console.error("Erreur:", err)
    alert("Une erreur s'est produite")
  }
}

function afficherClassement(users) {
  leaderboard.innerHTML = ''

  users.forEach((user, index) => {
    const isCurrentUser = user.email === currentUserEmail
    const badge = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
    
    const userRow = document.createElement('div')
    userRow.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      margin-bottom: 8px;
      background: ${isCurrentUser ? '#667eea' : 'white'};
      color: ${isCurrentUser ? 'white' : '#333'};
      border-radius: 8px;
      border: ${isCurrentUser ? '2px solid #667eea' : '1px solid #ddd'};
      font-weight: ${isCurrentUser ? 'bold' : 'normal'};
      overflow: hidden;
      gap: 12px;
    `
    
    userRow.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; overflow: hidden;">
        <span style="font-size: 18px; flex-shrink: 0;">${badge}</span>
        <div style="min-width: 0; overflow: hidden; flex: 1; cursor: ${jeSuisAdmin ? 'pointer' : 'default'};">
          <p style="margin: 0; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${user.email.split('@')[0]}</p>
        </div>
      </div>
      <div style="text-align: right; font-size: 15px; font-weight: bold; flex-shrink: 0; white-space: nowrap; padding-left: 8px;">
        💰 ${user.solde}
      </div>
    `
    
    // Rendre cliquable si admin
    if (jeSuisAdmin && !isCurrentUser) {
      userRow.style.cursor = 'pointer'
      userRow.addEventListener('click', () => {
        ouvrirModalAdmin(user.email, user.solde)
      })
    }
    
    leaderboard.appendChild(userRow)
  })

  // Ajouter une séparation après l'utilisateur courant
  const currentUserIndex = users.findIndex(u => u.email === currentUserEmail)
  if (currentUserIndex >= 0 && currentUserIndex < users.length - 1) {
    const separator = document.createElement('div')
    separator.style.cssText = 'height: 2px; background: #ddd; margin: 10px 0;'
    const rows = leaderboard.querySelectorAll('div')
    if (rows.length > currentUserIndex) {
      rows[currentUserIndex].parentNode.insertBefore(separator, rows[currentUserIndex + 1])
    }
  }
}

// ==================== BOUTONS ACCUEIL ====================
document.querySelector('#btn-login').addEventListener('click', () => {
  // Afficher JUSTE la connexion (code uniquement), pas les onglets
  tabNouveau.style.pointerEvents = 'none'
  tabConnu.style.pointerEvents = 'none'
  document.querySelector('#tabs-container').style.display = 'none'
  formInscription.style.display = 'none'
  formConnexion.style.display = 'block'
  setEcran('login')
})

document.querySelector('#btn-register').addEventListener('click', () => {
  // Afficher JUSTE l'inscription (email uniquement), pas les onglets
  tabNouveau.style.pointerEvents = 'none'
  tabConnu.style.pointerEvents = 'none'
  document.querySelector('#tabs-container').style.display = 'none'
  formInscription.style.display = 'block'
  formConnexion.style.display = 'none'
  setEcran('login')
})

// ==================== BOUTONS RETOUR ====================
document.querySelector('#btn-back-login').addEventListener('click', () => {
  // Réactiver les onglets et afficher les tabs-container
  tabNouveau.style.pointerEvents = 'auto'
  tabConnu.style.pointerEvents = 'auto'
  document.querySelector('#tabs-container').style.display = 'flex'
  document.querySelector('#email-inscription').value = ''
  document.querySelector('#code-connexion').value = ''
  document.querySelector('#otp').value = ''
  localStorage.removeItem('emailTemp')
  setEcran('home')
})

document.querySelector('#btn-back-otp').addEventListener('click', () => {
  document.querySelector('#otp').value = ''
  setEcran('login')
})

// ==================== BOUTON DECONNEXION ====================
document.querySelector('#btn-logout').addEventListener('click', async () => {
  await supabase.auth.signOut()
  document.querySelector('#email-inscription').value = ''
  document.querySelector('#code-connexion').value = ''
  document.querySelector('#otp').value = ''
  localStorage.removeItem('emailTemp')
  localStorage.clear()
  setEcran('home')
})

// Barre de recherche
searchUsers.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase()
  const filtered = allUsers.filter(user => 
    user.email.toLowerCase().includes(query)
  )
  afficherClassement(filtered)
})

// ==================== LOGIQUE ADMIN ====================
const adminModal = document.querySelector('#admin-modal')
const adminTargetSpan = document.querySelector('#admin-target-user')
let cibleEmail = ""
let cibleAncienSolde = 0

function ouvrirModalAdmin(emailCible, soldeActuel) {
  cibleEmail = emailCible
  cibleAncienSolde = soldeActuel
  adminTargetSpan.textContent = emailCible
  document.querySelector('#admin-amount').value = ''
  document.querySelector('#admin-reason').value = ''
  adminModal.classList.remove('hidden')
}

// Bouton Annuler
document.querySelector('#btn-cancel-admin').addEventListener('click', () => {
  adminModal.classList.add('hidden')
})

// Bouton Valider
document.querySelector('#btn-confirm-admin').addEventListener('click', async () => {
  const montant = parseInt(document.querySelector('#admin-amount').value)
  const raison = document.querySelector('#admin-reason').value.trim()

  if (!montant || !raison) {
    alert("Il faut un montant et une raison !")
    return
  }

  // 1. Calcul du nouveau solde
  const nouveauSolde = cibleAncienSolde + montant

  // 2. Mise à jour du solde de l'étudiant
  const { error: errorUpdate } = await supabase
    .from('etudiants')
    .update({ solde: nouveauSolde })
    .eq('email', cibleEmail)

  if (errorUpdate) {
    alert("Erreur mise à jour : " + errorUpdate.message)
    return
  }

  // 3. Enregistrement de la transaction (La Trace)
  const { error: errorTransac } = await supabase
    .from('transactions')
    .insert([{
      destinataire_email: cibleEmail,
      admin_email: emailAdmin,
      montant: montant,
      raison: raison
    }])

  if (errorTransac) console.error("Erreur log transaction", errorTransac)

  // 4. Succès
  alert(`✅ Transaction réussie !\n${montant} points ajoutés à ${cibleEmail}.`)
  adminModal.classList.add('hidden')
  
  // Recharger le classement
  const { data: users } = await supabase
    .from('etudiants')
    .select('*')
    .order('solde', { ascending: false })
  
  allUsers = users || []
  afficherClassement(allUsers)
})

// ==================== ONGLETS CLASSEMENT/BOUTIQUE ====================
const tabClassement = document.querySelector('#tab-classement')
const tabBoutique = document.querySelector('#tab-boutique')
const tabMoi = document.querySelector('#tab-moi')
const classementScreen = document.querySelector('#classement-screen')
const boutiqueScreen = document.querySelector('#boutique-screen')
const moiScreen = document.querySelector('#moi-screen')

let jeSuisBoutiqueManager = false
let objetEnCoursAchat = null

// Gestion des onglets principaux
tabClassement.addEventListener('click', () => {
  classementScreen.style.display = 'block'
  boutiqueScreen.style.display = 'none'
  moiScreen.style.display = 'none'
  tabClassement.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
  tabClassement.style.color = 'white'
  tabBoutique.style.background = 'white'
  tabBoutique.style.color = '#333'
  tabMoi.style.background = 'white'
  tabMoi.style.color = '#333'
})

tabBoutique.addEventListener('click', async () => {
  classementScreen.style.display = 'none'
  boutiqueScreen.style.display = 'block'
  moiScreen.style.display = 'none'
  tabClassement.style.background = 'white'
  tabClassement.style.color = '#333'
  tabBoutique.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
  tabBoutique.style.color = 'white'
  tabMoi.style.background = 'white'
  tabMoi.style.color = '#333'
  
  await chargerObjetsBoutique()
})

tabMoi.addEventListener('click', async () => {
  classementScreen.style.display = 'none'
  boutiqueScreen.style.display = 'none'
  moiScreen.style.display = 'block'
  tabClassement.style.background = 'white'
  tabClassement.style.color = '#333'
  tabBoutique.style.background = 'white'
  tabBoutique.style.color = '#333'
  tabMoi.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
  tabMoi.style.color = 'white'
  
  await chargerMesAchats()
})

// Sous-onglets de Moi
const sousTabMesAchats = document.querySelector('#sous-tab-mes-achats')
const sousTabGererBoutique = document.querySelector('#sous-tab-gerer-boutique')
const mesAchatsContent = document.querySelector('#mes-achats-content')
const gererBoutiqueContent = document.querySelector('#gerer-boutique-content')

sousTabMesAchats.addEventListener('click', async () => {
  mesAchatsContent.style.display = 'block'
  gererBoutiqueContent.style.display = 'none'
  sousTabMesAchats.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
  sousTabMesAchats.style.color = 'white'
  sousTabGererBoutique.style.background = '#f0f0f0'
  sousTabGererBoutique.style.color = '#333'
  await chargerMesAchats()
})

sousTabGererBoutique.addEventListener('click', async () => {
  mesAchatsContent.style.display = 'none'
  gererBoutiqueContent.style.display = 'block'
  sousTabMesAchats.style.background = '#f0f0f0'
  sousTabMesAchats.style.color = '#333'
  sousTabGererBoutique.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
  sousTabGererBoutique.style.color = 'white'
  await chargerObjetsGestion()
})

// ==================== FONCTIONS BOUTIQUE ====================

async function chargerObjetsBoutique() {
  const { data: objets, error } = await supabase
    .from('objets_boutique')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erreur chargement objets:', error)
    return
  }
  
  // Afficher les objets dans la boutique
  const principal = objets.find(o => o.type === 'principal')
  const petits = objets.filter(o => o.type === 'petit').slice(0, 3)
  
  // Item principal
  const itemPrincipal = document.querySelector('#item-principal')
  if (principal) {
    itemPrincipal.innerHTML = `
      <div style="background: rgba(255,255,255,0.2); width: 150px; height: 150px; border-radius: 10px; margin: 0 auto 15px auto; display: flex; align-items: center; justify-content: center; font-size: 60px; background-image: url('${principal.image_url || ''}'); background-size: cover; background-position: center;">${!principal.image_url ? '📸' : ''}</div>
      <h3 style="margin: 10px 0; font-size: 20px;">${principal.nom}</h3>
      <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">💰 ${principal.prix} pts</p>
      <button onclick="confirmerAchat(${principal.id}, '${principal.nom}', ${principal.prix})" style="background: white; color: #e74c3c; margin-top: 10px; width: 60%; margin-left: auto; margin-right: auto;">Acheter</button>
    `
  } else {
    itemPrincipal.innerHTML = `
      <div style="background: rgba(255,255,255,0.2); width: 150px; height: 150px; border-radius: 10px; margin: 0 auto 15px auto; display: flex; align-items: center; justify-content: center; font-size: 60px;">📸</div>
      <p style="color: white;">Aucun objet principal</p>
    `
  }
  
  // Petits items
  const container3Items = boutiqueScreen.querySelector('div[style*="display: flex"]')
  let html3Items = ''
  
  for (let i = 0; i < 3; i++) {
    const petit = petits[i]
    if (petit) {
      html3Items += `
        <div style="flex: 1; background: #f0f0f0; padding: 12px; border-radius: 8px; text-align: center; border: 2px solid #e74c3c;">
          <div style="background: #ddd; width: 100%; height: 80px; border-radius: 8px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; font-size: 30px; background-image: url('${petit.image_url || ''}'); background-size: cover; background-position: center;">${!petit.image_url ? '📸' : ''}</div>
          <h4 style="margin: 8px 0; font-size: 14px;">${petit.nom}</h4>
          <p style="font-weight: bold; color: #e74c3c; margin: 5px 0; font-size: 16px;">${petit.prix} pts</p>
          <button onclick="confirmerAchat(${petit.id}, '${petit.nom}', ${petit.prix})" style="font-size: 12px; padding: 8px; margin: 5px 0 0 0; width: 100%;">Acheter</button>
        </div>
      `
    } else {
      html3Items += `
        <div style="flex: 1; background: #f0f0f0; padding: 12px; border-radius: 8px; text-align: center; border: 2px solid #ddd;">
          <div style="background: #ddd; width: 100%; height: 80px; border-radius: 8px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; font-size: 30px;">📸</div>
          <p style="font-size: 12px; color: #999;">Vide</p>
        </div>
      `
    }
  }
  
  container3Items.innerHTML = html3Items
}

// Fonction globale pour confirmer achat
window.confirmerAchat = async function(objetId, objetNom, objetPrix) {
  objetEnCoursAchat = { id: objetId, nom: objetNom, prix: objetPrix }
  
  // Récupérer le solde actuel
  const { data: etudiant } = await supabase
    .from('etudiants')
    .select('solde')
    .eq('email', currentUserEmail)
    .single()
  
  document.querySelector('#achat-objet-nom').textContent = objetNom
  document.querySelector('#achat-objet-prix').textContent = objetPrix
  document.querySelector('#achat-solde-actuel').textContent = etudiant.solde
  
  document.querySelector('#modal-confirmer-achat').classList.remove('hidden')
}

document.querySelector('#btn-cancel-achat').addEventListener('click', () => {
  document.querySelector('#modal-confirmer-achat').classList.add('hidden')
  objetEnCoursAchat = null
})

document.querySelector('#btn-confirm-achat-final').addEventListener('click', async () => {
  if (!objetEnCoursAchat) return
  
  // Vérifier le solde
  const { data: etudiant } = await supabase
    .from('etudiants')
    .select('solde')
    .eq('email', currentUserEmail)
    .single()
  
  if (etudiant.solde < objetEnCoursAchat.prix) {
    alert('Solde insuffisant !')
    return
  }
  
  // Débiter les points
  const nouveauSolde = etudiant.solde - objetEnCoursAchat.prix
  await supabase
    .from('etudiants')
    .update({ solde: nouveauSolde })
    .eq('email', currentUserEmail)
  
  // Enregistrer l'achat
  const { error } = await supabase
    .from('achats')
    .insert({
      acheteur_email: currentUserEmail,
      objet_id: objetEnCoursAchat.id,
      prix_paye: objetEnCoursAchat.prix
    })
  
  if (error) {
    alert('Erreur lors de l\'achat')
    console.error(error)
    return
  }
  
  alert('Achat effectué !')
  document.querySelector('#modal-confirmer-achat').classList.add('hidden')
  objetEnCoursAchat = null
  
  // Rafraîchir le classement
  displayWelcomeScreen()
})

// ==================== FONCTIONS MES ACHATS ====================

async function chargerMesAchats() {
  const { data: achats, error } = await supabase
    .from('achats')
    .select(`
      *,
      objets_boutique (nom, prix, image_url)
    `)
    .eq('acheteur_email', currentUserEmail)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erreur chargement achats:', error)
    return
  }
  
  const listeMesAchats = document.querySelector('#liste-mes-achats')
  
  if (achats.length === 0) {
    listeMesAchats.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Aucun achat pour le moment</p>'
    return
  }
  
  let html = ''
  achats.forEach(achat => {
    const objet = achat.objets_boutique
    const date = new Date(achat.created_at).toLocaleDateString('fr-FR')
    html += `
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; gap: 15px; align-items: center;">
        <div style="width: 60px; height: 60px; background: #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; background-image: url('${objet.image_url || ''}'); background-size: cover;">${!objet.image_url ? '📦' : ''}</div>
        <div style="flex: 1;">
          <h4 style="margin: 0 0 5px 0; color: #333;">${objet.nom}</h4>
          <p style="margin: 0; font-size: 14px; color: #666;">${achat.prix_paye} points - ${date}</p>
        </div>
      </div>
    `
  })
  
  listeMesAchats.innerHTML = html
}

// ==================== FONCTIONS GESTION BOUTIQUE ====================

async function chargerObjetsGestion() {
  const { data: objets, error } = await supabase
    .from('objets_boutique')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erreur chargement objets gestion:', error)
    return
  }
  
  const listeObjetsGestion = document.querySelector('#liste-objets-gestion')
  
  if (objets.length === 0) {
    listeObjetsGestion.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Aucun objet dans la boutique</p>'
    return
  }
  
  let html = ''
  objets.forEach(objet => {
    html += `
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
        <div style="display: flex; gap: 15px; align-items: center;">
          <div style="width: 60px; height: 60px; background: #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; background-image: url('${objet.image_url || ''}'); background-size: cover;">${!objet.image_url ? '📦' : ''}</div>
          <div style="flex: 1;">
            <h4 style="margin: 0 0 5px 0; color: #333;">${objet.nom}</h4>
            <p style="margin: 0; font-size: 14px; color: #666;">${objet.prix} pts - ${objet.type === 'principal' ? '⭐ Principal' : '📦 Petit'}</p>
          </div>
          <button onclick="supprimerObjet(${objet.id})" style="background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">🗑️ Supprimer</button>
        </div>
      </div>
    `
  })
  
  listeObjetsGestion.innerHTML = html
}

window.supprimerObjet = async function(objetId) {
  if (!confirm('Voulez-vous vraiment supprimer cet objet ?')) return
  
  const { error } = await supabase
    .from('objets_boutique')
    .delete()
    .eq('id', objetId)
  
  if (error) {
    alert('Erreur lors de la suppression')
    console.error(error)
    return
  }
  
  alert('Objet supprimé !')
  await chargerObjetsGestion()
  await chargerObjetsBoutique()
}

document.querySelector('#btn-ajouter-objet').addEventListener('click', () => {
  document.querySelector('#modal-ajouter-objet').classList.remove('hidden')
})

document.querySelector('#btn-cancel-objet').addEventListener('click', () => {
  document.querySelector('#modal-ajouter-objet').classList.add('hidden')
})

document.querySelector('#btn-confirm-objet').addEventListener('click', async () => {
  const nom = document.querySelector('#objet-nom').value.trim()
  const prix = parseInt(document.querySelector('#objet-prix').value)
  const imageUrl = document.querySelector('#objet-image').value.trim()
  const type = document.querySelector('#objet-type').value
  
  if (!nom || !prix || prix <= 0) {
    alert('Veuillez remplir tous les champs obligatoires')
    return
  }
  
  // Vérifier les limites
  const { data: objetsExistants } = await supabase
    .from('objets_boutique')
    .select('*')
    .eq('type', type)
  
  if (type === 'principal' && objetsExistants.length >= 1) {
    alert('Il y a déjà un objet principal ! Supprimez-le d\'abord.')
    return
  }
  
  if (type === 'petit' && objetsExistants.length >= 3) {
    alert('Il y a déjà 3 petits objets ! Supprimez-en un d\'abord.')
    return
  }
  
  // Insérer l'objet
  const { error } = await supabase
    .from('objets_boutique')
    .insert({
      nom,
      prix,
      image_url: imageUrl || null,
      type
    })
  
  if (error) {
    alert('Erreur lors de l\'ajout')
    console.error(error)
    return
  }
  
  alert('Objet ajouté !')
  document.querySelector('#modal-ajouter-objet').classList.add('hidden')
  
  // Réinitialiser le formulaire
  document.querySelector('#objet-nom').value = ''
  document.querySelector('#objet-prix').value = ''
  document.querySelector('#objet-image').value = ''
  
  await chargerObjetsGestion()
  await chargerObjetsBoutique()
})

checkSession()