import './style.css'
import './sections.css'
import { supabase } from './supabaseClient'

// Forcer le z-index du compteur au-dessus de tout
document.addEventListener('DOMContentLoaded', () => {
  const soldeHeader = document.querySelector('#solde-header')
  if (soldeHeader) {
    soldeHeader.style.zIndex = '999999'
    soldeHeader.style.position = 'fixed'
  }
})

// ==================== GESTION DE LA SIDEBAR ====================
const hamburgerMenu = document.querySelector('#hamburger-menu')
const sidebar = document.querySelector('#sidebar')
const sidebarOverlay = document.querySelector('#sidebar-overlay')
const sidebarItems = document.querySelectorAll('.sidebar-item')

let sidebarOpen = false
let lastToggleTime = 0

function toggleSidebar() {
  console.log('Toggle sidebar called, current state:', sidebarOpen)
  
  // Protection anti-rebond : ignorer les appels trop rapides (< 300ms)
  const now = Date.now()
  if (now - lastToggleTime < 300) {
    console.log('Toggle ignoré - trop rapide')
    return
  }
  lastToggleTime = now
  
  sidebarOpen = !sidebarOpen
  
  if (sidebarOpen) {
    console.log('Opening sidebar')
    sidebar.classList.add('open')
    hamburgerMenu.classList.add('sidebar-open')
    sidebarOverlay.style.opacity = '1'
    sidebarOverlay.style.visibility = 'visible'
    hamburgerMenu.classList.add('active')
    
    // Sur mobile uniquement
    if (window.innerWidth < 768) {
      // Déplacer le hamburger vers la droite avec transition
      const hamburgerContainer = document.querySelector('#hamburger-container')
      if (hamburgerContainer) {
        hamburgerContainer.style.left = 'calc(85vw + 12px)'
      }
      
      // Descendre le compteur Wbuck
      setTimeout(() => {
        const soldeHeader = document.querySelector('#solde-header')
        if (soldeHeader) {
          console.log('Moving soldeHeader down')
          soldeHeader.style.setProperty('top', '65px', 'important')
        }
      }, 50)
    }
  } else {
    console.log('Closing sidebar')
    sidebar.classList.remove('open')
    hamburgerMenu.classList.remove('sidebar-open')
    sidebarOverlay.style.opacity = '0'
    sidebarOverlay.style.visibility = 'hidden'
    hamburgerMenu.classList.remove('active')
    
    // Sur mobile uniquement
    if (window.innerWidth < 768) {
      // Remettre le hamburger à gauche avec transition
      const hamburgerContainer = document.querySelector('#hamburger-container')
      if (hamburgerContainer) {
        hamburgerContainer.style.left = '20px'
      }
      
      // Remonter le compteur Wbuck
      setTimeout(() => {
        const soldeHeader = document.querySelector('#solde-header')
        if (soldeHeader) {
          console.log('Moving soldeHeader up')
          soldeHeader.style.setProperty('top', '20px', 'important')
        }
      }, 50)
    }
  }
}

// Ouvrir/fermer au clic sur le hamburger (click + touch pour mobile)
hamburgerMenu.addEventListener('click', (e) => {
  e.preventDefault()
  e.stopPropagation()
  console.log('Hamburger clicked')
  toggleSidebar()
})

// Fermer au clic/touch sur l'overlay
sidebarOverlay.addEventListener('click', (e) => {
  console.log('Overlay clicked, sidebar open:', sidebarOpen)
  if (sidebarOpen) {
    toggleSidebar()
  }
})

sidebarOverlay.addEventListener('touchend', (e) => {
  e.preventDefault()
  console.log('Overlay touched, sidebar open:', sidebarOpen)
  if (sidebarOpen) {
    toggleSidebar()
  }
}, { passive: false })

hamburgerMenu.addEventListener('touchend', (e) => {
  e.preventDefault()
  e.stopPropagation()
  console.log('Hamburger touched')
  toggleSidebar()
}, { passive: false })

// Fermer au clic sur l'overlay
sidebarOverlay.addEventListener('click', toggleSidebar)
sidebarOverlay.addEventListener('touchend', toggleSidebar, { passive: true })

// Gérer les clics sur les items de la sidebar
sidebarItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault()
    
    // Retirer la classe active de tous les items
    sidebarItems.forEach(i => {
      i.style.background = 'transparent'
      i.style.borderLeft = '4px solid transparent'
    })
    
    // Ajouter la classe active à l'item cliqué
    item.style.background = 'rgba(231, 76, 60, 0.1)'
    item.style.borderLeft = '4px solid #e74c3c'
    
    // Récupérer la section
    const section = item.getAttribute('data-section')
    
    // Ici on peut gérer l'affichage des différentes sections
    console.log('Section sélectionnée:', section)
    
    // Fermer la sidebar après sélection
    toggleSidebar()
    
    // TODO: Gérer l'affichage des différentes sections
    handleSectionChange(section)
  })
})

// Fonction pour gérer le changement de section
function handleSectionChange(section) {
  // Masquer toutes les sections
  const sections = document.querySelectorAll('.section-content')
  sections.forEach(s => {
    s.classList.remove('active')
    s.classList.remove('section-enter')
  })
  
  // Afficher la section demandée avec un léger délai pour permettre au navigateur de se préparer
  const targetSection = document.querySelector(`#section-${section}`)
  if (targetSection) {
    // Utiliser requestAnimationFrame pour un rendu plus fluide
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        targetSection.classList.add('active')
        targetSection.classList.add('section-enter')
        // Retirer la classe après l'animation pour qu'elle ne se répète pas
        setTimeout(() => {
          targetSection.classList.remove('section-enter')
        }, 500)
      })
    })
    
    // Initialiser les ecocups 3D si on affiche la section goodies
    if (section === 'merch' && typeof window.createEcocup3D === 'function') {
      setTimeout(() => {
        window.createEcocup3D('#ecocup-normal-3d-canvas', '/goodies/Ecocup.png')
        window.createEcocup3D('#ecocup-3d-canvas', '/goodies/EcocupCollector.png')
      }, 100)
    }
  }
  
  // Masquer les écrans boutique et moi qui ne font pas partie du système de sections
  const boutiqueScreen = document.querySelector('#boutique-screen')
  const moiScreen = document.querySelector('#moi-screen')
  
  if (boutiqueScreen) boutiqueScreen.style.display = 'none'
  if (moiScreen) moiScreen.style.display = 'none'
  
  console.log('Section affichée:', section)
}

// Gérer le redimensionnement de la fenêtre
window.addEventListener('resize', () => {
  if (sidebarOpen) {
    // Si la sidebar est ouverte, la refermer lors du resize pour éviter les bugs
    toggleSidebar()
  }
})

// ==================== GESTION DU PROGRAMME EXPANDABLE ====================
function toggleProgramme(id) {
  const item = document.getElementById(`programme-${id}`)
  if (item) {
    const parent = item.closest('.programme-item-expand')
    if (parent) {
      parent.classList.toggle('open')
    }
  }
}

// Rendre la fonction accessible globalement
window.toggleProgramme = toggleProgramme

// ==================== GESTION DES MEMBRES DE L'ÉQUIPE ====================
const membersData = {
  'president': {
    name: 'Victor Lavieville',
    role: 'Président',
    pole: 'Le Bureau',
    description: 'Parti de 0, je suis passé par respo évent, trez, puis vice-prez pendant 1 mois, pour au final devenir Président de Wild Ember. ',
    photo: '/photos/compresse/Victor.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=100093944988385&locale=fr_FR'
  },
  'vice-president': {
    name: 'Lila Beckaert',
    role: 'Vice-Présidente',
    pole: 'Le Bureau',
    description: 'J\'ai raté pas mal de réunions j\'ai le sommeil un peu lourd, mais je suis extrêmement heureuse et motivée d\'être vice présidente!! ',
    photo: '/photos/compresse/Lila.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=61564787956888&locale=fr_FR'
  },
  'tresorier': {
    name: 'Enekio Olhagaray',
    role: 'Trésorier',
    pole: 'Le Bureau',
    description: ' Si j\'ai un seul truc à dire, c\'est merci Boursobank pour vos parrainages sinon on était cook ! !',
    photo: '/photos/compresse/Enekio.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=61565158467716&locale=fr_FR'
  },
  'secretaire': {
    name: 'Camille Gommane',
    role: 'Secrétaire',
    pole: 'Le Bureau',
    description: 'J\'ai passé 5 mois à concevoir le planning du torcho car d\'après les happenings prévus par louis il faudrait 36 staffeurs (help)!! ',
    photo: '/photos/compresse/Camille.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/camille.gomanne.7?locale=fr_FR'
  },
  'respolog': {
    name: 'Andréas Deléage',
    role: 'Respo Log',
    pole: 'Pôle L3D',
    description: 'Fini pour moi les poissons et le peppermint, cette année je suis respo log et j\'organise des merveilleux WEL!!',
    photo: '/photos/compresse/Andreas.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/andreas.delage?locale=fr_FR'
  },
  'respocomm': {
    name: 'Félix Perrier',
    role: 'Respo Comm',
    pole: 'Pôle Communication',
    description: 'Anciennement connu comme le plus gros paresseux dans le pôle com de Pearl, j\'ai redoublé de travail pour proposer une Comm à la hauteur de Wild Ember ! ',
    photo: '/photos/compresse/Felix.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/felix.perruer?locale=fr_FR'
  },
  'corespocomm': {
    name: 'Margaux Regnault',
    role: 'Co Respo Comm',
    pole: 'Pôle Communication',
    description: 'Définitivement l\'IE1 la plus boostée, j\'ai entièrement conçu le feed insta des WILD EMBER en y cachant un maximum de références pour vous régaler ! ',
    photo: '/photos/compresse/Margaux.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=61577975832522&locale=fr_FR'
  },
  'comm1': {
    name: 'Nathanaël Fontaine',
    role: 'Comm',
    pole: 'Pôle Communication',
    description: 'La Comm n\'étant définitivement pas faite pour moi, je suis parti aider mon ami Enekio dans sa récolte obscure d\'argent ! !',
    photo: '/photos/compresse/Nathanael.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=61550998131678&locale=fr_FR'
  },
  'comm2': {
    name: 'Léa Bouquet',
    role: 'Comm',
    pole: 'Pôle Communication',
    description: 'Bien qu\'ayant un emploi du temps de ministre, j\'ai su aider mon pôle comm par ma créativité débordante et mon énergie inépuisable ! !',
    photo: '/photos/compresse/Lea.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=100081868824804&locale=fr_FR'
  },
  'comm3': {
    name: 'Ethan Nesen',
    role: 'Comm',
    pole: 'Pôle Communication',
    description: 'Je n\'ai pas trop la vision en comm, donc j\'ai préféré bâtir à côté mon propre pôle musique pour ambiancer les Wild ! !',
    photo: '/photos/compresse/Ethan.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=61555701656084&locale=fr_FR'
  },
  'respoevent': {
    name: 'Louis Raclin',
    role: 'Respo Event',
    pole: 'Pôle Événementiel',
    description: 'Je suis un gros bébé qui mange pas mais j\'organise des événements plus que mémorables pour nos campagnes BDI ! !',
    photo: '/photos/compresse/Louis.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=61564941304268&locale=fr_FR'
  },
  'event1': {
    name: 'Jeanne Portail',
    role: 'Event',
    pole: 'Pôle Événementiel',
    description: 'Jongleuse entre la Comm, l\'event, j\'ai finalement trouvé ma place en tant que Respo déco ! !',
    photo: '/photos/compresse/Jeanne.jpg',
    contact: [],
    facebook: ''
  },
  'event2': {
    name: 'Sacha Tiberghien',
    role: 'Event',
    pole: 'Pôle Événementiel',
    description: 'Acteur important du film des Wilds, y\'a pas grand chose de plus en fait c\'est déjà bien...',
    photo: '/photos/compresse/Sacha.jpg',
    contact: [],
    facebook: ''
  },
  'event3': {
    name: 'Soline Zanatta',
    role: 'Event',
    pole: 'Pôle Événementiel',
    description: 'Ils ont voulu m\'appeler "Paff ou Puff", alors que je veux juste les puffs...',
    photo: '/photos/compresse/Soline.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=61578837955154&locale=fr_FR'
  },
  'event4': {
    name: 'Antoine Jouillerot',
    role: 'Event',
    pole: 'Pôle Événementiel',
    description: 'Travailleur la journée et charmeur la nuit, je sais alterner entre mes deux seules qualités...',
    photo: '/photos/compresse/Antoine.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=100081589205324&locale=fr_FR'
  },
 
  'respodem': {
    name: 'Lucas Bels',
    role: 'Respo Dém',
    pole: 'Pôle L3D',
    description: 'Pour moi pas de réu sans avoir bu, la vodka m\'aide à réflechir j\'y peux rien!!',
    photo: '/photos/compresse/Lucas.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=61564758462340&locale=fr_FR'
  },
  'dem1': {
    name: 'Joseph Simon',
    role: 'Dém',
    pole: 'Pôle L3D',
    description: 'Le mec chill de la liste, je suis présent aux réunions mais je pars aux ski la veille des campagnes parce que pourquoi pas.',
    photo: '/photos/compresse/Joseph.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=100040809643761&locale=fr_FR'
  },
  'respodd': {
    name: 'Max Hareng',
    role: 'Respo DD',
    pole: 'Pôle L3D',
    description: 'l\'IE1 le plus distrait de la liste, j\'ai repoussé mon travail de DD jusqu\'au bout, le prochain fillot sera la relève ! !',
    photo: '/photos/compresse/Max.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=61556459168175&locale=fr_FR'
  },
  'respofilm': {
    name: 'Félix Perrier',
    role: 'Respo Film',
    pole: 'Pôle Production',
    description: 'Digne de Steven Spielberg, caméra à la main j\'ai capturé les plus beaux moments de Wild Ember ! ',
    photo: '/photos/compresse/Felix.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/felix.perruer?locale=fr_FR'
  },
  'respomusique': {
    name: 'Ethan Nesen',
    role: 'Respo Musique',
    pole: 'Pôle Production',
    description: 'La musique c\'est mon domaine, plusieurs nuits blanches à écrire, poser et tourner des morceaux pour ambiancer les Wilds ! !',
    photo: '/photos/compresse/Ethan.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/profile.php?id=61555701656084&locale=fr_FR'
  },
  'resposite': {
    name: 'Félix Perrier',
    role: 'Respo Site',
    pole: 'Pôle Production',
    description: 'Mesghouni et Dangoumau seraient fiers de moi, dommage j\'ai pas laché cette perf au bon moment',
    photo: '/photos/compresse/Felix.jpg',
    contact: [],
    facebook: 'https://www.facebook.com/felix.perruer?locale=fr_FR'
  },
}

// Modale membre
const memberModal = document.querySelector('#member-modal')
const memberPhoto = document.querySelector('#member-photo')
const memberPhotoPlaceholder = document.querySelector('#member-photo-placeholder')
const memberName = document.querySelector('#member-name')
const memberRoleBadge = document.querySelector('#member-role-badge')
const memberPole = document.querySelector('#member-pole')
const memberDescription = document.querySelector('#member-description')
const memberContact = document.querySelector('#member-contact')
const memberFacebook = document.querySelector('#member-facebook')
const btnCloseMember = document.querySelector('#btn-close-member')

// Gérer les clics sur les tags de membres
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('member-tag')) {
    const memberId = e.target.getAttribute('data-member')
    const member = membersData[memberId]
    
    if (member) {
      // Remplir la modale
      memberName.textContent = member.name
      memberRoleBadge.textContent = member.role
      memberPole.textContent = member.pole
      memberDescription.textContent = member.description
      
      // Photo
      memberPhoto.src = member.photo
      memberPhoto.onerror = () => {
        memberPhoto.style.display = 'none'
        memberPhotoPlaceholder.style.display = 'flex'
      }
      memberPhoto.onload = () => {
        memberPhoto.style.display = 'block'
        memberPhotoPlaceholder.style.display = 'none'
      }
      
      // Contact
      memberContact.innerHTML = ''
      member.contact.forEach(contact => {
        const contactTag = document.createElement('span')
        contactTag.style.cssText = 'background: rgba(231, 76, 60, 0.1); color: #e74c3c; padding: 6px 12px; border-radius: 15px; font-size: 13px; font-weight: 600;'
        contactTag.textContent = contact
        memberContact.appendChild(contactTag)
      })
      
      // Facebook
      if (member.facebook) {
        memberFacebook.href = member.facebook
        memberFacebook.style.display = 'block'
      } else {
        memberFacebook.style.display = 'none'
      }
      
      // Afficher la modale
      memberModal.classList.remove('hidden')
    }
  }
})

// Fermer la modale
btnCloseMember.addEventListener('click', () => {
  memberModal.classList.add('hidden')
})

memberModal.addEventListener('click', (e) => {
  if (e.target === memberModal) {
    memberModal.classList.add('hidden')
  }
})

// ==================== GESTION CLIC SUR PHOTOS DE PÔLES ====================
const polePhotoModal = document.querySelector('#pole-photo-modal')
const polePhotoLarge = document.querySelector('#pole-photo-large')
const btnClosePolePhoto = document.querySelector('#btn-close-pole-photo')

// Ajouter événement de clic sur toutes les photos de pôles
document.addEventListener('click', (e) => {
  const poleImage = e.target.closest('.pole-image')
  if (poleImage) {
    const img = poleImage.querySelector('img')
    if (img && img.src && !img.src.includes('placeholder')) {
      polePhotoLarge.src = img.src
      polePhotoModal.classList.remove('hidden')
    }
  }
  
  // Clic sur la photo de groupe
  const groupPhotoContainer = e.target.closest('.group-photo-container')
  if (groupPhotoContainer) {
    const img = groupPhotoContainer.querySelector('.group-photo-img')
    if (img && img.src) {
      polePhotoLarge.src = img.src
      polePhotoModal.classList.remove('hidden')
    }
  }
})

// Fermer la modale photo
btnClosePolePhoto.addEventListener('click', () => {
  polePhotoModal.classList.add('hidden')
})

polePhotoModal.addEventListener('click', (e) => {
  if (e.target === polePhotoModal || e.target === polePhotoLarge) {
    polePhotoModal.classList.add('hidden')
  }
})

// ==================== GESTION DES ONGLETS DU MENU ====================
const formInscription = document.querySelector('#form-inscription')
const formConnexion = document.querySelector('#form-connexion')
const tabNouveau = document.querySelector('#tab-nouveau')
const tabConnu = document.querySelector('#tab-connu')

tabNouveau.addEventListener('click', () => {
  formInscription.style.display = 'block'
  formConnexion.style.display = 'none'
  tabNouveau.style.background = '#ddd'
  tabConnu.style.background = 'linear-gradient(135deg, #F5E6D3 0%, #E8D4BA 100%)'
})

tabConnu.addEventListener('click', () => {
  formInscription.style.display = 'none'
  formConnexion.style.display = 'block'
  tabNouveau.style.background = 'linear-gradient(135deg, #F5E6D3 0%, #E8D4BA 100%)'
  tabConnu.style.background = '#ddd'
  
  // Pré-remplir si nouveau compte créé
  const newEmail = localStorage.getItem('newAccountEmail')
  const newPassword = localStorage.getItem('newAccountPassword')
  if (newEmail && newPassword) {
    document.querySelector('#email-connexion').value = newEmail
    document.querySelector('#code-connexion').value = newPassword
  }
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
  
  if (nom === 'home') {
    homeScreen.classList.remove('hidden')
    hamburgerMenu.style.display = 'none'
  }
  if (nom === 'login') {
    loginScreen.classList.remove('hidden')
    hamburgerMenu.style.display = 'none'
  }
  if (nom === 'otp') {
    otpScreen.classList.remove('hidden')
    hamburgerMenu.style.display = 'none'
  }
  if (nom === 'welcome') {
    welcomeScreen.classList.remove('hidden')
    hamburgerMenu.style.display = 'block'
    hamburgerMenu.style.pointerEvents = 'auto'
    console.log('Menu hamburger affiché, display:', hamburgerMenu.style.display)
    console.log('Menu hamburger visible:', hamburgerMenu.offsetWidth > 0)
    // Afficher la section campagne par défaut lors de la connexion
    handleSectionChange('campagne')
  }
}

// ==================== 1. INSCRIPTION (email → code email → validation → mot de passe → connexion) ====================
let etapeInscription = 'email' // 'email', 'otp', ou 'complete'

// Empêcher rechargement mais laisser Safari détecter le submit
document.querySelector('#signup-form').addEventListener('submit', (e) => {
  e.preventDefault() // Empêche le rechargement
  console.log('Formulaire soumis - Safari va détecter')
})

// ==================== VALIDATION DES CHAMPS EN TEMPS RÉEL ====================
const emailInscription = document.querySelector('#email-inscription')
const otpInput = document.querySelector('#otp')
const btnSendOtp = document.querySelector('#btn-send-otp')

// Vérifier les champs d'inscription
function verifierChampsInscription() {
  if (etapeInscription === 'email') {
    // Étape email : activer si email valide
    const emailValide = emailInscription.value.trim().includes('@')
    btnSendOtp.disabled = !emailValide
  } else if (etapeInscription === 'otp') {
    // Étape OTP : activer si 8 chiffres
    const codeValide = otpInput.value.trim().length === 8
    btnSendOtp.disabled = !codeValide
  }
}

emailInscription.addEventListener('input', verifierChampsInscription)
otpInput.addEventListener('input', verifierChampsInscription)

// Vérifier les champs de connexion
const emailConnexion = document.querySelector('#email-connexion')
const codeConnexion = document.querySelector('#code-connexion')
const btnLoginCode = document.querySelector('#btn-login-code')

function verifierChampsConnexion() {
  const emailValide = emailConnexion.value.trim().includes('@')
  const codeValide = codeConnexion.value.trim().length === 8
  btnLoginCode.disabled = !(emailValide && codeValide)
}

emailConnexion.addEventListener('input', verifierChampsConnexion)
codeConnexion.addEventListener('input', verifierChampsConnexion)

// Initialiser les boutons comme désactivés
btnSendOtp.disabled = true
btnLoginCode.disabled = true

document.querySelector('#btn-send-otp').addEventListener('click', async () => {
  const btnSendOtp = document.querySelector('#btn-send-otp')
  const email = document.querySelector('#email-inscription').value.trim().toLowerCase()
  
  // ÉTAPE 1 : Envoyer le code OTP de Supabase
  if (etapeInscription === 'email') {
    if (!email) {
      afficherMessageNFC('', 'Email manquant', 'Entre ton email étudiant !', '#f39c12');
      return
    }

    // Vérifier que l'email est d'une école autorisée
    const domainesAutorises = ['centralelille.fr', 'iteem.centralelille.fr', 'enscl.centralelille.fr', 'centrale.centralelille.fr']
    const domainEmail = email.split('@')[1]
    
    if (!domainEmail || !domainesAutorises.includes(domainEmail)) {
      afficherMessageNFC('', 'Email non autorisé', 'Tu dois utiliser ton email étudiant : centralelille.fr, iteem.centralelille.fr, enscl.centralelille.fr ou centrale.centralelille.fr', '#f39c12');
      return
    }

    // Vérifier si le compte existe déjà
    const { data: existant } = await supabase
      .from('etudiants')
      .select('email')
      .eq('email', email)
      .single()
    
    if (existant) {
      afficherMessageNFC('', 'Compte existant', 'Ce compte existe déjà ! Clique sur "Se connecter".', '#f39c12');
      return
    }
    
    console.log("Envoi du code OTP...")
    
    // Envoyer le code OTP de Supabase
    const { error } = await supabase.auth.signInWithOtp({ email: email })
    
    if (error) {
      console.error("Erreur envoi email:", error)
      afficherMessageNFC('', 'Erreur', error.message, '#e74c3c');
      return
    }
    
    // Stocker temporairement
    localStorage.setItem('emailTemp', email)
    
    // Afficher la zone OTP
    document.querySelector('#email-inscription').disabled = true
    document.querySelector('#otp-section').style.display = 'block'
    btnSendOtp.textContent = 'Valider le code'
    etapeInscription = 'otp'
    
    // Réinitialiser le bouton comme désactivé
    btnSendOtp.disabled = true
    verifierChampsInscription()
  }
  // ÉTAPE 2 : Vérifier le code OTP
  else if (etapeInscription === 'otp') {
    const codeOTP = document.querySelector('#otp').value.trim()
    
    if (!codeOTP || codeOTP.length !== 8) {
      afficherMessageNFC('', 'Code invalide', 'Le code doit contenir 8 chiffres !', '#f39c12');
      return
    }
    
    console.log("Validation du code...")
    
    // 1. Vérifier le code OTP (crée la session)
    const { error: verifyError } = await supabase.auth.verifyOtp({ 
      email: email, 
      token: codeOTP, 
      type: 'email'
    })
    
    if (verifyError) {
      console.error("Erreur validation:", verifyError)
      afficherMessageNFC('', 'Code incorrect', 'Code invalide ou expiré', '#e74c3c');
      return
    }
    
    console.log("Code validé ✓")
    
    // 2. Définir le code comme mot de passe permanent dans Supabase Auth
    const { error: passwordError } = await supabase.auth.updateUser({
      password: codeOTP
    })
    
    if (passwordError) {
      console.error("Erreur mot de passe:", passwordError)
    }
    
    // 3. Créer l'étudiant dans la base
    const { error: insertError } = await supabase
      .from('etudiants')
      .insert([{ email: email, code_perso: codeOTP, solde: 0 }])

    if (insertError && !insertError.message.includes('duplicate')) {
      console.error("Erreur création:", insertError)
    }
    
    // 4. Succès - rediriger vers l'accueil
    afficherMessageNFC('', 'Compte créé !', `Ton mot de passe : <strong>${codeOTP}</strong>`, '#2ecc71');
    
    // Marquer pour refresh après connexion
    localStorage.setItem('needsRefreshForSafari', 'true')
    
    setTimeout(() => {
      checkSession()
    }, 1200)
  }
})

// ==================== 3. CONNEXION DIRECTE (Code uniquement) 🚀 ====================
// Intercepter la soumission du formulaire de connexion
document.querySelector('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault() // Empêcher le rechargement de la page
  
  const email = document.querySelector('#email-connexion').value.trim().toLowerCase()
  const code = document.querySelector('#code-connexion').value.trim()

  if (!email) {
    afficherMessageNFC('', 'Email manquant', 'Entre ton email !', '#f39c12');
    return
  }

  if (!code || code.length < 6) {
    afficherMessageNFC('', 'Code manquant', 'Rentre ton code !', '#f39c12');
    return
  }

  console.log("Tentative connexion:", email, "avec code:", code)

  const { data: student } = await supabase
    .from('etudiants')
    .select('email, code_perso')
    .eq('email', email)
    .eq('code_perso', code)
    .single()

  console.log("Étudiant trouvé:", student)

  if (!student) {
    afficherMessageNFC('', 'Erreur', 'Email ou code incorrect !', '#e74c3c');
    return
  }

  console.log("Connexion Supabase Auth avec:", student.email, code)

  const { error } = await supabase.auth.signInWithPassword({
    email: student.email,
    password: code
  })

  console.log("Résultat connexion:", error ? error.message : "OK")

  if (error) {
    afficherMessageNFC('', 'Erreur', 'Impossible de se connecter. Code incorrect ou compte non configuré.', '#e74c3c');
    console.error("Détail erreur:", error)
  } else {
    checkSession()
  }
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
    
    // Refresh pour Safari après être arrivé sur la page d'accueil
    if (localStorage.getItem('needsRefreshForSafari') === 'true') {
      localStorage.removeItem('needsRefreshForSafari')
      setTimeout(() => location.reload(), 500)
    }
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
    if (jeSuisAdmin) console.log("MODE ADMIN ACTIVÉ")
    if (jeSuisBoutiqueManager) {
      console.log("MODE GESTIONNAIRE BOUTIQUE ACTIVÉ")
      
      // Afficher le bouton Mode Édition
      const btnEditMode = document.querySelector('#btn-toggle-edit-mode')
      btnEditMode.style.display = 'block'
      
      // Initialiser l'état du bouton
      const icon = document.querySelector('#edit-mode-icon')
      const text = document.querySelector('#edit-mode-text')
      if (modeEdition) {
        btnEditMode.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)'
        btnEditMode.style.color = 'white'
        icon.textContent = '🔓'
      } else {
        btnEditMode.style.background = 'rgba(255, 255, 255, 0.95)'
        btnEditMode.style.color = '#333'
        icon.textContent = '🔒'
      }
      
      // Ajouter le listener
      btnEditMode.addEventListener('click', toggleModeEdition)
    }
    displayWelcomeScreen(emailUser)
  } else {
    console.warn("Étudiant non trouvé après vérification")
  }
}

async function displayWelcomeScreen(userEmail) {
  currentUserEmail = userEmail
  try {
    // D'abord récupérer tous les étudiants
    const { data: etudiants, error: etudiantsError } = await supabase
      .from('etudiants')
      .select('*')
    
    if (etudiantsError) {
      console.error("Erreur récupération étudiants:", etudiantsError)
      allUsers = []
      return
    }
    
    // Ensuite récupérer toutes les transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('destinataire_email, montant')
    
    if (transactionsError) {
      console.error("Erreur récupération transactions:", transactionsError)
    }
    
    // Récupérer tous les achats
    const { data: achats, error: achatsError } = await supabase
      .from('achats')
      .select('acheteur_email, prix_paye')
    
    if (achatsError) {
      console.error("Erreur récupération achats:", achatsError)
    }
    
    // Calculer le total des gains et le solde réel pour chaque étudiant
    allUsers = (etudiants || [])
      .filter(etudiant => !etudiant.is_admin) // Exclure les admins du classement
      .map(etudiant => {
      const userTransactions = (transactions || []).filter(t => t.destinataire_email === etudiant.email)
      const totalGains = userTransactions
        .filter(t => t.montant > 0)
        .reduce((sum, t) => sum + t.montant, 0)
      
      // Calculer le total des achats
      const userAchats = (achats || []).filter(a => a.acheteur_email === etudiant.email)
      const totalAchats = userAchats.reduce((sum, a) => sum + a.prix_paye, 0)
      
      return {
        ...etudiant,
        total_gains: totalGains, // Pour le classement (entrées seulement)
        solde_reel: totalGains - totalAchats // Pour le solde actuel (entrées - sorties)
      }
    }).sort((a, b) => b.total_gains - a.total_gains)
    
    const userIndex = allUsers.findIndex(u => u.email === userEmail)
    if (userIndex >= 0) {
      const currentUser = allUsers[userIndex]
      const rawName = userEmail.split('@')[0]
      const formattedName = rawName
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
      const rank = userIndex + 1
      const rankText = rank === 1 ? '1ère place' : rank === 2 ? '2ème place' : rank === 3 ? '3ème place' : `${rank}ème place`
      
      userRank.textContent = rankText
      userName.textContent = formattedName.toUpperCase()
      userSolde.innerHTML = `${currentUser.total_gains} <img src="/Wbuck.png" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 5px;" />`
      
      const soldeHeader = document.querySelector('#solde-header-amount')
      if (soldeHeader) soldeHeader.textContent = currentUser.solde_reel
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
    alert('+10 points !')
  } catch (err) {
    console.error("Erreur:", err)
    alert("Une erreur s'est produite")
  }
}

function afficherClassement(users) {
  leaderboard.innerHTML = ''

  users.forEach((user, index) => {
    const isCurrentUser = user.email === currentUserEmail
    
    // Trouver le VRAI rang dans le classement complet (allUsers)
    const vraiRang = allUsers.findIndex(u => u.email === user.email) + 1
    const badge = vraiRang === 1 ? '1.' : vraiRang === 2 ? '2.' : vraiRang === 3 ? '3.' : `${vraiRang}.`
    
    // Couleurs pour les 3 premiers du classement RÉEL
    let bgColor = 'white'
    let textColor = '#333'
    let borderColor = '#ddd'
    
    if (isCurrentUser) {
      bgColor = '#667eea'
      textColor = 'white'
      borderColor = '#667eea'
    } else if (vraiRang === 1) {
      // Or
      bgColor = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
      textColor = '#333'
      borderColor = '#FFD700'
    } else if (vraiRang === 2) {
      // Argent
      bgColor = 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)'
      textColor = '#333'
      borderColor = '#C0C0C0'
    } else if (vraiRang === 3) {
      // Bronze
      bgColor = 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)'
      textColor = 'white'
      borderColor = '#CD7F32'
    }
    
    const userRow = document.createElement('div')
    userRow.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      margin-bottom: 8px;
      background: ${bgColor};
      color: ${textColor};
      border-radius: 8px;
      border: 2px solid ${borderColor};
      font-weight: ${isCurrentUser || vraiRang <= 3 ? 'bold' : 'normal'};
      overflow: hidden;
      gap: 12px;
    `
    
    // Formater le nom : remplacer les points par des espaces et mettre en majuscule
    const rawName = user.email.split('@')[0]
    const formattedName = rawName
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
    
    userRow.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; overflow: hidden;">
        <span style="font-size: 18px; flex-shrink: 0;">${badge}</span>
        <div style="min-width: 0; overflow: hidden; flex: 1; cursor: ${jeSuisAdmin ? 'pointer' : 'default'};">
          <p style="margin: 0; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${formattedName}</p>
        </div>
      </div>
      <div style="text-align: right; font-size: 15px; font-weight: bold; flex-shrink: 0; white-space: nowrap; padding-left: 8px; display: flex; align-items: center; gap: 5px;">
        ${user.total_gains} <img src="/Wbuck.png" style="width: 16px; height: 16px;" />
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
  document.querySelector('#otp').disabled = false
  document.querySelector('#otp-section').style.display = 'none'
  document.querySelector('#btn-send-otp').textContent = 'Recevoir mon code'
  document.querySelector('#btn-send-otp').type = 'button'
  
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
  document.querySelector('#btn-send-otp').textContent = 'Recevoir mon code'
  document.querySelector('#btn-send-otp').type = 'button'
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
  document.body.style.overflow = 'hidden'
}

// Bouton Annuler
document.querySelector('#btn-cancel-admin').addEventListener('click', () => {
  adminModal.classList.add('hidden')
  document.body.style.overflow = ''
})

// Bouton Ajouter Points (Transaction - compte dans le classement)
document.querySelector('#btn-add-points').addEventListener('click', async () => {
  const montant = parseInt(document.querySelector('#admin-amount').value)
  const raison = document.querySelector('#admin-reason').value.trim()

  // Vérifier que le montant est positif et qu'il y a une raison
  if (isNaN(montant) || montant <= 0 || !raison) {
    alert('❌ Veuillez entrer un montant positif et une raison')
    return
  }

  try {
    // 1. Récupérer le solde actuel de l'utilisateur
    const { data: userData, error: fetchError } = await supabase
      .from('etudiants')
      .select('solde')
      .eq('email', cibleEmail)
      .single()

    if (fetchError) {
      console.error("Erreur récupération solde:", fetchError)
      alert('❌ Erreur lors de la récupération du solde')
      return
    }

    const nouveauSolde = (userData.solde || 0) + montant

    // 2. Mettre à jour le solde
    const { error: updateError } = await supabase
      .from('etudiants')
      .update({ solde: nouveauSolde })
      .eq('email', cibleEmail)

    if (updateError) {
      console.error("Erreur mise à jour solde:", updateError)
      alert('❌ Erreur lors de la mise à jour du solde')
      return
    }

    // 3. Enregistrer la transaction
    const transactionData = {
      destinataire_email: cibleEmail,
      montant: montant,
      raison: raison
    }
    
    // Ajouter admin_email seulement si défini
    if (emailAdmin) {
      transactionData.admin_email = emailAdmin
    }
    
    console.log("Insertion transaction:", transactionData)
    
    const { error: errorTransac } = await supabase
      .from('transactions')
      .insert([transactionData])

    if (errorTransac) {
      console.error("Erreur log transaction:", errorTransac)
      alert('❌ Erreur lors de l\'enregistrement de la transaction')
      return
    }
    
    console.log("Transaction enregistrée avec succès")
    
    // 4. Rafraîchir la page
    location.reload()
  } catch (err) {
    console.error("Erreur complète:", err)
    alert('❌ Une erreur inattendue s\'est produite')
  }
})

// Bouton Retirer Points (Achat - ne compte PAS dans le classement)
document.querySelector('#btn-remove-points').addEventListener('click', async () => {
  const montant = parseInt(document.querySelector('#admin-amount').value)
  const raison = document.querySelector('#admin-reason').value.trim()

  // Vérifier que le montant est positif et qu'il y a une raison
  if (isNaN(montant) || montant <= 0 || !raison) {
    alert('❌ Veuillez entrer un montant positif à retirer et une raison')
    return
  }

  try {
    // 1. Récupérer le solde actuel de l'utilisateur
    const { data: userData, error: fetchError } = await supabase
      .from('etudiants')
      .select('solde')
      .eq('email', cibleEmail)
      .single()

    if (fetchError) {
      console.error("Erreur récupération solde:", fetchError)
      alert('❌ Erreur lors de la récupération du solde')
      return
    }

    const nouveauSolde = (userData.solde || 0) - montant

    // Vérifier que le nouveau solde ne sera pas négatif
    if (nouveauSolde < 0) {
      alert(`❌ Impossible : le solde deviendrait négatif (${nouveauSolde} Wbucks)`)
      return
    }

    // 2. Mettre à jour le solde
    const { error: updateError } = await supabase
      .from('etudiants')
      .update({ solde: nouveauSolde })
      .eq('email', cibleEmail)

    if (updateError) {
      console.error("Erreur mise à jour solde:", updateError)
      alert('❌ Erreur lors de la mise à jour du solde')
      return
    }

    // 3. Créer un "achat" (retrait administratif)
    const achatData = {
      acheteur_email: cibleEmail,
      nom: `⚠️ Retrait Admin: ${raison}`,
      prix_paye: montant,
      date_achat: new Date().toISOString()
    }
    
    console.log("Insertion achat (retrait):", achatData)
    
    const { error: errorAchat } = await supabase
      .from('achats')
      .insert([achatData])

    if (errorAchat) {
      console.error("Erreur log achat:", errorAchat)
      alert('❌ Erreur lors de l\'enregistrement du retrait')
      return
    }
    
    console.log("Retrait enregistré avec succès")
    
    // 4. Rafraîchir la page
    location.reload()
  } catch (err) {
    console.error("Erreur complète:", err)
    alert('❌ Une erreur inattendue s\'est produite')
  }
})

// ==================== ONGLETS CLASSEMENT/BOUTIQUE ====================
const tabClassement = document.querySelector('#tab-classement')
const tabBoutique = document.querySelector('#tab-boutique')
const tabMoi = document.querySelector('#tab-moi')
const classementScreen = document.querySelector('#classement-screen')
const boutiqueScreen = document.querySelector('#boutique-screen')
const moiScreen = document.querySelector('#moi-screen')

let jeSuisBoutiqueManager = false
let modeEdition = localStorage.getItem('modeEdition') === 'true'
let objetEnCoursAchat = null

// Fonction pour activer/désactiver le mode édition
function toggleModeEdition() {
  modeEdition = !modeEdition
  localStorage.setItem('modeEdition', modeEdition)
  
  const btn = document.querySelector('#btn-toggle-edit-mode')
  const icon = document.querySelector('#edit-mode-icon')
  const text = document.querySelector('#edit-mode-text')
  
  if (modeEdition) {
    btn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)'
    btn.style.color = 'white'
    icon.textContent = '🔓'
    text.textContent = 'Mode Édition'
  } else {
    btn.style.background = 'rgba(255, 255, 255, 0.95)'
    btn.style.color = '#333'
    icon.textContent = '🔒'
    text.textContent = 'Mode Édition'
  }
  
  // Recharger les sections actives
  if (document.querySelector('#boutique-screen').classList.contains('active')) {
    chargerObjetsBoutique()
  }
  if (document.querySelector('#section-challenge').classList.contains('active')) {
    loadChallenges()
  }
}

// Gestion des onglets principaux
tabClassement.addEventListener('click', () => {
  classementScreen.style.display = 'block'
  boutiqueScreen.style.display = 'none'
  moiScreen.style.display = 'none'
  tabClassement.style.background = 'linear-gradient(135deg, #B8956A 0%, #A67C52 100%)'
  tabClassement.style.color = 'white'
  tabBoutique.style.background = 'linear-gradient(135deg, #F5E6D3 0%, #E8D4BA 100%)'
  tabBoutique.style.color = '#333'
  tabMoi.style.background = 'linear-gradient(135deg, #F5E6D3 0%, #E8D4BA 100%)'
  tabMoi.style.color = '#333'
  
  // Afficher la section campagne par défaut
  handleSectionChange('campagne')
})

tabBoutique.addEventListener('click', async () => {
  classementScreen.style.display = 'none'
  boutiqueScreen.style.display = 'block'
  moiScreen.style.display = 'none'
  tabClassement.style.background = 'linear-gradient(135deg, #F5E6D3 0%, #E8D4BA 100%)'
  tabClassement.style.color = '#333'
  tabBoutique.style.background = 'linear-gradient(135deg, #B8956A 0%, #A67C52 100%)'
  tabBoutique.style.color = 'white'
  tabMoi.style.background = 'linear-gradient(135deg, #F5E6D3 0%, #E8D4BA 100%)'
  tabMoi.style.color = '#333'
  
  await chargerObjetsBoutique()
  
  // Écouter les changements en temps réel UNIQUEMENT pour les objets publiés (sauf admin)
  const realtimeFilter = jeSuisBoutiqueManager 
    ? { event: '*', schema: 'public', table: 'objets_boutique' }
    : { event: '*', schema: 'public', table: 'objets_boutique', filter: 'is_published=eq.true' }
  
  supabase
    .channel('boutique-changes')
    .on('postgres_changes', realtimeFilter, () => {
      console.log('Changement détecté dans la boutique, rechargement...')
      chargerObjetsBoutique()
    })
    .subscribe()
})

tabMoi.addEventListener('click', async () => {
  classementScreen.style.display = 'none'
  boutiqueScreen.style.display = 'none'
  moiScreen.style.display = 'block'
  tabClassement.style.background = 'linear-gradient(135deg, #F5E6D3 0%, #E8D4BA 100%)'
  tabClassement.style.color = '#333'
  tabBoutique.style.background = 'linear-gradient(135deg, #F5E6D3 0%, #E8D4BA 100%)'
  tabBoutique.style.color = '#333'
  tabMoi.style.background = 'linear-gradient(135deg, #B8956A 0%, #A67C52 100%)'
  tabMoi.style.color = 'white'
  
  await chargerMesAchats()
  await chargerMesGains()
})

// ==================== FONCTIONS BOUTIQUE ====================

async function chargerObjetsBoutique() {
  // Filtre selon le mode
  let query = supabase
    .from('objets_boutique')
    .select('*')
  
  if (jeSuisBoutiqueManager && modeEdition) {
    // Super admin EN MODE ÉDITION : voir tout sauf les objets supprimés
    query = query.eq('admin_deleted', false)
  } else {
    // Tous les autres (y compris super admin en mode normal) : seulement objets publiés
    query = query.eq('is_published', true).eq('admin_deleted', false)
  }
  
  const { data: objets, error } = await query.order('created_at', { ascending: true })
  
  if (error) {
    console.error('Erreur chargement objets:', error)
    return
  }
  
  // Afficher les boutons si gestionnaire en mode édition
  const btnAjout = document.querySelector('#btn-ajouter-objet')
  const btnActualiser = document.querySelector('#btn-actualiser-boutique')
  
  if (jeSuisBoutiqueManager && modeEdition) {
    btnAjout?.classList.remove('hidden')
    btnActualiser?.classList.remove('hidden')
    
    // Compter seulement les objets non publiés (en attente)
    const objetsNonPublies = objets.filter(o => !o.is_published).length
    
    if (objetsNonPublies > 0 && btnActualiser) {
      btnActualiser.textContent = `📢 Actualiser (${objetsNonPublies})`
    } else if (btnActualiser) {
      btnActualiser.textContent = '📢 Actualiser'
    }
  } else {
    btnAjout?.classList.add('hidden')
    btnActualiser?.classList.add('hidden')
  }
  
  // Créer la grille
  const grid = document.querySelector('#objets-grid')
  grid.innerHTML = ''
  
  objets.forEach(objet => {
    const estEpuise = objet.quantite <= 0
    const taille = objet.taille || 'petit'
    const isTombola = objet.is_tombola || false
    const tombolaTerminee = objet.tombola_terminee || false
    const isGratuit = objet.is_gratuit || false
    
    // Définir le nombre de colonnes occupées (grille de 6)
    let gridColumn = ''
    if (taille === 'gros') gridColumn = 'span 6'        // 1 par ligne
    else if (taille === 'moyen') gridColumn = 'span 4'  // ~2/3 de ligne
    else if (taille === 'large') gridColumn = 'span 3'  // 1/2 ligne (2 par ligne)
    else gridColumn = 'span 2'                          // 1/3 ligne (3 par ligne)
    
    const div = document.createElement('div')
    div.style.cssText = `
      grid-column: ${gridColumn};
      background: #f5f5f5;
      border-radius: 12px;
      padding: 15px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.1);
      position: relative;
      border: 2px solid ${estEpuise ? '#ddd' : (isGratuit ? '#00b8d4' : (isTombola ? '#f39c12' : '#e74c3c'))};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 300px;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    `
    
    let html = ''
    
    // Badges en haut à gauche
    if (isTombola || isGratuit) {
      html += `<div style="position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; gap: 5px; z-index: 10;">`
      
      if (isTombola) {
        const badgeText = tombolaTerminee ? '🏆 TERMINÉE' : '🎰 TOMBOLA'
        const badgeColor = tombolaTerminee ? '#27ae60' : '#f39c12'
        html += `<div style="background: ${badgeColor}; color: white; padding: 5px 12px; border-radius: 6px; font-weight: bold; font-size: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">${badgeText}</div>`
      }
      
      if (isGratuit) {
        html += `<div style="background: #00b8d4; color: white; padding: 5px 12px; border-radius: 6px; font-weight: bold; font-size: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">🎁 GRATUIT</div>`
      }
      
      html += `</div>`
    }
    
    // Menu 3 points si gestionnaire en mode édition
    if (jeSuisBoutiqueManager && modeEdition) {
      html += `<button class="btn-menu-3pts" data-objet-id="${objet.id}" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;">⋮</button>`
    }
    
    // Image alignée en haut sans cadre blanc pour images transparentes
    html += `
      <div style="width: 100%; display: flex; align-items: flex-start; justify-content: center; flex-shrink: 0;">
        ${objet.image_url 
          ? `<img src="${objet.image_url}" style="width: 90%; height: auto; display: block; border-radius: 6px;" />`
          : `<div style="width: 90%; min-height: 150px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 50px;">📸</div>`
        }
      </div>
    `
    
    // Contenu en bas (hauteur fixe)
    html += `<div style="flex-shrink: 0;">`
    
    // Nom
    const fontSize = taille === 'gros' ? '22px' : taille === 'moyen' ? '18px' : '16px'
    html += `<h3 style="margin: 10px 0; font-size: ${fontSize}; color: #333;">${objet.nom}</h3>`
    
    // Prix
    if (isGratuit) {
      html += `<p style="font-size: 20px; font-weight: bold; color: #00b8d4; margin: 8px 0; text-align: center;">GRATUIT</p>`
    } else {
      const prixLabel = isTombola ? 'Prix du ticket' : 'Prix'
      html += `<p style="font-size: ${isTombola ? '14px' : '28px'}; font-weight: bold; color: #e74c3c; margin: 8px 0; display: flex; align-items: center; justify-content: center; gap: 8px;">${isTombola ? prixLabel + ' : ' : ''}${objet.prix} <img src="/Wbuck.png" style="width: ${isTombola ? '20px' : '28px'}; height: ${isTombola ? '20px' : '28px'};" /></p>`
    }
    
    // Stock (uniquement pour les objets normaux, pas pour les tombolas)
    if (!isTombola) {
      html += `<p style="font-size: 14px; margin: 8px 0; color: ${estEpuise ? '#e74c3c' : '#666'};">${estEpuise ? 'Épuisé' : `Quantité : ${objet.quantite}`}</p>`
    }
    
    // Bouton acheter
    const btnDisabled = (!isTombola && estEpuise) || (isTombola && tombolaTerminee)
    let btnText = 'Acheter'
    if (isTombola) {
      if (tombolaTerminee) {
        btnText = 'Tombola terminée'
      } else if (isGratuit) {
        btnText = '🎁 Participer GRATUITEMENT'
      } else {
        btnText = 'Acheter un ticket'
      }
    } else if (isGratuit) {
      btnText = '🎁 Obtenir GRATUITEMENT'
    }
    const btnColor = isGratuit ? '#00b8d4' : (isTombola ? '#f39c12' : '#e74c3c')
    html += `<button class="btn-acheter" data-id="${objet.id}" data-nom="${objet.nom}" data-prix="${objet.prix}" data-is-tombola="${isTombola}" data-is-gratuit="${isGratuit}" style="width: 100%; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: ${btnDisabled ? 'not-allowed' : 'pointer'}; background: ${btnDisabled ? '#ddd' : btnColor}; color: white; font-size: 16px; margin-top: 8px;" ${btnDisabled ? 'disabled' : ''}>${btnText}</button>`
    
    html += `</div>`
    
    div.innerHTML = html
    div.dataset.objetId = objet.id
    div.dataset.objetNom = objet.nom
    div.dataset.objetPrix = objet.prix
    div.dataset.objetImage = objet.image_url || ''
    div.dataset.objetQuantite = objet.quantite
    div.dataset.objetTaille = taille
    div.dataset.objetTombola = isTombola
    div.dataset.objetGratuit = isGratuit
    div.dataset.objetTombolaTerminee = tombolaTerminee
    grid.appendChild(div)
  })
  
  // Ajouter listeners sur les boutons acheter
  document.querySelectorAll('.btn-acheter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const id = parseInt(btn.dataset.id)
      const nom = btn.dataset.nom
      const prix = parseInt(btn.dataset.prix)
      const isTombola = btn.dataset.isTombola === 'true'
      const isGratuit = btn.dataset.isGratuit === 'true'
      confirmerAchat(id, nom, prix, isTombola, isGratuit)
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
      const isTombola = container.dataset.objetTombola === 'true'
      const tombolaTerminee = container.dataset.objetTombolaTerminee === 'true'
      
      ouvrirMenuObjet(id, nom, prix, imageUrl, taille, quantite, isTombola, tombolaTerminee)
    })
  })
}

// Bouton pour ajouter un objet
document.querySelector('#btn-ajouter-objet')?.addEventListener('click', () => {
  ouvrirModalAjout()
})

// Fonction pour synchroniser la boutique
async function synchroniserBoutique() {
  // Étape 1 : Supprimer définitivement les objets marqués comme supprimés
  const { error: deleteError } = await supabase
    .from('objets_boutique')
    .delete()
    .eq('admin_deleted', true)
  
  if (deleteError) {
    afficherMessageNFC('', 'Erreur', 'Erreur lors de la suppression', '#e74c3c')
    console.error(deleteError)
    return false
  }
  
  // Étape 2 : Publier tous les objets en attente
  const { error: publishError } = await supabase
    .from('objets_boutique')
    .update({ is_published: true })
    .eq('is_published', false)
  
  if (publishError) {
    afficherMessageNFC('', 'Erreur', 'Erreur lors de la publication', '#e74c3c')
    console.error(publishError)
    return false
  }
  
  afficherMessageNFC('', 'Succès', 'Boutique synchronisée pour tous !', '#2a9d8f')
  await chargerObjetsBoutique()
  return true
}

// Gestion du choix de taille dans le modal
document.querySelectorAll('.btn-taille').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-taille').forEach(b => {
      b.style.border = '2px solid #ddd'
      b.style.background = 'linear-gradient(135deg, #F5E6D3 0%, #E8D4BA 100%)'
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

// Gestion de la checkbox Mode Tombola
const tombolaCheckbox = document.querySelector('#objet-tombola')
const quantiteContainer = document.querySelector('#quantite-container')
const quantiteInput = document.querySelector('#objet-quantite')
const gratuitCheckbox = document.querySelector('#objet-gratuit')
const labelGratuit = document.querySelector('#label-gratuit')
const prixInput = document.querySelector('#objet-prix')

tombolaCheckbox?.addEventListener('change', (e) => {
  if (e.target.checked) {
    // Mode tombola activé : cacher la quantité et la mettre à 0
    quantiteContainer.style.display = 'none'
    quantiteInput.value = '0'
    
    // Activer la checkbox gratuit
    gratuitCheckbox.disabled = false
    labelGratuit.style.opacity = '1'
    labelGratuit.style.pointerEvents = 'auto'
  } else {
    // Mode normal : afficher la quantité et la remettre à 1
    quantiteContainer.style.display = 'block'
    quantiteInput.value = '1'
    
    // Désactiver et décocher la checkbox gratuit
    gratuitCheckbox.disabled = true
    gratuitCheckbox.checked = false
    labelGratuit.style.opacity = '0.5'
    labelGratuit.style.pointerEvents = 'none'
    prixInput.disabled = false
  }
})

// Gestion de la checkbox Gratuit
gratuitCheckbox?.addEventListener('change', (e) => {
  if (e.target.checked) {
    // Gratuit activé : mettre le prix à 0 et désactiver le champ
    prixInput.value = '0'
    prixInput.disabled = true
    quantiteInput.value = '1000' // Grande quantité pour les gratuits
  } else {
    // Gratuit désactivé : réactiver le champ prix
    prixInput.disabled = false
    quantiteInput.value = '0'
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
  document.querySelector('#objet-tombola').checked = false
  document.querySelector('#objet-gratuit').checked = false
  previewDiv.style.display = 'none'
  
  // Réinitialiser les états des checkboxes
  document.querySelector('#objet-prix').disabled = false
  document.querySelector('#objet-gratuit').disabled = true
  document.querySelector('#label-gratuit').style.opacity = '0.5'
  document.querySelector('#label-gratuit').style.pointerEvents = 'none'
  
  // Afficher le champ quantité (mode normal par défaut)
  quantiteContainer.style.display = 'block'
  
  // Sélectionner la taille "petit" par défaut
  document.querySelectorAll('.btn-taille').forEach(b => {
    b.style.border = '2px solid #ddd'
    b.style.background = 'linear-gradient(135deg, #F5E6D3 0%, #E8D4BA 100%)'
  })
  document.querySelector('.btn-taille[data-taille="petit"]').style.border = '2px solid #e74c3c'
  document.querySelector('.btn-taille[data-taille="petit"]').style.background = '#ffe6e6'
  document.querySelector('#objet-taille').value = 'petit'
  
  document.querySelector('#modal-titre-objet').textContent = '➕ Ajouter un Objet'
  document.querySelector('#btn-confirm-objet').textContent = 'Ajouter'
  document.querySelector('#modal-ajouter-objet').classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

// Ouvrir menu 3 points pour un objet
let objetEnCoursMenu = null

window.ouvrirMenuObjet = function(id, nom, prix, imageUrl, taille, quantite, isTombola = false, tombolaTerminee = false) {
  objetEnCoursMenu = { id, nom, prix, image_url: imageUrl, taille, quantite, is_tombola: isTombola, tombola_terminee: tombolaTerminee }
  document.querySelector('#menu-objet-nom').textContent = nom
  
  // Afficher le bouton "Tirer le gagnant" uniquement si c'est une tombola non terminée
  const btnTirerGagnant = document.querySelector('#btn-menu-tirer-gagnant')
  if (isTombola && !tombolaTerminee) {
    btnTirerGagnant.style.display = 'block'
  } else {
    btnTirerGagnant.style.display = 'none'
  }
  
  document.querySelector('#menu-objet').classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

async function supprimerObjet(objetId, type) {
  if (!jeSuisBoutiqueManager || !modeEdition) {
    alert('❌ Activez le Mode Édition pour supprimer des objets')
    return
  }
  
  // Marquer l'objet comme supprimé au lieu de le supprimer définitivement
  const { error } = await supabase
    .from('objets_boutique')
    .update({ admin_deleted: true })
    .eq('id', objetId)
  
  if (error) {
    alert('Erreur lors de la suppression')
    console.error(error)
    return
  }
  
  alert('Objet marqué pour suppression ! Cliquez sur "Actualiser" pour synchroniser.')
  await chargerObjetsBoutique()
}

// Fonction globale pour confirmer achat
window.confirmerAchat = async function(objetId, objetNom, objetPrix, isTombola = false, isGratuit = false) {
  // Vérifier si l'utilisateur a déjà acheté cet objet (pour les objets avec limite)
  const { data: objetData } = await supabase
    .from('objets_boutique')
    .select('max_par_personne, is_gratuit')
    .eq('id', objetId)
    .single()
  
  if (objetData && objetData.max_par_personne) {
    const { data: achatsExistants } = await supabase
      .from('achats')
      .select('id')
      .eq('acheteur_email', currentUserEmail)
      .eq('objet_id', objetId)
    
    if (achatsExistants && achatsExistants.length >= objetData.max_par_personne) {
      if (isGratuit) {
        alert('Vous avez déjà participé à cette tombola gratuite ! Limite : 1 par personne.')
      } else {
        alert(`Vous avez déjà acheté cet objet ! Limite : ${objetData.max_par_personne} par personne.`)
      }
      return
    }
  }
  
  const prixFinal = isGratuit ? 0 : objetPrix
  
  objetEnCoursAchat = { 
    id: objetId, 
    nom: objetNom, 
    prix: prixFinal, 
    is_tombola: isTombola,
    is_gratuit: isGratuit
  }
  
  // Récupérer le solde réel calculé depuis allUsers
  const currentUser = allUsers.find(u => u.email === currentUserEmail)
  const soldeReel = currentUser ? currentUser.solde_reel : 0
  
  // Adapter le message selon si c'est une tombola ou non
  const modalTitle = document.querySelector('#modal-confirmer-achat h3')
  if (isTombola && isGratuit) {
    modalTitle.textContent = '🎁 Participer gratuitement'
  } else if (isTombola) {
    modalTitle.textContent = '🎰 Acheter un ticket'
  } else if (isGratuit) {
    modalTitle.textContent = '🎁 Obtenir gratuitement'
  } else {
    modalTitle.textContent = '🛍️ Confirmer l\'achat'
  }
  
  document.querySelector('#achat-objet-nom').textContent = objetNom
  document.querySelector('#achat-objet-prix').textContent = isGratuit ? '0 (GRATUIT)' : prixFinal
  document.querySelector('#achat-solde-actuel').textContent = soldeReel
  
  document.querySelector('#modal-confirmer-achat').classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

document.querySelector('#btn-cancel-achat').addEventListener('click', () => {
  document.querySelector('#modal-confirmer-achat').classList.add('hidden')
  document.body.style.overflow = ''
  objetEnCoursAchat = null
})

document.querySelector('#btn-confirm-achat-final').addEventListener('click', async () => {
  if (!objetEnCoursAchat) return
  
  const isGratuit = objetEnCoursAchat.is_gratuit || false
  
  // Vérifier le solde réel (sauf si gratuit)
  if (!isGratuit) {
    const currentUser = allUsers.find(u => u.email === currentUserEmail)
    const soldeReel = currentUser ? currentUser.solde_reel : 0
    
    if (soldeReel < objetEnCoursAchat.prix) {
      alert('Solde insuffisant !')
      return
    }
  }
  
  // Récupérer l'objet complet
  const { data: objet } = await supabase
    .from('objets_boutique')
    .select('quantite, is_tombola, image_url')
    .eq('id', objetEnCoursAchat.id)
    .single()
  
  const isTombola = objet.is_tombola || false
  
  // Pour les objets normaux, vérifier qu'il reste du stock
  if (!isTombola && objet.quantite <= 0) {
    alert('Cet objet est épuisé !')
    document.querySelector('#modal-confirmer-achat').classList.add('hidden')
    objetEnCoursAchat = null
    await chargerObjetsBoutique()
    return
  }

  // La quantité sera mise à jour automatiquement par le trigger SQL
  // (pas besoin de le faire manuellement côté client)
  
  // Enregistrer l'achat avec toutes les infos de l'objet
  const { error } = await supabase
    .from('achats')
    .insert({
      acheteur_email: currentUserEmail,
      objet_id: objetEnCoursAchat.id,
      prix_paye: objetEnCoursAchat.prix,
      nom_objet: objetEnCoursAchat.nom,
      image_objet: objet?.image_url
    })
  
  if (error) {
    alert('Erreur lors de l\'achat')
    console.error(error)
    return
  }
  
  // Rafraîchir la page pour mettre à jour le solde
  location.reload()
})

// ==================== FONCTIONS MES ACHATS ====================

async function chargerMesAchats() {
  const { data: achats, error } = await supabase
    .from('achats')
    .select('*')
    .eq('acheteur_email', currentUserEmail)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erreur chargement achats:', error)
    return
  }
  
  const listeMesAchats = document.querySelector('#liste-mes-achats')
  
  if (achats.length === 0) {
    listeMesAchats.innerHTML = '<p style="color: rgba(255,255,255,0.7); text-align: center; padding: 30px; font-size: 16px;">🛍️ Aucun achat pour le moment</p>'
    return
  }
  
  let html = ''
  achats.forEach(achat => {
    const date = new Date(achat.created_at)
    const dateStr = date.toLocaleDateString('fr-FR')
    const heureStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    
    // Utiliser les données sauvegardées au moment de l'achat
    const nomObjet = achat.nom_objet || 'Objet supprimé'
    const prixObjet = achat.prix_paye || 0
    const imageUrl = achat.image_objet || null
    const estGagnant = achat.est_gagnant
    
    // Déterminer si c'est une tombola et le résultat
    let tombolaBadge = ''
    let borderColor = '#e74c3c'
    let gradient = 'linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)'
    let evenementText = 'Achat boutique'
    
    if (estGagnant === true) {
      tombolaBadge = '<span style="background: #27ae60; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; margin-left: 8px;">🏆 GAGNANT</span>'
      borderColor = '#27ae60'
      gradient = 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)'
      evenementText = 'Tombola (GAGNANT !)'
    } else if (estGagnant === false) {
      tombolaBadge = '<span style="background: #95a5a6; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; margin-left: 8px;">🎰 Non gagnant</span>'
      borderColor = '#95a5a6'
      gradient = 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)'
      evenementText = 'Tombola (non gagnant)'
    }
    
    html += `
      <div style="background: ${gradient}; padding: 20px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid ${borderColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: all 0.3s ease; cursor: pointer; overflow: hidden;" onmouseover="this.style.transform='translateX(5px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'">
        <div style="display: flex; gap: 15px; justify-content: space-between;">
          <!-- Colonne gauche : infos textuelles -->
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;">
            <h4 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 18px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center;">${nomObjet}${tombolaBadge}</h4>
            <p style="margin: 0 0 3px 0; font-size: 14px; color: #666;">Quantité : 1</p>
            <p style="margin: 0 0 3px 0; font-size: 14px; color: #666;">Événement : ${evenementText}</p>
            <p style="margin: 0; font-size: 13px; color: #999;">📅 ${dateStr} à ${heureStr}</p>
          </div>
          <!-- Colonne droite : prix en haut, photo en bas -->
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px; min-width: 90px;">
            <!-- Prix en haut -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: ${borderColor}; line-height: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap;">-${prixObjet}</p>
              <img src="/Wbuck.png" style="width: 28px; height: 28px;" />
            </div>
            <!-- Photo en bas -->
            <div style="width: 85px; height: 85px; background: ${imageUrl ? `url('${imageUrl}')` : '#ddd'}; background-size: cover; background-position: center; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">${!imageUrl ? (estGagnant === true ? '🏆' : estGagnant === false ? '🎰' : '📦') : ''}</div>
          </div>
        </div>
      </div>
    `
  })
  
  listeMesAchats.innerHTML = html
}

async function chargerMesGains() {
  console.log('🔍 Chargement des gains pour:', currentUserEmail)
  
  const { data: gains, error } = await supabase
    .from('transactions')
    .select('id, montant, raison, created_at')
    .eq('destinataire_email', currentUserEmail)
    .order('created_at', { ascending: false })
  
  console.log('📊 Gains trouvés:', gains?.length, gains)
  
  if (error) {
    console.error('Erreur chargement gains:', error)
    return
  }
  
  const listeMesGains = document.querySelector('#liste-mes-gains')
  
  if (gains.length === 0) {
    listeMesGains.innerHTML = '<p style="color: rgba(255,255,255,0.7); text-align: center; padding: 30px; font-size: 16px;">🎉 Aucun gain pour le moment</p>'
    return
  }
  
  let html = ''
  gains.forEach(gain => {
    const date = new Date(gain.created_at)
    const dateStr = date.toLocaleDateString('fr-FR')
    const heureStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    const isPositif = gain.montant > 0
    const gradient = isPositif ? 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)'
    const borderColor = isPositif ? '#2ecc71' : '#e74c3c'
    const signe = isPositif ? '+' : ''
    
    // Détecter si c'est un tag NFC et formater
    let description = gain.raison || 'Transaction'
    let evenement = gain.raison || 'Transaction'
    
    if (gain.raison && gain.raison.startsWith('NFC:')) {
      description = 'Carte de Paiement'
      // Extraire le code après "NFC:" et le formater
      const code = gain.raison.substring(4) // Enlève "NFC:"
      // Formater : PETIT-DEJ1 → Petit Dej 1
      evenement = code
        .split('-')
        .map(mot => mot.charAt(0).toUpperCase() + mot.slice(1).toLowerCase())
        .join(' ')
        .replace(/(\d+)/, ' $1') // Ajoute espace avant les chiffres
        .trim()
    }
    
    html += `
      <div style="background: ${gradient}; padding: 20px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid ${borderColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: all 0.3s ease; cursor: pointer; overflow: hidden;" onmouseover="this.style.transform='translateX(5px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'">
        <div style="display: flex; gap: 15px; justify-content: space-between;">
          <!-- Colonne gauche : infos textuelles -->
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;">
            <h4 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 18px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${description}</h4>
            <p style="margin: 0 0 3px 0; font-size: 14px; color: #666;">Événement : ${evenement}</p>
            <p style="margin: 0; font-size: 13px; color: #999;">📅 ${dateStr} à ${heureStr}</p>
          </div>
          <!-- Colonne droite : prix en haut, photo en bas -->
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px; min-width: 90px;">
            <!-- Prix en haut -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: ${borderColor}; line-height: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap;">${signe}${gain.montant}</p>
              <img src="/Wbuck.png" style="width: 28px; height: 28px;" />
            </div>
            <!-- Photo en bas -->
            <div style="width: 85px; height: 85px; background: ${borderColor}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 40px; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">${isPositif ? '💰' : '💸'}</div>
          </div>
        </div>
      </div>
    `
  })
  
  listeMesGains.innerHTML = html
}

// ==================== TOGGLE SECTIONS MOI ====================
window.toggleSection = function(section) {
  const liste = document.querySelector(`#liste-mes-${section}`)
  const arrow = document.querySelector(`#arrow-${section}`)
  
  if (liste.style.maxHeight === '0px' || !liste.style.maxHeight) {
    // Ouvrir la section
    liste.style.maxHeight = '400px'
    liste.style.padding = '20px 20px 20px 20px'
    liste.style.overflowY = 'auto'
    arrow.style.transform = 'rotate(0deg)'
  } else {
    // Fermer la section
    liste.style.maxHeight = '0px'
    liste.style.padding = '0 20px'
    liste.style.overflowY = 'hidden'
    arrow.style.transform = 'rotate(-90deg)'
  }
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
  document.body.style.overflow = ''
})

document.querySelector('#btn-confirm-objet').addEventListener('click', async () => {
  const nom = document.querySelector('#objet-nom').value.trim()
  let prix = parseInt(document.querySelector('#objet-prix').value)
  let quantite = parseInt(document.querySelector('#objet-quantite').value) || 1
  const imageUrl = document.querySelector('#objet-image').value.trim()
  const photoFile = document.querySelector('#objet-photo').files[0]
  const taille = document.querySelector('#objet-taille').value
  const isTombola = document.querySelector('#objet-tombola')?.checked || false
  const isGratuit = document.querySelector('#objet-gratuit')?.checked || false
  const objetIdEdit = document.querySelector('#objet-id-edit').value
  
  // Si gratuit, forcer le prix à 0
  if (isGratuit) {
    prix = 0
  }
  
  // Pour les tombolas, forcer la quantité à 0 (nombre de participants initial)
  if (isTombola) {
    quantite = 0
  }
  
  // Pour les objets normaux, quantité doit être >= 1
  const quantiteMin = isTombola ? 0 : 1
  
  if (!nom || prix < 0 || quantite < quantiteMin) {
    afficherMessageNFC('', 'Champs manquants', 'Veuillez remplir tous les champs obligatoires', '#f39c12');
    return
  }
  
  // Upload photo si sélectionnée
  let finalImageUrl = imageUrl
  if (photoFile) {
    const uploadedUrl = await uploadPhoto(photoFile)
    if (uploadedUrl) {
      finalImageUrl = uploadedUrl
    } else {
      afficherMessageNFC('', 'Erreur upload', 'Erreur lors de l\'upload de la photo', '#e74c3c');
      return
    }
  }
  
  // Préparer les données de l'objet
  const objetData = {
    nom,
    prix,
    quantite,
    image_url: finalImageUrl || null,
    taille,
    is_tombola: isTombola,
    is_gratuit: isGratuit,
    max_par_personne: isGratuit ? 1 : null,
    is_published: false
  }
  
  // Si modification
  if (objetIdEdit) {
    const { error } = await supabase
      .from('objets_boutique')
      .update(objetData)
      .eq('id', parseInt(objetIdEdit))
    
    if (error) {
      afficherMessageNFC('', 'Erreur', 'Erreur lors de la modification', '#e74c3c');
      console.error(error)
      return
    }
    
    afficherMessageNFC('', 'Succès', 'Objet modifié !', '#2a9d8f');
  } else {
    // Sinon ajout
    const { error } = await supabase
      .from('objets_boutique')
      .insert(objetData)
    
    if (error) {
      console.error('Erreur complète:', error)
      afficherMessageNFC('', 'Erreur', `Erreur lors de l'ajout: ${error.message || JSON.stringify(error)}`, '#e74c3c');
      return
    }
    
    afficherMessageNFC('', 'Succès', 'Objet ajouté !', '#2a9d8f');
  }
  document.querySelector('#modal-ajouter-objet').classList.add('hidden')
  document.body.style.overflow = ''
  
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
  document.body.style.overflow = ''
  objetEnCoursMenu = null
})

document.querySelector('#btn-menu-modifier').addEventListener('click', () => {
  if (!objetEnCoursMenu) return
  
  // Pré-remplir le formulaire dans le modal d'ajout (en mode édition)
  document.querySelector('#objet-nom').value = objetEnCoursMenu.nom
  document.querySelector('#objet-prix').value = objetEnCoursMenu.prix
  document.querySelector('#objet-quantite').value = objetEnCoursMenu.quantite
  document.querySelector('#objet-image').value = objetEnCoursMenu.image_url || ''
  const isTombola = objetEnCoursMenu.is_tombola || false
  document.querySelector('#objet-tombola').checked = isTombola
  document.querySelector('#objet-id-edit').value = objetEnCoursMenu.id
  previewDiv.style.display = 'none'
  
  // Gérer l'affichage du champ quantité selon le mode
  if (isTombola) {
    quantiteContainer.style.display = 'none'
  } else {
    quantiteContainer.style.display = 'block'
  }
  
  // Sélectionner la bonne taille
  const taille = objetEnCoursMenu.taille || 'petit'
  document.querySelectorAll('.btn-taille').forEach(b => {
    b.style.border = '2px solid #ddd'
    b.style.background = 'linear-gradient(135deg, #F5E6D3 0%, #E8D4BA 100%)'
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
  document.body.style.overflow = 'hidden'
})

document.querySelector('#btn-menu-supprimer').addEventListener('click', async () => {
  if (!objetEnCoursMenu) return
  
  const { error } = await supabase
    .from('objets_boutique')
    .delete()
    .eq('id', objetEnCoursMenu.id)
  
  if (error) {
    console.error(error)
    return
  }
  
  document.querySelector('#menu-objet').classList.add('hidden')
  document.body.style.overflow = ''
  objetEnCoursMenu = null
  await chargerObjetsBoutique()
})

// Bouton pour tirer le gagnant d'une tombola
document.querySelector('#btn-menu-tirer-gagnant').addEventListener('click', async () => {
  if (!objetEnCoursMenu) return
  
  // Vérifier que c'est bien une tombola
  if (!objetEnCoursMenu.is_tombola) {
    afficherMessageNFC('⚠️', 'Erreur', 'Cet objet n\'est pas une tombola', '#e74c3c')
    return
  }
  
  // Vérifier qu'elle n'est pas déjà terminée
  if (objetEnCoursMenu.tombola_terminee) {
    afficherMessageNFC('⚠️', 'Déjà terminée', 'Le tirage au sort a déjà été effectué pour cette tombola', '#f39c12')
    return
  }
  
  // Demander confirmation
  if (!confirm(`⚠️ ATTENTION !\n\nVous allez tirer au sort le gagnant pour : ${objetEnCoursMenu.nom}\n\nCette action est IRRÉVERSIBLE.\n\nVoulez-vous continuer ?`)) {
    return
  }
  
  try {
    // Appeler la fonction SQL pour tirer le gagnant
    const { data, error } = await supabase
      .rpc('tirer_gagnant_tombola', {
        objet_id_param: objetEnCoursMenu.id
      })
    
    if (error) {
      console.error('Erreur tirage:', error)
      afficherMessageNFC('❌', 'Erreur', error.message || 'Erreur lors du tirage au sort', '#e74c3c')
      return
    }
    
    // Afficher le résultat
    if (data && data.length > 0) {
      const resultat = data[0]
      document.querySelector('#gagnant-email').textContent = resultat.gagnant_email
      document.querySelector('#nombre-participants').textContent = `${resultat.nombre_participants} participant${resultat.nombre_participants > 1 ? 's' : ''} au total`
      
      // Fermer le menu et ouvrir la modal de résultat
      document.querySelector('#menu-objet').classList.add('hidden')
      document.querySelector('#modal-resultat-tombola').classList.remove('hidden')
      document.body.style.overflow = 'hidden'
      
      // Recharger la boutique pour mettre à jour l'affichage
      await chargerObjetsBoutique()
    }
  } catch (err) {
    console.error('Erreur complète:', err)
    afficherMessageNFC('❌', 'Erreur', 'Une erreur inattendue s\'est produite', '#e74c3c')
  }
})

// Fermer la modal de résultat tombola
document.querySelector('#btn-close-resultat-tombola')?.addEventListener('click', () => {
  document.querySelector('#modal-resultat-tombola').classList.add('hidden')
  document.body.style.overflow = ''
  objetEnCoursMenu = null
})

// Event listener pour tirer le gagnant d'une tombola
document.querySelector('#btn-menu-tirer-gagnant').addEventListener('click', async () => {
  if (!objetEnCoursMenu) return
  if (!jeSuisBoutiqueManager || !modeEdition) {
    alert('❌ Vous devez être gestionnaire en mode édition')
    return
  }
  
  // Confirmation
  if (!confirm(`Voulez-vous vraiment tirer le gagnant pour "${objetEnCoursMenu.nom}" ? Cette action est irréversible.`)) {
    return
  }
  
  try {
    // Appeler la fonction PostgreSQL qui tire un gagnant au hasard
    const { data, error } = await supabase.rpc('tirer_gagnant_tombola', {
      objet_id_param: objetEnCoursMenu.id
    })
    
    if (error) throw error
    
    // Afficher le résultat
    const resultat = data[0]
    document.querySelector('#gagnant-email').textContent = resultat.gagnant_email
    document.querySelector('#nombre-participants').textContent = `${resultat.nombre_participants} participant(s) au total`
    
    // Fermer le menu et afficher la modal de résultat
    document.querySelector('#menu-objet').classList.add('hidden')
    document.querySelector('#modal-resultat-tombola').classList.remove('hidden')
    document.body.style.overflow = 'hidden'
    
    objetEnCoursMenu = null
    
    // Recharger la boutique pour mettre à jour l'affichage
    setTimeout(async () => {
      await chargerObjetsBoutique()
    }, 500)
    
  } catch (error) {
    console.error('Erreur lors du tirage au sort:', error)
    alert(`Erreur : ${error.message}`)
  }
})

// Event listener pour fermer la modal de résultat tombola
document.querySelector('#btn-close-resultat-tombola').addEventListener('click', () => {
  document.querySelector('#modal-resultat-tombola').classList.add('hidden')
  document.body.style.overflow = ''
})

// Event listeners pour modal-modifier-objet
document.querySelector('#btn-cancel-modifier').addEventListener('click', () => {
  document.querySelector('#modal-modifier-objet').classList.add('hidden')
  document.body.style.overflow = ''
})

document.querySelector('#btn-confirm-modifier').addEventListener('click', async () => {
  if (!objetEnCoursMenu) return
  
  const nom = document.querySelector('#modifier-objet-nom').value.trim()
  const prix = parseInt(document.querySelector('#modifier-objet-prix').value)
  const quantite = parseInt(document.querySelector('#modifier-objet-quantite').value)
  const imageUrl = document.querySelector('#modifier-objet-image').value.trim()
  const photoFile = document.querySelector('#modifier-objet-photo').files[0]
  
  if (!nom || !prix || prix < 1 || quantite < 0) {
    return
  }
  
  // Upload nouvelle photo si sélectionnée
  let finalImageUrl = imageUrl
  if (photoFile) {
    const uploadedUrl = await uploadPhoto(photoFile)
    if (uploadedUrl) {
      finalImageUrl = uploadedUrl
    } else {
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
    console.error(error)
    return
  }
  
  // Rafraîchir la page

  location.reload()
})

// ==================== GESTION NFC / QR CODE ====================

// Fonction helper pour afficher un beau message
function afficherMessageNFC(emoji, titre, message, couleur = '#e74c3c') {
  document.querySelector('#nfc-info-emoji').textContent = emoji;
  document.querySelector('#nfc-info-titre').textContent = titre;
  document.querySelector('#nfc-info-titre').style.color = couleur;
  document.querySelector('#nfc-info-message').innerHTML = message;
  document.querySelector('#nfc-info-modal .modal-content').style.border = `3px solid ${couleur}`;
  document.querySelector('#btn-close-nfc-info').style.background = couleur;
  document.querySelector('#nfc-info-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
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
    afficherMessageNFC('', 'Connexion requise', 'Connecte-toi vite pour récupérer tes points !', '#f39c12');
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
    afficherMessageNFC('', 'Tag invalide', 'Ce tag est invalide ou désactivé.', '#e74c3c');
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
    afficherMessageNFC('', 'Déjà scanné', 'Tu as déjà scanné ce tag ! Pas de triche !', '#f39c12');
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
  document.body.style.overflow = 'hidden';

  // Mise à jour du compteur visuel
  if(document.querySelector('#points-count')) {
      document.querySelector('#points-count').textContent = nouveauSolde;
  }
}

// Boutons pour fermer les fenêtres
document.querySelector('#btn-close-nfc').addEventListener('click', () => {
  document.querySelector('#nfc-success-modal').classList.add('hidden');
  document.body.style.overflow = '';
});

document.querySelector('#btn-close-nfc-info').addEventListener('click', () => {
  document.querySelector('#nfc-info-modal').classList.add('hidden');
  document.body.style.overflow = '';
});

// Empêcher la soumission par Enter dans tous les inputs des modales
document.querySelectorAll('.modal input').forEach(input => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  })
})

// ==================== GESTION DES CHALLENGES ====================
let currentDifficulty = '50'

// Charger les challenges
async function loadChallenges() {
  console.log('🔄 Chargement des challenges...')
  try {
    // Filtrer selon le type d'utilisateur
    let query = supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (jeSuisBoutiqueManager && modeEdition) {
      // Mode édition : voir tout sauf les challenges supprimés
      query = query.eq('admin_deleted', false)
    } else {
      // Mode normal : seulement les défis publiés et non supprimés
      query = query.eq('published', true).eq('admin_deleted', false)
    }
    
    const { data: challenges, error } = await query

    if (error) throw error
    
    console.log('✅ Challenges chargés:', challenges)

    // Afficher les boutons selon le rôle
    const btnAddChallenge = document.querySelector('#btn-add-challenge')
    const btnActualiser = document.querySelector('#btn-actualiser-challenges')
    
    if (jeSuisBoutiqueManager && modeEdition) {
      btnAddChallenge?.classList.remove('hidden')
      btnActualiser?.classList.remove('hidden')
      
      // Compter seulement les challenges non publiés (en attente)
      const unpublishedCount = challenges.filter(c => !c.published).length
      
      if (unpublishedCount > 0 && btnActualiser) {
        btnActualiser.textContent = `📢 Actualiser (${unpublishedCount})`
        btnActualiser.style.animation = 'pulse 2s infinite'
      } else if (btnActualiser) {
        btnActualiser.textContent = '✅ Tout est à jour'
        btnActualiser.style.animation = 'none'
      }
    } else {
      btnAddChallenge?.classList.add('hidden')
      btnActualiser?.classList.add('hidden')
    }

    // Charger les validations
    const { data: validations, error: validError } = await supabase
      .from('challenge_validations')
      .select('*')

    if (validError) {
      console.error('Erreur validations:', validError)
      throw validError
    }

    // Grouper les challenges par difficulté
    const challengesByDifficulty = {
      '50': [],
      '150': [],
      '300': []
    }

    challenges.forEach(challenge => {
      const validation = validations.filter(v => v.challenge_id === challenge.id)
      if (challengesByDifficulty[challenge.difficulte]) {
        challengesByDifficulty[challenge.difficulte].push({
          ...challenge,
          validations: validation
        })
      }
    })

    // Afficher les challenges
    displayChallenges('50', challengesByDifficulty['50'])
    displayChallenges('150', challengesByDifficulty['150'])
    displayChallenges('300', challengesByDifficulty['300'])
    
    // Initialiser l'affichage : montrer uniquement la liste 50 au départ
    document.querySelectorAll('.challenges-list').forEach(list => {
      list.style.display = 'none'
    })
    document.querySelector('#challenges-50').style.display = 'block'

  } catch (error) {
    console.error('Erreur lors du chargement des challenges:', error)
  }
}

// Afficher les challenges
function displayChallenges(difficulty, challenges) {
  const container = document.querySelector(`#challenges-${difficulty}`)
  if (!container) return

  if (challenges.length === 0) {
    container.innerHTML = '<div class="empty-challenges">Aucun challenge pour le moment</div>'
    return
  }

  const currentUserEmail = localStorage.getItem('userEmail')

  container.innerHTML = challenges.map(challenge => {
    const userValidation = challenge.validations.find(v => v.user_email === currentUserEmail)
    const isCompleted = !!userValidation
    const allValidations = challenge.validations
    const validatedByCount = allValidations.length
    const isTerminated = challenge.terminated || false

    return `
      <div class="challenge-card ${isCompleted ? 'completed' : ''} ${isTerminated ? 'terminated' : ''} ${!challenge.published && jeSuisBoutiqueManager && modeEdition ? 'unpublished' : ''}" style="position: relative;">
        ${jeSuisBoutiqueManager && modeEdition ? `
          <button class="btn-menu-3pts" onclick="ouvrirMenuChallenge(${challenge.id})" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;">⋮</button>
        ` : ''}
        <div class="challenge-header-row">
          <h3 class="challenge-title">${challenge.titre} ${!challenge.published && jeSuisBoutiqueManager && modeEdition ? '<span class="draft-badge">📝 Brouillon</span>' : ''}</h3>
          <div class="challenge-points">+${challenge.points} pts</div>
        </div>
        <p class="challenge-description">${challenge.description}</p>
        <div class="challenge-footer">
          <div>
            ${isCompleted ? `
              <div class="challenge-status completed">✅ Défi réussi !</div>
            ` : `
              <div class="challenge-status">En attente de validation</div>
            `}
            ${validatedByCount > 0 ? `
              <div class="challenge-completed-by">
                <svg viewBox="0 0 24 24"><path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" /></svg>
                Validé par: ${allValidations.map(v => v.user_email.split('@')[0].split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')).join(', ')}
              </div>
            ` : ''}
          </div>
          <div>
            ${jeSuisAdmin && !isTerminated ? `
              <button class="btn-validate-challenge" onclick="openValidateModal(${challenge.id}, '${challenge.titre.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', ${challenge.points})">
                ✓ Valider pour un utilisateur
              </button>
            ` : ''}
            ${isTerminated ? '<div class="challenge-status" style="color: #999; font-size: 14px;">🔒 Défi terminé</div>' : ''}
          </div>
        </div>
      </div>
    `
  }).join('')
}

// Gérer les onglets de difficulté
document.querySelectorAll('.challenge-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const difficulty = tab.dataset.difficulty
    
    // Mettre à jour les onglets actifs
    document.querySelectorAll('.challenge-tab').forEach(t => t.classList.remove('active'))
    tab.classList.add('active')
    
    // Mettre à jour les listes actives - forcer le style display
    document.querySelectorAll('.challenges-list').forEach(list => {
      list.classList.remove('active')
      list.style.display = 'none'
    })
    const targetList = document.querySelector(`#challenges-${difficulty}`)
    if (targetList) {
      targetList.classList.add('active')
      targetList.style.display = 'block'
    }
    
    currentDifficulty = difficulty
  })
})

// Bouton ajouter challenge
const btnAddChallenge = document.querySelector('#btn-add-challenge')
if (btnAddChallenge) {
  btnAddChallenge.addEventListener('click', () => {
    document.querySelector('#challenge-difficulty').value = currentDifficulty
    document.querySelector('#modal-add-challenge').classList.remove('hidden')
    document.body.style.overflow = 'hidden'
  })
}

// Annuler ajout challenge
document.querySelector('#btn-cancel-add-challenge')?.addEventListener('click', () => {
  document.querySelector('#modal-add-challenge').classList.add('hidden')
  document.body.style.overflow = ''
  document.querySelector('#challenge-title').value = ''
  document.querySelector('#challenge-description').value = ''
})

// Confirmer ajout challenge
document.querySelector('#btn-confirm-add-challenge')?.addEventListener('click', async () => {
  const difficulty = document.querySelector('#challenge-difficulty').value
  const title = document.querySelector('#challenge-title').value.trim()
  const description = document.querySelector('#challenge-description').value.trim()
  const points = parseInt(difficulty) // Les points sont déduits directement de la difficulté

  if (!title || !description) {
    alert('Veuillez remplir tous les champs correctement')
    return
  }

  try {
    const { data, error } = await supabase.from('challenges').insert([{
      difficulte: difficulty,
      titre: title,
      description: description,
      points: points,
      published: false, // Par défaut non publié
      admin_deleted: false
    }]).select()

    if (error) throw error

    alert('✅ Challenge ajouté en brouillon ! Cliquez sur "Actualiser" pour le publier.')
    document.querySelector('#modal-add-challenge').classList.add('hidden')
    document.body.style.overflow = ''
    document.querySelector('#challenge-title').value = ''
    document.querySelector('#challenge-description').value = ''
    
    await loadChallenges()
  } catch (error) {
    console.error('Erreur lors de l\'ajout du challenge:', error)
    alert('❌ Erreur lors de l\'ajout du challenge')
  }
})

// Fonction pour synchroniser les challenges
async function synchroniserChallenges() {
  try {
    console.log('🔄 Synchronisation des challenges...')
    
    // 1. Supprimer vraiment les challenges marqués comme supprimés par l'admin
    const { data: deletedData, error: deleteError } = await supabase
      .from('challenges')
      .delete()
      .eq('admin_deleted', true)
      .select()
    
    if (deleteError) throw deleteError
    console.log(`🗑️ ${deletedData?.length || 0} challenge(s) supprimé(s)`)
    
    // 2. Publier tous les nouveaux challenges (brouillons)
    const { data: publishedData, error: publishError } = await supabase
      .from('challenges')
      .update({ published: true })
      .eq('published', false)
      .select()
    
    if (publishError) throw publishError
    console.log(`📢 ${publishedData?.length || 0} challenge(s) publié(s)`, publishedData)
    
    // 3. Recharger la section challenges pour mettre à jour l'affichage et le compteur
    await loadChallenges()
    
    return true
  } catch (error) {
    console.error('Erreur lors de l\'actualisation:', error)
    return false
  }
}

// Ouvrir modal de validation
window.openValidateModal = async (challengeId, title, points) => {
  document.querySelector('#validate-challenge-title').textContent = title
  document.querySelector('#validate-challenge-points').textContent = `+${points} pts`
  document.querySelector('#selected-challenge-id').value = challengeId
  document.querySelector('#modal-validate-challenge').classList.remove('hidden')
  document.body.style.overflow = 'hidden'
  
  console.log('✅ Utilisateurs disponibles:', allUsers.length)
}

// Recherche d'utilisateur
document.querySelector('#validate-user-search')?.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase().trim()
  const resultsContainer = document.querySelector('#validate-user-results')
  
  console.log('🔍 Recherche:', searchTerm, '| Nb users:', allUsers.length)
  
  // Debug: afficher les 3 premiers users
  if (allUsers.length > 0) {
    console.log('👥 Exemple users:', allUsers.slice(0, 3).map(u => ({ 
      nom: u.nom, 
      prenom: u.prenom, 
      email: u.email 
    })))
  }
  
  if (searchTerm.length < 2) {
    resultsContainer.style.display = 'none'
    return
  }
  
  const filteredUsers = allUsers.filter(user => {
    // Extraire nom et prénom depuis l'email
    const rawName = user.email.split('@')[0]
    const parts = rawName.split('.')
    const prenom = parts[0] || ''
    const nom = parts[1] || ''
    const searchable = `${prenom} ${nom}`.toLowerCase()
    return nom.toLowerCase().includes(searchTerm) || 
           prenom.toLowerCase().includes(searchTerm) ||
           searchable.includes(searchTerm)
  })
  
  console.log('✅ Résultats filtrés:', filteredUsers.length)
  
  if (filteredUsers.length === 0) {
    resultsContainer.innerHTML = '<div class="user-search-result">Aucun utilisateur trouvé</div>'
    resultsContainer.style.display = 'block'
    return
  }
  
  resultsContainer.innerHTML = filteredUsers.map(user => {
    // Extraire nom et prénom depuis l'email
    const rawName = user.email.split('@')[0]
    const parts = rawName.split('.')
    const prenom = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : ''
    const nom = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : ''
    const displayName = `${prenom} ${nom}`.trim()
    
    return `
      <div class="user-search-result" onclick="selectUser(${user.id}, '${displayName}', '${user.email}')">
        ${displayName}
      </div>
    `
  }).join('')
  resultsContainer.style.display = 'block'
})

// Sélectionner un utilisateur
window.selectUser = (userId, userName, userEmail) => {
  document.querySelector('#selected-user-id').value = userId
  document.querySelector('#selected-user-name span').textContent = userName
  document.querySelector('#selected-user-name').style.display = 'block'
  document.querySelector('#validate-user-results').style.display = 'none'
  document.querySelector('#validate-user-search').value = userName
  document.querySelector('#btn-confirm-validate-challenge').disabled = false
  
  // Stocker l'email également
  document.querySelector('#selected-user-id').dataset.email = userEmail
}

// Annuler validation
document.querySelector('#btn-cancel-validate-challenge')?.addEventListener('click', () => {
  document.querySelector('#modal-validate-challenge').classList.add('hidden')
  document.body.style.overflow = ''
  document.querySelector('#validate-user-search').value = ''
  document.querySelector('#validate-user-results').style.display = 'none'
  document.querySelector('#selected-user-name').style.display = 'none'
  document.querySelector('#selected-user-id').value = ''
  document.querySelector('#btn-confirm-validate-challenge').disabled = true
})

// Confirmer validation
document.querySelector('#btn-confirm-validate-challenge')?.addEventListener('click', async () => {
  const challengeId = parseInt(document.querySelector('#selected-challenge-id').value)
  const userId = parseInt(document.querySelector('#selected-user-id').value)
  const userEmail = document.querySelector('#selected-user-id').dataset.email
  const points = parseInt(document.querySelector('#validate-challenge-points').textContent.match(/\d+/)[0])
  const adminEmail = currentUserEmail // Utiliser la variable globale au lieu de localStorage
  const challengeTitle = document.querySelector('#validate-challenge-title').textContent

  if (!userId || !challengeId) {
    alert('Veuillez sélectionner un utilisateur')
    return
  }
  
  if (!adminEmail) {
    alert('❌ Erreur: email admin non trouvé')
    return
  }

  try {
    // Vérifier si cet utilisateur a déjà validé ce challenge
    const { data: existing } = await supabase
      .from('challenge_validations')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_email', userEmail)

    if (existing && existing.length > 0) {
      alert('❌ Cet utilisateur a déjà validé ce challenge !')
      return
    }

    // Ajouter la validation
    const { error: validError } = await supabase.from('challenge_validations').insert([{
      challenge_id: challengeId,
      user_id: userId,
      user_email: userEmail,
      validated_by_admin: adminEmail
    }])

    if (validError) throw validError

    // Ajouter les points à l'utilisateur
    const { data: userData } = await supabase.from('etudiants').select('solde').eq('email', userEmail).single()
    const newSolde = (userData?.solde || 0) + points

    const { error: updateError } = await supabase.from('etudiants').update({ solde: newSolde }).eq('email', userEmail)
    if (updateError) throw updateError

    // Enregistrer la transaction
    await supabase.from('transactions').insert([{
      destinataire_email: userEmail,
      montant: points,
      raison: `Challenge: ${challengeTitle}`,
      admin_email: adminEmail
    }])

    document.querySelector('#modal-validate-challenge').classList.add('hidden')
    document.body.style.overflow = ''
    document.querySelector('#validate-user-search').value = ''
    document.querySelector('#validate-user-results').style.display = 'none'
    document.querySelector('#selected-user-name').style.display = 'none'
    document.querySelector('#selected-user-id').value = ''
    document.querySelector('#btn-confirm-validate-challenge').disabled = true
    
    await loadChallenges()
    
    // Rafraîchir le leaderboard si on est sur la page campagne
    if (document.querySelector('#section-campagne').classList.contains('active')) {
      loadLeaderboard()
    }
  } catch (error) {
    console.error('Erreur lors de la validation:', error)
  }
})

// Supprimer un challenge
window.deleteChallenge = async (challengeId) => {
  console.log('🗑️ Tentative de suppression:', { jeSuisBoutiqueManager, modeEdition, challengeId })
  
  if (!jeSuisBoutiqueManager || !modeEdition) {
    alert('❌ Activez le Mode Édition pour supprimer des challenges')
    return
  }

  try {
    // D'abord récupérer le challenge pour savoir s'il est publié
    const { data: challenge, error: fetchError } = await supabase
      .from('challenges')
      .select('published')
      .eq('id', challengeId)
      .single()
    
    if (fetchError) throw fetchError

    // Si le challenge n'est pas encore publié, le supprimer directement
    if (!challenge.published) {
      if (!confirm('Supprimer ce challenge définitivement ?')) {
        return
      }

      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId)
      
      if (error) throw error
      
      alert('✅ Challenge supprimé définitivement')
      await loadChallenges()
      return
    }

    // Si le challenge est déjà publié, le marquer pour suppression différée
    if (!confirm('Supprimer ce challenge ? (Il sera supprimé pour tout le monde quand vous cliquerez sur Actualiser)')) {
      return
    }

    const { error } = await supabase
      .from('challenges')
      .update({ admin_deleted: true })
      .eq('id', challengeId)
      
    if (error) throw error

    alert('✅ Challenge supprimé de votre vue. Cliquez sur "Actualiser" pour appliquer la suppression à tout le monde.')
    await loadChallenges()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    alert('❌ Erreur lors de la suppression')
  }
}

// Charger les challenges quand on arrive sur la section
const observerChallenge = new MutationObserver(() => {
  const challengeSection = document.querySelector('#section-challenge')
  if (challengeSection && challengeSection.classList.contains('active')) {
    loadChallenges()
  }
})

if (document.querySelector('#section-challenge')) {
  observerChallenge.observe(document.querySelector('#section-challenge'), {
    attributes: true,
    attributeFilter: ['class']
  })
}

// Gestion du modal de programmation - VERSION SIMPLIFIÉE
let currentSyncType = '' // 'challenges' ou 'boutique'

document.querySelector('#btn-cancel-schedule')?.addEventListener('click', () => {
  document.querySelector('#modal-schedule-sync').classList.add('hidden')
  document.querySelector('#schedule-zone').style.display = 'none'
  document.body.style.overflow = ''
  currentSyncType = ''
})

// Bouton Actualiser Boutique
document.querySelector('#btn-actualiser-boutique')?.addEventListener('click', () => {
  currentSyncType = 'boutique'
  document.querySelector('#modal-sync-title').textContent = '📢 Actualiser la Boutique'
  document.querySelector('#modal-sync-subtitle').textContent = 'Synchroniser maintenant ou programmer ?'
  document.querySelector('#modal-schedule-sync').classList.remove('hidden')
  document.body.style.overflow = 'hidden'
})

// Bouton Actualiser Challenges
document.querySelector('#btn-actualiser-challenges')?.addEventListener('click', () => {
  currentSyncType = 'challenges'
  document.querySelector('#modal-sync-title').textContent = '📢 Actualiser les Défis'
  document.querySelector('#modal-sync-subtitle').textContent = 'Synchroniser maintenant ou programmer ?'
  document.querySelector('#modal-schedule-sync').classList.remove('hidden')
  document.body.style.overflow = 'hidden'
})

// Bouton MAINTENANT
document.querySelector('#btn-sync-now')?.addEventListener('click', async () => {
  const confirmation = confirm(`⚠️ Synchroniser ${currentSyncType === 'challenges' ? 'les défis' : 'la boutique'} MAINTENANT ?\\n\\nToutes les modifications (ajouts ET suppressions) seront appliquées pour tout le monde.`)
  if (!confirmation) return
  
  if (currentSyncType === 'challenges') {
    await synchroniserChallenges()
  } else if (currentSyncType === 'boutique') {
    await synchroniserBoutique()
  }
  
  document.querySelector('#modal-schedule-sync').classList.add('hidden')
  document.body.style.overflow = ''
  currentSyncType = ''
})

// Bouton PROGRAMMER
document.querySelector('#btn-sync-schedule')?.addEventListener('click', () => {
  document.querySelector('#schedule-zone').style.display = 'block'
})

// Mise à jour de l'aperçu de la date
document.querySelector('#sync-datetime')?.addEventListener('change', (e) => {
  const datetime = e.target.value
  const preview = document.querySelector('#sync-preview')
  
  if (datetime) {
    const date = new Date(datetime)
    preview.textContent = `📅 Programmé pour le ${date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`
    preview.style.display = 'block'
  } else {
    preview.style.display = 'none'
  }
})

// Confirmer la programmation
document.querySelector('#btn-confirm-schedule-final')?.addEventListener('click', async () => {
  const datetime = document.querySelector('#sync-datetime').value
  
  if (!datetime) {
    alert('⚠️ Veuillez sélectionner une date et heure')
    return
  }
  
  const scheduledDate = new Date(datetime)
  const now = new Date()
  
  if (scheduledDate <= now) {
    alert('⚠️ La date doit être dans le futur')
    return
  }
  
  const delay = scheduledDate - now
  
  if (confirm(`Programmer la synchronisation pour le ${scheduledDate.toLocaleString('fr-FR')} ?`)) {
    // Programmer avec setTimeout
    setTimeout(async () => {
      if (currentSyncType === 'challenges') {
        await synchroniserChallenges()
      } else if (currentSyncType === 'boutique') {
        await synchroniserBoutique()
      }
    }, delay)
    
    alert(`✅ Synchronisation programmée pour le ${scheduledDate.toLocaleString('fr-FR')}`)
    document.querySelector('#modal-schedule-sync').classList.add('hidden')
    document.querySelector('#schedule-zone').style.display = 'none'
    document.body.style.overflow = ''
    
    // Réinitialiser
    document.querySelector('#sync-datetime').value = ''
    document.querySelector('#sync-preview').style.display = 'none'
    currentSyncType = ''
  }
})

// Menu 3 points pour les challenges
window.ouvrirMenuChallenge = (challengeId) => {
  document.querySelector('#menu-challenge-id').value = challengeId
  document.querySelector('#modal-menu-challenge').classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

// Annuler menu challenge
document.querySelector('#btn-annuler-menu-challenge')?.addEventListener('click', () => {
  document.querySelector('#modal-menu-challenge').classList.add('hidden')
  document.body.style.overflow = ''
})

// Modifier challenge
document.querySelector('#btn-modifier-challenge')?.addEventListener('click', () => {
  document.querySelector('#modal-menu-challenge').classList.add('hidden')
  document.body.style.overflow = ''
  alert('🚧 Fonction de modification à venir')
  // TODO: Implémenter la modification
})

// Marquer challenge comme terminé
document.querySelector('#btn-terminer-challenge')?.addEventListener('click', async () => {
  const challengeId = parseInt(document.querySelector('#menu-challenge-id').value)
  document.querySelector('#modal-menu-challenge').classList.add('hidden')
  document.body.style.overflow = ''
  
  try {
    const { error } = await supabase
      .from('challenges')
      .update({ terminated: true })
      .eq('id', challengeId)
    
    if (error) throw error
    console.log('✅ Challenge marqué comme terminé')
    await loadChallenges()
  } catch (error) {
    console.error('Erreur:', error)
    alert('❌ Erreur lors de la mise à jour')
  }
})

// Supprimer challenge depuis le menu
document.querySelector('#btn-supprimer-challenge-menu')?.addEventListener('click', () => {
  const challengeId = document.querySelector('#menu-challenge-id').value
  document.querySelector('#modal-menu-challenge').classList.add('hidden')
  document.body.style.overflow = ''
  deleteChallenge(parseInt(challengeId))
})

checkSession()

// Initialiser l'ecocup 3D après le chargement de la page
setTimeout(() => {
  initEcocup3D()
}, 500)

verifierTagUrl()

// Animation scroll photos pôle - MOBILE SEULEMENT
function checkPoleCenter() {
  // Skip sur desktop
  if (window.innerWidth > 768) {
    requestAnimationFrame(checkPoleCenter)
    return
  }
  
  const centerY = window.innerHeight / 2
  const allPoles = document.querySelectorAll('.pole-image')
  
  allPoles.forEach((pole, i) => {
    const rect = pole.getBoundingClientRect()
    const poleCenter = rect.top + (rect.height / 2)
    const distance = Math.abs(poleCenter - centerY)
    
    // Quand l'image est au milieu de l'écran
    if (distance < 120) {
      if (!pole.classList.contains('pole-centered')) {
        console.log(`✅ Pôle ${i} au centre - activation`)
        pole.classList.add('pole-centered')
        const parent = pole.closest('.team-pole')
        if (parent) parent.classList.add('pole-active')
      }
    } else {
      if (pole.classList.contains('pole-centered')) {
        console.log(`❌ Pôle ${i} hors centre - désactivation`)
        pole.classList.remove('pole-centered')
        const parent = pole.closest('.team-pole')
        if (parent) parent.classList.remove('pole-active')
      }
    }
  })
  
  requestAnimationFrame(checkPoleCenter)
}

// Démarrer après chargement
setTimeout(() => {
  console.log('🎬 Démarrage animation pôles')
  console.log('📱 Mobile:', window.innerWidth <= 768)
  console.log('🖼️ Pôles trouvés:', document.querySelectorAll('.pole-image').length)
  checkPoleCenter()
}, 1500)

// Système de modal vidéo
setTimeout(() => {
  const thumbnails = document.querySelectorAll('.video-thumbnail')
  
  // Créer le modal
  const modal = document.createElement('div')
  modal.className = 'video-modal'
  modal.innerHTML = `
    <div class="video-modal-content">
      <button class="video-modal-close">×</button>
      <img class="video-modal-poster" src="" alt="">
      <div class="video-modal-play-overlay">
        <div class="video-modal-play-icon"></div>
      </div>
      <video controls></video>
      <iframe class="video-modal-iframe" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
    </div>
  `
  document.body.appendChild(modal)
  
  const modalVideo = modal.querySelector('video')
  const modalIframe = modal.querySelector('.video-modal-iframe')
  const modalPoster = modal.querySelector('.video-modal-poster')
  const closeBtn = modal.querySelector('.video-modal-close')
  const playOverlay = modal.querySelector('.video-modal-play-overlay')
  
  // Fermer le modal
  const closeModal = () => {
    modal.classList.remove('active')
    document.body.classList.remove('video-modal-open')
    modalVideo.pause()
    modalVideo.currentTime = 0
    modalVideo.classList.remove('active')
    modalIframe.classList.remove('active')
    modalIframe.src = ''
    modalPoster.classList.remove('hidden')
    playOverlay.classList.remove('hidden')
    modalVideo.innerHTML = ''
    modalPoster.src = ''
  }
  
  closeBtn.addEventListener('click', closeModal)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal()
  })
  
  // Play au clic sur l'overlay
  playOverlay.addEventListener('click', () => {
    modalPoster.classList.add('hidden')
    playOverlay.classList.add('hidden')
    
    // Si c'est une iframe, on la montre et on ajoute autoplay
    if (modalIframe.src) {
      modalIframe.classList.add('active')
      // Ajouter autoplay à l'URL YouTube
      if (modalIframe.src.includes('youtube.com')) {
        const separator = modalIframe.src.includes('?') ? '&' : '?'
        modalIframe.src = modalIframe.src + separator + 'autoplay=1'
      }
    } else {
      // Sinon c'est une vidéo normale
      modalVideo.classList.add('active')
      modalVideo.play()
    }
  })
  
  // Montrer l'overlay si on met pause (seulement pour vidéo)
  modalVideo.addEventListener('pause', () => {
    if (modalVideo.currentTime < modalVideo.duration - 0.5) {
      playOverlay.classList.remove('hidden')
    }
  })
  
  // Ouvrir le modal au clic sur miniature
  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', () => {
      // Ignorer les vidéos verrouillées
      if (thumbnail.classList.contains('video-locked')) {
        return
      }
      
      const container = thumbnail.closest('.video-thumbnail-container')
      const video = container.querySelector('video')
      const iframe = container.querySelector('iframe')
      
      if (iframe) {
        // C'est une iframe YouTube
        const posterUrl = thumbnail.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1]
        
        // Afficher le poster dans le modal
        modalPoster.src = posterUrl
        
        // Copier l'URL de l'iframe
        modalIframe.src = iframe.src
        
        // Ouvrir le modal avec le poster visible
        modal.classList.add('active')
        document.body.classList.add('video-modal-open')
        modalPoster.classList.remove('hidden')
        modalVideo.classList.remove('active')
        modalIframe.classList.remove('active')
        playOverlay.classList.remove('hidden')
      } else if (video) {
        // C'est une vidéo normale
        const posterUrl = video.getAttribute('poster')
        
        // Copier la source vidéo dans le modal
        const source = video.querySelector('source')
        if (source) {
          modalVideo.innerHTML = `<source src="${source.src}" type="video/mp4">`
          modalVideo.load()
        }
        
        // Afficher le poster dans le modal
        modalPoster.src = posterUrl
        
        // Ouvrir le modal avec le poster visible
        modal.classList.add('active')
        document.body.classList.add('video-modal-open')
        modalPoster.classList.remove('hidden')
        modalVideo.classList.remove('active')
        modalIframe.classList.remove('active')
        playOverlay.classList.remove('hidden')
      }
    })
  })
}, 2000)


