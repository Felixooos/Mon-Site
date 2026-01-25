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
  const token = document.querySelector('#otp').value
  
  if (!email) {
    alert('Email manquant !')
    return
  }

  if (!token || token.length < 6) {
    alert('Rentre le code reçu par mail !')
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
      padding: 12px 15px;
      margin-bottom: 10px;
      background: ${isCurrentUser ? '#667eea' : 'white'};
      color: ${isCurrentUser ? 'white' : '#333'};
      border-radius: 8px;
      border: ${isCurrentUser ? '2px solid #667eea' : '1px solid #ddd'};
      font-weight: ${isCurrentUser ? 'bold' : 'normal'};
    `
    
    userRow.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
        <span style="font-size: 20px; min-width: 30px;">${badge}</span>
        <div>
          <p style="margin: 0; font-weight: bold;">${user.email.split('@')[0]}</p>
          <p style="margin: 3px 0 0 0; font-size: 12px; opacity: 0.8;">${user.email}</p>
        </div>
      </div>
      <div style="text-align: right; font-size: 18px; font-weight: bold;">
        💰 ${user.solde} pts
      </div>
    `
    
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
checkSession()