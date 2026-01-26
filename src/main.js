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
  
  // Pré-remplir si nouveau compte créé
  const newEmail = localStorage.getItem('newAccountEmail')
  const newPassword = localStorage.getItem('newAccountPassword')
  if (newEmail && newPassword) {
    document.querySelector('#email-connexion').value = newEmail
    document.querySelector('#code-connexion').value = newPassword
  }
})

// Bouton copier le mot de passe
document.querySelector('#btn-copy-password').addEventListener('click', () => {
  const password = document.querySelector('#generated-password').textContent
  navigator.clipboard.writeText(password).then(() => {
    const btn = document.querySelector('#btn-copy-password')
    btn.textContent = '✅ Copié !'
    setTimeout(() => {
      btn.textContent = '📋 Copier'
    }, 2000)
  })
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

// ==================== 1. INSCRIPTION (Tout sur une page) ====================
let etapeInscription = 'email' // 'email', 'otp', 'complete'

document.querySelector('#btn-send-otp').addEventListener('click', async () => {
  const btnSendOtp = document.querySelector('#btn-send-otp')
  const email = document.querySelector('#email-inscription').value.trim().toLowerCase()
  
  // ÉTAPE 1 : Envoi du code par email
  if (etapeInscription === 'email') {
    if (!email) {
      afficherMessageNFC('⚠️', 'Email manquant', 'Entre ton email étudiant !', '#f39c12');
      return
    }

    // Vérifier que l'email est d'une école autorisée
    const domainesAutorises = ['centralelille.fr', 'iteem.centralelille.fr', 'enscl.centralelille.fr']
    const domainEmail = email.split('@')[1]
    
    if (!domainEmail || !domainesAutorises.includes(domainEmail)) {
      afficherMessageNFC('⚠️', 'Email non autorisé', 'Tu dois utiliser ton email étudiant : centralelille.fr, iteem.centralelille.fr ou enscl.centralelille.fr', '#f39c12');
      return
    }

    // Vérifier si le compte existe déjà
    const { data: existant } = await supabase
      .from('etudiants')
      .select('email')
      .eq('email', email)
      .single()
    
    if (existant) {
      afficherMessageNFC('⚠️', 'Compte existant', 'Ce compte existe déjà ! Clique sur "Se connecter".', '#f39c12');
      return
    }

    // Créer le compte avec OTP
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      afficherMessageNFC('❌', 'Erreur', error.message, '#e74c3c');
      return
    }
    
    // Stocker l'email temporairement
    localStorage.setItem('emailTemp', email)
    
    // Afficher la zone OTP et désactiver l'email
    document.querySelector('#email-inscription').disabled = true
    document.querySelector('#otp-section').style.display = 'block'
    btnSendOtp.textContent = 'Valider le code'
    etapeInscription = 'otp'
    
  } 
  // ÉTAPE 2 : Validation du code OTP
  else if (etapeInscription === 'otp') {
    const token = document.querySelector('#otp').value.trim()
    
    if (!token || token.length !== 8) {
      afficherMessageNFC('⚠️', 'Code invalide', 'Le code doit contenir exactement 8 chiffres !', '#f39c12');
      return
    }

    const { error, data } = await supabase.auth.verifyOtp({ email, token, type: 'email'})
    
    if (error) {
      console.error("Erreur OTP:", error)
      afficherMessageNFC('❌', 'Code incorrect', 'Code faux ! Vérifie tes mails.', '#e74c3c');
      return
    }

    console.log("OTP vérifié, session créée:", data)
    
    // Créer le compte et afficher le mot de passe
    await creerCompteEtAfficherMdp(email, token)
    
    // Afficher le mot de passe et changer le bouton
    document.querySelector('#otp').disabled = true
    btnSendOtp.textContent = 'Se connecter'
    etapeInscription = 'complete'
  }
  // ÉTAPE 3 : Se connecter
  else if (etapeInscription === 'complete') {
    const password = document.querySelector('#generated-password').textContent
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (error) {
      afficherMessageNFC('❌', 'Erreur', 'Erreur de connexion: ' + error.message, '#e74c3c');
    } else {
      checkSession()
    }
  }
})

// Fonction pour créer le compte et afficher le mot de passe
async function creerCompteEtAfficherMdp(emailUser, codeOtp) {
  console.log("Création du compte avec email:", emailUser, "code:", codeOtp)
  
  // Définir le mot de passe
  const { error: errorUpdate } = await supabase.auth.updateUser({ password: codeOtp })
  
  if (errorUpdate) {
    console.error("Erreur mot de passe:", errorUpdate)
    afficherMessageNFC('❌', 'Erreur', 'Erreur lors de la création du compte: ' + errorUpdate.message, '#e74c3c');
    return
  }

  console.log("Mot de passe défini avec succès")

  // Créer l'étudiant dans la base
  const { data: nouveau, error: insertError } = await supabase
    .from('etudiants')
    .insert([{ email: emailUser, code_perso: codeOtp, solde: 0 }])
    .select()
    .single()

  if (insertError) {
    console.error("Erreur insertion étudiant:", insertError)
    afficherMessageNFC('❌', 'Erreur', 'Erreur lors de l\'enregistrement', '#e74c3c');
    return
  }
    
  console.log("Étudiant créé:", nouveau)
  
  // Afficher le mot de passe dans l'interface
  document.querySelector('#generated-password').textContent = codeOtp
  document.querySelector('#password-display').style.display = 'block'
}

// ==================== 3. CONNEXION DIRECTE (Code uniquement) 🚀 ====================
// Intercepter la soumission du formulaire de connexion
document.querySelector('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault() // Empêcher le rechargement de la page
  
  const email = document.querySelector('#email-connexion').value.trim().toLowerCase()
  const code = document.querySelector('#code-connexion').value.trim()

  if (!email) {
    afficherMessageNFC('⚠️', 'Email manquant', 'Entre ton email !', '#f39c12');
    return
  }

  if (!code || code.length < 6) {
    afficherMessageNFC('⚠️', 'Code manquant', 'Rentre ton code !', '#f39c12');
    return
  }

  const { data: student } = await supabase
    .from('etudiants')
    .select('email, code_perso')
    .eq('email', email)
    .eq('code_perso', code)
    .single()

  if (!student) {
    afficherMessageNFC('❌', 'Erreur', 'Email ou code incorrect !', '#e74c3c');
    return
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: student.email,
    password: code
  })

  if (error) afficherMessageNFC('❌', 'Erreur', 'Erreur de connexion: ' + error.message, '#e74c3c');
  else checkSession()
})

// Garder aussi le listener sur le bouton pour compatibilité
document.querySelector('#btn-login-code').addEventListener('click', async (e) => {
  e.preventDefault()
  document.querySelector('#login-form').dispatchEvent(new Event('submit'))
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

// ==================== 5. GESTION BASE DE DONNEES ====================
async function gererEtudiant(emailUser) {
  console.log("gererEtudiant appelé pour:", emailUser)
  
  let { data: etudiant, error: searchError } = await supabase
    .from('etudiants')
    .select('*')
    .eq('email', emailUser)
    .single()

  console.log("Recherche étudiant:", { etudiant, searchError })

  if (etudiant) {
    console.log("Affichage du profil, solde:", etudiant.solde)
    jeSuisAdmin = etudiant.is_admin || false
    jeSuisBoutiqueManager = etudiant.is_boutique_manager || false
    emailAdmin = etudiant.email
    if (jeSuisAdmin) console.log("👑 MODE ADMIN ACTIVÉ")
    if (jeSuisBoutiqueManager) console.log("🛍️ MODE GESTIONNAIRE BOUTIQUE ACTIVÉ")
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
    try {
      const separator = document.createElement('div')
      separator.style.cssText = 'height: 2px; background: #ddd; margin: 10px 0;'
      const rows = Array.from(leaderboard.children)
      if (rows.length > currentUserIndex + 1) {
        leaderboard.insertBefore(separator, rows[currentUserIndex + 1])
      }
    } catch (e) {
      console.log('Erreur ajout séparateur (non critique):', e)
    }
  }
}

// ==================== BOUTONS ACCUEIL ====================
document.querySelector('#btn-login').addEventListener('click', () => {
  // Afficher JUSTE la connexion (code uniquement), pas les onglets
  document.querySelector('#tabs-container').style.display = 'none'
  formInscription.style.display = 'none'
  formConnexion.style.display = 'block'
  setEcran('login')
})

document.querySelector('#btn-register').addEventListener('click', () => {
  // Réinitialiser le formulaire d'inscription
  etapeInscription = 'email'
  document.querySelector('#email-inscription').value = ''
  document.querySelector('#email-inscription').disabled = false
  document.querySelector('#otp').value = ''
  document.querySelector('#otp-section').style.display = 'none'
  document.querySelector('#password-display').style.display = 'none'
  document.querySelector('#btn-send-otp').textContent = 'Recevoir mon code'
  
  // Afficher JUSTE l'inscription, pas les onglets
  document.querySelector('#tabs-container').style.display = 'none'
  formInscription.style.display = 'block'
  formConnexion.style.display = 'none'
  setEcran('login')
})

// ==================== BOUTONS RETOUR ====================
document.querySelector('#btn-back-login').addEventListener('click', () => {
  // Réinitialiser tout
  etapeInscription = 'email'
  document.querySelector('#email-inscription').value = ''
  document.querySelector('#email-inscription').disabled = false
  document.querySelector('#code-connexion').value = ''
  document.querySelector('#otp').value = ''
  document.querySelector('#otp').disabled = false
  document.querySelector('#otp-section').style.display = 'none'
  document.querySelector('#password-display').style.display = 'none'
  document.querySelector('#btn-send-otp').textContent = 'Recevoir mon code'
  localStorage.removeItem('emailTemp')
  setEcran('home')
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

// ==================== FONCTIONS BOUTIQUE ====================

async function chargerObjetsBoutique() {
  const { data: objets, error } = await supabase
    .from('objets_boutique')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Erreur chargement objets:', error)
    return
  }
  
  // Afficher le bouton d'ajout si gestionnaire
  const btnAjout = document.querySelector('#btn-ajouter-objet-flottant')
  if (jeSuisBoutiqueManager) {
    btnAjout.classList.remove('hidden')
  } else {
    btnAjout.classList.add('hidden')
  }
  
  // Créer la grille
  const grid = document.querySelector('#objets-grid')
  grid.innerHTML = ''
  
  objets.forEach(objet => {
    const estEpuise = objet.quantite <= 0
    const taille = objet.taille || 'petit'
    
    // Définir le nombre de colonnes occupées
    let gridColumn = ''
    if (taille === 'gros') gridColumn = 'span 3'
    else if (taille === 'moyen') gridColumn = 'span 2'
    else gridColumn = 'span 1'
    
    const div = document.createElement('div')
    div.style.cssText = `
      grid-column: ${gridColumn};
      background: white;
      border-radius: 12px;
      padding: 15px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.1);
      position: relative;
      border: 2px solid ${estEpuise ? '#ddd' : '#e74c3c'};
    `
    
    let html = ''
    
    // Menu 3 points si gestionnaire
    if (jeSuisBoutiqueManager) {
      html += `<button class="btn-menu-3pts" data-objet-id="${objet.id}" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;">⋮</button>`
    }
    
    // Image
    const imageHeight = taille === 'gros' ? '200px' : taille === 'moyen' ? '150px' : '120px'
    html += `
      <div style="background: #f0f0f0; width: 100%; height: ${imageHeight}; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; font-size: 50px; background-image: url('${objet.image_url || ''}'); background-size: contain; background-repeat: no-repeat; background-position: center;">
        ${!objet.image_url ? '📸' : ''}
      </div>
    `
    
    // Nom
    const fontSize = taille === 'gros' ? '22px' : taille === 'moyen' ? '18px' : '16px'
    html += `<h3 style="margin: 10px 0; font-size: ${fontSize}; color: #333;">${objet.nom}</h3>`
    
    // Prix
    html += `<p style="font-size: 20px; font-weight: bold; color: #e74c3c; margin: 8px 0;">💰 ${objet.prix} pts</p>`
    
    // Stock
    html += `<p style="font-size: 14px; margin: 8px 0; color: ${estEpuise ? '#e74c3c' : '#2ecc71'};">${estEpuise ? '❌ Épuisé' : `✅ ${objet.quantite} disponible(s)`}</p>`
    
    // Bouton acheter
    html += `<button class="btn-acheter" data-id="${objet.id}" data-nom="${objet.nom}" data-prix="${objet.prix}" style="width: 100%; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: ${estEpuise ? 'not-allowed' : 'pointer'}; background: ${estEpuise ? '#ddd' : '#e74c3c'}; color: white; font-size: 16px;" ${estEpuise ? 'disabled' : ''}>Acheter</button>`
    
    div.innerHTML = html
    div.dataset.objetId = objet.id
    div.dataset.objetNom = objet.nom
    div.dataset.objetPrix = objet.prix
    div.dataset.objetImage = objet.image_url || ''
    div.dataset.objetQuantite = objet.quantite
    div.dataset.objetTaille = taille
    grid.appendChild(div)
  })
  
  // Ajouter listeners sur les boutons acheter
  document.querySelectorAll('.btn-acheter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const id = parseInt(btn.dataset.id)
      const nom = btn.dataset.nom
      const prix = parseInt(btn.dataset.prix)
      confirmerAchat(id, nom, prix)
    })
  })
  
  // Ajouter listeners sur les menus 3 points
  document.querySelectorAll('.btn-menu-3pts').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const id = parseInt(btn.dataset.objetId)
      const container = btn.closest('[data-objet-id]')
      const nom = container.dataset.objetNom
      const prix = parseInt(container.dataset.objetPrix)
      const imageUrl = container.dataset.objetImage
      const quantite = parseInt(container.dataset.objetQuantite)
      const taille = container.dataset.objetTaille
      
      ouvrirMenuObjet(id, nom, prix, imageUrl, taille, quantite)
    })
  })
}

// Bouton flottant pour ajouter un objet
document.querySelector('#btn-ajouter-objet-flottant').addEventListener('click', () => {
  ouvrirModalAjout()
})

// Gestion du choix de taille dans le modal
document.querySelectorAll('.btn-taille').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-taille').forEach(b => {
      b.style.border = '2px solid #ddd'
      b.style.background = 'white'
    })
    btn.style.border = '2px solid #e74c3c'
    btn.style.background = '#ffe6e6'
    document.querySelector('#objet-taille').value = btn.dataset.taille
  })
})

// Gestion de l'upload de photo avec preview
const zoneUpload = document.querySelector('#zone-upload')
const inputPhoto = document.querySelector('#objet-photo')
const previewDiv = document.querySelector('#preview-image')
const imgPreview = document.querySelector('#img-preview')

zoneUpload.addEventListener('click', () => {
  inputPhoto.click()
})

zoneUpload.addEventListener('dragover', (e) => {
  e.preventDefault()
  zoneUpload.style.borderColor = '#e74c3c'
  zoneUpload.style.background = '#ffe6e6'
})

zoneUpload.addEventListener('dragleave', () => {
  zoneUpload.style.borderColor = '#ddd'
  zoneUpload.style.background = '#f9f9f9'
})

zoneUpload.addEventListener('drop', (e) => {
  e.preventDefault()
  zoneUpload.style.borderColor = '#ddd'
  zoneUpload.style.background = '#f9f9f9'
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    inputPhoto.files = e.dataTransfer.files
    afficherPreview(file)
  }
})

inputPhoto.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (file) {
    afficherPreview(file)
  }
})

function afficherPreview(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    imgPreview.src = e.target.result
    previewDiv.style.display = 'block'
  }
  reader.readAsDataURL(file)
}

// Ouvrir modal avec type pré-sélectionné (ancien système)
function ouvrirModalAjout(type = null) {
  // Réinitialiser le formulaire
  document.querySelector('#objet-nom').value = ''
  document.querySelector('#objet-prix').value = ''
  document.querySelector('#objet-quantite').value = '1'
  document.querySelector('#objet-image').value = ''
  document.querySelector('#objet-photo').value = ''
  document.querySelector('#objet-id-edit').value = ''
  previewDiv.style.display = 'none'
  
  // Sélectionner la taille "petit" par défaut
  document.querySelectorAll('.btn-taille').forEach(b => {
    b.style.border = '2px solid #ddd'
    b.style.background = 'white'
  })
  document.querySelector('.btn-taille[data-taille="petit"]').style.border = '2px solid #e74c3c'
  document.querySelector('.btn-taille[data-taille="petit"]').style.background = '#ffe6e6'
  document.querySelector('#objet-taille').value = 'petit'
  
  document.querySelector('#modal-titre-objet').textContent = '➕ Ajouter un Objet'
  document.querySelector('#btn-confirm-objet').textContent = 'Ajouter'
  document.querySelector('#modal-ajouter-objet').classList.remove('hidden')
}

// Ouvrir menu 3 points pour un objet
let objetEnCoursMenu = null

window.ouvrirMenuObjet = function(id, nom, prix, imageUrl, taille, quantite) {
  objetEnCoursMenu = { id, nom, prix, image_url: imageUrl, taille, quantite }
  document.querySelector('#menu-objet-nom').textContent = nom
  document.querySelector('#menu-objet').classList.remove('hidden')
}

async function supprimerObjet(objetId, type) {
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
  await chargerObjetsBoutique()
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
  
  // Vérifier la quantité disponible
  const { data: objet } = await supabase
    .from('objets_boutique')
    .select('quantite')
    .eq('id', objetEnCoursAchat.id)
    .single()
  
  if (objet.quantite <= 0) {
    alert('Cet objet est épuisé !')
    document.querySelector('#modal-confirmer-achat').classList.add('hidden')
    objetEnCoursAchat = null
    await chargerObjetsBoutique()
    return
  }
  
  // Débiter les points
  const nouveauSolde = etudiant.solde - objetEnCoursAchat.prix
  await supabase
    .from('etudiants')
    .update({ solde: nouveauSolde })
    .eq('email', currentUserEmail)
  
  // Décrémenter la quantité
  await supabase
    .from('objets_boutique')
    .update({ quantite: objet.quantite - 1 })
    .eq('id', objetEnCoursAchat.id)
  
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
  
  // Rafraîchir le classement et la boutique
  displayWelcomeScreen()
  await chargerObjetsBoutique()
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

// ==================== GESTION MODAL AJOUT OBJET ====================

// Fonction pour uploader une photo vers Supabase Storage
async function uploadPhoto(file) {
  if (!file) return null
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
  const filePath = `objets/${fileName}`
  
  const { data, error } = await supabase.storage
    .from('photos-boutique')
    .upload(filePath, file)
  
  if (error) {
    console.error('Erreur upload photo:', error)
    return null
  }
  
  // Récupérer l'URL publique
  const { data: urlData } = supabase.storage
    .from('photos-boutique')
    .getPublicUrl(filePath)
  
  return urlData.publicUrl
}

document.querySelector('#btn-cancel-objet').addEventListener('click', () => {
  document.querySelector('#modal-ajouter-objet').classList.add('hidden')
})

document.querySelector('#btn-confirm-objet').addEventListener('click', async () => {
  const nom = document.querySelector('#objet-nom').value.trim()
  const prix = parseInt(document.querySelector('#objet-prix').value)
  const quantite = parseInt(document.querySelector('#objet-quantite').value) || 1
  const imageUrl = document.querySelector('#objet-image').value.trim()
  const photoFile = document.querySelector('#objet-photo').files[0]
  const taille = document.querySelector('#objet-taille').value
  const objetIdEdit = document.querySelector('#objet-id-edit').value
  
  if (!nom || !prix || prix <= 0 || quantite < 1) {
    afficherMessageNFC('⚠️', 'Champs manquants', 'Veuillez remplir tous les champs obligatoires', '#f39c12');
    return
  }
  
  // Upload photo si sélectionnée
  let finalImageUrl = imageUrl
  if (photoFile) {
    const uploadedUrl = await uploadPhoto(photoFile)
    if (uploadedUrl) {
      finalImageUrl = uploadedUrl
    } else {
      afficherMessageNFC('❌', 'Erreur upload', 'Erreur lors de l\'upload de la photo', '#e74c3c');
      return
    }
  }
  
  // Si modification
  if (objetIdEdit) {
    const { error } = await supabase
      .from('objets_boutique')
      .update({
        nom,
        prix,
        quantite,
        image_url: finalImageUrl || null,
        taille
      })
      .eq('id', parseInt(objetIdEdit))
    
    if (error) {
      afficherMessageNFC('❌', 'Erreur', 'Erreur lors de la modification', '#e74c3c');
      console.error(error)
      return
    }
    
    afficherMessageNFC('✅', 'Succès', 'Objet modifié !', '#2a9d8f');
  } else {
    // Sinon ajout
    const { error } = await supabase
      .from('objets_boutique')
      .insert({
        nom,
        prix,
        quantite,
        image_url: finalImageUrl || null,
        taille
      })
    
    if (error) {
      afficherMessageNFC('❌', 'Erreur', 'Erreur lors de l\'ajout', '#e74c3c');
      console.error(error)
      return
    }
    
    afficherMessageNFC('✅', 'Succès', 'Objet ajouté !', '#2a9d8f');
  }
  document.querySelector('#modal-ajouter-objet').classList.add('hidden')
  
  // Réinitialiser le formulaire
  document.querySelector('#objet-nom').value = ''
  document.querySelector('#objet-prix').value = ''
  document.querySelector('#objet-quantite').value = '1'
  document.querySelector('#objet-image').value = ''
  document.querySelector('#objet-photo').value = ''
  
  await chargerObjetsBoutique()
})

// Event listeners pour menu-objet
document.querySelector('#btn-menu-annuler').addEventListener('click', () => {
  document.querySelector('#menu-objet').classList.add('hidden')
  objetEnCoursMenu = null
})

document.querySelector('#btn-menu-modifier').addEventListener('click', () => {
  if (!objetEnCoursMenu) return
  
  // Pré-remplir le formulaire dans le modal d'ajout (en mode édition)
  document.querySelector('#objet-nom').value = objetEnCoursMenu.nom
  document.querySelector('#objet-prix').value = objetEnCoursMenu.prix
  document.querySelector('#objet-quantite').value = objetEnCoursMenu.quantite
  document.querySelector('#objet-image').value = objetEnCoursMenu.image_url || ''
  document.querySelector('#objet-id-edit').value = objetEnCoursMenu.id
  previewDiv.style.display = 'none'
  
  // Sélectionner la bonne taille
  const taille = objetEnCoursMenu.taille || 'petit'
  document.querySelectorAll('.btn-taille').forEach(b => {
    b.style.border = '2px solid #ddd'
    b.style.background = 'white'
  })
  const btnTaille = document.querySelector(`.btn-taille[data-taille="${taille}"]`)
  if (btnTaille) {
    btnTaille.style.border = '2px solid #e74c3c'
    btnTaille.style.background = '#ffe6e6'
  }
  document.querySelector('#objet-taille').value = taille
  
  // Changer le titre et le bouton
  document.querySelector('#modal-titre-objet').textContent = '✏️ Modifier l\'Objet'
  document.querySelector('#btn-confirm-objet').textContent = 'Modifier'
  
  // Fermer le menu et ouvrir le modal
  document.querySelector('#menu-objet').classList.add('hidden')
  document.querySelector('#modal-ajouter-objet').classList.remove('hidden')
})

document.querySelector('#btn-menu-supprimer').addEventListener('click', async () => {
  if (!objetEnCoursMenu) return
  
  if (!confirm(`Supprimer "${objetEnCoursMenu.nom}" ?`)) return
  
  const { error } = await supabase
    .from('objets_boutique')
    .delete()
    .eq('id', objetEnCoursMenu.id)
  
  if (error) {
    alert('Erreur lors de la suppression')
    console.error(error)
    return
  }
  
  alert('Objet supprimé !')
  document.querySelector('#menu-objet').classList.add('hidden')
  objetEnCoursMenu = null
  await chargerObjetsBoutique()
})

// Event listeners pour modal-modifier-objet
document.querySelector('#btn-cancel-modifier').addEventListener('click', () => {
  document.querySelector('#modal-modifier-objet').classList.add('hidden')
})

document.querySelector('#btn-confirm-modifier').addEventListener('click', async () => {
  if (!objetEnCoursMenu) return
  
  const nom = document.querySelector('#modifier-objet-nom').value.trim()
  const prix = parseInt(document.querySelector('#modifier-objet-prix').value)
  const quantite = parseInt(document.querySelector('#modifier-objet-quantite').value)
  const imageUrl = document.querySelector('#modifier-objet-image').value.trim()
  const photoFile = document.querySelector('#modifier-objet-photo').files[0]
  
  if (!nom || !prix || prix < 1 || quantite < 0) {
    alert('Veuillez remplir tous les champs correctement')
    return
  }
  
  // Upload nouvelle photo si sélectionnée
  let finalImageUrl = imageUrl
  if (photoFile) {
    const uploadedUrl = await uploadPhoto(photoFile)
    if (uploadedUrl) {
      finalImageUrl = uploadedUrl
    } else {
      alert('Erreur lors de l\'upload de la photo')
      return
    }
  }
  
  const { error } = await supabase
    .from('objets_boutique')
    .update({
      nom,
      prix,
      quantite,
      image_url: finalImageUrl || null
    })
    .eq('id', objetEnCoursMenu.id)
  
  if (error) {
    alert('Erreur lors de la modification')
    console.error(error)
    return
  }
  
  alert('Objet modifié !')
  document.querySelector('#modal-modifier-objet').classList.add('hidden')
  objetEnCoursMenu = null
  await chargerObjetsBoutique()
})

// ==================== GESTION NFC / QR CODE ====================

// Fonction helper pour afficher un beau message
function afficherMessageNFC(emoji, titre, message, couleur = '#e74c3c') {
  document.querySelector('#nfc-info-emoji').textContent = emoji;
  document.querySelector('#nfc-info-titre').textContent = titre;
  document.querySelector('#nfc-info-titre').style.color = couleur;
  document.querySelector('#nfc-info-message').textContent = message;
  document.querySelector('#nfc-info-modal .modal-content').style.border = `3px solid ${couleur}`;
  document.querySelector('#btn-close-nfc-info').style.background = couleur;
  document.querySelector('#nfc-info-modal').classList.remove('hidden');
}

// 1. Fonction lancée au chargement de la page
async function verifierTagUrl() {
  const params = new URLSearchParams(window.location.search);
  const tagCode = params.get('tag');

  // S'il n'y a pas de tag, on ne fait rien
  if (!tagCode) return;

  console.log("🔍 Tag détecté :", tagCode);

  // ✨ NETTOYAGE IMMÉDIAT DE L'URL (Sécurité visuelle)
  // On remplace l'URL actuelle par l'URL de base sans recharger la page
  window.history.replaceState({}, document.title, window.location.pathname);

  // Vérifier la connexion
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // Si pas connecté, on sauvegarde le tag pour après le login
    localStorage.setItem('pendingTag', tagCode);
    afficherMessageNFC('🔒', 'Connexion requise', 'Connecte-toi vite pour récupérer tes points !', '#f39c12');
    return;
  }

  // Si connecté, on traite le tag
  await scannerTag(tagCode, session.user.email);
}

// 2. Fonction de traitement
async function scannerTag(code, emailUser) {
  // A. Récupérer les infos du tag (Points + Message)
  const { data: tagInfo, error } = await supabase
    .from('nfc_tags')
    .select('*')
    .eq('code', code)
    .single();

  if (!tagInfo || !tagInfo.active) {
    afficherMessageNFC('❌', 'Tag invalide', 'Ce tag est invalide ou désactivé.', '#e74c3c');
    return;
  }

  // B. Vérifier si DÉJÀ scanné
  const { data: dejaScanne } = await supabase
    .from('transactions')
    .select('*')
    .eq('destinataire_email', emailUser)
    .eq('raison', `NFC: ${code}`)
    .single();

  if (dejaScanne) {
    afficherMessageNFC('⚠️', 'Déjà scanné', `Tu as déjà scanné le tag "${code}" ! Pas de triche !`, '#f39c12');
    return;
  }

  // C. Ajouter les points
  const { data: etudiant } = await supabase
    .from('etudiants')
    .select('solde')
    .eq('email', emailUser)
    .single();

  const nouveauSolde = etudiant.solde + tagInfo.points;

  await supabase.from('etudiants').update({ solde: nouveauSolde }).eq('email', emailUser);
  
  // D. Enregistrer la transaction
  await supabase.from('transactions').insert([{
      destinataire_email: emailUser,
      montant: tagInfo.points,
      raison: `NFC: ${code}`,
      admin_email: 'SYSTEM_NFC'
  }]);

  // E. AFFICHER LA BELLE FENÊTRE 🎉
  document.querySelector('#nfc-custom-message').textContent = tagInfo.message; // Le message de la BDD
  document.querySelector('#nfc-points-amount').textContent = `+${tagInfo.points}`;
  document.querySelector('#nfc-success-modal').classList.remove('hidden');

  // Mise à jour du compteur visuel
  if(document.querySelector('#points-count')) {
      document.querySelector('#points-count').textContent = nouveauSolde;
  }
}

// Boutons pour fermer les fenêtres
document.querySelector('#btn-close-nfc').addEventListener('click', () => {
  document.querySelector('#nfc-success-modal').classList.add('hidden');
});

document.querySelector('#btn-close-nfc-info').addEventListener('click', () => {
  document.querySelector('#nfc-info-modal').classList.add('hidden');
});

checkSession()
verifierTagUrl()