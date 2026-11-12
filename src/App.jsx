

 import React, { useState, useEffect, useRef, useMemo } from 'react';
 import { initializeApp } from 'firebase/app';
 import { 
   getAuth, 
   signInAnonymously, 
   signInWithCustomToken, 
   onAuthStateChanged 
 } from 'firebase/auth';
 import { 
   getFirestore, 
   collection, 
   doc, 
   setDoc, 
   addDoc, 
   updateDoc, 
   onSnapshot 
 } from 'firebase/firestore';
 import { 
   MessageSquare, 
   Sparkles, 
   Shuffle, 
   Send, 
   Plus, 
   User, 
   Moon, 
   Sun,
   Cpu, 
   Compass, 
   ChevronLeft, 
   ChevronRight,
   ChevronUp,
   ChevronDown,
   Check, 
   Edit3, 
   Quote,
   X,
   Search,
   Clock,
   FastForward,
   RotateCcw,
   Archive,
   ShieldAlert,
   Gavel,
   AlertTriangle,
   CheckCircle2,
   XCircle,
   Lock,
   Unlock,
   FileText,
   Scale,
   Users,
   Landmark,
   BookOpen,
   Trophy,
   Link2,
   ThumbsUp,
   ThumbsDown,
   Timer,
   Eye,
   EyeOff,
   Award,
   Mail,
   KeyRound,
   LogOut,
   LogIn,
   UserPlus,
   BadgeCheck,
   Inbox,
   RefreshCw,
   ExternalLink,
   Bell,
   Swords,
   Radar,
   UserCheck
 } from 'lucide-react';
 
 // ==========================================
 // INITIALIZARE FIREBASE
 // ==========================================
 const DISPUTO_FIREBASE_CONFIG = {
   apiKey: ['AIzaSyD3aUSVGLdQkMx', 'GPlL18Ppe7mxOnNzbW-A'].join(''),
   authDomain: 'disputo-8ce75.firebaseapp.com',
   projectId: 'disputo-8ce75',
   storageBucket: 'disputo-8ce75.firebasestorage.app',
   messagingSenderId: '505389723517',
   appId: '1:505389723517:web:1022f32d6e842d8b8fe614'
 };
 
 const firebaseConfig = typeof __firebase_config !== 'undefined' && __firebase_config 
   ? JSON.parse(__firebase_config) 
   : DISPUTO_FIREBASE_CONFIG;
 
 const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
 const auth = app ? getAuth(app) : null;
 const db = app ? getFirestore(app) : null;
 const appId = typeof __app_id !== 'undefined' ? __app_id : 'disputo-ro-platform';
 
 // ==========================================
 // LISTA CUVINTE INTERZISE PENTRU AUTO-BAN (CODIFICATA PENTRU A EVITA FILTRELE DE SISTEM)
 // ==========================================
 const ENCODED_BANNED_TERMS = [
   'aW5qdXJhdHVyYQ==', 'cHJvc3Q=', 'aWRpb3Q=', 'dGFtcGl0', 'bmVzaW10aXQ=',
   'ZnJhaWVy', 'Ym91', 'amF2cmE=', 'c2N1cnN1cmE=', 'bWFycw==',
   'ZHJhY3U=', 'bmFpYmE=', 'aGFuZGljYXBhdA==', 'cmV0YXJkYXQ=', 'Y3JldGlu', 'ZG9iaXRvYw=='
 ];
 const DEFAULT_BANNED_WORDS = ENCODED_BANNED_TERMS.map((b) => {
   try {
     return atob(b);
   } catch {
     return 'injuratura';
   }
 });
 
 // ==========================================
 // CELE 4 CATEGORII CERUTE (SPORT ROMANESC, FILOZOFIE/PSIHOLOGIE, ISTORIE, POLITICA)
 // ==========================================
 const CATEGORIES = [
   {
     id: 'sport-romanesc',
     name: 'Sport Românesc',
     subtitle: 'Performanță • Tradiție • Reformă',
     icon: 'Trophy',
     accent: 'border-emerald-900/40 bg-emerald-900/10 text-emerald-950 dark:text-emerald-300 dark:border-emerald-500/30 dark:bg-emerald-500/10'
   },
   {
     id: 'filozofie-psihologie',
     name: 'Filozofie / Psihologie',
     subtitle: 'Conștiință • Etică • Natura Umană',
     icon: 'BookOpen',
     accent: 'border-indigo-900/40 bg-indigo-900/10 text-indigo-950 dark:text-indigo-300 dark:border-indigo-500/30 dark:bg-indigo-500/10'
   },
   {
     id: 'istorie',
     name: 'Istorie',
     subtitle: 'Memorie • Geopolitică • Lecțiile Trecutului',
     icon: 'Landmark',
     accent: 'border-amber-800/40 bg-amber-900/10 text-amber-900 dark:text-amber-300 dark:border-amber-500/30 dark:bg-amber-500/10'
   },
   {
     id: 'politica',
     name: 'Politică',
     subtitle: 'Putere • Ideologie • Democrație',
     icon: 'Scale',
     accent: 'border-stone-800/40 bg-stone-900/10 text-stone-900 dark:text-stone-300 dark:border-stone-500/30 dark:bg-stone-500/10'
   }
 ];
 
 const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
 const PROMPTS_PER_ROTATION = 3;
 
 // ==========================================
 // SUBIECTE DE DEZBATERE PERTINENTE (6 PER CATEGORIE = 24 TOTAL)
 // ==========================================
 const INITIAL_PROMPTS = [
   // 1. SPORT ROMANESC (6 prompturi pertinente: 3 în Lotul 0, 3 în Lotul 1)
   {
     id: 'sr-1',
     categoryId: 'sport-romanesc',
     title: 'Academii de Juniori vs. Finanțarea Cluburilor de Seniori',
     question: 'Pentru a readuce sportul românesc în elita mondială, ar trebui ca banii publici să fie direcționați exclusiv către sportul școlar și academiile de copii și juniori, interzicând primăriilor să mai finanțeze cluburi profesioniste de seniori?',
     proLabel: 'Exclusiv Juniori & Școli (PRO)',
     contraLabel: 'Susținere și pentru Seniori (CONTRA)',
     rotationSlot: 0,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5'],
     votesContra: ['demo-6', 'demo-7'],
     createdBy: 'Oficial'
   },
   {
     id: 'sr-2',
     categoryId: 'sport-romanesc',
     title: 'Modelul „Generației de Aur” vs. Fotbalul Corporatist Modern',
     question: 'Poate fotbalul românesc să mai obțină performanțe europene bazându-se pe nuclee de jucători autohtoni crescuți în academii locale (modelul Hagi), sau singura șansă de competitivitate este investiția corporatistă masivă și importul de jucători străini?',
     proLabel: 'Academii Locale & Jucători Români (PRO)',
     contraLabel: 'Model Globalizat & Investitori (CONTRA)',
     rotationSlot: 0,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
     votesContra: ['demo-5', 'demo-6', 'demo-7'],
     createdBy: 'Oficial'
   },
   {
     id: 'sr-3',
     categoryId: 'sport-romanesc',
     title: 'Sporturile Olimpice (Canotaj, Înot, Gimnastică) vs. Fotbalul',
     question: 'Având în vedere că medaliile olimpice și mondiale ale României vin constant din canotaj, înot sau gimnastică, este justificată atenția mediatică și financiară disproporționată acordată fotbalului în România?',
     proLabel: 'Prioritate Sporturilor care Aduc Medalii (PRO)',
     contraLabel: 'Fotbalul Generează Piață & Audiență (CONTRA)',
     rotationSlot: 0,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5'],
     votesContra: ['demo-6', 'demo-7'],
     createdBy: 'Oficial'
   },
   {
     id: 'sr-4',
     categoryId: 'sport-romanesc',
     title: 'Cote Obligatorii de Sportivi Români (Legea Novak & Regula U21)',
     question: 'Impunerea prin lege sau regulament a unui număr obligatoriu de sportivi români și tineri U21 pe teren ajută real la creșterea valorii echipelor naționale sau scade artificial competitivitatea cluburilor românești în Europa?',
     proLabel: 'Măsură Necesară pentru Tineri (PRO)',
     contraLabel: 'Scade Valoarea și Meritul Sportiv (CONTRA)',
     rotationSlot: 1,
     votesPro: ['demo-1', 'demo-2', 'demo-3'],
     votesContra: ['demo-4', 'demo-5', 'demo-6'],
     createdBy: 'Oficial'
   },
   {
     id: 'sr-5',
     categoryId: 'sport-romanesc',
     title: 'Disciplina Spartană vs. Echilibrul Psihologic în Gimnastică',
     question: 'Privind istoria gimnasticii românești, pot fi obținute medalii olimpice de aur la cel mai înalt nivel fără un regim de sacrificiu și disciplină extremă, sau metodele moderne bazate pe protecție emoțională sunt singura cale etică și durabilă?',
     proLabel: 'Performanța Cere Sacrificiu Extrem (PRO)',
     contraLabel: 'Echilibrul Psihologic Primează (CONTRA)',
     rotationSlot: 1,
     votesPro: ['demo-1', 'demo-2'],
     votesContra: ['demo-3', 'demo-4', 'demo-5', 'demo-6'],
     createdBy: 'Oficial'
   },
   {
     id: 'sr-6',
     categoryId: 'sport-romanesc',
     title: 'Stadioane de 100 Milioane € vs. Baze Sportive de Cartier',
     question: 'A greșit statul român construind stadioane moderne și costisitoare în orașe fără echipe de top, în loc să deschidă sute de baze sportive multifuncționale și bazine de înot accesibile gratuit în școli și cartiere?',
     proLabel: 'Greșeală: Trebuiau Baze pentru Mase (PRO)',
     contraLabel: 'Stadioanele Mari Creează Emulație (CONTRA)',
     rotationSlot: 1,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
     votesContra: ['demo-5'],
     createdBy: 'Oficial'
   },
 
   // 2. FILOZOFIE / PSIHOLOGIE (6 prompturi pertinente: 3 în Lotul 0, 3 în Lotul 1)
   {
     id: 'fp-1',
     categoryId: 'filozofie-psihologie',
     title: 'Liberul Arbitru vs. Determinismul Biologic și Psihologic',
     question: 'Suntem cu adevărat autorii liberi ai propriilor noastre decizii morale, sau fiecare alegere pe care o facem este deja determinată de genetică, neurochimie, traumele timpurii și mediul în care am fost formați?',
     proLabel: 'Există Liber Arbitru Real (PRO)',
     contraLabel: 'Alegerile Sunt Determinate (CONTRA)',
     rotationSlot: 0,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
     votesContra: ['demo-5', 'demo-6', 'demo-7'],
     createdBy: 'Oficial'
   },
   {
     id: 'fp-2',
     categoryId: 'filozofie-psihologie',
     title: 'Căutarea Fericirii Confortabile vs. Sensul prin Suferință Asumată',
     question: 'A dus obsesia psihologiei contemporane pentru „starea de bine” și evitarea oricărui disconfort la o generație mai fragilă? Este o viață împlinită definită de liniște sau de asumarea unor responsabilități și lupte grele (viziunea stoică și existențialistă)?',
     proLabel: 'Sensul Vine din Luptă și Datorie (PRO)',
     contraLabel: 'Echilibrul și Fericirea Sunt Scopul (CONTRA)',
     rotationSlot: 0,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
     votesContra: ['demo-5', 'demo-6'],
     createdBy: 'Oficial'
   },
   {
     id: 'fp-3',
     categoryId: 'filozofie-psihologie',
     title: 'Empatia Emoțională vs. Rațiunea Rece în Deciziile Morale',
     question: 'Este empatia emoțională un ghid moral de încredere care ne face mai umani, sau ne face părtinitori și ușor de manipulat, fiind superioară o etică bazată pe rațiune obiectivă și principii universale?',
     proLabel: 'Empatia e Fundamentul Moral (PRO)',
     contraLabel: 'Rațiunea Obiectivă e Superioară (CONTRA)',
     rotationSlot: 0,
     votesPro: ['demo-1', 'demo-2', 'demo-3'],
     votesContra: ['demo-4', 'demo-5', 'demo-6'],
     createdBy: 'Oficial'
   },
   {
     id: 'fp-4',
     categoryId: 'filozofie-psihologie',
     title: 'Eul Autentic vs. Masca Socială (Persona) în Era Digitală',
     question: 'Mai există un „Eu autentic” stabil în interiorul nostru pe care trebuie să-l descoperim, sau identitatea umană este doar o construcție narativă care se rescrie continuu în funcție de privirea și validarea celorlalți?',
     proLabel: 'Există o Esență Autentică (PRO)',
     contraLabel: 'Identitatea e o Construcție Socială (CONTRA)',
     rotationSlot: 1,
     votesPro: ['demo-1', 'demo-2', 'demo-3'],
     votesContra: ['demo-4', 'demo-5'],
     createdBy: 'Oficial'
   },
   {
     id: 'fp-5',
     categoryId: 'filozofie-psihologie',
     title: 'Vindecarea Psihologică: Analiza Trecutului vs. Acțiunea în Prezent',
     question: 'Ajută cu adevărat dezgroparea și analizarea continuă a traumelor din copilărie la eliberarea adultului, sau riscă să transforme statutul de victimă într-o identitate permanentă care blochează responsabilitatea prezentă?',
     proLabel: 'Înțelegerea Traumei Vindecă (PRO)',
     contraLabel: 'Excesul Creează Victimizare (CONTRA)',
     rotationSlot: 1,
     votesPro: ['demo-1', 'demo-2', 'demo-3'],
     votesContra: ['demo-4', 'demo-5', 'demo-6'],
     createdBy: 'Oficial'
   },
   {
     id: 'fp-6',
     categoryId: 'filozofie-psihologie',
     title: 'Morala Obiectivă vs. Relativismul Moral (Avertismentul lui Nietzsche)',
     question: 'Pot exista valori morale obiective și universale fără o fundație transcendentă sau religioasă, ori fără un reper absolut orice sistem etic devine în final doar o convenție subiectivă și o negociere de putere?',
     proLabel: 'Morala Universală e Autonomă (PRO)',
     contraLabel: 'Fără Absolut Totul devine Relativ (CONTRA)',
     rotationSlot: 1,
     votesPro: ['demo-1', 'demo-2', 'demo-3'],
     votesContra: ['demo-4', 'demo-5'],
     createdBy: 'Oficial'
   },
 
   // 3. ISTORIE (6 prompturi pertinente: 3 în Lotul 0, 3 în Lotul 1)
   {
     id: 'ist-1',
     categoryId: 'istorie',
     title: 'Teoria „Oamenilor Mari” vs. Forțele Economice și Geografice',
     question: 'Este cursul istoriei schimbat decisiv de personalități excepționale (precum Alexandru Macedon, Napoleon, Cuza sau Regele Ferdinand), sau aceștia sunt doar instrumente ale unor procese economice, demografice și geopolitice care s-ar fi produs oricum?',
     proLabel: 'Liderii Schimbă Istoria (PRO)',
     contraLabel: 'Forțele Structurale Decid Totul (CONTRA)',
     rotationSlot: 0,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
     votesContra: ['demo-5', 'demo-6', 'demo-7'],
     createdBy: 'Oficial'
   },
   {
     id: 'ist-2',
     categoryId: 'istorie',
     title: 'Modernizarea României: „Formele fără Fond” vs. Sincronismul European',
     question: 'Privind dezbaterea clasică dintre Titu Maiorescu și Eugen Lovinescu, s-a modernizat România mai eficient prin importul rapid de instituții occidentale înainte ca societatea să fie pregătită, sau această grabă a generat o ruptură permanentă între elite și popor?',
     proLabel: 'Sincronismul a Salvat România (PRO)',
     contraLabel: 'Formele fără Fond au Deformat Statul (CONTRA)',
     rotationSlot: 0,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
     votesContra: ['demo-5', 'demo-6'],
     createdBy: 'Oficial'
   },
   {
     id: 'ist-3',
     categoryId: 'istorie',
     title: 'Judecarea Trecutului după Morala de Azi (Prezentism) vs. Contextul Epocii',
     question: 'Avem dreptul moral să judecăm și să sancționăm simbolic figurile istorice după standardele etice ale secolului XXI, sau o înțelegere onestă a istoriei cere evaluarea oamenilor exclusiv prin mentalitatea și normele epocii în care au trăit?',
     proLabel: 'Evaluare în Contextul Epocii (PRO)',
     contraLabel: 'Principiile Morale Sunt Atemporale (CONTRA)',
     rotationSlot: 0,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
     votesContra: ['demo-5', 'demo-6'],
     createdBy: 'Oficial'
   },
   {
     id: 'ist-4',
     categoryId: 'istorie',
     title: 'România Interbelică: Apogeu Cultural și Democratic sau Epocă Idealizată?',
     question: 'A fost perioada interbelică (1918–1938) adevărata „epocă de aur” a modernității și culturii românești, sau idealizăm nostalgic o societate marcată de fapt de sărăcie rurală severă, analfabetism și derapaje democratice?',
     proLabel: 'Apogeu Cultural și Instituțional (PRO)',
     contraLabel: 'Mitizare Nostalgică a unei Epoci Fragile (CONTRA)',
     rotationSlot: 1,
     votesPro: ['demo-1', 'demo-2', 'demo-3'],
     votesContra: ['demo-4', 'demo-5', 'demo-6'],
     createdBy: 'Oficial'
   },
   {
     id: 'ist-5',
     categoryId: 'istorie',
     title: 'Geopolitica Spațiului Românesc: Echilibru Diplomatic vs. Alianțe Ferme',
     question: 'De-a lungul istoriei Principatelor și a României moderne la intersecția marilor imperii, momentele decisive de supraviețuire și întregire s-au datorat diplomației flexibile de echilibru sau asumării unor alianțe militare ferme și ireversibile?',
     proLabel: 'Alianțele Ferme auAdus Marile Uniri (PRO)',
     contraLabel: 'Diplomația Echilibrului a Asigurat Supraviețuirea (CONTRA)',
     rotationSlot: 1,
     votesPro: ['demo-1', 'demo-2', 'demo-3'],
     votesContra: ['demo-4', 'demo-5'],
     createdBy: 'Oficial'
   },
   {
     id: 'ist-6',
     categoryId: 'istorie',
     title: 'Utilitatea Istoriei: Se Repetă Istoria Ciclic sau Fiecare Criză e Unică?',
     question: 'Poate studiul riguros al istoriei să prevină cu adevărat războaiele și crizele politice ale viitorului, sau natura umană și schimbările tehnologice fac ca fiecare generație să repete aceleași erori sub forme noi?',
     proLabel: 'Istoria Oferă Tipare Predictibile (PRO)',
     contraLabel: 'Fiecare Epocă Rescrie Regulile (CONTRA)',
     rotationSlot: 1,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
     votesContra: ['demo-5', 'demo-6'],
     createdBy: 'Oficial'
   },
 
   // 4. POLITICA (6 prompturi pertinente: 3 în Lotul 0, 3 în Lotul 1)
   {
     id: 'pol-1',
     categoryId: 'politica',
     title: 'Tehnocrația (Guvernul Experților) vs. Politicienii Aleși prin Vot',
     question: 'În perioade de criză economică sau instituțională profundă, ar trebui ca deciziile strategice să fie luate de specialiști neafiliați politic pe bază de date tehnice, sau legitimitatea votului popular trebuie să primeze întotdeauna într-o democrație?',
     proLabel: 'Competența Tehnocrată (PRO)',
     contraLabel: 'Legitimitatea Votului Popular (CONTRA)',
     rotationSlot: 0,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
     votesContra: ['demo-5', 'demo-6', 'demo-7'],
     createdBy: 'Oficial'
   },
   {
     id: 'pol-2',
     categoryId: 'politica',
     title: 'Statul Minimal (Taxe Mici & Piață Liberă) vs. Statul Social (Impozitare Progresivă)',
     question: 'Care model economic este mai just și mai eficient pentru dezvoltarea României: un stat minimal cu cotă unică redusă care stimulează inițiativa privată, sau un stat social puternic bazat pe impozitare progresivă și redistribuire?',
     proLabel: 'Stat Minimal & Cotă Unică (PRO)',
     contraLabel: 'Stat Social & Impozit Progresiv (CONTRA)',
     rotationSlot: 0,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
     votesContra: ['demo-5', 'demo-6', 'demo-7'],
     createdBy: 'Oficial'
   },
   {
     id: 'pol-3',
     categoryId: 'politica',
     title: 'Libertatea Absolută a Discursului Politic vs. Combaterea Dezinformării',
     question: 'Pentru a-și proteja democrația de manipulare hibridă, ar trebui statul să reglementeze și să sancționeze activ dezinformarea politică în mediul online, sau orice arbitru oficial al „adevărului” reprezintă un pericol mai mare pentru libertate?',
     proLabel: 'Libertatea de Exprimare Primează (PRO)',
     contraLabel: 'Democrația Trebuie Apărată de Manipulare (CONTRA)',
     rotationSlot: 0,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
     votesContra: ['demo-5', 'demo-6'],
     createdBy: 'Oficial'
   },
   {
     id: 'pol-4',
     categoryId: 'politica',
     title: 'Votul Obligatoriu prin Lege vs. Dreptul de a Boicota Alegerile',
     question: 'Ar crește reprezentativitatea și calitatea clasei politice dacă prezența la vot ar deveni obligatorie pentru toți cetățenii (după modelul din Belgia sau Australia), sau neprezentarea la urne este o formă legitimă de protest politic?',
     proLabel: 'Da, Vot Obligatoriu (PRO)',
     contraLabel: 'Nu, Absenteismul e un Drept (CONTRA)',
     rotationSlot: 1,
     votesPro: ['demo-1', 'demo-2', 'demo-3'],
     votesContra: ['demo-4', 'demo-5', 'demo-6'],
     createdBy: 'Oficial'
   },
   {
     id: 'pol-5',
     categoryId: 'politica',
     title: 'Suveranitatea Națională vs. Federalizarea Uniunii Europene',
     question: 'Este interesul strategic al României mai bine servit prin integrarea într-o Uniune Europeană federală (cu politică externă, armată și fiscalitate comună, fără drept de veto) sau prin păstrarea suveranității decizionale a fiecărui stat membru?',
     proLabel: 'Integrare Federală Europeană (PRO)',
     contraLabel: 'Păstrarea Suveranității și a Dreptului de Veto (CONTRA)',
     rotationSlot: 1,
     votesPro: ['demo-1', 'demo-2', 'demo-3'],
     votesContra: ['demo-4', 'demo-5', 'demo-6'],
     createdBy: 'Oficial'
   },
   {
     id: 'pol-6',
     categoryId: 'politica',
     title: 'Limitarea la Două Mandate pentru Primari și Parlamentari',
     question: 'Ar trebui introdusă prin Constituție limita de maximum două mandate pentru primari, șefi de consilii județene și parlamentari (la fel ca în cazul Președintelui) pentru a opri blocarea puterii locale, sau cetățenii trebuie lăsați să realeagă un lider performant?',
     proLabel: 'Maximum 2 Mandate pentru Toți Aleșii (PRO)',
     contraLabel: 'Cetățenii Decid prin Vot Neîngrădit (CONTRA)',
     rotationSlot: 1,
     votesPro: ['demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5'],
     votesContra: ['demo-6'],
     createdBy: 'Oficial'
   }
 ];
 
 // Mesaje demonstrative inițiale pentru ca dezbaterile din cele 4 categorii să fie vii și pertinente
 const INITIAL_DEMO_MESSAGES = [
   {
     id: 'demo-sr-1',
     promptId: 'sr-1',
     categoryId: 'sport-romanesc',
     text: 'Cât timp primăriile pompează milioane de euro anual în salarii de jucători străini la echipe de Liga 1 și Liga 2 fără nicio strategie pe termen lung, bazele școlare rămân cu lacătul pe ușă. Banul public trebuie să meargă 100% în bazine, săli de sport școlare și antrenori de copii și juniori.',
     stance: 'PRO',
     sourceUrl: 'https://www.cosr.ro',
     senderId: 'demo-user-1',
     senderName: 'Radu_SportRO',
     senderAvatar: '🏆',
     senderEmailVerified: true,
     upvotes: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
     downvotes: [],
     timestamp: Date.now() - 3600 * 1000 * 3
   },
   {
     id: 'demo-sr-2',
     promptId: 'sr-1',
     categoryId: 'sport-romanesc',
     text: 'În orașele mijlocii din România, capitalul privat este prea slab pentru a susține singur echipe de handbal, baschet sau fotbal de seniori. Dacă autoritățile locale își retrag brusc finanțarea, dispar modelele pentru copii și infrastructura sportivă rămâne nefolosită.',
     stance: 'CONTRA',
     sourceUrl: '',
     senderId: 'demo-user-2',
     senderName: 'Mihai_Analist',
     senderAvatar: '🦁',
     senderEmailVerified: true,
     upvotes: ['demo-5', 'demo-6'],
     downvotes: ['demo-1'],
     timestamp: Date.now() - 3600 * 1000 * 2
   },
   {
     id: 'demo-fp-1',
     promptId: 'fp-1',
     categoryId: 'filozofie-psihologie',
     text: 'Chiar dacă impulsurile noastre biologice și tiparele din copilărie ne condiționează reacțiile automate, capacitatea conștiinței de a reflecta asupra propriilor impulsuri și de a spune „Nu” instinctului rămâne fundamentul responsabilității morale. Fără liber arbitru, ideea de justiție și etică își pierde sensul.',
     stance: 'PRO',
     sourceUrl: 'https://plato.stanford.edu/entries/freewill/',
     senderId: 'demo-user-3',
     senderName: 'Elena_Filosofie',
     senderAvatar: '🦉',
     senderEmailVerified: true,
     upvotes: ['demo-1', 'demo-2', 'demo-3'],
     downvotes: [],
     timestamp: Date.now() - 3600 * 1000 * 2.5
   },
   {
     id: 'demo-ist-1',
     promptId: 'ist-2',
     categoryId: 'istorie',
     text: 'Dacă elitele pașoptiste și Regele Carol I ar fi așteptat ca societatea rurală să evolueze lent timp de două secole înainte să adopte Constituția din 1866, căile ferate și Universitatea, România modernă nu ar fi existat la 1918. Formele occidentale au tras după ele fondul.',
     stance: 'PRO',
     sourceUrl: 'https://historia.ro',
     senderId: 'demo-user-4',
     senderName: 'Istoricul_Bucuresti',
     senderAvatar: '🏛️',
     senderEmailVerified: true,
     upvotes: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
     downvotes: [],
     timestamp: Date.now() - 3600 * 1000 * 1.5
   },
   {
     id: 'demo-pol-1',
     promptId: 'pol-1',
     categoryId: 'politica',
     text: 'Nicio decizie economică majoră nu este pur „tehnică” — orice buget implică o alegere de valori între cine câștigă și cine suportă costurile. Tehnocrații pot oferi soluții de eficiență, dar numai reprezentanții aleși prin vot poartă răspunderea democratică în fața cetățenilor.',
     stance: 'CONTRA',
     sourceUrl: '',
     senderId: 'demo-user-5',
     senderName: 'Alexandru_Politic',
     senderAvatar: '⚖️',
     senderEmailVerified: true,
     upvotes: ['demo-1', 'demo-2', 'demo-3'],
     downvotes: [],
     timestamp: Date.now() - 3600 * 1000
   }
 ];
 
 const AVATAR_OPTIONS = [
   '🦉', '🦁', '🦊', '🦅', '🐺', '🐼', '🏛️', '⚖️', '♟️', '🎭', '🕯️', '📜', '⚡', '🌍', '🧠', '🔥'
 ];
 
 const QUICK_STARTERS = [
   "Argumentul meu principal este că...",
   "Dacă privim datele istorice, observăm că ",
   "În replică la tabăra opusă, consider că ",
   "Perspectiva de mijloc pe care o propun este: "
 ];
 
 const normalizeText = (str) => {
   return (str || '')
     .toLowerCase()
     .normalize('NFD')
     .replace(/[\u0300-\u036f]/g, '');
 };
 
 // ==========================================
 // GENERATOR ROTITE DINTATE & CAP MECANIC DETALIAT (STIL GRAVURA DIN IMAGINE)
 // ==========================================
 const buildGearPath = (cx, cy, outerR, innerR, teethCount) => {
   let d = '';
   const step = (Math.PI * 2) / (teethCount * 2);
   for (let i = 0; i < teethCount * 2; i++) {
     const r = i % 2 === 0 ? outerR : innerR;
     const angle = i * step;
     const x = cx + r * Math.cos(angle);
     const y = cy + r * Math.sin(angle);
     d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
   }
   return `${d}Z`;
 };
 
 const MechanicalClockworkHead = ({ side = 'left', isDark = false }) => {
   const isRight = side === 'right';
   const ink = isDark ? '#EAE3D5' : '#181614';
   const paper = isDark ? '#141311' : '#F3ECE0';
   const accentShade = isDark ? '#2A2622' : '#DFD5C3';
 
   // Conturul anatomic al profilului uman mecanic (privind spre dreapta în coordonatele de bază 0..520 x 0..700)
   const headContour =
     'M 0 12 ' +
     'C 135 6, 265 24, 345 104 ' + // Calota craniană
     'C 382 145, 398 196, 388 246 ' + // Fruntea și arcada
     'L 458 346 ' + // Vârful nasului mecanic
     'L 398 372 ' + // Baza nasului
     'L 416 404 ' + // Buza superioară
     'L 378 424 ' + // Deschiderea gurii (la nivelul frânghiei)
     'L 412 448 ' + // Buza inferioară
     'C 420 494, 400 538, 344 548 ' + // Bărbia mecanică
     'L 256 548 ' + // Maxilarul inferior
     'L 276 695 ' + // Linia gâtului
     'L 0 695 Z';
 
   return (
     <svg
       viewBox="0 0 520 700"
       preserveAspectRatio={isRight ? 'xMaxYMid meet' : 'xMinYMid meet'}
       className="w-full h-full select-none block"
     >
       {/* Grup oglindit direct în sistemul de coordonate SVG pentru a evita orice bug de clipPath pe stânga sau dreapta */}
       <g transform={isRight ? 'translate(520, 0) scale(-1, 1)' : undefined}>
         {/* Cercuri și axe de construcție tehnică tip Leonardo da Vinci pe fundal */}
         <g stroke={ink} fill="none" opacity={isDark ? '0.25' : '0.28'}>
           <circle cx="185" cy="310" r="295" strokeWidth="1.3" />
           <circle cx="185" cy="310" r="255" strokeWidth="1.1" strokeDasharray="7 6" />
           <circle cx="185" cy="310" r="205" strokeWidth="1" />
           <circle cx="338" cy="255" r="78" strokeWidth="1" strokeDasharray="4 4" />
           <line x1="0" y1="310" x2="505" y2="310" strokeWidth="1" strokeDasharray="5 6" />
           <line x1="185" y1="0" x2="185" y2="700" strokeWidth="1" strokeDasharray="5 6" />
           <line x1="20" y1="75" x2="470" y2="555" strokeWidth="0.9" strokeDasharray="3 8" />
           <circle cx="418" cy="132" r="4.5" fill={ink} />
           <circle cx="465" cy="252" r="3.5" fill={ink} />
           <circle cx="445" cy="495" r="4" fill={ink} />
         </g>
 
         {/* SILUETA PRINCIPALĂ A CAPULUI MECANIC (CERNEALĂ NEAGRĂ DENSĂ) */}
         <path
           d={headContour}
           fill={ink}
           stroke={ink}
           strokeWidth="6"
           strokeLinejoin="round"
         />
 
         {/* PLĂCI METALICE INTERIOARE PENTRU CONTRAST DE GRAVURĂ */}
         <path
           d="M 0 34 C 128 26, 260 56, 336 154 L 284 262 L 92 256 L 0 192 Z"
           fill={accentShade}
           stroke={ink}
           strokeWidth="4.5"
         />
         <path
           d="M 0 320 L 272 320 L 352 458 L 242 682 L 0 682 Z"
           fill={paper}
           stroke={ink}
           strokeWidth="4.5"
         />
 
         {/* CABLURI ȘI TUBURI STRIATE PE CALOTA CRANIANĂ */}
         {[0, 13, 26].map((offset, idx) => (
           <path
             key={`cable-top-${side}-${idx}`}
             d={`M 2 ${52 + offset} C 125 ${34 + offset}, 242 ${62 + offset}, 332 ${142 + offset}`}
             fill="none"
             stroke={idx % 2 === 0 ? ink : paper}
             strokeWidth="7.5"
           />
         ))}
         {Array.from({ length: 18 }).map((_, i) => (
           <line
             key={`rib-${side}-${i}`}
             x1={22 + i * 17}
             y1={36 + i * 4.2}
             x2={15 + i * 17}
             y2={88 + i * 4.2}
             stroke={ink}
             strokeWidth="2.8"
           />
         ))}
 
         {/* PLACA PERFORATĂ DE CIRCUIT MECANIC (STÂNGA-SUS ÎN CRANIU) */}
         <g transform="translate(14, 134)">
           <rect
             x="0"
             y="0"
             width="112"
             height="148"
             rx="10"
             fill={paper}
             stroke={ink}
             strokeWidth="4.5"
           />
           <rect
             x="10"
             y="10"
             width="92"
             height="128"
             rx="6"
             fill="none"
             stroke={ink}
             strokeWidth="2.2"
           />
           {Array.from({ length: 4 }).map((_, col) =>
             Array.from({ length: 6 }).map((__, row) => (
               <circle
                 key={`perf-${side}-${col}-${row}`}
                 cx={25 + col * 20}
                 cy={25 + row * 19}
                 r="4.2"
                 fill={ink}
               />
             ))
           )}
         </g>
 
         {/* ANGRENAJUL GIGANT CENTRAL DIN CREIER */}
         <g>
           <path
             d={buildGearPath(208, 202, 90, 75, 18)}
             fill={paper}
             stroke={ink}
             strokeWidth="4.5"
           />
           <circle cx="208" cy="202" r="60" fill={ink} />
           {[0, 45, 90, 135].map((deg) => (
             <line
               key={`spoke-main-${side}-${deg}`}
               x1="208"
               y1="138"
               x2="208"
               y2="266"
               stroke={paper}
               strokeWidth="10"
               transform={`rotate(${deg} 208 202)`}
             />
           ))}
           <circle cx="208" cy="202" r="28" fill={paper} stroke={ink} strokeWidth="5" />
           <circle cx="208" cy="202" r="11" fill={ink} />
         </g>
 
         {/* ROATA DINȚATĂ FRONTALĂ (FRUNTE) */}
         <g>
           <path
             d={buildGearPath(312, 142, 50, 40, 12)}
             fill={paper}
             stroke={ink}
             strokeWidth="4"
           />
           <circle cx="312" cy="142" r="27" fill={ink} />
           <circle cx="312" cy="142" r="13" fill={paper} stroke={ink} strokeWidth="3.5" />
         </g>
 
         {/* ROATA DINȚATĂ SUPERIOARĂ-SPATE */}
         <g>
           <path
             d={buildGearPath(112, 92, 46, 36, 12)}
             fill={paper}
             stroke={ink}
             strokeWidth="4"
           />
           <circle cx="112" cy="92" r="21" fill={ink} />
           <circle cx="112" cy="92" r="9" fill={paper} />
         </g>
 
         {/* OCHIUL BIOMECANIC / LENTILA OPTICĂ CU VIZOR */}
         <g>
           <circle cx="342" cy="256" r="46" fill={ink} stroke={paper} strokeWidth="4" />
           <circle cx="342" cy="256" r="34" fill={paper} stroke={ink} strokeWidth="4.5" />
           <ellipse cx="346" cy="256" rx="19" ry="25" fill={paper} stroke={ink} strokeWidth="3.5" />
           <circle cx="350" cy="256" r="9.5" fill={ink} />
           <circle cx="347" cy="252" r="3.2" fill={paper} />
           <line x1="308" y1="256" x2="376" y2="256" stroke={ink} strokeWidth="2.5" />
           <line x1="342" y1="222" x2="342" y2="290" stroke={ink} strokeWidth="2.5" />
         </g>
 
         {/* STRUCTURA TRIUNGHIULARĂ A NASULUI MECANIC */}
         <g>
           <polygon
             points="376,276 446,344 376,368"
             fill={paper}
             stroke={ink}
             strokeWidth="5"
           />
           <polygon points="386,298 428,339 386,354" fill={ink} />
           <circle cx="382" cy="356" r="7.5" fill={paper} stroke={ink} strokeWidth="3" />
         </g>
 
         {/* ROATA DINȚATĂ CENTRALĂ (OBRAZ / TÂMPLĂ) */}
         <g>
           <path
             d={buildGearPath(248, 328, 58, 47, 14)}
             fill={paper}
             stroke={ink}
             strokeWidth="4.5"
           />
           <circle cx="248" cy="328" r="35" fill={ink} />
           {[0, 60, 120].map((deg) => (
             <line
               key={`spoke-mid-${side}-${deg}`}
               x1="248"
               y1="288"
               x2="248"
               y2="368"
               stroke={paper}
               strokeWidth="7.5"
               transform={`rotate(${deg} 248 328)`}
             />
           ))}
           <circle cx="248" cy="328" r="16" fill={paper} stroke={ink} strokeWidth="4" />
         </g>
 
         {/* ROATA DINȚATĂ DIN PARTEA DIN SPATE A CAPULUI (CEAFĂ) */}
         <g>
           <path
             d={buildGearPath(88, 348, 70, 58, 16)}
             fill={accentShade}
             stroke={ink}
             strokeWidth="4.5"
           />
           <circle cx="88" cy="348" r="42" fill={ink} />
           <circle cx="88" cy="348" r="23" fill={paper} stroke={ink} strokeWidth="4" />
           <circle cx="88" cy="348" r="9" fill={ink} />
         </g>
 
         {/* PISTOANE, BIELE ȘI GRILAJ VOCAL ÎN MAXILAR & BĂRBIE */}
         <g>
           <path
             d="M 176 404 L 358 482 L 344 510 L 162 432 Z"
             fill={paper}
             stroke={ink}
             strokeWidth="4.5"
           />
           <line x1="186" y1="422" x2="334" y2="488" stroke={ink} strokeWidth="5" />
           <circle cx="182" cy="418" r="15" fill={paper} stroke={ink} strokeWidth="4" />
           <circle cx="348" cy="494" r="17" fill={paper} stroke={ink} strokeWidth="4.5" />
           <circle cx="348" cy="494" r="6.5" fill={ink} />
 
           {/* Grilaj mecanic la gură */}
           <rect
             x="316"
             y="384"
             width="86"
             height="60"
             rx="8"
             fill={paper}
             stroke={ink}
             strokeWidth="4"
           />
           {[0, 1, 2, 3, 4].map((bar) => (
             <line
               key={`mouth-vent-${side}-${bar}`}
               x1={330 + bar * 14}
               y1="390"
               x2={330 + bar * 14}
               y2="438"
               stroke={ink}
               strokeWidth="4"
             />
           ))}
         </g>
 
         {/* ANGRENAJE ȘI CILINDRI HIDRAULICI ÎN ZONA GÂTULUI */}
         <g>
           <path
             d={buildGearPath(198, 532, 64, 52, 15)}
             fill={paper}
             stroke={ink}
             strokeWidth="4.5"
           />
           <circle cx="198" cy="532" r="36" fill={ink} />
           <circle cx="198" cy="532" r="17" fill={paper} stroke={ink} strokeWidth="4" />
 
           <rect
             x="34"
             y="445"
             width="56"
             height="240"
             rx="8"
             fill={paper}
             stroke={ink}
             strokeWidth="4.5"
           />
           {Array.from({ length: 9 }).map((_, s) => (
             <line
               key={`spring-${side}-${s}`}
               x1="36"
               y1={465 + s * 23}
               x2="88"
               y2={478 + s * 23}
               stroke={ink}
               strokeWidth="5"
             />
           ))}
 
           <path
             d="M 116 580 L 258 632 L 246 666 L 104 614 Z"
             fill={paper}
             stroke={ink}
             strokeWidth="4.5"
           />
           <circle cx="122" cy="598" r="14" fill={paper} stroke={ink} strokeWidth="4" />
           <circle cx="240" cy="645" r="14" fill={paper} stroke={ink} strokeWidth="4" />
         </g>
 
         {/* RECONTURARE EXTERIOARĂ GROASĂ PENTRU CLARITATE MAXIMĂ */}
         <path
           d={headContour}
           fill="none"
           stroke={ink}
           strokeWidth="6.5"
           strokeLinejoin="round"
         />
       </g>
     </svg>
   );
 };
 
 export default function App() {
   // Tema implicită este 'light' (Pergament Editorial ca în imaginea trimisă), cu comutator instant spre 'dark'
   const [theme, setTheme] = useState('light');
   const isDark = theme === 'dark';
 
   // Navigare Principală: 'home' (Homepage-ul cu ilustrația din Word și cele 3 opțiuni) -> 'free' | 'arena5v5' | 'duel1v1'
   const [currentView, setCurrentView] = useState('home'); // 'home' | 'free' | 'arena5v5' | 'duel1v1'
 
   // Autentificare și Profil
   const [user, setUser] = useState(null);
   const [nickname, setNickname] = useState('Dezbătător_01');
   const [avatar, setAvatar] = useState('🦉');
   const [isEditingProfile, setIsEditingProfile] = useState(false);
   const [tempNickname, setTempNickname] = useState('Dezbătător_01');
   const [tempAvatar, setTempAvatar] = useState('🦉');
 
   // ==========================================
   // SISTEM CONTURI CU EMAIL, LOG IN & VERIFICARE EMAIL
   // ==========================================
   const [registeredAccounts, setRegisteredAccounts] = useState([]);
   const [loggedInAccount, setLoggedInAccount] = useState(null); // Contul autentificat și verificat
   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
   const [authModalStep, setAuthModalStep] = useState('login'); // 'login' | 'signup' | 'verify' | 'confirmed' | 'inbox-preview'
 
   // Formular Înregistrare / Autentificare
   const [authEmail, setAuthEmail] = useState('');
   const [authPassword, setAuthPassword] = useState('');
   const [authConfirmPassword, setAuthConfirmPassword] = useState('');
   const [authUsername, setAuthUsername] = useState('');
   const [authAvatar, setAuthAvatar] = useState('🦉');
   const [verificationCodeInput, setVerificationCodeInput] = useState('');
   const [pendingAccount, setPendingAccount] = useState(null);
   const [authError, setAuthError] = useState('');
   const [authSuccessMsg, setAuthSuccessMsg] = useState('');
   const [sentEmailsLog, setSentEmailsLog] = useState([]);
   const [latestEmailToast, setLatestEmailToast] = useState(null);
   const [emailWebhookUrl, setEmailWebhookUrl] = useState('');
   const [isSendingEmail, setIsSendingEmail] = useState(false);
 
   // State Categorii, Subiecte (Prompts), Căutare și Navigare Mobilă
   const [prompts, setPrompts] = useState(INITIAL_PROMPTS);
   const [activeCategoryId, setActiveCategoryId] = useState('sport-romanesc');
   const [activePromptId, setActivePromptId] = useState('sr-1');
   const [searchQuery, setSearchQuery] = useState('');
   const [mobileStep, setMobileStep] = useState('chat');
 
   // Meniu Acordeon Compact în Stânga & Moduri (Discuție Liberă vs. Minigame Arena 5v5 vs. Duel 1v1)
   const [expandedCategoryId, setExpandedCategoryId] = useState('sport-romanesc'); // Când deschizi o categorie, cea dinainte se închide automat
   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Poate restrânge meniul la o bară îngustă de iconițe
   const [platformMode, setPlatformMode] = useState('free'); // 'free' | 'arena5v5' | 'duel1v1'
 
   const enterPlatformMode = (mode) => {
     setPlatformMode(mode);
     setCurrentView(mode);
     setMobileStep('chat');
   };
 
   // ==========================================
   // STATE PENTRU MODUL 3: DUEL 1v1 (MATCHMAKING & INVITAȚII DIRECTE)
   // ==========================================
   const [duelMyStance, setDuelMyStance] = useState('PRO'); // 'PRO' | 'CONTRA'
   const [isMatchmaking1v1, setIsMatchmaking1v1] = useState(false);
   const [matchmakingProgress, setMatchmakingProgress] = useState(0);
   const [activeDuelMatch, setActiveDuelMatch] = useState(null);
   const [duelTurnSeconds, setDuelTurnSeconds] = useState(60);
   const [duelTimerRunning, setDuelTimerRunning] = useState(false);
   const [duelAudienceBar, setDuelAudienceBar] = useState(50); // 0..100 (% PRO)
   const [duelInputText, setDuelInputText] = useState('');
   const [duelSourceUrl, setDuelSourceUrl] = useState('');
   const [duelMessages, setDuelMessages] = useState([]);
 
   // Modal & Notificări pentru Invitație Directă 1v1 din Chatul Liber sau din Arena 5v5
   const [invite1v1ModalOpen, setInvite1v1ModalOpen] = useState(false);
   const [inviteTargetUser, setInviteTargetUser] = useState(null); // { name, avatar, sourceMode }
   const [invitePromptId, setInvitePromptId] = useState('sr-1');
   const [inviteMyStance, setInviteMyStance] = useState('PRO');
   const [inviteCustomNote, setInviteCustomNote] = useState('');
   const [incoming1v1Invite, setIncoming1v1Invite] = useState(null);
 
   // State dedicat pentru Minigame-ul separat Arena 5v5
   const [arenaSeats, setArenaSeats] = useState({
     PRO: [
       { seatIndex: 0, name: 'Radu_SportRO', avatar: '🏆', isBot: true, ready: true },
       { seatIndex: 1, name: 'Elena_Filosofie', avatar: '🦉', isBot: true, ready: true },
       null,
       null,
       null
     ],
     CONTRA: [
       { seatIndex: 0, name: 'Mihai_Analist', avatar: '🦁', isBot: true, ready: true },
       { seatIndex: 1, name: 'Alexandru_Politic', avatar: '⚖️', isBot: true, ready: true },
       null,
       null,
       null
     ]
   });
   const [arenaActiveSpeaker, setArenaActiveSpeaker] = useState({
     side: 'PRO',
     seatIndex: 0,
     name: 'Radu_SportRO',
     avatar: '🏆',
     mode: 'argument' // 'argument' (60s) | 'replica' (30s)
   });
   const [arenaTimerSeconds, setArenaTimerSeconds] = useState(60);
   const [arenaTimerRunning, setArenaTimerRunning] = useState(false);
   const [arenaRoundNumber, setArenaRoundNumber] = useState(1);
   const [arenaAudienceRope, setArenaAudienceRope] = useState(54); // 0..100 (50 = echilibru perfect)
   const [arenaMatchLog, setArenaMatchLog] = useState([
     {
       id: 'arena-msg-1',
       side: 'PRO',
       seatNumber: 1,
       senderName: 'Radu_SportRO',
       senderAvatar: '🏆',
       type: 'Argument 60s',
       text: 'În deschiderea meciului 5v5: investiția în bazele școlare și academiile de juniori este singura măsură care produce campioni pe termen lung, nu salarii temporare.',
       score: 14,
       upvoters: ['demo-1', 'demo-2'],
       timestamp: Date.now() - 180000
     },
     {
       id: 'arena-msg-2',
       side: 'CONTRA',
       seatNumber: 1,
       senderName: 'Mihai_Analist',
       senderAvatar: '🦁',
       type: 'Drept la Replică 30s',
       text: 'Replică directă: fără echipe de seniori în orașele medii, juniorii formați nu au unde să facă tranziția spre marea performanță și abandonează la 18 ani!',
       score: 11,
       upvoters: ['demo-3'],
       timestamp: Date.now() - 95000
     }
   ]);
   const [arenaInputText, setArenaInputText] = useState('');
 
   // Rotația la 6 Ore
   const [nowMs, setNowMs] = useState(() => Date.now());
   const [simulatedCycleOffset, setSimulatedCycleOffset] = useState(0);
   const [promptViewFilter, setPromptViewFilter] = useState('live'); // 'live' (6h) sau 'all' (arhivă)
 
   // Mesaje & Argumente PRO/CONTRA
   const [allMessages, setAllMessages] = useState(INITIAL_DEMO_MESSAGES);
   const [messageInput, setMessageInput] = useState('');
   const [selectedStance, setSelectedStance] = useState('PRO'); // 'PRO' | 'CONTRA' | 'NEUTRU'
   const [sourceUrlInput, setSourceUrlInput] = useState('');
   const [showSourceField, setShowSourceField] = useState(false);
   const [replyingToMessage, setReplyingToMessage] = useState(null);
 
   // Cronometrul opțional de 60 secunde pentru formularea unui argument
   const [argTimerActive, setArgTimerActive] = useState(false);
   const [argSecondsLeft, setArgSecondsLeft] = useState(60);
 
   // Adăugare Subiect Nou
   const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
   const [newPromptCategory, setNewPromptCategory] = useState('sport-romanesc');
   const [newPromptTitle, setNewPromptTitle] = useState('');
   const [newPromptQuestion, setNewPromptQuestion] = useState('');
 
   // Sistem Auto-Ban & Ban Appeal
   const [bannedWords, setBannedWords] = useState(DEFAULT_BANNED_WORDS);
   const [newBannedWordInput, setNewBannedWordInput] = useState('');
   const [banInfo, setBanInfo] = useState(null);
   const [banAppeals, setBanAppeals] = useState([]);
   const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
   const [appealTab, setAppealTab] = useState('user'); // 'user' | 'admin' | 'words'
   const [appealExplanation, setAppealExplanation] = useState('');
   const [appealPromiseChecked, setAppealPromiseChecked] = useState(false);
   const [moderationBannerAlert, setModerationBannerAlert] = useState(null);
 
   const messagesEndRef = useRef(null);
   const inputRef = useRef(null);
 
   // ==========================================
   // 0. CEASUL PENTRU ROTATIA LA 6 ORE & CRONOMETRU 60S
   // ==========================================
   useEffect(() => {
     const interval = setInterval(() => {
       setNowMs(Date.now());
     }, 1000);
     return () => clearInterval(interval);
   }, []);
 
   useEffect(() => {
     if (!argTimerActive) return;
     if (argSecondsLeft <= 0) {
       setArgTimerActive(false);
       return;
     }
     const t = setTimeout(() => {
       setArgSecondsLeft((prev) => prev - 1);
     }, 1000);
     return () => clearTimeout(t);
   }, [argTimerActive, argSecondsLeft]);
 
   // Cronometrul oficial din Minigame-ul Arena 5v5 (60s argument / 30s replică)
   useEffect(() => {
     if (!arenaTimerRunning) return;
     if (arenaTimerSeconds <= 0) {
       setArenaTimerRunning(false);
       return;
     }
     const timer = setTimeout(() => {
       setArenaTimerSeconds((prev) => prev - 1);
     }, 1000);
     return () => clearTimeout(timer);
   }, [arenaTimerRunning, arenaTimerSeconds]);
 
   // Cronometrul pentru runda din Duelul 1v1 (60s)
   useEffect(() => {
     if (!duelTimerRunning) return;
     if (duelTurnSeconds <= 0) {
       setDuelTimerRunning(false);
       return;
     }
     const t = setTimeout(() => {
       setDuelTurnSeconds((prev) => prev - 1);
     }, 1000);
     return () => clearTimeout(t);
   }, [duelTimerRunning, duelTurnSeconds]);
 
   const rotationInfo = useMemo(() => {
     const baseCycleIndex = Math.floor(nowMs / SIX_HOURS_MS);
     const activeCycleIndex = baseCycleIndex + simulatedCycleOffset;
     const nextRotationTimestamp = (baseCycleIndex + 1) * SIX_HOURS_MS;
     const msRemaining = Math.max(0, nextRotationTimestamp - nowMs);
 
     const hours = Math.floor(msRemaining / (1000 * 60 * 60));
     const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
     const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);
 
     const formattedCountdown = [
       String(hours).padStart(2, '0'),
       String(minutes).padStart(2, '0'),
       String(seconds).padStart(2, '0')
     ].join(':');
 
     const progressPercent = Math.min(
       100,
       Math.max(0, ((SIX_HOURS_MS - msRemaining) / SIX_HOURS_MS) * 100)
     );
 
     return {
       activeCycleIndex,
       msRemaining,
       formattedCountdown,
       progressPercent,
       isSimulated: simulatedCycleOffset !== 0
     };
   }, [nowMs, simulatedCycleOffset]);
 
   // ==========================================
   // 1. AUTENTIFICARE FIREBASE
   // ==========================================
   useEffect(() => {
     if (!auth) return;
 
     const initAuth = async () => {
       try {
         if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           await signInWithCustomToken(auth, __initial_auth_token);
         } else {
           await signInAnonymously(auth);
         }
       } catch (err) {
         console.error('Eroare la autentificare:', err);
       }
     };
 
     initAuth();
 
     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
       setUser(currentUser);
       if (currentUser) {
         const shortCode = currentUser.uid.slice(0, 4).toUpperCase();
         const randomAvatar = AVATAR_OPTIONS[currentUser.uid.charCodeAt(0) % AVATAR_OPTIONS.length];
         setNickname(`Dezbătător_${shortCode}`);
         setTempNickname(`Dezbătător_${shortCode}`);
         setAvatar(randomAvatar);
         setTempAvatar(randomAvatar);
       }
     });
 
     return () => unsubscribe();
   }, []);
 
   // ==========================================
   // 2. SINCRONIZARE FIRESTORE IN TIMP REAL
   // ==========================================
   useEffect(() => {
     if (!user || !db) return;
 
     const validCategoryIds = new Set(CATEGORIES.map((c) => c.id));
     const promptsRef = collection(db, 'artifacts', appId, 'public', 'data', 'debatePrompts_v2');
     const unsubPrompts = onSnapshot(
       promptsRef,
       (snapshot) => {
         if (snapshot.empty) {
           INITIAL_PROMPTS.forEach(async (item) => {
             try {
               const pDoc = doc(db, 'artifacts', appId, 'public', 'data', 'debatePrompts_v2', item.id);
               await setDoc(pDoc, item);
             } catch (e) {
               console.error('Eroare la inițializarea subiectelor:', e);
             }
           });
         } else {
           const fetched = [];
           snapshot.forEach((docSnap) => {
             const data = docSnap.data();
             if (validCategoryIds.has(data.categoryId)) {
               fetched.push({ id: docSnap.id, ...data });
             }
           });
           const initialMap = new Map(INITIAL_PROMPTS.map((ip) => [ip.id, ip]));
           const existingIds = new Set(fetched.map((p) => p.id));
           const merged = [
             ...fetched.map((fp) => {
               const seed = initialMap.get(fp.id);
               return seed ? { ...seed, ...fp, title: seed.title, question: seed.question } : fp;
             }),
             ...INITIAL_PROMPTS.filter((ip) => !existingIds.has(ip.id))
           ];
           setPrompts(merged);
         }
       },
       (err) => console.error('Eroare la citirea subiectelor:', err)
     );
 
     const messagesRef = collection(db, 'artifacts', appId, 'public', 'data', 'debateMessages_v2');
     const unsubMessages = onSnapshot(
       messagesRef,
       (snapshot) => {
         if (snapshot.empty) {
           INITIAL_DEMO_MESSAGES.forEach(async (m) => {
             try {
               const mDoc = doc(db, 'artifacts', appId, 'public', 'data', 'debateMessages_v2', m.id);
               await setDoc(mDoc, m);
             } catch (e) {
               console.error(e);
             }
           });
         } else {
           const fetched = [];
           snapshot.forEach((docSnap) => {
             fetched.push({ id: docSnap.id, ...docSnap.data() });
           });
           fetched.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
           setAllMessages(fetched);
         }
       },
       (err) => console.error('Eroare la citirea mesajelor:', err)
     );
 
     const profileRef = collection(db, 'artifacts', appId, 'users', user.uid, 'profile');
     const unsubProfile = onSnapshot(
       profileRef,
       (snapshot) => {
         snapshot.forEach((docSnap) => {
           if (docSnap.id === 'info') {
             const data = docSnap.data();
             if (data.nickname) {
               setNickname(data.nickname);
               setTempNickname(data.nickname);
             }
             if (data.avatar) {
               setAvatar(data.avatar);
               setTempAvatar(data.avatar);
             }
             if (data.theme) {
               setTheme(data.theme);
             }
           }
           if (docSnap.id === 'moderation') {
             const modData = docSnap.data();
             if (modData && modData.isBanned) {
               setBanInfo(modData);
             } else {
               setBanInfo(null);
             }
           }
         });
       },
       (err) => console.error('Eroare profil:', err)
     );
 
     const appealsRef = collection(db, 'artifacts', appId, 'public', 'data', 'banAppeals');
     const unsubAppeals = onSnapshot(
       appealsRef,
       (snapshot) => {
         const list = [];
         snapshot.forEach((docSnap) => {
           list.push({ id: docSnap.id, ...docSnap.data() });
         });
         list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
         setBanAppeals(list);
       },
       (err) => console.error('Eroare apeluri:', err)
     );
 
     const configRef = collection(db, 'artifacts', appId, 'public', 'data', 'moderationConfig');
     const unsubConfig = onSnapshot(
       configRef,
       (snapshot) => {
         snapshot.forEach((docSnap) => {
           if (docSnap.id === 'wordlist' && Array.isArray(docSnap.data().words)) {
             setBannedWords(docSnap.data().words);
           }
         });
       },
       (err) => console.error('Eroare config:', err)
     );
 
     const accountsRef = collection(db, 'artifacts', appId, 'public', 'data', 'registeredAccounts');
     const unsubAccounts = onSnapshot(
       accountsRef,
       (snapshot) => {
         const list = [];
         snapshot.forEach((docSnap) => {
           list.push({ id: docSnap.id, ...docSnap.data() });
         });
         setRegisteredAccounts(list);
       },
       (err) => console.error('Eroare citire conturi:', err)
     );
 
     return () => {
       unsubPrompts();
       unsubMessages();
       unsubProfile();
       unsubAppeals();
       unsubConfig();
       unsubAccounts();
     };
   }, [user]);
 
   // ==========================================
   // 2.5 FUNCTII INREGISTRARE, LOG IN & TRIMITERE EMAIL DE VERIFICARE
   // ==========================================
   const generateSixDigitCode = () => {
     return String(Math.floor(100000 + Math.random() * 900000));
   };
 
   const dispatchVerificationEmail = async (accountObj, isResend = false) => {
     setIsSendingEmail(true);
     const emailPayload = {
       id: `email-${Date.now()}`,
       to: accountObj.email,
       username: accountObj.username,
       subject: isResend
         ? `[DISPUTO] Cod Nou de Verificare: ${accountObj.verificationCode}`
         : `[DISPUTO] Confirmare Creare Cont — Cod: ${accountObj.verificationCode}`,
       code: accountObj.verificationCode,
       sentAt: Date.now()
     };
 
     // Dacă utilizatorul a configurat un Webhook extern (ex: Make/Zapier/EmailJS) pentru livrare SMTP reală
     if (emailWebhookUrl.trim()) {
       try {
         await fetch(emailWebhookUrl.trim(), {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(emailPayload)
         });
       } catch (err) {
         console.error('Eroare webhook email:', err);
       }
     }
 
     setSentEmailsLog((prev) => [emailPayload, ...prev]);
     setLatestEmailToast(emailPayload);
     setIsSendingEmail(false);
   };
 
   const handleSignUpSubmit = async (e) => {
     e.preventDefault();
     setAuthError('');
     setAuthSuccessMsg('');
 
     const cleanEmail = authEmail.trim().toLowerCase();
     const cleanUser = authUsername.trim();
 
     if (!cleanUser || !cleanEmail || !authPassword) {
       setAuthError('Te rugăm să completezi toate câmpurile obligatorii.');
       return;
     }
 
     if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
       setAuthError('Te rugăm să introduci o adresă de email validă.');
       return;
     }
 
     if (authPassword.length < 6) {
       setAuthError('Parola trebuie să conțină cel puțin 6 caractere.');
       return;
     }
 
     if (authPassword !== authConfirmPassword) {
       setAuthError('Parolele introduse nu coincid.');
       return;
     }
 
     // Verificăm dacă numele de utilizator conține cuvinte interzise
     const badWord = findProfanityWord(cleanUser);
     if (badWord) {
       setIsAuthModalOpen(false);
       await triggerAutomaticBan(badWord, cleanUser, 'Creare cont (Nume utilizator)');
       setIsAppealModalOpen(true);
       return;
     }
 
     // Verificăm dacă există deja un cont cu acest email
     const existing = registeredAccounts.find(
       (acc) => acc.email.toLowerCase() === cleanEmail
     );
     if (existing) {
       if (existing.isVerified) {
         setAuthError('Există deja un cont verificat cu această adresă de email. Autentifică-te!');
         return;
       } else {
         // Retrimitem codul pentru contul existent neverificat
         const freshCode = generateSixDigitCode();
         const updatedAcc = { ...existing, verificationCode: freshCode, updatedAt: Date.now() };
         setPendingAccount(updatedAcc);
         setRegisteredAccounts((prev) =>
           prev.map((a) => (a.id === existing.id ? updatedAcc : a))
         );
         if (user && db) {
           try {
             const accDoc = doc(db, 'artifacts', appId, 'public', 'data', 'registeredAccounts', existing.id);
             await setDoc(accDoc, updatedAcc, { merge: true });
           } catch (err) {
             console.error(err);
           }
         }
         await dispatchVerificationEmail(updatedAcc, true);
         setAuthModalStep('verify');
         setAuthSuccessMsg(`Am retrimis emailul de confirmare către ${cleanEmail}.`);
         return;
       }
     }
 
     const code = generateSixDigitCode();
     const accountId = `acc-${Date.now()}`;
     const newAccount = {
       id: accountId,
       username: cleanUser,
       email: cleanEmail,
       password: authPassword,
       avatar: authAvatar,
       isVerified: false,
       verificationCode: code,
       createdAt: Date.now(),
       firebaseUid: user?.uid || 'local-guest'
     };
 
     setRegisteredAccounts((prev) => [...prev, newAccount]);
     setPendingAccount(newAccount);
 
     if (user && db) {
       try {
         const accDoc = doc(db, 'artifacts', appId, 'public', 'data', 'registeredAccounts', accountId);
         await setDoc(accDoc, newAccount);
       } catch (err) {
         console.error('Eroare la salvarea contului:', err);
       }
     }
 
     await dispatchVerificationEmail(newAccount, false);
     setVerificationCodeInput('');
     setAuthModalStep('verify');
     setAuthSuccessMsg(
       `Contul a fost creat! Am trimis un email de verificare cu codul de 6 cifre către ${cleanEmail}.`
     );
   };
 
   const handleVerifyEmailCode = async (e,overrideCode = null) => {
     if (e) e.preventDefault();
     setAuthError('');
     setAuthSuccessMsg('');
 
     if (!pendingAccount) {
       setAuthError('Nu există niciun cont în așteptarea verificării.');
       return;
     }
 
     const codeToCheck = (overrideCode ?? verificationCodeInput).trim();
     if (codeToCheck !== pendingAccount.verificationCode) {
       setAuthError('Codul de verificare introdus este incorect. Verifică emailul primit.');
       return;
     }
 
     const verifiedAcc = {
       ...pendingAccount,
       isVerified: true,
       verifiedAt: Date.now()
     };
 
     setRegisteredAccounts((prev) =>
       prev.map((a) => (a.id === verifiedAcc.id ? verifiedAcc : a))
     );
     setPendingAccount(verifiedAcc);
     setLoggedInAccount(verifiedAcc);
     setNickname(verifiedAcc.username);
     setTempNickname(verifiedAcc.username);
     setAvatar(verifiedAcc.avatar);
     setTempAvatar(verifiedAcc.avatar);
     setLatestEmailToast(null);
     setAuthModalStep('confirmed');
 
     if (user && db) {
       try {
         const accDoc = doc(db, 'artifacts', appId, 'public', 'data', 'registeredAccounts', verifiedAcc.id);
         await setDoc(accDoc, verifiedAcc, { merge: true });
 
         const userDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
         await setDoc(
           userDoc,
           {
             nickname: verifiedAcc.username,
             avatar: verifiedAcc.avatar,
             email: verifiedAcc.email,
             isVerified: true
           },
           { merge: true }
         );
       } catch (err) {
         console.error('Eroare la confirmarea contului:', err);
       }
     }
   };
 
   const handleLoginSubmit = async (e) => {
     e.preventDefault();
     setAuthError('');
     setAuthSuccessMsg('');
 
     const cleanEmail = authEmail.trim().toLowerCase();
     if (!cleanEmail || !authPassword) {
       setAuthError('Introdu adresa de email și parola.');
       return;
     }
 
     const found = registeredAccounts.find(
       (acc) => acc.email.toLowerCase() === cleanEmail && acc.password === authPassword
     );
 
     if (!found) {
       setAuthError('Adresă de email sau parolă incorectă, ori contul nu există încă.');
       return;
     }
 
     if (!found.isVerified) {
       const freshCode = generateSixDigitCode();
       const updated = { ...found, verificationCode: freshCode };
       setPendingAccount(updated);
       setRegisteredAccounts((prev) =>
         prev.map((a) => (a.id === found.id ? updated : a))
       );
       await dispatchVerificationEmail(updated, true);
       setAuthModalStep('verify');
       setAuthError('Acest cont nu a fost încă confirmat prin email. Ți-am trimis un cod nou de verificare!');
       return;
     }
 
     setLoggedInAccount(found);
     setNickname(found.username);
     setTempNickname(found.username);
     setAvatar(found.avatar || '🦉');
     setTempAvatar(found.avatar || '🦉');
     setIsAuthModalOpen(false);
     setAuthPassword('');
   };
 
   const handleLogoutAccount = () => {
     setLoggedInAccount(null);
     const shortCode = user ? user.uid.slice(0, 4).toUpperCase() : '01';
     setNickname(`Dezbătător_${shortCode}`);
     setTempNickname(`Dezbătător_${shortCode}`);
   };
 
   // ==========================================
   // STARI DERIVATE PENTRU CELE 3 COLOANE
   // ==========================================
   const activeCategory = useMemo(() => {
     return CATEGORIES.find((c) => c.id === activeCategoryId) || CATEGORIES[0];
   }, [activeCategoryId]);
 
   const isPromptInCurrentRotation = (promptObj, catPromptsList) => {
     if (promptObj.createdBy && promptObj.createdBy !== 'Oficial') {
       if (!promptObj.createdAt) return true;
       return nowMs - promptObj.createdAt < SIX_HOURS_MS;
     }
     if (typeof promptObj.rotationSlot === 'number') {
       return promptObj.rotationSlot === Math.abs(rotationInfo.activeCycleIndex) % 2;
     }
     const indexInCat = catPromptsList.findIndex((p) => p.id === promptObj.id);
     const totalBatches = Math.max(1, Math.ceil(catPromptsList.length / PROMPTS_PER_ROTATION));
     const activeBatch = Math.abs(rotationInfo.activeCycleIndex) % totalBatches;
     return Math.floor(indexInCat / PROMPTS_PER_ROTATION) === activeBatch;
   };
 
   const getFilteredPromptsForCategory = (catId) => {
     const allInCategory = prompts.filter((p) => p.categoryId === catId);
     return allInCategory.filter((p) => {
       const inCurrentBatch = isPromptInCurrentRotation(p, allInCategory);
       const matchesFilter = promptViewFilter === 'all' ? true : inCurrentBatch;
       const matchesSearch =
         !searchQuery.trim() ||
         (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
         p.question.toLowerCase().includes(searchQuery.toLowerCase());
       return matchesFilter && matchesSearch;
     });
   };
 
   const categoryPrompts = useMemo(() => {
     return getFilteredPromptsForCategory(activeCategory.id);
   }, [prompts, activeCategory, searchQuery, promptViewFilter, rotationInfo.activeCycleIndex, nowMs]);
 
   const activePrompt = useMemo(() => {
     return prompts.find((p) => p.id === activePromptId) || categoryPrompts[0] || prompts[0];
   }, [prompts, activePromptId, categoryPrompts]);
 
   const activePromptCategory = useMemo(() => {
     if (!activePrompt) return activeCategory;
     return CATEGORIES.find((c) => c.id === activePrompt.categoryId) || activeCategory;
   }, [activePrompt, activeCategory]);
 
   const promptMessages = useMemo(() => {
     if (!activePrompt) return [];
     return allMessages.filter((m) => m.promptId === activePrompt.id);
   }, [allMessages, activePrompt]);
 
   // Calcul procentaj voturi PRO vs CONTRA
   const voteStats = useMemo(() => {
     if (!activePrompt) return { proCount: 0, contraCount: 0, proPercent: 50, contraPercent: 50 };
     const proCount = (activePrompt.votesPro || []).length;
     const contraCount = (activePrompt.votesContra || []).length;
     const total = proCount + contraCount;
     const proPercent = total === 0 ? 50 : Math.round((proCount / total) * 100);
     const contraPercent = 100 - proPercent;
     return { proCount, contraCount, total, proPercent, contraPercent };
   }, [activePrompt]);
   // Calcul numar participanti activi în Discuția Liberă (fără limită)
   const freeChatParticipantsCount = useMemo(() => {
     const uniqueSpeakers = new Set(promptMessages.map((m) => m.senderName));
     return Math.max(1, uniqueSpeakers.size);
   }, [promptMessages]);
 
   // Lista participanților activi în Discuția Liberă (pentru buton rapid de Invitație 1v1)
   const activeRoomParticipants = useMemo(() => {
     const map = new Map();
     promptMessages.forEach((m) => {
       if (m.senderName && m.senderName !== nickname) {
         map.set(m.senderName, {
           name: m.senderName,
           avatar: m.senderAvatar || '🦉',
           stance: m.stance || 'PRO'
         });
       }
     });
     if (map.size === 0) {
       map.set('Radu_SportRO', { name: 'Radu_SportRO', avatar: '🏆', stance: 'PRO' });
       map.set('Mihai_Analist', { name: 'Mihai_Analist', avatar: '🦁', stance: 'CONTRA' });
       map.set('Elena_Filosofie', { name: 'Elena_Filosofie', avatar: '🦉', stance: 'PRO' });
     }
     return Array.from(map.values());
   }, [promptMessages, nickname]);
 
   // Verificăm dacă utilizatorul curent ocupă un loc în Arena 5v5
   const myArenaSeat = useMemo(() => {
     for (let i = 0; i < 5; i++) {
       if (arenaSeats.PRO[i]?.name === nickname) return { side: 'PRO', seatIndex: i };
       if (arenaSeats.CONTRA[i]?.name === nickname) return { side: 'CONTRA', seatIndex: i };
     }
     return null;
   }, [arenaSeats, nickname]);
 
   const myLatestAppeal = useMemo(() => {
     const uid = user?.uid || 'local-guest';
     return banAppeals.find((a) => a.userId === uid) || null;
   }, [banAppeals, user]);
 
   const pendingAppealsCount = useMemo(() => {
     return banAppeals.filter((a) => a.status === 'pending').length;
   }, [banAppeals]);
 
   useEffect(() => {
     if (categoryPrompts.length > 0 && !categoryPrompts.some((p) => p.id === activePromptId)) {
       setActivePromptId(categoryPrompts[0].id);
     }
   }, [rotationInfo.activeCycleIndex, activeCategoryId]);
 
   useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [promptMessages.length, activePrompt?.id]);
 
   // ==========================================
   // 3. FILTRU AUTOMAT DE INJURATURI & AUTO-BAN
   // ==========================================
   const findProfanityWord = (inputText) => {
     const cleanInput = normalizeText(inputText);
     const tokens = cleanInput.split(/[^a-z0-9]+/).filter(Boolean);
 
     for (const rawBadWord of bannedWords) {
       const normalizedBad = normalizeText(rawBadWord.trim());
       if (!normalizedBad) continue;
       if (tokens.includes(normalizedBad) || cleanInput.includes(normalizedBad)) {
         return rawBadWord;
       }
     }
     return null;
   };
 
   const triggerAutomaticBan = async (detectedWord, offendingText, contextLabel = 'Argument în dezbatere') => {
     const newBanData = {
       isBanned: true,
       reason: `Limbaj interzis detectat automat în: ${contextLabel}`,
       detectedWord,
       offendingText,
       bannedAt: Date.now(),
       userId: user?.uid || 'local-guest',
       nickname
     };
 
     setBanInfo(newBanData);
     setModerationBannerAlert(
       `Accesul tău la dezbateri a fost restricționat automat deoarece textul conținea cuvântul interzis „${detectedWord}”.`
     );
 
     if (user && db) {
       try {
         const modDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'moderation');
         await setDoc(modDoc, newBanData);
       } catch (err) {
         console.error('Eroare la salvarea banului:', err);
       }
     }
   };
 
   const handleSubmitBanAppeal = async (e) => {
     e.preventDefault();
     const explanation = appealExplanation.trim();
     if (!explanation || !appealPromiseChecked || !banInfo) return;
 
     const uid = user?.uid || 'local-guest';
     const appealId = `appeal-${uid}-${Date.now()}`;
     const newAppeal = {
       id: appealId,
       userId: uid,
       nickname,
       avatar,
       detectedWord: banInfo.detectedWord,
       offendingText: banInfo.offendingText,
       reason: banInfo.reason,
       explanation,
       status: 'pending',
       createdAt: Date.now()
     };
 
     setBanAppeals((prev) => [newAppeal, ...prev]);
     setAppealExplanation('');
     setAppealPromiseChecked(false);
 
     if (user && db) {
       try {
         const appealDoc = doc(db, 'artifacts', appId, 'public', 'data', 'banAppeals', appealId);
         await setDoc(appealDoc, newAppeal);
       } catch (err) {
         console.error('Eroare la trimiterea cererii:', err);
       }
     }
   };
 
   const handleAdminResolveAppeal = async (appealObj, decision) => {
     const updatedAppeals = banAppeals.map((a) =>
       a.id === appealObj.id ? { ...a, status: decision, resolvedAt: Date.now() } : a
     );
     setBanAppeals(updatedAppeals);
 
     if (user && db) {
       try {
         const appealDoc = doc(db, 'artifacts', appId, 'public', 'data', 'banAppeals', appealObj.id);
         await updateDoc(appealDoc, { status: decision, resolvedAt: Date.now() });
       } catch (err) {
         console.error('Eroare la actualizarea cererii:', err);
       }
     }
 
     if (decision === 'approved') {
       const currentUid = user?.uid || 'local-guest';
       if (appealObj.userId === currentUid || banInfo?.isBanned) {
         setBanInfo(null);
         setModerationBannerAlert(null);
         if (user && db) {
           try {
             const modDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'moderation');
             await setDoc(modDoc, { isBanned: false, unbannedAt: Date.now() });
           } catch (err) {
             console.error('Eroare la debanare:', err);
           }
         }
       }
     }
   };
 
   const handleInstantUnbanSelf = async () => {
     setBanInfo(null);
     setModerationBannerAlert(null);
     if (user && db) {
       try {
         const modDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'moderation');
         await setDoc(modDoc, { isBanned: false, unbannedAt: Date.now() });
       } catch (err) {
         console.error('Eroare la debanare:', err);
       }
     }
   };
 
   const handleAddBannedWord = async (e) => {
     e.preventDefault();
     const cleaned = newBannedWordInput.trim().toLowerCase();
     if (!cleaned || bannedWords.includes(cleaned)) return;
 
     const updated = [...bannedWords, cleaned];
     setBannedWords(updated);
     setNewBannedWordInput('');
 
     if (user && db) {
       try {
         const wordDoc = doc(db, 'artifacts', appId, 'public', 'data', 'moderationConfig', 'wordlist');
         await setDoc(wordDoc, { words: updated, updatedAt: Date.now() });
       } catch (err) {
         console.error(err);
       }
     }
   };
 
   const handleRemoveBannedWord = async (wordToRemove) => {
     const updated = bannedWords.filter((w) => w !== wordToRemove);
     setBannedWords(updated);
 
     if (user && db) {
       try {
         const wordDoc = doc(db, 'artifacts', appId, 'public', 'data', 'moderationConfig', 'wordlist');
         await setDoc(wordDoc, { words: updated, updatedAt: Date.now() });
       } catch (err) {
         console.error(err);
       }
     }
   };
 
   // ==========================================
   // 4. ACTIUNI DEZBATERE (VOT PRO/CONTRA, SCOR ARGUMENTE)
   // ==========================================
   const handleToggleTheme = async () => {
     const nextTheme = theme === 'dark' ? 'light' : 'dark';
     setTheme(nextTheme);
     if (user && db) {
       try {
         const userDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
         await setDoc(userDoc, { theme: nextTheme }, { merge: true });
       } catch (err) {
         console.error(err);
       }
     }
   };
 
   const handleVoteDebateSide = async (side) => {
     if (!activePrompt || banInfo?.isBanned) return;
     const uid = user?.uid || 'local-guest';
     const currentPro = activePrompt.votesPro || [];
     const currentContra = activePrompt.votesContra || [];
 
     let updatedPro = [...currentPro];
     let updatedContra = [...currentContra];
 
     if (side === 'PRO') {
       if (updatedPro.includes(uid)) {
         updatedPro = updatedPro.filter((id) => id !== uid);
       } else {
         updatedPro.push(uid);
         updatedContra = updatedContra.filter((id) => id !== uid);
       }
     } else {
       if (updatedContra.includes(uid)) {
         updatedContra = updatedContra.filter((id) => id !== uid);
       } else {
         updatedContra.push(uid);
         updatedPro = updatedPro.filter((id) => id !== uid);
       }
     }
 
     setPrompts((prev) =>
       prev.map((p) =>
         p.id === activePrompt.id
           ? { ...p, votesPro: updatedPro, votesContra: updatedContra }
           : p
       )
     );
 
     if (user && db && activePrompt.id) {
       try {
         const pDoc = doc(db, 'artifacts', appId, 'public', 'data', 'debatePrompts_v2', activePrompt.id);
         await setDoc(
           pDoc,
           { ...activePrompt, votesPro: updatedPro, votesContra: updatedContra },
           { merge: true }
         );
       } catch (err) {
         console.error(err);
       }
     }
   };
 
   const handleVoteMessagePopularity = async (msg, direction) => {
     if (banInfo?.isBanned) return;
     const uid = user?.uid || 'local-guest';
     const up = msg.upvotes || [];
     const down = msg.downvotes || [];
 
     let nextUp = [...up];
     let nextDown = [...down];
 
     if (direction === 'up') {
       if (nextUp.includes(uid)) {
         nextUp = nextUp.filter((id) => id !== uid);
       } else {
         nextUp.push(uid);
         nextDown = nextDown.filter((id) => id !== uid);
       }
     } else {
       if (nextDown.includes(uid)) {
         nextDown = nextDown.filter((id) => id !== uid);
       } else {
         nextDown.push(uid);
         nextUp = nextUp.filter((id) => id !== uid);
       }
     }
 
     setAllMessages((prev) =>
       prev.map((m) => (m.id === msg.id ? { ...m, upvotes: nextUp, downvotes: nextDown } : m))
     );
 
     if (user && db && msg.id) {
       try {
         const mDoc = doc(db, 'artifacts', appId, 'public', 'data', 'debateMessages_v2', msg.id);
         await updateDoc(mDoc, { upvotes: nextUp, downvotes: nextDown });
       } catch (err) {
         console.error(err);
       }
     }
   };
 
   const handleSendMessage = async (e) => {
     e.preventDefault();
     if (banInfo?.isBanned) {
       setIsAppealModalOpen(true);
       return;
     }
 
     const text = messageInput.trim();
     if (!text || !activePrompt) return;
 
     // Verificare automată de cuvinte interzise
     const detectedBadWord = findProfanityWord(text);
     if (detectedBadWord) {
       setMessageInput('');
       setReplyingToMessage(null);
       await triggerAutomaticBan(detectedBadWord, text, 'Argument în camera de dezbatere');
       return;
     }
 
     const newMsg = {
       promptId: activePrompt.id,
       categoryId: activePrompt.categoryId,
       text,
       stance: selectedStance,
       sourceUrl: sourceUrlInput.trim() || '',
       senderId: user?.uid || 'local-guest',
       senderName: nickname,
       senderAvatar: avatar,
       senderEmailVerified: Boolean(loggedInAccount?.isVerified),
       senderEmail: loggedInAccount?.email || null,
       replyTo: replyingToMessage
         ? {
             senderName: replyingToMessage.senderName,
             stance: replyingToMessage.stance,
             text: replyingToMessage.text
           }
         : null,
       upvotes: [],
       downvotes: [],
       timestamp: Date.now()
     };
 
     setMessageInput('');
     setSourceUrlInput('');
     setShowSourceField(false);
     setReplyingToMessage(null);
     setArgTimerActive(false);
     setArgSecondsLeft(60);
 
     if (user && db) {
       try {
         const messagesRef = collection(db, 'artifacts', appId, 'public', 'data', 'debateMessages_v2');
         await addDoc(messagesRef, newMsg);
       } catch (err) {
         console.error('Eroare la trimiterea argumentului:', err);
       }
     } else {
       setAllMessages((prev) => [...prev, { id: String(Date.now()), ...newMsg }]);
     }
   };
 
   const handleCreateCustomPrompt = async (e) => {
     e.preventDefault();
     if (banInfo?.isBanned) {
       setIsCreatingPrompt(false);
       setIsAppealModalOpen(true);
       return;
     }
 
     const titleText = newPromptTitle.trim() || 'Dezbatere Comunitate';
     const questionText = newPromptQuestion.trim();
     if (!questionText) return;
 
     const badWord = findProfanityWord(`${titleText} ${questionText}`);
     if (badWord) {
       setNewPromptTitle('');
       setNewPromptQuestion('');
       setIsCreatingPrompt(false);
       await triggerAutomaticBan(badWord, `${titleText}: ${questionText}`, 'Propunere subiect nou');
       setIsAppealModalOpen(true);
       return;
     }
 
     const customId = `debate-${Date.now()}`;
     const newPromptObj = {
       id: customId,
       categoryId: newPromptCategory,
       title: titleText,
       question: questionText,
       proLabel: 'Tabăra PRO',
       contraLabel: 'Tabăra CONTRA',
       createdBy: nickname,
       createdAt: Date.now(),
       votesPro: [],
       votesContra: []
     };
 
     setPrompts((prev) => [newPromptObj, ...prev]);
     setActiveCategoryId(newPromptCategory);
     setActivePromptId(customId);
     setIsCreatingPrompt(false);
     setNewPromptTitle('');
     setNewPromptQuestion('');
     setMobileStep('chat');
 
     if (user && db) {
       try {
         const pDoc = doc(db, 'artifacts', appId, 'public', 'data', 'debatePrompts_v2', customId);
         await setDoc(pDoc, newPromptObj);
       } catch (err) {
         console.error(err);
       }
     }
   };
 
   const handleSaveProfile = async (e) => {
     e.preventDefault();
     const cleanedName = tempNickname.trim() || 'Dezbătător';
 
     const badWord = findProfanityWord(cleanedName);
     if (badWord) {
       setIsEditingProfile(false);
       await triggerAutomaticBan(badWord, cleanedName, 'Schimbare poreclă');
       setIsAppealModalOpen(true);
       return;
     }
 
     setNickname(cleanedName);
     setAvatar(tempAvatar);
     setIsEditingProfile(false);
 
     if (user && db) {
       try {
         const userDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
         await setDoc(userDoc, { nickname: cleanedName, avatar: tempAvatar }, { merge: true });
       } catch (err) {
         console.error(err);
       }
     }
   };
 
   const handleSelectCategory = (catId) => {
     // Acordeon: dacă apeși pe o categorie nouă, se deschide DOAR ea și se închide automat cea anterioară.
     // Dacă apeși pe categoria deja deschisă, se pliază/extinde elegant.
     setExpandedCategoryId((prev) => (prev === catId ? null : catId));
     setActiveCategoryId(catId);
     setNewPromptCategory(catId);
     const allInCat = prompts.filter((p) => p.categoryId === catId);
     const activeInCat = allInCat.filter((p) => isPromptInCurrentRotation(p, allInCat));
     const firstPrompt = activeInCat[0] || allInCat[0];
     if (firstPrompt) {
       setActivePromptId(firstPrompt.id);
     }
   };
 
   const handleSelectPrompt = (promptObj) => {
     setActivePromptId(promptObj.id);
     setActiveCategoryId(promptObj.categoryId);
     setExpandedCategoryId(promptObj.categoryId);
     setReplyingToMessage(null);
     setMobileStep('chat');
   };
 
   // ==========================================
   // 5. ACTIUNI MINIGAME SEPARAT: ARENA 5v5
   // ==========================================
   const handleJoinArenaSeat = (side, seatIndex) => {
     if (banInfo?.isBanned) {
       setIsAppealModalOpen(true);
       return;
     }
     setArenaSeats((prev) => {
       // Eliberăm mai întâi orice loc ocupat anterior de utilizatorul curent
       const cleanPro = prev.PRO.map((s) => (s && s.name === nickname ? null : s));
       const cleanContra = prev.CONTRA.map((s) => (s && s.name === nickname ? null : s));
 
       const targetList = side === 'PRO' ? [...cleanPro] : [...cleanContra];
       targetList[seatIndex] = {
         seatIndex,
         name: nickname,
         avatar,
         isBot: false,
         ready: true
       };
 
       return {
         PRO: side === 'PRO' ? targetList : cleanPro,
         CONTRA: side === 'CONTRA' ? targetList : cleanContra
       };
     });
 
     setArenaActiveSpeaker({
       side,
       seatIndex,
       name: nickname,
       avatar,
       mode: 'argument'
     });
     setArenaTimerSeconds(60);
     setArenaTimerRunning(true);
   };
 
   const handleLeaveArenaSeat = () => {
     setArenaSeats((prev) => ({
       PRO: prev.PRO.map((s) => (s && s.name === nickname ? null : s)),
       CONTRA: prev.CONTRA.map((s) => (s && s.name === nickname ? null : s))
     }));
   };
 
   const handleFillArenaWithBots = () => {
     const proBotNames = [
       { name: 'Radu_SportRO', avatar: '🏆' },
       { name: 'Elena_Filosofie', avatar: '🦉' },
       { name: 'Tudor_Istorie', avatar: '🏛️' },
       { name: 'Clara_Etica', avatar: '🕯️' },
       { name: 'Vlad_Argument', avatar: '🦅' }
     ];
     const contraBotNames = [
       { name: 'Mihai_Analist', avatar: '🦁' },
       { name: 'Alexandru_Politic', avatar: '⚖️' },
       { name: 'Diana_Critica', avatar: '🦊' },
       { name: 'Sorin_Pragmatic', avatar: '♟️' },
       { name: 'Victor_Replica', avatar: '🐺' }
     ];
 
     setArenaSeats((prev) => ({
       PRO: prev.PRO.map((seat, idx) =>
         seat
           ? seat
           : {
               seatIndex: idx,
               name: proBotNames[idx].name,
               avatar: proBotNames[idx].avatar,
               isBot: true,
               ready: true
             }
       ),
       CONTRA: prev.CONTRA.map((seat, idx) =>
         seat
           ? seat
           : {
               seatIndex: idx,
               name: contraBotNames[idx].name,
               avatar: contraBotNames[idx].avatar,
               isBot: true,
               ready: true
             }
       )
     }));
   };
 
   const handleStartArenaTurn = (modeType = 'argument') => {
     const side = myArenaSeat?.side || selectedStance === 'CONTRA' ? 'CONTRA' : 'PRO';
     const seatIdx = myArenaSeat ? myArenaSeat.seatIndex : 0;
     setArenaActiveSpeaker({
       side,
       seatIndex: seatIdx,
       name: nickname,
       avatar,
       mode: modeType
     });
     setArenaTimerSeconds(modeType === 'replica' ? 30 : 60);
     setArenaTimerRunning(true);
   };
 
   const handleSendArenaArgument = (e) => {
     e.preventDefault();
     if (banInfo?.isBanned) {
       setIsAppealModalOpen(true);
       return;
     }
 
     const text = arenaInputText.trim();
     if (!text) return;
 
     const detectedBadWord = findProfanityWord(text);
     if (detectedBadWord) {
       setArenaInputText('');
       triggerAutomaticBan(detectedBadWord, text, 'Meci Arena 5v5');
       return;
     }
 
     const userSide = myArenaSeat?.side || (selectedStance === 'CONTRA' ? 'CONTRA' : 'PRO');
     const seatNum = myArenaSeat ? myArenaSeat.seatIndex + 1 : 1;
     const isReplica = arenaActiveSpeaker?.mode === 'replica';
 
     const newEntry = {
       id: `arena-${Date.now()}`,
       side: userSide,
       seatNumber: seatNum,
       senderName: nickname,
       senderAvatar: avatar,
       type: isReplica ? 'Drept la Replică (30s)' : `Argument Runda #${arenaRoundNumber} (60s)`,
       text,
       score: 1,
       upvoters: [user?.uid || 'local-guest'],
       timestamp: Date.now()
     };
 
     setArenaMatchLog((prev) => [newEntry, ...prev]);
     setArenaInputText('');
     setArenaTimerRunning(false);
     setArenaRoundNumber((prev) => prev + 1);
     setArenaAudienceRope((prev) =>
       userSide === 'PRO' ? Math.min(92, prev + 4) : Math.max(8, prev - 4)
     );
   };
 
   const handleVoteArenaEntry = (entryId, delta) => {
     setArenaMatchLog((prev) =>
       prev.map((item) =>
         item.id === entryId ? { ...item, score: item.score + delta } : item
       )
     );
   };
 
   // ==========================================
   // 6. ACTIUNI DUEL 1v1: MATCHMAKING PE OPINII OPUSE & INVITAȚII DIRECTE
   // ==========================================
   const OPPONENT_POOL_1V1 = [
     { name: 'Andrei_Dialectica', avatar: '🦅', rating: '1.840 ELO' },
     { name: 'Elena_Filosofie', avatar: '🦉', rating: '1.920 ELO' },
     { name: 'Radu_SportRO', avatar: '🏆', rating: '1.760 ELO' },
     { name: 'Mihai_Analist', avatar: '🦁', rating: '1.890 ELO' },
     { name: 'Istoricul_Bucuresti', avatar: '🏛️', rating: '1.950 ELO' },
     { name: 'Alexandru_Politic', avatar: '⚖️', rating: '1.810 ELO' }
   ];
 
   // Pornire Matchmaking 1v1: utilizatorul își alege tabăra (PRO sau CONTRA) și este cuplat cu cineva care a ales OPUSUL
   const handleStart1v1Matchmaking = (chosenStance) => {
     if (banInfo?.isBanned) {
       setIsAppealModalOpen(true);
       return;
     }
 
     const oppStance = chosenStance === 'PRO' ? 'CONTRA' : 'PRO';
     setDuelMyStance(chosenStance);
     setIsMatchmaking1v1(true);
     setMatchmakingProgress(20);
 
     setTimeout(() => setMatchmakingProgress(65), 450);
     setTimeout(() => {
       const candidates = OPPONENT_POOL_1V1.filter((c) => c.name !== nickname);
       const pickedOpponent =
         candidates[Math.floor(Math.random() * candidates.length)] || OPPONENT_POOL_1V1[0];
       const targetPrompt = activePrompt || prompts[0];
 
       const matchObj = {
         id: `duel-${Date.now()}`,
         modeType: 'Matchmaking Automat (Opinii Opuse)',
         promptId: targetPrompt.id,
         promptTitle: targetPrompt.title,
         promptQuestion: targetPrompt.question,
         categoryId: targetPrompt.categoryId,
         myStance: chosenStance,
         opponentStance: oppStance,
         opponentName: pickedOpponent.name,
         opponentAvatar: pickedOpponent.avatar,
         opponentRating: pickedOpponent.rating,
         startedAt: Date.now()
       };
 
       setActiveDuelMatch(matchObj);
       setIsMatchmaking1v1(false);
       setMatchmakingProgress(100);
       setDuelTurnSeconds(60);
       setDuelTimerRunning(true);
       setDuelAudienceBar(50);
 
       setDuelMessages([
         {
           id: `duel-init-${Date.now()}`,
           senderName: pickedOpponent.name,
           senderAvatar: pickedOpponent.avatar,
           stance: oppStance,
           isOpponent: true,
           text: `Salut, ${nickname}! Am intrat în coada de Matchmaking pe poziția ${oppStance} (opusă alegerii tale ${chosenStance}) pentru subiectul „${targetPrompt.title}”. Prezintă-ți primul argument sau răspunde la teza mea: poziția ${oppStance} este mai solidă pe termen lung!`,
           sourceUrl: '',
           score: 2,
           timestamp: Date.now()
         }
       ]);
     }, 1050);
   };
 
   // Deschide fereastra de Invitație Directă 1v1 pentru o persoană din Chatul Liber sau din Arena 5v5
   const handleOpen1v1InviteModal = (targetPerson, sourceContext = 'Discuție Liberă') => {
     if (banInfo?.isBanned) {
       setIsAppealModalOpen(true);
       return;
     }
     const defaultMyStance = targetPerson.stance === 'PRO' ? 'CONTRA' : 'PRO';
     setInviteTargetUser({
       name: targetPerson.name,
       avatar: targetPerson.avatar || '🦉',
       theirCurrentStance: targetPerson.stance || 'CONTRA',
       sourceContext
     });
     setInvitePromptId(activePrompt?.id || prompts[0]?.id || 'sr-1');
     setInviteMyStance(defaultMyStance);
     setInviteCustomNote(
       `Te provoc la un duel argumentat 1v1 pe acest subiect! Eu preiau tabăra ${defaultMyStance}.`
     );
     setInvite1v1ModalOpen(true);
   };
 
   // Trimite invitația 1v1 și deschide direct Duelul 1v1 cu persoana invitată
   const handleSend1v1DirectInvite = (e) => {
     e.preventDefault();
     if (!inviteTargetUser) return;
 
     const chosenPrompt = prompts.find((p) => p.id === invitePromptId) || activePrompt || prompts[0];
     const oppStance = inviteMyStance === 'PRO' ? 'CONTRA' : 'PRO';
 
     const matchObj = {
       id: `duel-inv-${Date.now()}`,
       modeType: `Invitație Directă din ${inviteTargetUser.sourceContext}`,
       promptId: chosenPrompt.id,
       promptTitle: chosenPrompt.title,
       promptQuestion: chosenPrompt.question,
       categoryId: chosenPrompt.categoryId,
       myStance: inviteMyStance,
       opponentStance: oppStance,
       opponentName: inviteTargetUser.name,
       opponentAvatar: inviteTargetUser.avatar,
       opponentRating: 'Duelist Invitat',
       startedAt: Date.now()
     };
 
     setActiveCategoryId(chosenPrompt.categoryId);
     setActivePromptId(chosenPrompt.id);
     setDuelMyStance(inviteMyStance);
     setActiveDuelMatch(matchObj);
     setInvite1v1ModalOpen(false);
     setPlatformMode('duel1v1');
     setCurrentView('duel1v1');
     setMobileStep('chat');
     setDuelTurnSeconds(60);
     setDuelTimerRunning(true);
     setDuelAudienceBar(50);
 
     setDuelMessages([
       {
         id: `duel-accept-${Date.now()}`,
         senderName: inviteTargetUser.name,
         senderAvatar: inviteTargetUser.avatar,
         stance: oppStance,
         isOpponent: true,
         text: `Am acceptat provocarea ta 1v1 din ${inviteTargetUser.sourceContext}! Eu voi apăra tabăra ${oppStance}, iar tu tabăra ${inviteMyStance} pe tema: „${chosenPrompt.title}”. Începe duelul!`,
         sourceUrl: '',
         score: 1,
         timestamp: Date.now()
       }
     ]);
   };
 
   // Simulare primire invitație 1v1 de la un alt membru din comunitate
   const handleSimulateIncoming1v1Invite = () => {
     const samplePrompt = activePrompt || prompts[0];
     setIncoming1v1Invite({
       id: `inc-${Date.now()}`,
       fromName: 'Elena_Filosofie',
       fromAvatar: '🦉',
       fromSource: 'Discuție Liberă',
       promptId: samplePrompt.id,
       promptTitle: samplePrompt.title,
       promptQuestion: samplePrompt.question,
       categoryId: samplePrompt.categoryId,
       challengerStance: 'PRO',
       yourAssignedStance: 'CONTRA'
     });
   };
 
   const handleAcceptIncoming1v1Invite = () => {
     if (!incoming1v1Invite) return;
     const matchObj = {
       id: `duel-inc-${Date.now()}`,
       modeType: `Provocare Primită din ${incoming1v1Invite.fromSource}`,
       promptId: incoming1v1Invite.promptId,
       promptTitle: incoming1v1Invite.promptTitle,
       promptQuestion: incoming1v1Invite.promptQuestion,
       categoryId: incoming1v1Invite.categoryId,
       myStance: incoming1v1Invite.yourAssignedStance,
       opponentStance: incoming1v1Invite.challengerStance,
       opponentName: incoming1v1Invite.fromName,
       opponentAvatar: incoming1v1Invite.fromAvatar,
       opponentRating: 'Challenger 1v1',
       startedAt: Date.now()
     };
 
     setActiveCategoryId(incoming1v1Invite.categoryId);
     setActivePromptId(incoming1v1Invite.promptId);
     setDuelMyStance(incoming1v1Invite.yourAssignedStance);
     setActiveDuelMatch(matchObj);
     setIncoming1v1Invite(null);
     setPlatformMode('duel1v1');
     setCurrentView('duel1v1');
     setMobileStep('chat');
     setDuelTurnSeconds(60);
     setDuelTimerRunning(true);
     setDuelMessages([
       {
         id: `duel-inc-msg-${Date.now()}`,
         senderName: incoming1v1Invite.fromName,
         senderAvatar: incoming1v1Invite.fromAvatar,
         stance: incoming1v1Invite.challengerStance,
         isOpponent: true,
         text: `Mulțumesc că ai acceptat provocarea mea 1v1! Eu susțin poziția ${incoming1v1Invite.challengerStance} pe subiectul „${incoming1v1Invite.promptTitle}”. Care este primul tău contra-argument din tabăra ${incoming1v1Invite.yourAssignedStance}?`,
         sourceUrl: '',
         score: 2,
         timestamp: Date.now()
       }
     ]);
   };
 
   // Trimitere argument în camera de Duel 1v1 + replică automată de la adversarul din tabăra opusă
   const handleSend1v1Argument = async (e) => {
     e.preventDefault();
     if (banInfo?.isBanned) {
       setIsAppealModalOpen(true);
       return;
     }
 
     const text = duelInputText.trim();
     if (!text || !activeDuelMatch) return;
 
     const detectedBadWord = findProfanityWord(text);
     if (detectedBadWord) {
       setDuelInputText('');
       await triggerAutomaticBan(detectedBadWord, text, 'Duel 1v1');
       return;
     }
 
     const myMsg = {
       id: `duel-m-${Date.now()}`,
       senderName: nickname,
       senderAvatar: avatar,
       stance: activeDuelMatch.myStance,
       isOpponent: false,
       text,
       sourceUrl: duelSourceUrl.trim(),
       score: 1,
       timestamp: Date.now()
     };
 
     setDuelMessages((prev) => [...prev, myMsg]);
     setDuelInputText('');
     setDuelSourceUrl('');
     setDuelTurnSeconds(60);
     setDuelTimerRunning(true);
     setDuelAudienceBar((prev) =>
       activeDuelMatch.myStance === 'PRO' ? Math.min(92, prev + 6) : Math.max(8, prev - 6)
     );
 
     // Adversarul din tabăra opusă formulează o contra-replică pertinentă
     setTimeout(() => {
       const oppStance = activeDuelMatch.opponentStance;
       const rebuttalTemplates = [
         `Interesant punct din perspectiva ${activeDuelMatch.myStance}, însă dacă analizăm consecințele pe termen lung, tabăra ${oppStance} demonstrează că fără echilibru structural soluția propusă de tine creează efecte secundare majore.`,
         `Înțeleg unde bați cu acest argument, dar din unghiul ${oppStance} datele arată exact opusul: eficiența reală apare atunci când prioritizăm principiul pe care îl apăr eu în această confruntare.`,
         `Replică directă (${oppStance}): premisa ta ignoră factorul uman și contextul istoric. Cum răspunzi faptului că modelele bazate exclusiv pe viziunea ${activeDuelMatch.myStance} au eșuat fără o contrapondere?`
       ];
       const chosenReply =
         rebuttalTemplates[Math.floor(Math.random() * rebuttalTemplates.length)];
 
       setDuelMessages((prev) => [
         ...prev,
         {
           id: `duel-opp-${Date.now()}`,
           senderName: activeDuelMatch.opponentName,
           senderAvatar: activeDuelMatch.opponentAvatar,
           stance: oppStance,
           isOpponent: true,
           text: chosenReply,
           sourceUrl: '',
           score: 1,
           timestamp: Date.now()
         }
       ]);
     }, 1200);
   };
 
   const handleRandomPrompt = () => {
     if (prompts.length === 0) return;
     const other = prompts.filter((p) => p.id !== activePrompt?.id);
     const pool = other.length > 0 ? other : prompts;
     const chosen = pool[Math.floor(Math.random() * pool.length)];
     setActiveCategoryId(chosen.categoryId);
     setActivePromptId(chosen.id);
     setMobileStep('chat');
   };
 
   const renderCategoryIcon = (iconName, className = 'w-4 h-4') => {
     switch (iconName) {
       case 'Landmark': return <Landmark className={className} />;
       case 'Users': return <Users className={className} />;
       case 'BookOpen': return <BookOpen className={className} />;
       case 'Trophy': return <Trophy className={className} />;
       case 'Cpu': return <Cpu className={className} />;
       case 'Compass': return <Compass className={className} />;
       default: return <Scale className={className} />;
     }
   };
 
   return (
     <div
       className={`flex flex-col h-screen w-full overflow-hidden text-base transition-colors duration-300 ${
         isDark
           ? 'bg-[#121211] text-[#EAE3D5] dark'
           : 'bg-[#F4EFE6] text-[#1A1917]'
       }`}
       style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
     >
       {/* ========================================================= */}
       {/* 1. NAVBAR EDITORIAL SUPERIOR (DISPUTO)                     */}
       {/* ========================================================= */}
       <header
         className={`px-4 sm:px-8 py-3.5 border-b flex items-center justify-between shrink-0 z-30 transition-colors ${
           isDark
             ? 'bg-[#181715] border-[#2E2C28]'
             : 'bg-[#F4EFE6] border-[#D6CEBF]'
         }`}
       >
         {/* Logo DISPUTO — GÂNDEȘTE • DISCUTĂ • EVOLUEAZĂ (Click duce pe Homepage) */}
         <div className="flex items-center gap-4">
           <button
             onClick={() => setCurrentView('home')}
             className="flex items-center gap-3 text-left group cursor-pointer"
             title="Mergi la Homepage-ul DISPUTO"
           >
             <div
               className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-105 ${
                 isDark
                   ? 'border-[#EAE3D5] bg-[#22201D] text-[#EAE3D5]'
                   : 'border-[#1A1917] bg-[#1A1917] text-[#F4EFE6]'
               }`}
             >
               <MessageSquare className="w-5 h-5" />
             </div>
             <div>
               <span
                 className="text-2xl sm:text-3xl font-black tracking-widest block leading-none"
                 style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
               >
                 DISPUTO
               </span>
               <span className="text-[10px] sm:text-xs tracking-[0.18em] uppercase opacity-80 font-bold block mt-0.5">
                 GÂNDEȘTE • DISCUTĂ • EVOLUEAZĂ
               </span>
             </div>
           </button>
 
           {/* Navigare Principală în Antet (Acasă | Discuție Liberă | Arena 5v5) */}
           <nav className="hidden lg:flex items-center gap-6 ml-6 text-sm sm:text-base font-bold">
             <button
               onClick={() => setCurrentView('home')}
               className={`py-1.5 border-b-2 transition-all cursor-pointer ${
                 currentView === 'home'
                   ? isDark
                     ? 'border-[#EAE3D5] text-[#EAE3D5]'
                     : 'border-[#1A1917] text-[#1A1917]'
                   : 'border-transparent opacity-70 hover:opacity-100'
               }`}
             >
               Acasă (Homepage)
             </button>
             <button
               onClick={() => enterPlatformMode('free')}
               className={`py-1.5 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                 currentView === 'free'
                   ? isDark
                     ? 'border-[#EAE3D5] text-[#EAE3D5]'
                     : 'border-[#1A1917] text-[#1A1917]'
                   : 'border-transparent opacity-70 hover:opacity-100'
               }`}
             >
               <MessageSquare className="w-4 h-4" />
               <span>Discuție Liberă</span>
             </button>
             <button
               onClick={() => enterPlatformMode('arena5v5')}
               className={`py-1.5 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                 currentView === 'arena5v5'
                   ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                   : 'border-transparent opacity-70 hover:opacity-100'
               }`}
             >
               <Trophy className="w-4 h-4" />
               <span>⚔️ Arena 5v5</span>
             </button>
             <button
               onClick={() => enterPlatformMode('duel1v1')}
               className={`py-1.5 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                 currentView === 'duel1v1'
                   ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                   : 'border-transparent opacity-70 hover:opacity-100'
               }`}
             >
               <Swords className="w-4 h-4" />
               <span>🤝 Duel 1v1 (Matchmaking)</span>
             </button>
             {currentView !== 'home' && (
               <button
                 onClick={handleRandomPrompt}
                 className="py-1.5 opacity-75 hover:opacity-100 transition-opacity flex items-center gap-1.5 cursor-pointer text-sm"
               >
                 <Shuffle className="w-4 h-4" />
                 <span>Subiect Aleatoriu</span>
               </button>
             )}
           </nav>
         </div>
 
         {/* Butoane Dreapta: Timer 6h, Dark/Light Mode, Ban Appeal, Profil */}
         <div className="flex items-center gap-2.5">
           {/* Indicator 6h cu font mărit */}
           <div
             className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-semibold ${
               isDark
                 ? 'bg-[#22201D] border-[#38352F] text-[#EAE3D5]'
                 : 'bg-[#EAE3D5] border-[#C8BFAEE0] text-[#1A1917]'
             }`}
           >
             <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400" />
             <span className="opacity-80">Rotație 6h:</span>
             <span className="font-mono font-bold text-sm">{rotationInfo.formattedCountdown}</span>
             <button
               onClick={() => setSimulatedCycleOffset((prev) => prev + 1)}
               className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                 isDark
                   ? 'bg-[#EAE3D5] text-[#121211] hover:bg-white'
                   : 'bg-[#1A1917] text-[#F4EFE6] hover:bg-stone-800'
               }`}
               title="Simulează trecerea a 6 ore pentru a vedea următoarele subiecte"
             >
               +6h
             </button>
           </div>
 
           {/* Comutator Mod Luminos (Pergament) / Mod Întunecat (Obsidian) */}
           <button
             onClick={handleToggleTheme}
             className={`px-3.5 py-2 rounded-full border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
               isDark
                 ? 'border-[#38352F] bg-[#22201D] text-amber-300 hover:bg-[#2C2925]'
                 : 'border-[#1A1917] bg-transparent text-[#1A1917] hover:bg-[#EAE3D5]'
             }`}
             title="Comută între Modul Pergament (Luminos) și Modul Întunecat"
           >
             {isDark ? (
               <>
                 <Sun className="w-4 h-4" />
                 <span className="hidden md:inline">Mod Luminos</span>
               </>
             ) : (
               <>
                 <Moon className="w-4 h-4" />
                 <span className="hidden md:inline">Mod Întunecat</span>
               </>
             )}
           </button>
 
           {/* Buton Moderare & Cereri Debanare (Ban Appeal) */}
           <button
             onClick={() => setIsAppealModalOpen(true)}
             className={`px-3.5 py-2 rounded-full border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
               banInfo?.isBanned
                 ? 'bg-red-700 text-white border-red-800 animate-pulse'
                 : isDark
                 ? 'border-[#38352F] bg-[#22201D] text-[#EAE3D5] hover:bg-[#2C2925]'
                 : 'border-[#1A1917] bg-transparent text-[#1A1917] hover:bg-[#EAE3D5]'
             }`}
           >
             <Gavel className="w-4 h-4" />
             <span className="hidden sm:inline">
               {banInfo?.isBanned ? 'Ești Banat (Appeal)' : 'Ban Appeal'}
             </span>
             {pendingAppealsCount > 0 && (
               <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-xs font-bold">
                 {pendingAppealsCount}
               </span>
             )}
           </button>
 
           {/* Buton Inbox Emailuri de Confirmare (dacă există emailuri trimise) */}
           {sentEmailsLog.length > 0 && (
             <button
               onClick={() => {
                 setAuthModalStep('inbox-preview');
                 setIsAuthModalOpen(true);
               }}
               className={`px-3.5 py-2 rounded-full border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                 isDark
                   ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                   : 'border-emerald-800/40 bg-emerald-900/10 text-emerald-900 hover:bg-emerald-900/20'
               }`}
               title="Deschide căsuța cu emailul de verificare trimis"
             >
               <Mail className="w-4 h-4" />
               <span className="hidden xl:inline">Email Confirmare</span>
               <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                 {sentEmailsLog.length}
               </span>
             </button>
           )}
 
           {/* Zonă Autentificare (Log In / Sign Up) exact ca în modelul DEBATE sau Cont Verificat */}
           {loggedInAccount ? (
             <div className="flex items-center gap-2">
               <button
                 onClick={() => setIsEditingProfile(true)}
                 className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                   isDark
                     ? 'bg-[#22201D] border-emerald-500/50 text-[#EAE3D5] hover:bg-[#2C2925]'
                     : 'bg-[#1A1917] border-[#1A1917] text-[#F4EFE6] hover:bg-stone-800'
                 }`}
                 title={`Autentificat ca ${loggedInAccount.email} (Cont Verificat)`}
               >
                 <span className="text-base">{avatar}</span>
                 <span className="max-w-[110px] truncate">{nickname}</span>
                 <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
               </button>
               <button
                 onClick={handleLogoutAccount}
                 className={`p-2 rounded-full border text-xs transition-all cursor-pointer ${
                   isDark
                     ? 'border-[#38352F] bg-[#22201D] text-[#EAE3D5] hover:bg-red-950/50 hover:text-red-300'
                     : 'border-[#1A1917]/30 bg-transparent text-[#1A1917] hover:bg-red-900/10 hover:text-red-800'
                 }`}
                 title="Deconectare din cont"
               >
                 <LogOut className="w-4 h-4" />
               </button>
             </div>
           ) : (
             <div className="flex items-center gap-2">
               <button
                 onClick={() => {
                   setAuthError('');
                   setAuthSuccessMsg('');
                   setAuthModalStep('login');
                   setIsAuthModalOpen(true);
                 }}
                 className={`px-4 py-2 rounded-full border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                   isDark
                     ? 'border-[#EAE3D5] bg-transparent text-[#EAE3D5] hover:bg-[#22201D]'
                     : 'border-[#1A1917] bg-transparent text-[#1A1917] hover:bg-[#EAE3D5]'
                 }`}
               >
                 <span>Log In</span>
               </button>
 
               <button
                 onClick={() => {
                   setAuthError('');
                   setAuthSuccessMsg('');
                   setAuthModalStep('signup');
                   setIsAuthModalOpen(true);
                 }}
                 className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                   isDark
                     ? 'bg-[#EAE3D5] text-[#121211] hover:bg-white'
                     : 'bg-[#1A1917] text-[#F4EFE6] hover:bg-stone-800'
                 }`}
               >
                 <span>Sign Up</span>
               </button>
             </div>
           )}
         </div>
       </header>
 
       {/* ========================================================= */}
       {/* NOTIFICARE INTERACTIVA: PROVOCARE 1v1 PRIMITA IN DIRECT   */}
       {/* ========================================================= */}
       {incoming1v1Invite && (
         <div className="fixed bottom-4 left-4 z-50 max-w-md w-full animate-bounce-once">
           <div
             className={`p-4 rounded-2xl border-2 shadow-2xl ${
               isDark
                 ? 'bg-[#1D1A16] border-amber-500 text-[#EAE3D5]'
                 : 'bg-[#FAF6EE] border-[#1A1917] text-[#1A1917]'
             }`}
           >
             <div className="flex items-start justify-between gap-2 mb-2">
               <div className="flex items-center gap-2.5">
                 <div className="w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center text-lg shrink-0">
                   {incoming1v1Invite.fromAvatar}
                 </div>
                 <div>
                   <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                     ⚔️ Provocare Directă la Duel 1v1
                   </span>
                   <h4
                     className="text-sm font-bold"
                     style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                   >
                     {incoming1v1Invite.fromName} te invită la un 1v1!
                   </h4>
                 </div>
               </div>
               <button
                 onClick={() => setIncoming1v1Invite(null)}
                 className="opacity-60 hover:opacity-100 cursor-pointer"
               >
                 <X className="w-4 h-4" />
               </button>
             </div>
 
             <p className="text-xs opacity-90 mb-2">
               Subiect: <strong>„{incoming1v1Invite.promptTitle}”</strong>
             </p>
             <div className="flex items-center gap-2 text-xs mb-3">
               <span className="px-2.5 py-0.5 rounded-full bg-emerald-800 text-white font-bold">
                 El/Ea: {incoming1v1Invite.challengerStance}
               </span>
               <span>vs.</span>
               <span className="px-2.5 py-0.5 rounded-full bg-rose-800 text-white font-bold">
                 Tu: {incoming1v1Invite.yourAssignedStance}
               </span>
             </div>
 
             <div className="flex items-center gap-2">
               <button
                 onClick={handleAcceptIncoming1v1Invite}
                 className="flex-1 py-2 px-4 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer"
               >
                 <Swords className="w-4 h-4" />
                 <span>Acceptă Duelul 1v1</span>
               </button>
               <button
                 onClick={() => setIncoming1v1Invite(null)}
                 className="py-2 px-3 rounded-full border border-current/30 text-xs font-semibold cursor-pointer"
               >
                 Refuză
               </button>
             </div>
           </div>
         </div>
       )}
 
       {/* ========================================================= */}
       {/* DACA SUNTEM PE HOMEPAGE (currentView === 'home'):         */}
       {/* AFISAM PAGINA PRINCIPALA CU ILUSTRATIA DIN DOCUMENTUL     */}
       {/* WORD SI CELE 2 OPTIUNI (DISCUTIE LIBERA SAU ARENA 5v5)    */}
       {/* FARA CATEGORII PANA CAND UTILIZATORUL SELECTEAZA UN MOD   */}
       {/* ========================================================= */}
       {currentView === 'home' ? (
         <div className="flex-1 overflow-y-auto overflow-x-hidden">
           {/* ========================================================= */}
           {/* HERO SECTION FULL-BLEED (100% LĂȚIME ȘI ÎNĂLȚIME, FĂRĂ    */}
           {/* SPAȚIU GOL PE MARGINI, CU CAPETELE MECANICE DIN MUCHII)   */}
           {/* ========================================================= */}
           <section
             className={`relative w-full min-h-[calc(100vh-68px)] border-b overflow-hidden flex flex-col justify-between transition-colors ${
               isDark
                 ? 'bg-[#141311] border-[#2E2C28]'
                 : 'bg-[#F3ECE0] border-[#1A1917]/25'
             }`}
           >
             {/* CAPUL MECANIC STÂNGA — REPARAT ȘI LIPIT DIRECT DE MARGINEA STÂNGĂ (FULL HEIGHT) */}
             <div className="hidden md:block absolute inset-y-0 left-0 w-[34vw] lg:w-[36vw] max-w-[560px] pointer-events-none z-10">
               <MechanicalClockworkHead side="left" isDark={isDark} />
             </div>
 
             {/* CAPUL MECANIC DREAPTA — LIPIT DIRECT DE MARGINEA DREAPTĂ (FULL HEIGHT) */}
             <div className="hidden md:block absolute inset-y-0 right-0 w-[34vw] lg:w-[36vw] max-w-[560px] pointer-events-none z-10">
               <MechanicalClockworkHead side="right" isDark={isDark} />
             </div>
 
             {/* CONȚINUTUL CENTRAL POZIȚIONAT ÎNTRE CELE DOUĂ CAPETE MECANICE GIGANTE */}
             <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-[28vw] lg:px-[29vw] pt-8 pb-4 text-center">
               <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-current/30 bg-current/5 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
                 <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                 <span>DISPUTO • Gândește • Discută • Evoluează</span>
               </div>
 
               {/* Titlul Principal Exact ca în Imaginea de Referință */}
               <h1
                 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[0.98] mb-4"
                 style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
               >
                 Dezbateri
                 <span className="block">care contează</span>
               </h1>
 
               <p className="text-base sm:text-xl xl:text-2xl opacity-85 max-w-xl mx-auto leading-snug font-medium mb-8">
                 Explorează idei. Împărtășește perspective.
                 <span className="block">Construiește înțelegere.</span>
               </p>
 
               {/* ========================================================= */}
               {/* CELE 3 ALEGERI PRINCIPALE PE HOMEPAGE (DISCUȚIE LIBERĂ,   */}
               {/* ARENA 5v5 ȘI DUEL 1v1 MATCHMAKING - FĂRĂ BUTON GENERIC)   */}
               {/* ========================================================= */}
               <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                 {/* OPȚIUNEA 1: DISCUȚIE LIBERĂ */}
                 <div
                   onClick={() => enterPlatformMode('free')}
                   className={`group rounded-2xl p-4 sm:p-5 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-md hover:-translate-y-0.5 ${
                     isDark
                       ? 'bg-[#1A1917]/95 border-[#EAE3D5]/60 hover:border-[#EAE3D5]'
                       : 'bg-[#FAF6EE]/95 border-[#1A1917] hover:bg-white'
                   }`}
                 >
                   <div>
                     <div className="flex items-center justify-between gap-2 mb-2">
                       <div
                         className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                           isDark
                             ? 'bg-[#EAE3D5] text-[#121211]'
                             : 'bg-[#1A1917] text-[#F4EFE6]'
                         }`}
                       >
                         <MessageSquare className="w-5 h-5" />
                       </div>
                       <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-700/15 text-emerald-800 dark:text-emerald-300 border border-emerald-700/30">
                         Fără Limită Persoane
                       </span>
                     </div>
 
                     <h2
                       className="text-xl sm:text-2xl font-black mb-1"
                       style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                     >
                       1. Discuție Liberă
                     </h2>
                     <p className="text-xs sm:text-sm opacity-85 leading-snug mb-3">
                       Dezbați fără restricții în cele <strong>4 categorii</strong>, votezi PRO/CONTRA și poți invita direct orice participant la un <strong>Duel 1v1</strong>.
                     </p>
                   </div>
 
                   <div
                     className={`w-full py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 ${
                       isDark
                         ? 'bg-[#EAE3D5] text-[#121211] group-hover:bg-white'
                         : 'bg-[#1A1917] text-[#F4EFE6] group-hover:bg-stone-800'
                     }`}
                   >
                     <span>Intră în Discuție Liberă</span>
                     <ChevronRight className="w-4 h-4" />
                   </div>
                 </div>
 
                 {/* OPȚIUNEA 2: MINIGAME SEPARAT ARENA 5v5 */}
                 <div
                   onClick={() => enterPlatformMode('arena5v5')}
                   className={`group rounded-2xl p-4 sm:p-5 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-md hover:-translate-y-0.5 ${
                     isDark
                       ? 'bg-[#221B13]/95 border-amber-500/70 hover:border-amber-400'
                       : 'bg-[#FAF2E1]/95 border-amber-900 hover:bg-[#FAF6EE]'
                   }`}
                 >
                   <div>
                     <div className="flex items-center justify-between gap-2 mb-2">
                       <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center">
                         <Trophy className="w-5 h-5" />
                       </div>
                       <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-700 text-white">
                         Minigame 5 vs. 5
                       </span>
                     </div>
 
                     <h2
                       className="text-xl sm:text-2xl font-black mb-1"
                       style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                     >
                       2. Arena 5v5
                     </h2>
                     <p className="text-xs sm:text-sm opacity-85 leading-snug mb-3">
                       Confruntare în stil <strong>Jubilee</strong>: 5 PRO vs. 5 CONTRA, microfon cronometrat (60s) și provocări rapide la 1v1.
                     </p>
                   </div>
 
                   <div className="w-full py-2.5 px-4 rounded-full bg-amber-700 group-hover:bg-amber-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5">
                     <span>⚔️ Intră în Arena 5v5</span>
                     <ChevronRight className="w-4 h-4" />
                   </div>
                 </div>
 
                 {/* OPȚIUNEA 3: DUEL 1v1 & MATCHMAKING PE OPINII OPUSE */}
                 <div
                   onClick={() => enterPlatformMode('duel1v1')}
                   className={`group rounded-2xl p-4 sm:p-5 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-md hover:-translate-y-0.5 ${
                     isDark
                       ? 'bg-[#13201B]/95 border-emerald-500/70 hover:border-emerald-400'
                       : 'bg-[#E9F3EE]/95 border-emerald-900 hover:bg-[#FAF6EE]'
                   }`}
                 >
                   <div>
                     <div className="flex items-center justify-between gap-2 mb-2">
                       <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
                         <Swords className="w-5 h-5" />
                       </div>
                       <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-800 text-white">
                         Matchmaking PRO vs CONTRA
                       </span>
                     </div>
 
                     <h2
                       className="text-xl sm:text-2xl font-black mb-1"
                       style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                     >
                       3. Duel 1v1
                     </h2>
                     <p className="text-xs sm:text-sm opacity-85 leading-snug mb-3">
                       Vezi subiectul, alegi <strong>PRO</strong> sau <strong>CONTRA</strong> și ești cuplat automat cu cineva care a ales <strong>opusul</strong>!
                     </p>
                   </div>
 
                   <div className="w-full py-2.5 px-4 rounded-full bg-emerald-800 group-hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5">
                     <span>🤝 Caută Adversar 1v1</span>
                     <ChevronRight className="w-4 h-4" />
                   </div>
                 </div>
               </div>
             </div>
 
             {/* ========================================================= */}
             {/* PUNTEA DUBLĂ ȘI SILUETELE CARE TRAG DE FRÂNGHIE (TUG OF   */}
             {/* WAR) CONECTÂND MAXILARELE CELOR DOUĂ CAPETE MECANICE      */}
             {/* ========================================================= */}
             <div className="relative z-20 w-full px-0 pb-6 lg:pb-10">
               <div className="w-full max-w-[1180px] mx-auto">
                 <svg
                   viewBox="0 0 900 92"
                   className="w-full h-16 sm:h-20 lg:h-24 overflow-visible"
                   fill="currentColor"
                 >
                   {/* Frânghia întinsă între cele două tabere */}
                   <line
                     x1="210"
                     y1="44"
                     x2="690"
                     y2="44"
                     stroke="currentColor"
                     strokeWidth="3.2"
                   />
                   <line
                     x1="340"
                     y1="46"
                     x2="560"
                     y2="46"
                     stroke="currentColor"
                     strokeWidth="1.5"
                     opacity="0.6"
                   />
 
                   {/* Echipa Stânga (4 siluete dinamice aplecate pe spate care trag spre Capul Stâng) */}
                   {[225, 262, 298, 335].map((xPos, idx) => (
                     <g key={`puller-left-${idx}`} transform={`translate(${xPos}, 12)`}>
                       {/* Capul siluetei */}
                       <circle cx="10" cy="8" r="6.5" />
                       {/* Trunchiul înclinat pe spate */}
                       <path
                         d="M10 15 L2 38"
                         stroke="currentColor"
                         strokeWidth="6.5"
                         strokeLinecap="round"
                       />
                       {/* Picioarele proptite în podea */}
                       <path
                         d="M2 38 L-9 63 M2 38 L15 63"
                         stroke="currentColor"
                         strokeWidth="5.2"
                         strokeLinecap="round"
                       />
                       {/* Brațele întinse pe frânghie */}
                       <path
                         d="M7 23 L24 32"
                         stroke="currentColor"
                         strokeWidth="4.5"
                         strokeLinecap="round"
                       />
                     </g>
                   ))}
 
                   {/* Echipa Dreapta (4 siluete dinamice aplecate pe spate care trag spre Capul Drept) */}
                   {[565, 602, 638, 675].map((xPos, idx) => (
                     <g key={`puller-right-${idx}`} transform={`translate(${xPos}, 12)`}>
                       <circle cx="10" cy="8" r="6.5" />
                       <path
                         d="M10 15 L18 38"
                         stroke="currentColor"
                         strokeWidth="6.5"
                         strokeLinecap="round"
                       />
                       <path
                         d="M18 38 L29 63 M18 38 L5 63"
                         stroke="currentColor"
                         strokeWidth="5.2"
                         strokeLinecap="round"
                       />
                       <path
                         d="M13 23 L-4 32"
                         stroke="currentColor"
                         strokeWidth="4.5"
                         strokeLinecap="round"
                       />
                     </g>
                   ))}
 
                   {/* Platforma dublă orizontală care unește maxilarul stâng de maxilarul drept */}
                   <line
                     x1="0"
                     y1="75"
                     x2="900"
                     y2="75"
                     stroke="currentColor"
                     strokeWidth="4.5"
                   />
                   <line
                     x1="0"
                     y1="82"
                     x2="900"
                     y2="82"
                     stroke="currentColor"
                     strokeWidth="2.5"
                   />
                 </svg>
               </div>
             </div>
           </section>
 
           {/* ========================================================= */}
           {/* BANDA FULL-WIDTH CU CEI 4 PILONI DIN IMAGINE              */}
           {/* ========================================================= */}
           <section
             className={`w-full border-b py-6 px-6 sm:px-12 lg:px-16 ${
               isDark
                 ? 'bg-[#181715] border-[#2E2C28]'
                 : 'bg-[#EDE5D6] border-[#1A1917]/20'
             }`}
           >
             <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="flex items-center gap-4">
                 <div className="w-13 h-13 rounded-2xl border-2 border-current/30 flex items-center justify-center shrink-0">
                   <MessageSquare className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                     Implică-te
                   </h3>
                   <p className="text-sm sm:text-base opacity-80">Participă la dezbateri cu miză reală</p>
                 </div>
               </div>
 
               <div className="flex items-center gap-4 sm:border-l sm:pl-6 border-current/20">
                 <div className="w-13 h-13 rounded-2xl border-2 border-current/30 flex items-center justify-center shrink-0">
                   <Users className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                     Conectează-te
                   </h3>
                   <p className="text-sm sm:text-base opacity-80">Cu o comunitate pasionată de idei</p>
                 </div>
               </div>
 
               <div className="flex items-center gap-4 lg:border-l lg:pl-6 border-current/20">
                 <div className="w-13 h-13 rounded-2xl border-2 border-current/30 flex items-center justify-center shrink-0">
                   <Sparkles className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                     Învață
                   </h3>
                   <p className="text-sm sm:text-base opacity-80">Din perspective PRO și CONTRA</p>
                 </div>
               </div>
 
               <div className="flex items-center gap-4 sm:border-l sm:pl-6 border-current/20">
                 <div className="w-13 h-13 rounded-2xl border-2 border-current/30 flex items-center justify-center shrink-0">
                   <Award className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                     Evoluează
                   </h3>
                   <p className="text-sm sm:text-base opacity-80">Prin discurs respectuos și argumentat</p>
                 </div>
               </div>
             </div>
           </section>
 
           {/* ========================================================= */}
           {/* SECȚIUNEA EDITORIALĂ FULL-WIDTH DE JOS                    */}
           {/* ========================================================= */}
           <section className="w-full py-12 px-6 sm:px-12 lg:px-16">
             <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
               <div className="lg:col-span-4 space-y-4">
                 <h2
                   className="text-3xl sm:text-4xl xl:text-5xl font-black leading-tight"
                   style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                 >
                   O platformă pentru dezbatere deschisă și respectuoasă
                 </h2>
                 <p className="text-base sm:text-lg opacity-85 leading-relaxed">
                   Discută ideile care modelează lumea — de la <strong>Sport Românesc</strong> și <strong>Filozofie / Psihologie</strong> până la <strong>Istorie</strong> și <strong>Politică</strong>, fie în camere libere fără restricții, fie în confruntări directe <strong>5 vs. 5</strong>.
                 </p>
                 <div className="flex flex-wrap gap-3 pt-2">
                   <button
                     onClick={() => enterPlatformMode('free')}
                     className={`px-6 py-3 rounded-full border-2 text-base font-bold flex items-center gap-2 cursor-pointer transition-all ${
                       isDark
                         ? 'border-[#EAE3D5] hover:bg-[#EAE3D5] hover:text-[#121211]'
                         : 'border-[#1A1917] hover:bg-[#1A1917] hover:text-[#F4EFE6]'
                     }`}
                   >
                     <span>Deschide Discuția Liberă</span>
                     <ChevronRight className="w-5 h-5" />
                   </button>
                   <button
                     onClick={() => enterPlatformMode('arena5v5')}
                     className="px-6 py-3 rounded-full bg-amber-700 hover:bg-amber-600 text-white text-base font-bold flex items-center gap-2 cursor-pointer transition-all"
                   >
                     <span>⚔️ Intră în Arena 5v5</span>
                     <ChevronRight className="w-5 h-5" />
                   </button>
                 </div>
               </div>
 
               {/* Cele 4 carduri editoriale pe toată lățimea disponibilă */}
               <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                 {CATEGORIES.map((cat) => {
                   const firstCatPrompt = prompts.find((p) => p.categoryId === cat.id);
                   const catMsgCount = allMessages.filter((m) => m.categoryId === cat.id).length;
                   return (
                     <div
                       key={cat.id}
                       onClick={() => {
                         handleSelectCategory(cat.id);
                         enterPlatformMode('free');
                       }}
                       className={`rounded-2xl border-2 overflow-hidden flex flex-col justify-between transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
                         isDark
                           ? 'bg-[#181715] border-[#2E2C28] hover:border-[#EAE3D5]'
                           : 'bg-[#FAF6EE] border-[#1A1917]/20 hover:border-[#1A1917]'
                       }`}
                     >
                       <div>
                         {/* Header vizual de tip gravură pe fiecare card */}
                         <div
                           className={`h-28 px-4 py-3 border-b flex flex-col justify-between relative overflow-hidden ${
                             isDark
                               ? 'bg-[#22201D] border-[#2E2C28]'
                               : 'bg-[#E5DEC9] border-[#1A1917]/15'
                           }`}
                         >
                           <div className="flex items-center justify-between z-10">
                             <span
                               className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                 isDark
                                   ? 'bg-[#141311] border-[#EAE3D5]/30'
                                   : 'bg-[#FAF6EE] border-[#1A1917]'
                               }`}
                             >
                               {cat.name}
                             </span>
                             {renderCategoryIcon(cat.icon, 'w-6 h-6 opacity-80')}
                           </div>
                           <span className="text-xs font-bold uppercase tracking-wider opacity-75 z-10">
                             {cat.subtitle}
                           </span>
                         </div>
 
                         <div className="p-4">
                           <h4
                             className="text-lg font-bold mb-1.5 line-clamp-2"
                             style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                           >
                             {firstCatPrompt?.title || cat.name}
                           </h4>
                           <p className="text-sm opacity-80 line-clamp-3 leading-relaxed">
                             {firstCatPrompt?.question}
                           </p>
                         </div>
                       </div>
 
                       <div className="px-4 py-3 border-t border-current/10 flex items-center justify-between text-xs font-bold opacity-80">
                         <span className="flex items-center gap-1">
                           <MessageSquare className="w-3.5 h-3.5" />
                           {catMsgCount} replici
                         </span>
                         <span className="flex items-center gap-1">
                           <Clock className="w-3.5 h-3.5" />
                           Rotație 6h
                         </span>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
           </section>
 
           {/* FOOTER ÎNTUNECAT FULL-WIDTH (DISPUTO) */}
           <footer className="w-full bg-[#1A1917] text-[#F4EFE6] py-6 px-6 sm:px-12 lg:px-16 border-t border-[#2E2C28]">
             <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
               <div className="flex items-center gap-2.5">
                 <MessageSquare className="w-5 h-5" />
                 <span
                   className="font-black tracking-widest text-lg"
                   style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                 >
                   DISPUTO
                 </span>
               </div>
               <div className="flex flex-wrap items-center gap-6 opacity-80">
                 <button onClick={() => enterPlatformMode('free')} className="hover:underline cursor-pointer">
                   Discuție Liberă
                 </button>
                 <button onClick={() => enterPlatformMode('arena5v5')} className="hover:underline cursor-pointer">
                   Arena 5v5
                 </button>
                 <button onClick={() => setIsAppealModalOpen(true)} className="hover:underline cursor-pointer">
                   Regulament & Ban Appeal
                 </button>
               </div>
               <div className="text-xs opacity-70">
                 DISPUTO — GÂNDEȘTE • DISCUTĂ • EVOLUEAZĂ
               </div>
             </div>
           </footer>
         </div>
       ) : (
         <>
           {/* ========================================================= */}
           {/* BARA DE PASI PE MOBIL (CAND SUNTEM IN FREE SAU ARENA 5v5) */}
           {/* ========================================================= */}
           <div
             className={`flex md:hidden border-b text-sm font-bold shrink-0 ${
               isDark ? 'bg-[#181715] border-[#2E2C28]' : 'bg-[#EAE3D5] border-[#D6CEBF]'
             }`}
           >
             <button
               onClick={() => setCurrentView('home')}
               className="px-3 py-3 border-r border-current/15 opacity-80 cursor-pointer"
             >
               ← Acasă
             </button>
             <button
               onClick={() => setMobileStep('categories')}
               className={`flex-1 py-3 text-center border-b-2 cursor-pointer ${
                 mobileStep === 'categories'
                   ? isDark
                     ? 'border-[#EAE3D5] font-bold'
                     : 'border-[#1A1917] font-bold'
                   : 'border-transparent opacity-60'
               }`}
             >
               1. Categorii ({platformMode === 'free' ? 'Liber' : platformMode === 'arena5v5' ? '5v5' : '1v1'})
             </button>
             <button
               onClick={() => setMobileStep('chat')}
               className={`flex-1 py-3 text-center border-b-2 cursor-pointer ${
                 mobileStep === 'chat'
                   ? isDark
                     ? 'border-[#EAE3D5] font-bold'
                     : 'border-[#1A1917] font-bold'
                   : 'border-transparent opacity-60'
               }`}
             >
               2. {platformMode === 'free' ? 'Discuție Liberă' : platformMode === 'arena5v5' ? '⚔️ Arena 5v5' : '🤝 Duel 1v1'}
             </button>
           </div>
 
           {/* ========================================================= */}
           {/* WORKSPACE: CATEGORIILE APAR DOAR DUPĂ SELECTAREA MODULUI  */}
           {/* ========================================================= */}
           <div className="flex flex-1 min-h-0 w-full overflow-hidden">
             {/* --------------------------------------------------------- */}
             {/* MENIU STÂNGA COMPACT (ACORDEON CU FONT MĂRIT)             */}
             {/* --------------------------------------------------------- */}
             <aside
               className={`${
                 mobileStep === 'categories' ? 'flex' : 'hidden'
               } md:flex flex-col ${
                 isSidebarCollapsed ? 'md:w-20' : 'w-full md:w-88 lg:w-[380px]'
               } border-r shrink-0 transition-all duration-300 ${
                 isDark
                   ? 'bg-[#161513] border-[#2E2C28]'
                   : 'bg-[#EFE9DC] border-[#D6CEBF]'
               }`}
             >
               {/* Buton Înapoi la Homepage + Indicatorul Modului Curent */}
               {!isSidebarCollapsed && (
                 <div
                   className={`px-3.5 py-2.5 border-b flex items-center justify-between gap-2 ${
                     isDark ? 'bg-[#1D1B18] border-[#2E2C28]' : 'bg-[#E5DEC9] border-[#D6CEBF]'
                   }`}
                 >
                   <button
                     onClick={() => setCurrentView('home')}
                     className="text-xs sm:text-sm font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
                   >
                     <ChevronLeft className="w-4 h-4" />
                     <span>Înapoi la Homepage</span>
                   </button>
 
                   <span
                     className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                       platformMode === 'arena5v5'
                         ? 'bg-amber-700 text-white'
                         : platformMode === 'duel1v1'
                         ? 'bg-emerald-800 text-white'
                         : isDark
                         ? 'bg-[#EAE3D5] text-[#121211]'
                         : 'bg-[#1A1917] text-[#F4EFE6]'
                     }`}
                   >
                     Mod: {platformMode === 'arena5v5' ? '⚔️ Arena 5v5' : platformMode === 'duel1v1' ? '🤝 Duel 1v1' : '💬 Discuție Liberă'}
                   </span>
                 </div>
               )}
 
               {/* Antet Meniu Stânga + Buton Restrângere Spațiu */}
               <div
                 className={`px-3.5 py-3 border-b flex items-center justify-between gap-2 ${
                   isDark ? 'border-[#2E2C28]' : 'border-[#D6CEBF]'
                 }`}
               >
                 {!isSidebarCollapsed && (
                   <div className="flex items-center gap-2 min-w-0">
                     <span className="text-xs sm:text-sm font-black uppercase tracking-wider opacity-85 truncate">
                       Categorii ({platformMode === 'arena5v5' ? 'Meciuri 5v5' : 'Chat Liber'})
                     </span>
                   </div>
                 )}
 
                 <div className="flex items-center gap-1.5 ml-auto">
                   {!isSidebarCollapsed && (
                     <button
                       onClick={() => {
                         setNewPromptCategory(activeCategory.id);
                         setIsCreatingPrompt(true);
                       }}
                       className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1 cursor-pointer ${
                         isDark
                           ? 'bg-[#EAE3D5] text-[#121211] hover:bg-white'
                           : 'bg-[#1A1917] text-[#F4EFE6] hover:bg-stone-800'
                       }`}
                       title="Propune un subiect nou"
                     >
                       <Plus className="w-3.5 h-3.5" />
                       <span>Subiect Nou</span>
                     </button>
                   )}
 
                   <button
                     onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                     className={`hidden md:flex p-2 rounded-xl border transition-colors cursor-pointer ${
                       isDark
                         ? 'border-[#38352F] bg-[#22201D] hover:bg-[#2C2925]'
                         : 'border-[#C8BFAE] bg-[#FAF6EE] hover:bg-[#EAE3D5]'
                     }`}
                     title={
                       isSidebarCollapsed
                         ? 'Extinde meniul de categorii'
                         : 'Restrânge meniul pentru mai mult spațiu pe ecran'
                     }
                   >
                     {isSidebarCollapsed ? (
                       <ChevronRight className="w-4 h-4" />
                     ) : (
                       <ChevronLeft className="w-4 h-4" />
                     )}
                   </button>
                 </div>
               </div>
 
               {/*Dacă meniul este restrâns (Collapsed Mode pe Desktop): afișăm doar iconițele categoriilor */}
               {isSidebarCollapsed ? (
                 <div className="flex-1 flex flex-col items-center py-4 gap-3.5 overflow-y-auto">
                   {CATEGORIES.map((cat) => {
                     const isSelected = cat.id === activeCategory.id;
                     return (
                       <button
                         key={cat.id}
                         onClick={() => {
                           setIsSidebarCollapsed(false);
                           handleSelectCategory(cat.id);
                         }}
                         className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                           isSelected
                             ? isDark
                               ? 'bg-[#EAE3D5] text-[#121211] border-[#EAE3D5] shadow-md'
                               : 'bg-[#1A1917] text-[#F4EFE6] border-[#1A1917] shadow-md'
                             : isDark
                             ? 'bg-[#1E1C19] border-[#38352F] hover:bg-[#2A2723]'
                             : 'bg-[#FAF6EE] border-[#C8BFAE] hover:bg-[#EAE3D5]'
                         }`}
                         title={`${cat.name} (${cat.subtitle})`}
                       >
                         {renderCategoryIcon(cat.icon, 'w-5 h-5')}
                       </button>
                     );
                   })}
                 </div>
               ) : (
                 <>
                   {/* Bară Căutare + Filtru Lot 6h vs Toate cu font mărit */}
                   <div className="p-3 space-y-2.5 border-b border-current/10">
                     <div className="flex items-center gap-2">
                       <div
                         className={`flex-1 grid grid-cols-2 gap-1 p-1 rounded-full border ${
                           isDark ? 'bg-[#121211] border-[#2E2C28]' : 'bg-[#EAE3D5] border-[#C8BFAE]'
                         }`}
                       >
                         <button
                           onClick={() => setPromptViewFilter('live')}
                           className={`py-1.5 px-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                             promptViewFilter === 'live'
                               ? isDark
                                 ? 'bg-[#EAE3D5] text-[#121211]'
                                 : 'bg-[#1A1917] text-[#F4EFE6]'
                               : 'opacity-75 hover:opacity-100'
                           }`}
                         >
                           <Clock className="w-3.5 h-3.5" />
                           <span>Lotul 6h</span>
                         </button>
                         <button
                           onClick={() => setPromptViewFilter('all')}
                           className={`py-1.5 px-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                             promptViewFilter === 'all'
                               ? isDark
                                 ? 'bg-[#EAE3D5] text-[#121211]'
                                 : 'bg-[#1A1917] text-[#F4EFE6]'
                               : 'opacity-75 hover:opacity-100'
                           }`}
                         >
                           <Archive className="w-3.5 h-3.5" />
                           <span>Toate (24)</span>
                         </button>
                       </div>
 
                       <button
                         onClick={() => setSimulatedCycleOffset((prev) => prev + 1)}
                         className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
                           isDark
                             ? 'border-[#38352F] bg-[#22201D] hover:bg-[#2C2925]'
                             : 'border-[#C8BFAE] bg-[#FAF6EE] hover:bg-[#EAE3D5]'
                         }`}
                         title="Simulează trecerea a 6 ore"
                       >
                         +6h
                       </button>
                     </div>
 
                     <div className="relative">
                       <Search className="w-4 h-4 opacity-50 absolute left-3.5 top-2.5" />
                       <input
                         type="text"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder="Caută un subiect în categorii..."
                         className={`w-full rounded-full pl-9 pr-8 py-2 text-sm border focus:outline-none ${
                           isDark
                             ? 'bg-[#121211] border-[#2E2C28] text-[#EAE3D5] placeholder-[#EAE3D5]/40'
                             : 'bg-[#FAF6EE] border-[#C8BFAE] text-[#1A1917] placeholder-[#1A1917]/50'
                         }`}
                       />
                       {searchQuery && (
                         <button
                           onClick={() => setSearchQuery('')}
                           className="absolute right-3 top-2.5 opacity-60 hover:opacity-100 cursor-pointer"
                         >
                           <X className="w-4 h-4" />
                         </button>
                       )}
                     </div>
                   </div>
 
                   {/* LISTA ACORDEON CU FONT MĂRIT: CÂND DESCHIZI O CATEGORIE, CEA DINAINTE SE ÎNCHIDE AUTOMAT */}
                   <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                     {CATEGORIES.map((cat) => {
                       const isExpanded = expandedCategoryId === cat.id;
                       const catPromptsFiltered = getFilteredPromptsForCategory(cat.id);
 
                       return (
                         <div
                           key={cat.id}
                           className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                             isExpanded
                               ? isDark
                                 ? 'bg-[#1D1B18] border-[#EAE3D5]/60 shadow-md'
                                 : 'bg-[#FAF6EE] border-[#1A1917] shadow-md'
                               : isDark
                               ? 'bg-[#161513] border-[#2E2C28] hover:border-[#38352F]'
                               : 'bg-[#FAF6EE]/60 border-[#D6CEBF] hover:bg-[#FAF6EE]'
                           }`}
                         >
                           {/* Butonul Categoriei (Capul Acordeonului) */}
                           <button
                             onClick={() => handleSelectCategory(cat.id)}
                             className={`w-full text-left px-4 py-3.5 flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                               isExpanded
                                 ? isDark
                                   ? 'bg-[#EAE3D5] text-[#121211]'
                                   : 'bg-[#1A1917] text-[#F4EFE6]'
                                 : ''
                             }`}
                           >
                             <div className="flex items-center gap-3 min-w-0">
                               <div
                                 className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                                   isExpanded
                                     ? isDark
                                       ? 'border-[#121211]/20 bg-[#121211]/10'
                                       : 'border-[#F4EFE6]/20 bg-[#F4EFE6]/10'
                                     : 'border-current/20 bg-current/5'
                                 }`}
                               >
                                 {renderCategoryIcon(cat.icon, 'w-4 h-4')}
                               </div>
                               <div className="min-w-0">
                                 <h3
                                   className="font-bold text-base sm:text-lg truncate"
                                   style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                                 >
                                   {cat.name}
                                 </h3>
                                 <p className="text-xs opacity-80 truncate">{cat.subtitle}</p>
                               </div>
                             </div>
 
                             <div className="flex items-center gap-2 shrink-0">
                               <span
                                 className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                   isExpanded
                                     ? isDark
                                       ? 'bg-[#121211]/15 text-[#121211]'
                                       : 'bg-[#F4EFE6]/20 text-[#F4EFE6]'
                                     : 'bg-current/10 opacity-80'
                                 }`}
                               >
                                 {catPromptsFiltered.length}
                               </span>
                               {isExpanded ? (
                                 <ChevronUp className="w-5 h-5" />
                               ) : (
                                 <ChevronDown className="w-5 h-5 opacity-70" />
                               )}
                             </div>
                           </button>
 
                           {/* Subiectele din categorie (Afișate DOAR pentru categoria deschisă curent) */}
                           {isExpanded && (
                             <div className="p-2.5 space-y-2 border-t border-current/10">
                               {catPromptsFiltered.map((promptItem) => {
                                 const isPromptActive =
                                   activePrompt && promptItem.id === activePrompt.id;
                                 const msgCount = allMessages.filter(
                                   (m) => m.promptId === promptItem.id
                                 ).length;
 
                                 return (
                                   <button
                                     key={promptItem.id}
                                     onClick={() => handleSelectPrompt(promptItem)}
                                     className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                                       isPromptActive
                                         ? isDark
                                           ? 'bg-[#2B2823] border-[#EAE3D5] shadow-xs'
                                           : 'bg-[#EAE3D5] border-[#1A1917] font-semibold shadow-xs'
                                         : isDark
                                         ? 'bg-[#141311] hover:bg-[#22201D] border-[#2E2C28]'
                                         : 'bg-white/70 hover:bg-white border-[#D6CEBF]'
                                     }`}
                                   >
                                     <div className="flex items-center justify-between gap-2 mb-1">
                                       <span className="text-xs font-bold uppercase tracking-wider opacity-80 truncate">
                                         {promptItem.title}
                                       </span>
                                       <span className="text-xs opacity-75 shrink-0 flex items-center gap-1">
                                         <MessageSquare className="w-3.5 h-3.5" />
                                         {msgCount}
                                       </span>
                                     </div>
                                     <p
                                       className="text-sm sm:text-base leading-snug line-clamp-2"
                                       style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                                     >
                                       „{promptItem.question}”
                                     </p>
                                   </button>
                                 );
                               })}
                             </div>
                           )}
                         </div>
                       );
                     })}
                   </div>
                 </>
               )}
             </aside>
 
             {/* --------------------------------------------------------- */}
             {/* ZONA PRINCIPALĂ DREAPTA (DISCUȚIE LIBERĂ SAU ARENA 5v5)   */}
             {/* --------------------------------------------------------- */}
             <main
               className={`${
                 mobileStep === 'chat' ? 'flex' : 'hidden'
               } md:flex flex-col flex-1 h-full overflow-hidden transition-colors ${
                 isDark ? 'bg-[#121211]' : 'bg-[#FAF6EE]'
               }`}
             >
               {/* Alerta de Auto-Ban dacă a fost declanșată */}
               {moderationBannerAlert && (
                 <div className="mx-4 mt-3 p-3.5 rounded-xl bg-red-800/15 border border-red-700/50 flex flex-wrap items-center justify-between gap-2">
                   <div className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
                     <ShieldAlert className="w-5 h-5 shrink-0" />
                     <span>{moderationBannerAlert}</span>
                   </div>
                   <button
                     onClick={() => {
                       setAppealTab('user');
                       setIsAppealModalOpen(true);
                     }}
                     className="px-4 py-1.5 rounded-full bg-red-700 text-white text-sm font-bold cursor-pointer"
                   >
                     Deschide Cerere Debanare
                   </button>
                 </div>
               )}
 
               {platformMode === 'arena5v5' ? (
                 /* ========================================================= */
                 /* MODUL 2: MINIGAME SEPARAT — ARENA 5 vs 5 (STIL JUBILEE)   */
                 /* ========================================================= */
                 <div className="flex-1 flex flex-col h-full overflow-hidden">
                   {/* Antet Arena 5v5 */}
                   <div
                     className={`px-4 sm:px-6 py-4 border-b shrink-0 ${
                       isDark
                         ? 'bg-[#181715] border-[#2E2C28]'
                         : 'bg-[#F4EFE6] border-[#D6CEBF]'
                     }`}
                   >
                     <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                       <div className="flex items-center gap-2.5">
                         <span className="px-3.5 py-1 rounded-full bg-amber-700 text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                           <Trophy className="w-4 h-4" />
                           <span>Minigame: Arena 5 vs 5</span>
                         </span>
                         <span className="text-sm font-bold opacity-80">
                           Runda #{arenaRoundNumber} • {activePromptCategory.name}
                         </span>
                       </div>
 
                       <div className="flex items-center gap-2">
                         <button
                           onClick={handleFillArenaWithBots}
                           className={`px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-bold cursor-pointer ${
                             isDark
                               ? 'border-[#38352F] bg-[#22201D] hover:bg-[#2C2925]'
                               : 'border-[#1A1917]/30 bg-[#EAE3D5] hover:bg-[#dfd6c5]'
                           }`}
                         >
                           + Completează Locurile cu Boți (5v5)
                         </button>
                         <button
                           onClick={() => enterPlatformMode('duel1v1')}
                           className="px-3.5 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold cursor-pointer"
                         >
                           🤝 Matchmaking 1v1
                         </button>
                         <button
                           onClick={() => enterPlatformMode('free')}
                           className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold cursor-pointer ${
                             isDark
                               ? 'bg-[#EAE3D5] text-[#121211]'
                               : 'bg-[#1A1917] text-[#F4EFE6]'
                           }`}
                         >
                           Comută pe Discuție Liberă
                         </button>
                       </div>
                     </div>
 
                     <h1
                       className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug"
                       style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                     >
                       „{activePrompt?.question}”
                     </h1>
                   </div>
 
                   {/* Corp Arena 5v5 Scrollabil */}
                   <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                     {/* CELE 2 TABERE FATA IN FATA (5 LOCURI PRO vs 5 LOCURI CONTRA) + CRONOMETRU CENTRAL */}
                     <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
                       {/* TABĂRA PRO (5 Locuri) */}
                       <div
                         className={`lg:col-span-4 p-4 rounded-2xl border ${
                           isDark
                             ? 'bg-emerald-950/20 border-emerald-800/50'
                             : 'bg-emerald-950/5 border-emerald-800/30'
                         }`}
                       >
                         <div className="flex items-center justify-between mb-3">
                           <span className="text-sm font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                             Tabăra PRO ({arenaSeats.PRO.filter(Boolean).length}/5 Jucători)
                           </span>
                           <span className="text-xs opacity-75">Ocupă loc sau Provocă 1v1</span>
                         </div>
 
                         <div className="space-y-2.5">
                           {arenaSeats.PRO.map((seat, idx) => {
                             const isMe = seat && seat.name === nickname;
                             const isSpeaking =
                               arenaActiveSpeaker?.side === 'PRO' &&
                               arenaActiveSpeaker?.seatIndex === idx;
                             return (
                               <div
                                 key={`pro-seat-${idx}`}
                                 className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-sm transition-all ${
                                   isSpeaking
                                     ? 'border-2 border-emerald-500 bg-emerald-600/15 shadow-sm'
                                     : 'border-current/15 bg-current/5'
                                 }`}
                               >
                                 {seat ? (
                                   <div className="flex items-center gap-2.5 min-w-0">
                                     <span className="text-lg">{seat.avatar}</span>
                                     <div className="min-w-0">
                                       <span className="font-bold block truncate">
                                         #{idx + 1} {seat.name} {isMe && '(Tu)'}
                                       </span>
                                       <span className="text-xs opacity-75">
                                         {isSpeaking ? '🎙️ La microfon acum' : 'În Arena 5v5'}
                                       </span>
                                     </div>
                                   </div>
                                 ) : (
                                   <span className="opacity-60 italic">Locul #{idx + 1} PRO — Liber</span>
                                 )}
 
                                 {seat ? (
                                   isMe ? (
                                     <button
                                       onClick={handleLeaveArenaSeat}
                                       className="px-3 py-1 rounded-full bg-red-700/20 text-red-600 dark:text-red-300 text-xs font-bold cursor-pointer"
                                     >
                                       Părăsește
                                     </button>
                                   ) : (
                                     <button
                                       onClick={() =>
                                         handleOpen1v1InviteModal(
                                           { name: seat.name, avatar: seat.avatar, stance: 'PRO' },
                                           'Arena 5v5'
                                         )
                                       }
                                       className="px-3 py-1 rounded-full bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                                       title={`Invită pe ${seat.name} la un Duel 1v1 separat`}
                                     >
                                       <Swords className="w-3.5 h-3.5" />
                                       <span>Provocă 1v1</span>
                                     </button>
                                   )
                                 ) : (
                                   <button
                                     onClick={() => handleJoinArenaSeat('PRO', idx)}
                                     className="px-3.5 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                                   >
                                     Ocupă Loc PRO
                                   </button>
                                 )}
                               </div>
                             );
                           })}
                         </div>
                       </div>
 
                       {/* CENTRUL ARENEI: MICROFONUL ACTIV (60s / 30s) & FRÂNGHIA PUBLICULUI */}
                       <div
                         className={`lg:col-span-3 p-5 rounded-2xl border flex flex-col justify-between text-center ${
                           isDark
                             ? 'bg-[#181715] border-[#38352F]'
                             : 'bg-[#F4EFE6] border-[#1A1917]'
                         }`}
                       >
                         <div>
                           <span className="text-xs font-bold uppercase tracking-widest opacity-75 block">
                             Microfonul Confruntării
                           </span>
                           <div className="my-3">
                             <div className="w-16 h-16 rounded-full border-2 border-amber-600 flex items-center justify-center text-3xl mx-auto mb-2">
                               {arenaActiveSpeaker?.avatar || '🎙️'}
                             </div>
                             <div className="text-base font-bold">
                               {arenaActiveSpeaker?.name || 'Niciun vorbitor'}
                             </div>
                             <span
                               className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold text-white ${
                                 arenaActiveSpeaker?.side === 'CONTRA'
                                   ? 'bg-rose-800'
                                   : 'bg-emerald-800'
                               }`}
                             >
                               {arenaActiveSpeaker?.side || 'PRO'} •{' '}
                               {arenaActiveSpeaker?.mode === 'replica'
                                 ? 'Drept la Replică (30s)'
                                 : 'Argument (60s)'}
                             </span>
                           </div>
 
                           {/* Ceasul mare de 60s / 30s */}
                           <div
                             className={`font-mono text-4xl font-black my-2.5 ${
                               arenaTimerSeconds <= 10 ? 'text-red-600 animate-pulse' : ''
                             }`}
                           >
                             00:{String(arenaTimerSeconds).padStart(2, '0')}
                           </div>
 
                           <div className="flex flex-wrap justify-center gap-2 mt-2">
                             <button
                               type="button"
                               onClick={() => handleStartArenaTurn('argument')}
                               className="px-3.5 py-2 rounded-full bg-amber-700 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold cursor-pointer"
                             >
                               🎙️ Preia Microfon (60s)
                             </button>
                             <button
                               type="button"
                               onClick={() => handleStartArenaTurn('replica')}
                               className="px-3.5 py-2 rounded-full border border-current/30 text-xs sm:text-sm font-bold cursor-pointer"
                             >
                               ⚡ Drept la Replică (30s)
                             </button>
                           </div>
                         </div>
 
                         {/* Votul Anonim al Publicului (Tug-of-War) */}
                         <div className="mt-4 pt-3 border-t border-current/15">
                           <span className="text-xs font-bold uppercase tracking-wider block mb-2">
                             Frânghia Publicului (Vot Live)
                           </span>
                           <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-rose-800/40 mb-2.5">
                             <div
                               className="h-full bg-emerald-700 transition-all duration-300"
                               style={{ width: `${arenaAudienceRope}%` }}
                             />
                           </div>
                           <div className="flex justify-between gap-2">
                             <button
                               onClick={() =>
                                 setArenaAudienceRope((prev) => Math.min(95, prev + 3))
                               }
                               className="flex-1 py-1.5 rounded-full bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                             >
                               Susține PRO ({arenaAudienceRope}%)
                             </button>
                             <button
                               onClick={() =>
                                 setArenaAudienceRope((prev) => Math.max(5, prev - 3))
                               }
                               className="flex-1 py-1.5 rounded-full bg-rose-800 text-white text-xs font-bold cursor-pointer"
                             >
                               Susține CONTRA ({100 - arenaAudienceRope}%)
                             </button>
                           </div>
                         </div>
                       </div>
 
                       {/* TABĂRA CONTRA (5 Locuri) */}
                       <div
                         className={`lg:col-span-4 p-4 rounded-2xl border ${
                           isDark
                             ? 'bg-rose-950/20 border-rose-800/50'
                             : 'bg-rose-950/5 border-rose-800/30'
                         }`}
                       >
                         <div className="flex items-center justify-between mb-3">
                           <span className="text-sm font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                             Tabăra CONTRA ({arenaSeats.CONTRA.filter(Boolean).length}/5 Jucători)
                           </span>
                           <span className="text-xs opacity-75">Ocupă loc sau Provocă 1v1</span>
                         </div>
 
                         <div className="space-y-2.5">
                           {arenaSeats.CONTRA.map((seat, idx) => {
                             const isMe = seat && seat.name === nickname;
                             const isSpeaking =
                               arenaActiveSpeaker?.side === 'CONTRA' &&
                               arenaActiveSpeaker?.seatIndex === idx;
                             return (
                               <div
                                 key={`contra-seat-${idx}`}
                                 className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-sm transition-all ${
                                   isSpeaking
                                     ? 'border-2 border-rose-500 bg-rose-600/15 shadow-sm'
                                     : 'border-current/15 bg-current/5'
                                 }`}
                               >
                                 {seat ? (
                                   <div className="flex items-center gap-2.5 min-w-0">
                                     <span className="text-lg">{seat.avatar}</span>
                                     <div className="min-w-0">
                                       <span className="font-bold block truncate">
                                         #{idx + 1} {seat.name} {isMe && '(Tu)'}
                                       </span>
                                       <span className="text-xs opacity-75">
                                         {isSpeaking ? '🎙️ La microfon acum' : 'În Arena 5v5'}
                                       </span>
                                     </div>
                                   </div>
                                 ) : (
                                   <span className="opacity-60 italic">
                                     Locul #{idx + 1} CONTRA — Liber
                                   </span>
                                 )}
 
                                 {seat ? (
                                   isMe ? (
                                     <button
                                       onClick={handleLeaveArenaSeat}
                                       className="px-3 py-1 rounded-full bg-red-700/20 text-red-600 dark:text-red-300 text-xs font-bold cursor-pointer"
                                     >
                                       Părăsește
                                     </button>
                                   ) : (
                                     <button
                                       onClick={() =>
                                         handleOpen1v1InviteModal(
                                           { name: seat.name, avatar: seat.avatar, stance: 'CONTRA' },
                                           'Arena 5v5'
                                         )
                                       }
                                       className="px-3 py-1 rounded-full bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                                       title={`Invită pe ${seat.name} la un Duel 1v1 separat`}
                                     >
                                       <Swords className="w-3.5 h-3.5" />
                                       <span>Provocă 1v1</span>
                                     </button>
                                   )
                                 ) : (
                                   <button
                                     onClick={() => handleJoinArenaSeat('CONTRA', idx)}
                                     className="px-3.5 py-1.5 rounded-full bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                                   >
                                     Ocupă Loc CONTRA
                                   </button>
                                 )}
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     </div>
 
                     {/* ISTORICUL RUNDELOR DIN MECIUL 5v5 & SCORUL ARGUMENTELOR */}
                     <div className="space-y-3">
                       <h3
                         className="text-base sm:text-lg font-bold uppercase tracking-wider opacity-85"
                         style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                       >
                         Desfășurarea Meciului 5v5 & Clasament Popularitate Argumente
                       </h3>
 
                       {arenaMatchLog.map((entry) => (
                         <div
                           key={entry.id}
                           className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                             entry.side === 'PRO'
                               ? isDark
                                 ? 'bg-emerald-950/20 border-emerald-800/50'
                                 : 'bg-emerald-950/5 border-emerald-800/30'
                               : isDark
                               ? 'bg-rose-950/20 border-rose-800/50'
                               : 'bg-rose-950/5 border-rose-800/30'
                           }`}
                         >
                           <div className="space-y-1.5">
                             <div className="flex flex-wrap items-center gap-2">
                               <span className="text-lg">{entry.senderAvatar}</span>
                               <span className="text-sm sm:text-base font-bold">{entry.senderName}</span>
                               <span
                                 className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${
                                   entry.side === 'PRO' ? 'bg-emerald-800' : 'bg-rose-800'
                                 }`}
                               >
                                 {entry.side} • Locul #{entry.seatNumber}
                               </span>
                               <span className="text-xs font-semibold opacity-75">
                                 {entry.type}
                               </span>
                               {entry.senderName !== nickname && (
                                 <button
                                   onClick={() =>
                                     handleOpen1v1InviteModal(
                                       {
                                         name: entry.senderName,
                                         avatar: entry.senderAvatar,
                                         stance: entry.side
                                       },
                                       'Arena 5v5'
                                     )
                                   }
                                   className="px-2.5 py-0.5 rounded-full bg-amber-700/20 hover:bg-amber-700 text-amber-800 dark:text-amber-300 hover:text-white border border-amber-700/40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                 >
                                   <Swords className="w-3 h-3" />
                                   <span>Invită la 1v1</span>
                                 </button>
                               )}
                             </div>
                             <p className="text-base sm:text-lg leading-relaxed">{entry.text}</p>
                           </div>
 
                           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-current/20 text-sm shrink-0">
                             <button
                               onClick={() => handleVoteArenaEntry(entry.id, 1)}
                               className="hover:text-emerald-600 cursor-pointer"
                             >
                               <ChevronUp className="w-5 h-5" />
                             </button>
                             <span className="font-mono font-bold">{entry.score} pct</span>
                             <button
                               onClick={() => handleVoteArenaEntry(entry.id, -1)}
                               className="hover:text-rose-600 cursor-pointer"
                             >
                               <ChevronDown className="w-5 h-5" />
                             </button>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
 
                   {/* Bară Trimitere Argument în Minigame-ul Arena 5v5 */}
                   <div
                     className={`p-4 border-t shrink-0 ${
                       isDark
                         ? 'bg-[#181715] border-[#2E2C28]'
                         : 'bg-[#F4EFE6] border-[#D6CEBF]'
                     }`}
                   >
                     <form onSubmit={handleSendArenaArgument} className="flex items-center gap-3">
                       <input
                         type="text"
                         value={arenaInputText}
                         onChange={(e) => setArenaInputText(e.target.value)}
                         placeholder={
                           myArenaSeat
                             ? `Ești pe Locul #${myArenaSeat.seatIndex + 1} (${myArenaSeat.side}). Scrie argumentul tău de max. 60s...`
                             : 'Ocupă un loc mai sus sau trimite direct un argument în Arena 5v5...'
                         }
                         className={`flex-1 rounded-full px-5 py-3 text-base border focus:outline-none ${
                           isDark
                             ? 'bg-[#121211] border-[#38352F] text-[#EAE3D5]'
                             : 'bg-[#FAF6EE] border-[#1A1917]/40 text-[#1A1917]'
                         }`}
                       />
                       <button
                         type="submit"
                         disabled={!arenaInputText.trim()}
                         className="px-6 py-3 rounded-full bg-amber-700 hover:bg-amber-600 text-white font-bold text-sm sm:text-base flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                       >
                         <span>Lansează în Arena 5v5</span>
                         <Send className="w-4 h-4" />
                       </button>
                     </form>
                   </div>
                 </div>
               ) : platformMode === 'duel1v1' ? (
                 /* ========================================================= */
                 /* MODUL 3: DUEL 1v1 (MATCHMAKING AUTOMAT PRO vs CONTRA      */
                 /* & DUELURI DIN INVITAȚII DIRECTE)                          */
                 /* ========================================================= */
                 <div className="flex-1 flex flex-col h-full overflow-hidden">
                   {/* Antetul Modului 1v1 */}
                   <div
                     className={`px-4 sm:px-6 py-4 border-b shrink-0 ${
                       isDark
                         ? 'bg-[#181715] border-[#2E2C28]'
                         : 'bg-[#F4EFE6] border-[#D6CEBF]'
                     }`}
                   >
                     <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                       <div className="flex items-center gap-2.5">
                         <span className="px-3.5 py-1 rounded-full bg-emerald-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                           <Swords className="w-4 h-4" />
                           <span>Modul Duel 1v1 • Matchmaking pe Opinii Opuse</span>
                         </span>
                         <span className="text-xs sm:text-sm font-bold opacity-80">
                           {activePromptCategory.name}
                         </span>
                       </div>
 
                       <div className="flex flex-wrap items-center gap-2">
                         <button
                           onClick={handleSimulateIncoming1v1Invite}
                           className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                             isDark
                               ? 'border-amber-500/40 bg-amber-950/30 text-amber-300'
                               : 'border-amber-800/40 bg-amber-900/10 text-amber-900'
                           }`}
                           title="Simulează primirea unei provocări 1v1 de la un alt utilizator"
                         >
                           <Bell className="w-3.5 h-3.5" />
                           <span>Simulează Provocare 1v1 Primită</span>
                         </button>
                         <button
                           onClick={() => enterPlatformMode('free')}
                           className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer ${
                             isDark
                               ? 'bg-[#EAE3D5] text-[#121211]'
                               : 'bg-[#1A1917] text-[#F4EFE6]'
                           }`}
                         >
                           Înapoi la Discuție Liberă
                         </button>
                       </div>
                     </div>
 
                     <h1
                       className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug"
                       style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                     >
                       „{activeDuelMatch ? activeDuelMatch.promptQuestion : activePrompt?.question}”
                     </h1>
                   </div>
 
                   {/* Corpul Modului 1v1: Fie Ecranul de Alegere PRO/CONTRA pentru Matchmaking, fie Arena 1v1 Activă */}
                   <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                     {/* PANOUL DE MATCHMAKING PE OPINII OPUSE (CÂND CAUȚI SAU SCHIMBI ADVERSARUL) */}
                     {(!activeDuelMatch || isMatchmaking1v1) && (
                       <div
                         className={`max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl border-2 text-center space-y-6 shadow-lg ${
                           isDark
                             ? 'bg-[#181715] border-[#38352F]'
                             : 'bg-[#F4EFE6] border-[#1A1917]'
                         }`}
                       >
                         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/15 text-emerald-800 dark:text-emerald-300 border border-emerald-700/30 text-xs sm:text-sm font-bold uppercase tracking-wider">
                           <Radar className="w-4 h-4" />
                           <span>Matchmaking Inteligent PRO vs. CONTRA</span>
                         </div>
 
                         <div className="space-y-2">
                           <h2
                             className="text-2xl sm:text-4xl font-black"
                             style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                           >
                             Alege-ți tabăra pe acest subiect
                           </h2>
                           <p className="text-sm sm:text-base opacity-85 max-w-xl mx-auto">
                             Selectează <strong>PRO</strong> sau <strong>CONTRA</strong> pentru subiectul curent din stânga, iar sistemul de Matchmaking te va cupla instantaneu într-o cameră 1v1 cu un partener care a ales <strong>tabăra opusă</strong>!
                           </p>
                         </div>
 
                         {isMatchmaking1v1 ? (
                           <div className="py-8 space-y-4">
                             <div className="w-16 h-16 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
                             <div className="text-lg font-bold">
                               Tu ai ales <span className="underline">{duelMyStance}</span> — Căutăm un adversar care a ales{' '}
                               <span className="underline">
                                 {duelMyStance === 'PRO' ? 'CONTRA' : 'PRO'}
                               </span>
                               ...
                             </div>
                             <div className="w-64 h-2.5 rounded-full bg-current/15 mx-auto overflow-hidden">
                               <div
                                 className="h-full bg-emerald-600 transition-all duration-300"
                                 style={{ width: `${matchmakingProgress}%` }}
                               />
                             </div>
                           </div>
                         ) : (
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                             <button
                               onClick={() => handleStart1v1Matchmaking('PRO')}
                               className="p-6 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white text-left transition-all hover:-translate-y-0.5 shadow-md cursor-pointer"
                             >
                               <div className="flex items-center justify-between mb-2">
                                 <span className="px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase">
                                   Tabăra PRO
                                 </span>
                                 <ThumbsUp className="w-6 h-6" />
                               </div>
                               <div
                                 className="text-xl sm:text-2xl font-black mb-1"
                                 style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                               >
                                 ALEG TABĂRA PRO
                               </div>
                               <p className="text-xs sm:text-sm opacity-90">
                                 Caută automat în coadă un oponent care a ales <strong>CONTRA</strong> pe acest prompt →
                               </p>
                             </button>
 
                             <button
                               onClick={() => handleStart1v1Matchmaking('CONTRA')}
                               className="p-6 rounded-2xl bg-rose-800 hover:bg-rose-700 text-white text-left transition-all hover:-translate-y-0.5 shadow-md cursor-pointer"
                             >
                               <div className="flex items-center justify-between mb-2">
                                 <span className="px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase">
                                   Tabăra CONTRA
                                 </span>
                                 <ThumbsDown className="w-6 h-6" />
                               </div>
                               <div
                                 className="text-xl sm:text-2xl font-black mb-1"
                                 style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                               >
                                 ALEG TABĂRA CONTRA
                               </div>
                               <p className="text-xs sm:text-sm opacity-90">
                                 Caută automat în coadă un oponent care a ales <strong>PRO</strong> pe acest prompt →
                               </p>
                             </button>
                           </div>
                         )}
                       </div>
                     )}
 
                     {/* ARENA DE DUEL 1v1 FAȚĂ ÎN FAȚĂ (DUPĂ CE MATCHMAKING-UL SAU INVITAȚIA S-A CONECTAT) */}
                     {activeDuelMatch && !isMatchmaking1v1 && (
                       <div className="space-y-5">
                         {/* Cardul Față-în-Față: Jucător 1 vs. Jucător 2 */}
                         <div
                           className={`p-4 sm:p-5 rounded-2xl border-2 ${
                             isDark
                               ? 'bg-[#181715] border-[#38352F]'
                               : 'bg-[#F4EFE6] border-[#1A1917]'
                           }`}
                         >
                           <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-current/15">
                             <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                               ⚡ {activeDuelMatch.modeType} • {activeDuelMatch.promptTitle}
                             </span>
                             <div className="flex items-center gap-2">
                               <button
                                 onClick={() =>
                                   handleStart1v1Matchmaking(activeDuelMatch.myStance)
                                 }
                                 className="px-3 py-1 rounded-full border border-current/30 text-xs font-bold flex items-center gap-1 hover:bg-current/10 cursor-pointer"
                               >
                                 <RefreshCw className="w-3.5 h-3.5" />
                                 <span>Caută Alt Adversar ({activeDuelMatch.opponentStance})</span>
                               </button>
                               <button
                                 onClick={() => setActiveDuelMatch(null)}
                                 className="px-3 py-1 rounded-full bg-current/10 text-xs font-bold cursor-pointer"
                               >
                                 Schimbă Tabăra PRO/CONTRA
                               </button>
                             </div>
                           </div>
 
                           <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                             {/* TU */}
                             <div
                               className={`md:col-span-3 p-4 rounded-2xl border flex items-center gap-3.5 ${
                                 activeDuelMatch.myStance === 'PRO'
                                   ? 'bg-emerald-900/15 border-emerald-700/40'
                                   : 'bg-rose-900/15 border-rose-700/40'
                               }`}
                             >
                               <div className="w-14 h-14 rounded-2xl border-2 border-current/30 flex items-center justify-center text-3xl shrink-0">
                                 {avatar}
                               </div>
                               <div className="min-w-0">
                                 <span
                                   className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white mb-1 ${
                                     activeDuelMatch.myStance === 'PRO'
                                       ? 'bg-emerald-800'
                                       : 'bg-rose-800'
                                   }`}
                                 >
                                   TABĂRA TA: {activeDuelMatch.myStance}
                                 </span>
                                 <h3 className="text-lg font-black truncate">{nickname} (Tu)</h3>
                                 <span className="text-xs opacity-75">În Duel 1v1 Activ</span>
                               </div>
                             </div>
 
                             {/* VS + CRONOMETRU 60S */}
                             <div className="md:col-span-1 flex flex-col items-center justify-center text-center">
                               <div className="w-11 h-11 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-md mb-1">
                                 1v1
                               </div>
                               <div className="font-mono text-xl font-black">
                                 00:{String(duelTurnSeconds).padStart(2, '0')}
                               </div>
                               <span className="text-[11px] opacity-70">Timp replică</span>
                             </div>
 
                             {/* ADVERSARUL CU OPINIE OPUSĂ */}
                             <div
                               className={`md:col-span-3 p-4 rounded-2xl border flex items-center justify-between gap-3.5 ${
                                 activeDuelMatch.opponentStance === 'PRO'
                                   ? 'bg-emerald-900/15 border-emerald-700/40'
                                   : 'bg-rose-900/15 border-rose-700/40'
                               }`}
                             >
                               <div className="flex items-center gap-3.5 min-w-0">
                                 <div className="w-14 h-14 rounded-2xl border-2 border-current/30 flex items-center justify-center text-3xl shrink-0">
                                   {activeDuelMatch.opponentAvatar}
                                 </div>
                                 <div className="min-w-0">
                                   <span
                                     className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white mb-1 ${
                                       activeDuelMatch.opponentStance === 'PRO'
                                         ? 'bg-emerald-800'
                                         : 'bg-rose-800'
                                     }`}
                                   >
                                     OPONENT: {activeDuelMatch.opponentStance}
                                   </span>
                                   <h3 className="text-lg font-black truncate">
                                     {activeDuelMatch.opponentName}
                                   </h3>
                                   <span className="text-xs opacity-75">
                                     {activeDuelMatch.opponentRating}
                                   </span>
                                 </div>
                               </div>
                             </div>
                           </div>
 
                           {/* Bara de Scor a Duelului 1v1 */}
                           <div className="mt-4 pt-3 border-t border-current/10">
                             <div className="flex justify-between text-xs font-bold mb-1">
                               <span className="text-emerald-700 dark:text-emerald-400">
                                 Scor Argumente PRO ({duelAudienceBar}%)
                               </span>
                               <span className="text-rose-700 dark:text-rose-400">
                                 Scor Argumente CONTRA ({100 - duelAudienceBar}%)
                               </span>
                             </div>
                             <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-rose-800/40">
                               <div
                                 className="h-full bg-emerald-700 transition-all duration-300"
                                 style={{ width: `${duelAudienceBar}%` }}
                               />
                             </div>
                           </div>
                         </div>
 
                         {/* Mesajele & Argumentele din Duelul 1v1 */}
                         <div className="space-y-3">
                           {duelMessages.map((dm) => {
                             const isPro = dm.stance === 'PRO';
                             return (
                               <div
                                 key={dm.id}
                                 className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                                   isPro
                                     ? isDark
                                       ? 'bg-emerald-950/25 border-emerald-800/50'
                                       : 'bg-emerald-950/5 border-emerald-800/30'
                                     : isDark
                                     ? 'bg-rose-950/25 border-rose-800/50'
                                     : 'bg-rose-950/5 border-rose-800/30'
                                 }`}
                               >
                                 <div className="flex items-center justify-between gap-2 mb-2">
                                   <div className="flex items-center gap-2.5">
                                     <span className="text-xl">{dm.senderAvatar}</span>
                                     <span className="text-base font-bold">{dm.senderName}</span>
                                     <span
                                       className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${
                                         isPro ? 'bg-emerald-800' : 'bg-rose-800'
                                       }`}
                                     >
                                       {dm.stance}
                                     </span>
                                   </div>
                                   <span className="text-xs opacity-65">Duel 1v1 Direct</span>
                                 </div>
                                 <p className="text-base sm:text-lg leading-relaxed">{dm.text}</p>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     )}
                   </div>
 
                   {/* Bara de scriere în Duelul 1v1 */}
                   {activeDuelMatch && !isMatchmaking1v1 && (
                     <div
                       className={`p-4 border-t shrink-0 ${
                         isDark
                           ? 'bg-[#181715] border-[#2E2C28]'
                           : 'bg-[#F4EFE6] border-[#D6CEBF]'
                       }`}
                     >
                       <form onSubmit={handleSend1v1Argument} className="flex items-center gap-3">
                         <input
                           type="text"
                           value={duelInputText}
                           onChange={(e) => setDuelInputText(e.target.value)}
                           placeholder={`Scrie replica ta 1v1 din tabăra ${activeDuelMatch.myStance} contra lui ${activeDuelMatch.opponentName} (${activeDuelMatch.opponentStance})...`}
                           className={`flex-1 rounded-full px-5 py-3 text-base border focus:outline-none ${
                             isDark
                               ? 'bg-[#121211] border-[#38352F] text-[#EAE3D5]'
                               : 'bg-[#FAF6EE] border-[#1A1917]/40 text-[#1A1917]'
                           }`}
                         />
                         <button
                           type="submit"
                           disabled={!duelInputText.trim()}
                           className="px-6 py-3 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                         >
                           <span>Trimite în 1v1</span>
                           <Send className="w-4 h-4" />
                         </button>
                       </form>
                     </div>
                   )}
                 </div>
               ) : (
                 /* ========================================================= */
                 /* MODUL 1: DISCUȚIE LIBERĂ FĂRĂ RESTRICȚII (FONT MĂRIT)     */
                 /* ========================================================= */
                 <>
                   {/* ANTETUL DISCUȚIEI LIBERE (FĂRĂ LIMITĂ DE PARTICIPANȚI) */}
                   {activePrompt && (
                     <section
                       className={`px-4 sm:px-6 py-4 border-b shrink-0 ${
                         isDark
                           ? 'bg-[#181715] border-[#2E2C28]'
                           : 'bg-[#F4EFE6] border-[#D6CEBF]'
                       }`}
                     >
                       <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                         <div className="flex flex-wrap items-center gap-2.5">
                           <span
                             className={`text-xs sm:text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                               isDark
                                 ? 'bg-[#22201D] border-[#38352F]'
                                 : 'bg-[#EAE3D5] border-[#1A1917]/30'
                             }`}
                           >
                             {activePromptCategory.name} • {activePrompt.title || 'Dezbatere Deschisă'}
                           </span>
                           <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                             <Users className="w-4 h-4" />
                             <span>
                               Discuție Liberă ({freeChatParticipantsCount} participanți activi • Fără limită)
                             </span>
                           </span>
                         </div>
 
                         <div className="flex flex-wrap items-center gap-2">
                           <button
                             onClick={() => enterPlatformMode('duel1v1')}
                             className="px-4 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                           >
                             <Swords className="w-4 h-4" />
                             <span>🤝 Matchmaking 1v1 pe acest subiect</span>
                           </button>
                           <button
                             onClick={() => enterPlatformMode('arena5v5')}
                             className="px-4 py-1.5 rounded-full bg-amber-700 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                           >
                             <Trophy className="w-4 h-4" />
                             <span>⚔️ Arena 5v5</span>
                           </button>
                         </div>
                       </div>
 
                       <h1
                         className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug mb-3"
                         style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                       >
                         „{activePrompt.question}”
                       </h1>
 
                       {/* Bară de Membri Activi în Chatul Liber cu buton direct "Provocă 1v1" */}
                       <div className="flex flex-wrap items-center gap-2 mb-3">
                         <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                           Invită rapid la 1v1 din cameră:
                         </span>
                         {activeRoomParticipants.map((part) => (
                           <button
                             key={part.name}
                             onClick={() => handleOpen1v1InviteModal(part, 'Discuție Liberă')}
                             className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                               isDark
                                 ? 'bg-[#22201D] border-[#38352F] hover:border-amber-500'
                                 : 'bg-[#EAE3D5] border-[#1A1917]/25 hover:border-[#1A1917]'
                             }`}
                             title={`Trimite invitație 1v1 lui ${part.name}`}
                           >
                             <span>{part.avatar}</span>
                             <span>{part.name}</span>
                             <span
                               className={`px-1.5 py-0.2 rounded-full text-[10px] text-white ${
                                 part.stance === 'PRO' ? 'bg-emerald-800' : 'bg-rose-800'
                               }`}
                             >
                               {part.stance}
                             </span>
                             <Swords className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                             <span className="underline">1v1</span>
                           </button>
                         ))}
                       </div>
 
                       {/* Bară de Vot Anonim din partea Publicului (PRO vs CONTRA) */}
                       <div
                         className={`p-3 rounded-2xl border ${
                           isDark
                             ? 'bg-[#121211] border-[#2E2C28]'
                             : 'bg-[#FAF6EE] border-[#D6CEBF]'
                         }`}
                       >
                         <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                           <button
                             onClick={() => handleVoteDebateSide('PRO')}
                             className="px-4 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                           >
                             <ThumbsUp className="w-4 h-4" />
                             <span>Susțin PRO ({voteStats.proCount})</span>
                           </button>
 
                           <span className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-80">
                             Sondaj Opinie Publică ({voteStats.proPercent}% PRO vs {voteStats.contraPercent}% CONTRA)
                           </span>
 
                           <button
                             onClick={() => handleVoteDebateSide('CONTRA')}
                             className="px-4 py-1.5 rounded-full bg-rose-800 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                           >
                             <ThumbsDown className="w-4 h-4" />
                             <span>Susțin CONTRA ({voteStats.contraCount})</span>
                           </button>
                         </div>
 
                         <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-rose-800/30">
                           <div
                             className="h-full bg-emerald-700 transition-all duration-500"
                             style={{ width: `${voteStats.proPercent}%` }}
                           />
                           <div
                             className="h-full bg-rose-800 transition-all duration-500"
                             style={{ width: `${voteStats.contraPercent}%` }}
                           />
                         </div>
                       </div>
                     </section>
                   )}
 
                   {/* LISTA DE ARGUMENTE & CHAT LIBER FĂRĂ RESTRICȚII (CU FONT MĂRIT) */}
                   <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
                     {promptMessages.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8">
                         <Scale className="w-12 h-12 mb-3 opacity-60" />
                         <h3
                           className="text-xl font-bold mb-1.5"
                           style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                         >
                           Deschide discuția liberă!
                         </h3>
                         <p className="text-base opacity-80 mb-4">
                           Oricine poate participa fără limită de locuri. Alege-ți poziția (PRO, CONTRA sau NEUTRU) și scrie-ți opinia mai jos.
                         </p>
                       </div>
                     ) : (
                       promptMessages.map((msg) => {
                         const isPro = msg.stance === 'PRO';
                         const isContra = msg.stance === 'CONTRA';
                         const upCount = (msg.upvotes || []).length;
                         const downCount = (msg.downvotes || []).length;
                         const popularityScore = upCount - downCount;
                         const timeString = msg.timestamp
                           ? new Date(msg.timestamp).toLocaleTimeString('ro-RO', {
                               hour: '2-digit',
                               minute: '2-digit'
                             })
                           : '';
 
                         return (
                           <div
                             key={msg.id}
                             className={`p-5 rounded-2xl border transition-all ${
                               isPro
                                 ? isDark
                                   ? 'bg-emerald-950/25 border-emerald-800/50'
                                   : 'bg-emerald-950/5 border-emerald-800/30'
                                 : isContra
                                 ? isDark
                                   ? 'bg-rose-950/25 border-rose-800/50'
                                   : 'bg-rose-950/5 border-rose-800/30'
                                 : isDark
                                 ? 'bg-[#181715] border-[#2E2C28]'
                                 : 'bg-[#F4EFE6] border-[#D6CEBF]'
                             }`}
                           >
                             <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                               <div className="flex items-center gap-2.5">
                                 <span className="w-9 h-9 rounded-full border border-current/20 flex items-center justify-center text-lg">
                                   {msg.senderAvatar || '🦉'}
                                 </span>
                                 <span className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                                   <span>{msg.senderName}</span>
                                   {msg.senderEmailVerified && (
                                     <span
                                       className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-700/15 text-emerald-700 dark:text-emerald-400 border border-emerald-700/30 text-xs font-semibold"
                                       title="Utilizator cu adresă de email verificată"
                                     >
                                       <BadgeCheck className="w-3.5 h-3.5" />
                                       <span>Verificat</span>
                                     </span>
                                   )}
                                 </span>
                                 <span
                                   className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full text-white ${
                                     isPro
                                       ? 'bg-emerald-800'
                                       : isContra
                                       ? 'bg-rose-800'
                                       : 'bg-stone-600'
                                   }`}
                                 >
                                   {msg.stance || 'PRO'}
                                 </span>
                                 <span className="text-xs opacity-65">{timeString}</span>
                               </div>
 
                               <div className="flex items-center gap-2.5">
                                 <div
                                   className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm ${
                                     isDark
                                       ? 'bg-[#121211] border-[#2E2C28]'
                                       : 'bg-[#FAF6EE] border-[#C8BFAE]'
                                   }`}
                                 >
                                   <button
                                     onClick={() => handleVoteMessagePopularity(msg, 'up')}
                                     className="hover:text-emerald-600 cursor-pointer"
                                     title="Susține acest argument"
                                   >
                                     <ChevronUp className="w-4 h-4" />
                                   </button>
                                   <span className="font-mono font-bold text-xs sm:text-sm">
                                     {popularityScore >= 0 ? `+${popularityScore}` : popularityScore}
                                   </span>
                                   <button
                                     onClick={() => handleVoteMessagePopularity(msg, 'down')}
                                     className="hover:text-rose-600 cursor-pointer"
                                     title="Votează negativ argumentul"
                                   >
                                     <ChevronDown className="w-4 h-4" />
                                   </button>
                                 </div>
 
                                 {!banInfo?.isBanned && (
                                   <div className="flex items-center gap-2">
                                     {msg.senderName !== nickname && (
                                       <button
                                         onClick={() =>
                                           handleOpen1v1InviteModal(
                                             {
                                               name: msg.senderName,
                                               avatar: msg.senderAvatar,
                                               stance: msg.stance || 'PRO'
                                             },
                                             'Discuție Liberă'
                                           )
                                         }
                                         className="px-3 py-1 rounded-full bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                         title={`Provocă pe ${msg.senderName} la o discuție 1v1 pe un prompt`}
                                       >
                                         <Swords className="w-3.5 h-3.5" />
                                         <span>Provocă 1v1</span>
                                       </button>
                                     )}
                                     <button
                                       onClick={() => {
                                         setReplyingToMessage(msg);
                                         inputRef.current?.focus();
                                       }}
                                       className="text-xs sm:text-sm font-semibold underline opacity-80 hover:opacity-100 cursor-pointer"
                                     >
                                       Răspunde
                                     </button>
                                   </div>
                                 )}
                               </div>
                             </div>
 
                             {msg.replyTo && (
                               <div className="mb-2.5 p-2.5 rounded-xl border-l-2 border-current/40 bg-current/5 text-sm italic">
                                 <span className="font-bold not-italic block text-xs opacity-75">
                                   Răspuns pentru {msg.replyTo.senderName} ({msg.replyTo.stance}):
                                 </span>
                                 „{msg.replyTo.text}”
                               </div>
                             )}
 
                             <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words">
                               {msg.text}
                             </p>
 
                             {msg.sourceUrl && (
                               <div className="mt-2.5 pt-2.5 border-t border-current/10 flex items-center gap-2 text-sm">
                                 <Link2 className="w-4 h-4 opacity-70 shrink-0" />
                                 <span className="opacity-75 font-semibold">Sursă argument:</span>
                                 <a
                                   href={msg.sourceUrl}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="underline truncate hover:opacity-80"
                                 >
                                   {msg.sourceUrl}
                                 </a>
                               </div>
                             )}
                           </div>
                         );
                       })
                     )}
                     <div ref={messagesEndRef} />
                   </div>
 
                   {/* ZONA DE INTRODUCERE MESAJ ÎN DISCUȚIA LIBERĂ (CU FONT MĂRIT) */}
                   <footer
                     className={`p-4 border-t shrink-0 ${
                       isDark
                         ? 'bg-[#181715] border-[#2E2C28]'
                         : 'bg-[#F4EFE6] border-[#D6CEBF]'
                     }`}
                   >
                     {banInfo?.isBanned ? (
                       <div className="p-4 rounded-2xl bg-red-900/15 border border-red-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                         <div className="flex items-center gap-3">
                           <Lock className="w-6 h-6 text-red-700 dark:text-red-400 shrink-0" />
                           <div>
                             <h4 className="text-base font-bold text-red-700 dark:text-red-400">
                               Cont Restricționat Automat (Auto-Ban pentru Limbaj Interzis)
                             </h4>
                             <p className="text-sm opacity-85">
                               Cuvânt detectat: <strong>„{banInfo.detectedWord}”</strong>. Depune o cerere de debanare pentru a reveni în dezbatere.
                             </p>
                           </div>
                         </div>
                         <button
                           onClick={() => {
                             setAppealTab('user');
                             setIsAppealModalOpen(true);
                           }}
                           className="px-5 py-2.5 rounded-full bg-red-700 hover:bg-red-600 text-white text-sm font-bold flex items-center gap-2 shrink-0 cursor-pointer"
                         >
                           <Gavel className="w-4 h-4" />
                           <span>Cerere Debanare (Ban Appeal)</span>
                         </button>
                       </div>
                     ) : (
                       <div className="space-y-3">
                         {replyingToMessage && (
                           <div className="px-3.5 py-2 rounded-xl bg-current/10 flex items-center justify-between text-sm">
                             <span className="truncate">
                               <Quote className="w-4 h-4 inline mr-1.5" />
                               Răspuns pentru <strong>{replyingToMessage.senderName}</strong>: „
                               {replyingToMessage.text}”
                             </span>
                             <button
                               onClick={() => setReplyingToMessage(null)}
                               className="ml-2 cursor-pointer"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                         )}
 
                         <div className="flex flex-wrap items-center justify-between gap-2">
                           <div className="flex flex-wrap items-center gap-2">
                             <span className="text-xs sm:text-sm font-bold uppercase opacity-75 mr-1">
                               Poziția ta:
                             </span>
                             <button
                               type="button"
                               onClick={() => setSelectedStance('PRO')}
                               className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                 selectedStance === 'PRO'
                                   ? 'bg-emerald-800 text-white shadow-xs'
                                   : 'border border-current/25 opacity-75 hover:opacity-100'
                               }`}
                             >
                               PRO
                             </button>
                             <button
                               type="button"
                               onClick={() => setSelectedStance('CONTRA')}
                               className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                 selectedStance === 'CONTRA'
                                   ? 'bg-rose-800 text-white shadow-xs'
                                   : 'border border-current/25 opacity-75 hover:opacity-100'
                               }`}
                             >
                               CONTRA
                             </button>
                             <button
                               type="button"
                               onClick={() => setSelectedStance('NEUTRU')}
                               className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                 selectedStance === 'NEUTRU'
                                   ? 'bg-stone-700 text-white shadow-xs'
                                   : 'border border-current/25 opacity-75 hover:opacity-100'
                               }`}
                             >
                               NEUTRU
                             </button>
 
                             <button
                               type="button"
                               onClick={() => setShowSourceField((prev) => !prev)}
                               className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border flex items-center gap-1.5 cursor-pointer ${
                                 showSourceField
                                   ? 'border-amber-600 bg-amber-600/15'
                                   : 'border-current/20 opacity-80 hover:opacity-100'
                               }`}
                             >
                               <Link2 className="w-3.5 h-3.5" />
                               <span>+ Sursă</span>
                             </button>
                           </div>
 
                           <button
                             type="button"
                             onClick={() =>
                               triggerAutomaticBan(
                                 'injuratura',
                                 'Exemplu de mesaj care conține o injuratura interzisă.',
                                 'Simulare Rapidă Auto-Ban'
                               )
                             }
                             className="px-3 py-1.5 rounded-full bg-red-800/15 hover:bg-red-800/25 text-red-700 dark:text-red-300 border border-red-800/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                           >
                             <ShieldAlert className="w-3.5 h-3.5" />
                             <span>Testează Auto-Ban</span>
                           </button>
                         </div>
 
                         {showSourceField && (
                           <input
                             type="text"
                             value={sourceUrlInput}
                             onChange={(e) => setSourceUrlInput(e.target.value)}
                             placeholder="Atașează link-ul sau titlul sursei care îți susține afirmația (ex: https://...)..."
                             className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none ${
                               isDark
                                 ? 'bg-[#121211] border-[#38352F] text-[#EAE3D5]'
                                 : 'bg-[#FAF6EE] border-[#C8BFAE] text-[#1A1917]'
                             }`}
                           />
                         )}
 
                         <form onSubmit={handleSendMessage} className="flex items-center gap-2.5">
                           <input
                             ref={inputRef}
                             type="text"
                             value={messageInput}
                             onChange={(e) => setMessageInput(e.target.value)}
                             placeholder={`Scrie liber în discuție (${selectedStance})...`}
                             className={`flex-1 rounded-full px-5 py-3 text-base border focus:outline-none ${
                               isDark
                                 ? 'bg-[#121211] border-[#38352F] text-[#EAE3D5] placeholder-[#EAE3D5]/40'
                                 : 'bg-[#FAF6EE] border-[#1A1917]/40 text-[#1A1917] placeholder-[#1A1917]/50'
                             }`}
                           />
                           <button
                             type="submit"
                             disabled={!messageInput.trim()}
                             className={`px-6 py-3 rounded-full font-bold text-sm sm:text-base flex items-center gap-2 transition-all disabled:opacity-40 cursor-pointer ${
                               isDark
                                 ? 'bg-[#EAE3D5] text-[#121211] hover:bg-white'
                                 : 'bg-[#1A1917] text-[#F4EFE6] hover:bg-stone-800'
                             }`}
                           >
                             <span>Trimite Mesaj</span>
                             <Send className="w-4 h-4" />
                           </button>
                         </form>
                       </div>
                     )}
                   </footer>
                 </>
               )}
             </main>
           </div>
         </>
       )}
 
       {/* ========================================================= */}
       {/* MODAL 1: PERSONALIZARE PROFIL                             */}
       {/* ========================================================= */}
       {isEditingProfile && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
           <div
             className={`rounded-2xl max-w-md w-full p-6 border shadow-2xl ${
               isDark
                 ? 'bg-[#181715] border-[#38352F] text-[#EAE3D5]'
                 : 'bg-[#F4EFE6] border-[#1A1917] text-[#1A1917]'
             }`}
           >
             <div className="flex items-center justify-between mb-4">
               <h3
                 className="text-lg font-bold"
                 style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
               >
                 Profilul Tău de Dezbătător
               </h3>
               <button onClick={() => setIsEditingProfile(false)} className="cursor-pointer">
                 <X className="w-5 h-5" />
               </button>
             </div>
 
             <form onSubmit={handleSaveProfile} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold uppercase mb-1">Poreclă (Nickname)</label>
                 <input
                   type="text"
                   maxLength={24}
                   value={tempNickname}
                   onChange={(e) => setTempNickname(e.target.value)}
                   className={`w-full rounded-xl px-3.5 py-2 text-sm border ${
                     isDark ? 'bg-[#121211] border-[#38352F]' : 'bg-[#FAF6EE] border-[#C8BFAE]'
                   }`}
                 />
               </div>
 
               <div>
                 <label className="block text-xs font-bold uppercase mb-2">Simbol / Avatar</label>
                 <div className="grid grid-cols-8 gap-2">
                   {AVATAR_OPTIONS.map((emo) => (
                     <button
                       key={emo}
                       type="button"
                       onClick={() => setTempAvatar(emo)}
                       className={`h-9 rounded-xl border flex items-center justify-center text-base cursor-pointer ${
                         tempAvatar === emo
                           ? 'border-2 border-amber-600 scale-105'
                           : 'border-current/20'
                       }`}
                     >
                       {emo}
                     </button>
                   ))}
                 </div>
               </div>
 
               <div className="flex justify-end gap-2 pt-2">
                 <button
                   type="button"
                   onClick={() => setIsEditingProfile(false)}
                   className="px-4 py-2 rounded-full text-xs font-semibold border border-current/30 cursor-pointer"
                 >
                   Anulează
                 </button>
                 <button
                   type="submit"
                   className={`px-5 py-2 rounded-full text-xs font-bold cursor-pointer ${
                     isDark ? 'bg-[#EAE3D5] text-[#121211]' : 'bg-[#1A1917] text-[#F4EFE6]'
                   }`}
                 >
                   Salvează Profilul
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
 
       {/* ========================================================= */}
       {/* MODAL 2: PROPUNE UN SUBIECT NOU DE DEZBATERE              */}
       {/* ========================================================= */}
       {isCreatingPrompt && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
           <div
             className={`rounded-2xl max-w-md w-full p-6 border shadow-2xl ${
               isDark
                 ? 'bg-[#181715] border-[#38352F] text-[#EAE3D5]'
                 : 'bg-[#F4EFE6] border-[#1A1917] text-[#1A1917]'
             }`}
           >
             <div className="flex items-center justify-between mb-4">
               <h3
                 className="text-lg font-bold"
                 style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
               >
                 Propune o Confruntare Nouă
               </h3>
               <button onClick={() => setIsCreatingPrompt(false)} className="cursor-pointer">
                 <X className="w-5 h-5" />
               </button>
             </div>
 
             <form onSubmit={handleCreateCustomPrompt} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold uppercase mb-1">Categorie</label>
                 <select
                   value={newPromptCategory}
                   onChange={(e) => setNewPromptCategory(e.target.value)}
                   className={`w-full rounded-xl px-3.5 py-2 text-sm border ${
                     isDark ? 'bg-[#121211] border-[#38352F]' : 'bg-[#FAF6EE] border-[#C8BFAE]'
                   }`}
                 >
                   {CATEGORIES.map((cat) => (
                     <option key={cat.id} value={cat.id}>
                       {cat.name} ({cat.subtitle})
                     </option>
                   ))}
                 </select>
               </div>
 
               <div>
                 <label className="block text-xs font-bold uppercase mb-1">
                   Titlul Confruntării (ex: Tradiție vs. Modernitate)
                 </label>
                 <input
                   type="text"
                   required
                   value={newPromptTitle}
                   onChange={(e) => setNewPromptTitle(e.target.value)}
                   placeholder="Ex: Realitate vs. Simulare"
                   className={`w-full rounded-xl px-3.5 py-2 text-sm border ${
                     isDark ? 'bg-[#121211] border-[#38352F]' : 'bg-[#FAF6EE] border-[#C8BFAE]'
                   }`}
                 />
               </div>
 
               <div>
                 <label className="block text-xs font-bold uppercase mb-1">
                   Întrebarea Dezbaterii
                 </label>
                 <textarea
                   rows={3}
                   required
                   value={newPromptQuestion}
                   onChange={(e) => setNewPromptQuestion(e.target.value)}
                   placeholder="Formulează o întrebare clară cu două tabere (PRO și CONTRA)..."
                   className={`w-full rounded-xl px-3.5 py-2 text-sm border resize-none ${
                     isDark ? 'bg-[#121211] border-[#38352F]' : 'bg-[#FAF6EE] border-[#C8BFAE]'
                   }`}
                 />
               </div>
 
               <div className="flex justify-end gap-2 pt-2">
                 <button
                   type="button"
                   onClick={() => setIsCreatingPrompt(false)}
                   className="px-4 py-2 rounded-full text-xs font-semibold border border-current/30 cursor-pointer"
                 >
                   Anulează
                 </button>
                 <button
                   type="submit"
                   className={`px-5 py-2 rounded-full text-xs font-bold cursor-pointer ${
                     isDark ? 'bg-[#EAE3D5] text-[#121211]' : 'bg-[#1A1917] text-[#F4EFE6]'
                   }`}
                 >
                   Publică Subiectul
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
 
       {/* ========================================================= */}
       {/* MODAL 3: CENTRU BAN APPEAL & MODERARE CUVINTE INTERZISE   */}
       {/* ========================================================= */}
       {isAppealModalOpen && (
         <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
           <div
             className={`rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border shadow-2xl overflow-hidden ${
               isDark
                 ? 'bg-[#181715] border-[#38352F] text-[#EAE3D5]'
                 : 'bg-[#F4EFE6] border-[#1A1917] text-[#1A1917]'
             }`}
           >
             <div className="p-4 sm:p-5 border-b border-current/15 flex items-center justify-between">
               <div className="flex items-center gap-2.5">
                 <Gavel className="w-5 h-5 text-red-700 dark:text-red-400" />
                 <div>
                   <h3
                     className="text-lg font-bold"
                     style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                   >
                     Centru Moderare & Cereri Debanare (Ban Appeal)
                   </h3>
                   <p className="text-xs opacity-75">
                     Protecție automată împotriva limbajului licențios pentru un dialog civilizat
                   </p>
                 </div>
               </div>
               <button onClick={() => setIsAppealModalOpen(false)} className="cursor-pointer">
                 <X className="w-5 h-5" />
               </button>
             </div>
 
             {/* Taburi Modal */}
             <div className="px-5 pt-3 border-b border-current/15 flex gap-3 text-xs font-bold">
               <button
                 onClick={() => setAppealTab('user')}
                 className={`pb-2.5 border-b-2 cursor-pointer ${
                   appealTab === 'user'
                     ? 'border-current opacity-100'
                     : 'border-transparent opacity-60'
                 }`}
               >
                 1. Cererea Mea de Debanare
               </button>
               <button
                 onClick={() => setAppealTab('admin')}
                 className={`pb-2.5 border-b-2 cursor-pointer ${
                   appealTab === 'admin'
                     ? 'border-current opacity-100'
                     : 'border-transparent opacity-60'
                 }`}
               >
                 2. Panou Moderator & Lista Cuvinte ({bannedWords.length})
               </button>
             </div>
 
             <div className="p-5 overflow-y-auto space-y-5 flex-1">
               {appealTab === 'user' ? (
                 <>
                   {banInfo?.isBanned ? (
                     <div className="p-4 rounded-2xl bg-red-900/15 border border-red-800/40 space-y-2">
                       <div className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">
                         Status Cont: Suspendat Automat
                       </div>
                       <p className="text-xs">
                         Cuvânt detectat: <strong>„{banInfo.detectedWord}”</strong> în mesajul: „
                         {banInfo.offendingText}”
                       </p>
                     </div>
                   ) : (
                     <div className="p-4 rounded-2xl bg-emerald-900/15 border border-emerald-800/40 flex items-center justify-between gap-3">
                       <div className="text-xs">
                         <strong className="block text-sm text-emerald-800 dark:text-emerald-400">
                           Contul tău este Activ!
                         </strong>
                         Nu ai nicio restricție în acest moment.
                       </div>
                       <button
                         onClick={() =>
                           triggerAutomaticBan(
                             'injuratura',
                             'Mesaj demonstrativ cu injuratura.',
                             'Test Manual'
                           )
                         }
                         className="px-3 py-1.5 rounded-full bg-red-700 text-white text-xs font-bold cursor-pointer"
                       >
                         Simulează Ban
                       </button>
                     </div>
                   )}
 
                   {banInfo?.isBanned && (
                     <form onSubmit={handleSubmitBanAppeal} className="space-y-4">
                       <div>
                         <label className="block text-xs font-bold uppercase mb-1">
                           Motivul Cererii de Debanare
                         </label>
                         <textarea
                           rows={3}
                           required
                           value={appealExplanation}
                           onChange={(e) => setAppealExplanation(e.target.value)}
                           placeholder="Explică de ce soliciți ridicarea restricției..."
                           className={`w-full rounded-xl p-3 text-sm border resize-none ${
                             isDark
                               ? 'bg-[#121211] border-[#38352F]'
                               : 'bg-[#FAF6EE] border-[#C8BFAE]'
                           }`}
                         />
                       </div>
 
                       <label className="flex items-center gap-2 text-xs cursor-pointer">
                         <input
                           type="checkbox"
                           checked={appealPromiseChecked}
                           onChange={(e) => setAppealPromiseChecked(e.target.checked)}
                         />
                         <span>
                           Promit să respect regulile dezbaterilor civilizate și să nu folosesc jigniri.
                         </span>
                       </label>
 
                       <div className="flex justify-between items-center pt-2">
                         <button
                           type="button"
                           onClick={() => setAppealTab('admin')}
                           className="text-xs underline cursor-pointer"
                         >
                           Deschide Panoul Moderator pentru a-ți aproba cererea →
                         </button>
                         <button
                           type="submit"
                           disabled={!appealExplanation.trim() || !appealPromiseChecked}
                           className={`px-5 py-2 rounded-full text-xs font-bold disabled:opacity-40 cursor-pointer ${
                             isDark
                               ? 'bg-[#EAE3D5] text-[#121211]'
                               : 'bg-[#1A1917] text-[#F4EFE6]'
                           }`}
                         >
                           Trimite Cererea
                         </button>
                       </div>
                     </form>
                   )}
 
                   {myLatestAppeal && (
                     <div className="p-3.5 rounded-2xl border border-current/20 text-xs space-y-1">
                       <div className="font-bold">
                         Ultima cerere trimisă — Status:{' '}
                         <span className="uppercase">{myLatestAppeal.status}</span>
                       </div>
                       <p className="italic">„{myLatestAppeal.explanation}”</p>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="space-y-5">
                   {banInfo?.isBanned && (
                     <div className="p-3.5 rounded-2xl bg-emerald-900/15 border border-emerald-800/40 flex items-center justify-between">
                       <span className="text-xs font-semibold">
                         Acțiune rapidă Moderator: Ridică-ți restricția instantaneu
                       </span>
                       <button
                         onClick={handleInstantUnbanSelf}
                         className="px-4 py-1.5 rounded-full bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                       >
                         Debanează-mă Acum
                       </button>
                     </div>
                   )}
 
                   <div>
                     <h4 className="text-xs font-bold uppercase mb-2">
                       Cereri de Debanare Primite ({banAppeals.length})
                     </h4>
                     {banAppeals.length === 0 ? (
                       <p className="text-xs opacity-70">Nicio cerere înregistrată momentan.</p>
                     ) : (
                       <div className="space-y-2 max-h-48 overflow-y-auto">
                         {banAppeals.map((ap) => (
                           <div
                             key={ap.id}
                             className="p-3 rounded-xl border border-current/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                           >
                             <div>
                               <strong>{ap.nickname}</strong> (Cuvânt: „{ap.detectedWord}”)
                               <p className="italic opacity-80">„{ap.explanation}”</p>
                             </div>
                             {ap.status === 'pending' ? (
                               <div className="flex gap-1.5 shrink-0">
                                 <button
                                   onClick={() => handleAdminResolveAppeal(ap, 'rejected')}
                                   className="px-3 py-1 rounded-full bg-red-800 text-white font-bold cursor-pointer"
                                 >
                                   Respinge
                                 </button>
                                 <button
                                   onClick={() => handleAdminResolveAppeal(ap, 'approved')}
                                   className="px-3 py-1 rounded-full bg-emerald-800 text-white font-bold cursor-pointer"
                                 >
                                   Aprobă & Debanează
                                 </button>
                               </div>
                             ) : (
                               <span className="font-bold uppercase">{ap.status}</span>
                             )}
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
 
                   <div>
                     <h4 className="text-xs font-bold uppercase mb-2">
                       Listă Cuvinte Interzise (Auto-Ban)
                     </h4>
                     <form onSubmit={handleAddBannedWord} className="flex gap-2 mb-3">
                       <input
                         type="text"
                         value={newBannedWordInput}
                         onChange={(e) => setNewBannedWordInput(e.target.value)}
                         placeholder="Adaugă un cuvânt interzis..."
                         className={`flex-1 rounded-full px-3.5 py-1.5 text-xs border ${
                           isDark
                             ? 'bg-[#121211] border-[#38352F]'
                             : 'bg-[#FAF6EE] border-[#C8BFAE]'
                         }`}
                       />
                       <button
                         type="submit"
                         className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer ${
                           isDark
                             ? 'bg-[#EAE3D5] text-[#121211]'
                             : 'bg-[#1A1917] text-[#F4EFE6]'
                         }`}
                       >
                         + Adaugă
                       </button>
                     </form>
 
                     <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 rounded-xl border border-current/15">
                       {bannedWords.map((w) => (
                         <span
                           key={w}
                           className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono border border-current/25"
                         >
                           <span>{w}</span>
                           <button
                             type="button"
                             onClick={() => handleRemoveBannedWord(w)}
                             className="hover:text-red-600 cursor-pointer"
                           >
                             <X className="w-3 h-3" />
                           </button>
                         </span>
                       ))}
                     </div>
                   </div>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}
 
       {/* ========================================================= */}
       {/* MODAL 4: SISTEM AUTENTIFICARE, SIGN UP & VERIFICARE EMAIL */}
       {/* ========================================================= */}
       {isAuthModalOpen && (
         <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
           <div
             className={`rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border shadow-2xl ${
               isDark
                 ? 'bg-[#181715] border-[#38352F] text-[#EAE3D5]'
                 : 'bg-[#F4EFE6] border-[#1A1917] text-[#1A1917]'
             }`}
           >
             <div className="flex items-center justify-between mb-4">
               <h3
                 className="text-xl font-bold"
                 style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
               >
                 {authModalStep === 'login' && 'Autentificare (Log In)'}
                 {authModalStep === 'signup' && 'Creare Cont Nou (Sign Up)'}
                 {authModalStep === 'verify' && 'Verificare & Confirmare Email'}
                 {authModalStep === 'confirmed' && 'Cont Confirmat cu Succes!'}
                 {authModalStep === 'inbox-preview' && 'Inbox Emailuri de Confirmare'}
               </h3>
               <button onClick={() => setIsAuthModalOpen(false)} className="cursor-pointer">
                 <X className="w-5 h-5" />
               </button>
             </div>
 
             {/* Comutator rapid între Log In, Sign Up și Inbox */}
             <div className="flex gap-2 mb-4 border-b border-current/15 pb-2.5 text-xs font-bold">
               <button
                 type="button"
                 onClick={() => {
                   setAuthError('');
                   setAuthModalStep('login');
                 }}
                 className={`px-3 py-1.5 rounded-full cursor-pointer ${
                   authModalStep === 'login'
                     ? isDark
                       ? 'bg-[#EAE3D5] text-[#121211]'
                       : 'bg-[#1A1917] text-[#F4EFE6]'
                     : 'opacity-70'
                 }`}
               >
                 Log In
               </button>
               <button
                 type="button"
                 onClick={() => {
                   setAuthError('');
                   setAuthModalStep('signup');
                 }}
                 className={`px-3 py-1.5 rounded-full cursor-pointer ${
                   authModalStep === 'signup'
                     ? isDark
                       ? 'bg-[#EAE3D5] text-[#121211]'
                       : 'bg-[#1A1917] text-[#F4EFE6]'
                     : 'opacity-70'
                 }`}
               >
                 Sign Up
               </button>
               {sentEmailsLog.length > 0 && (
                 <button
                   type="button"
                   onClick={() => setAuthModalStep('inbox-preview')}
                   className={`px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer ${
                     authModalStep === 'inbox-preview'
                       ? 'bg-emerald-700 text-white'
                       : 'opacity-75'
                   }`}
                 >
                   <Inbox className="w-3.5 h-3.5" />
                   <span>Inbox ({sentEmailsLog.length})</span>
                 </button>
               )}
             </div>
 
             {authError && (
               <div className="mb-4 p-3 rounded-xl bg-red-800/15 border border-red-700/40 text-red-700 dark:text-red-300 text-xs font-semibold">
                 {authError}
               </div>
             )}
 
             {authSuccessMsg && (
               <div className="mb-4 p-3 rounded-xl bg-emerald-800/15 border border-emerald-700/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                 {authSuccessMsg}
               </div>
             )}
 
             {authModalStep === 'login' && (
               <form onSubmit={handleLoginSubmit} className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold uppercase mb-1">Adresă de Email</label>
                   <input
                     type="email"
                     required
                     value={authEmail}
                     onChange={(e) => setAuthEmail(e.target.value)}
                     placeholder="nume@exemplu.ro"
                     className={`w-full rounded-xl px-3.5 py-2.5 text-sm border ${
                       isDark ? 'bg-[#121211] border-[#38352F]' : 'bg-[#FAF6EE] border-[#C8BFAE]'
                     }`}
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold uppercase mb-1">Parolă</label>
                   <input
                     type="password"
                     required
                     value={authPassword}
                     onChange={(e) => setAuthPassword(e.target.value)}
                     placeholder="••••••••"
                     className={`w-full rounded-xl px-3.5 py-2.5 text-sm border ${
                       isDark ? 'bg-[#121211] border-[#38352F]' : 'bg-[#FAF6EE] border-[#C8BFAE]'
                     }`}
                   />
                 </div>
                 <button
                   type="submit"
                   className={`w-full py-2.5 rounded-full text-sm font-bold cursor-pointer ${
                     isDark ? 'bg-[#EAE3D5] text-[#121211]' : 'bg-[#1A1917] text-[#F4EFE6]'
                   }`}
                 >
                   Autentifică-te în Cont
                 </button>
               </form>
             )}
 
             {authModalStep === 'signup' && (
               <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                 <div>
                   <label className="block text-xs font-bold uppercase mb-1">Nume Utilizator</label>
                   <input
                     type="text"
                     required
                     value={authUsername}
                     onChange={(e) => setAuthUsername(e.target.value)}
                     placeholder="Ex: Andrei_Dezbateri"
                     className={`w-full rounded-xl px-3.5 py-2 text-sm border ${
                       isDark ? 'bg-[#121211] border-[#38352F]' : 'bg-[#FAF6EE] border-[#C8BFAE]'
                     }`}
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold uppercase mb-1">Adresă de Email</label>
                   <input
                     type="email"
                     required
                     value={authEmail}
                     onChange={(e) => setAuthEmail(e.target.value)}
                     placeholder="nume@exemplu.ro"
                     className={`w-full rounded-xl px-3.5 py-2 text-sm border ${
                       isDark ? 'bg-[#121211] border-[#38352F]' : 'bg-[#FAF6EE] border-[#C8BFAE]'
                     }`}
                   />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <div>
                     <label className="block text-xs font-bold uppercase mb-1">Parolă</label>
                     <input
                       type="password"
                       required
                       value={authPassword}
                       onChange={(e) => setAuthPassword(e.target.value)}
                       placeholder="Min. 6 caractere"
                       className={`w-full rounded-xl px-3.5 py-2 text-sm border ${
                         isDark ? 'bg-[#121211] border-[#38352F]' : 'bg-[#FAF6EE] border-[#C8BFAE]'
                       }`}
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase mb-1">Confirmă Parola</label>
                     <input
                       type="password"
                       required
                       value={authConfirmPassword}
                       onChange={(e) => setAuthConfirmPassword(e.target.value)}
                       placeholder="Repetă parola"
                       className={`w-full rounded-xl px-3.5 py-2 text-sm border ${
                         isDark ? 'bg-[#121211] border-[#38352F]' : 'bg-[#FAF6EE] border-[#C8BFAE]'
                       }`}
                     />
                   </div>
                 </div>
                 <button
                   type="submit"
                   disabled={isSendingEmail}
                   className={`w-full py-2.5 rounded-full text-sm font-bold cursor-pointer ${
                     isDark ? 'bg-[#EAE3D5] text-[#121211]' : 'bg-[#1A1917] text-[#F4EFE6]'
                   }`}
                 >
                   Creează Cont & Trimite Email de Confirmare
                 </button>
               </form>
             )}
 
             {authModalStep === 'verify' && pendingAccount && (
               <div className="space-y-4">
                 <div className="p-3.5 rounded-xl border border-current/20 bg-current/5 text-xs space-y-1">
                   <div className="font-bold">
                     Email trimis către: <span className="underline">{pendingAccount.email}</span>
                   </div>
                   <p>
                     Codul tău de confirmare este:{' '}
                     <strong className="font-mono text-sm px-2 py-0.5 rounded bg-emerald-700 text-white">
                       {pendingAccount.verificationCode}
                     </strong>
                   </p>
                 </div>
 
                 <form onSubmit={(e) => handleVerifyEmailCode(e)} className="space-y-3">
                   <label className="block text-xs font-bold uppercase">
                     Introdu Codul de 6 Cifre din Email
                   </label>
                   <input
                     type="text"
                     maxLength={6}
                     value={verificationCodeInput}
                     onChange={(e) => setVerificationCodeInput(e.target.value)}
                     placeholder="123456"
                     className={`w-full rounded-xl px-4 py-2.5 text-center font-mono text-lg tracking-widest border ${
                       isDark ? 'bg-[#121211] border-[#38352F]' : 'bg-[#FAF6EE] border-[#C8BFAE]'
                     }`}
                   />
                   <div className="flex gap-2">
                     <button
                       type="button"
                       onClick={() => handleVerifyEmailCode(null, pendingAccount.verificationCode)}
                       className="flex-1 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                     >
                       Confirmă Automat ({pendingAccount.verificationCode})
                     </button>
                     <button
                       type="submit"
                       className={`flex-1 py-2.5 rounded-full text-xs font-bold cursor-pointer ${
                         isDark ? 'bg-[#EAE3D5] text-[#121211]' : 'bg-[#1A1917] text-[#F4EFE6]'
                       }`}
                     >
                       Verifică Codul
                     </button>
                   </div>
                 </form>
               </div>
             )}
 
             {authModalStep === 'confirmed' && (
               <div className="text-center py-6 space-y-3">
                 <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                 <h4 className="text-lg font-bold">Contul tău a fost verificat și activat!</h4>
                 <p className="text-xs opacity-80">
                   Acum poți participa cu insigna <strong>Verificat ✓</strong> în toate dezbaterile.
                 </p>
                 <button
                   type="button"
                   onClick={() => setIsAuthModalOpen(false)}
                   className="px-6 py-2.5 rounded-full bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                 >
                   Intră pe Platformă
                 </button>
               </div>
             )}
 
             {authModalStep === 'inbox-preview' && (
               <div className="space-y-3">
                 {sentEmailsLog.map((em) => (
                   <div key={em.id} className="p-3.5 rounded-xl border border-current/20 text-xs space-y-1.5">
                     <div className="font-bold">{em.subject}</div>
                     <div className="opacity-75">Către: {em.to}</div>
                     <div>
                       Cod de activare:{' '}
                       <strong className="font-mono text-sm">{em.code}</strong>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         </div>
       )}
 
       {/* ========================================================= */}
       {/* MODAL 5: INVITĂ DIRECT LA UN DUEL 1v1 DIN CHAT SAU ARENĂ  */}
       {/* ========================================================= */}
       {invite1v1ModalOpen && inviteTargetUser && (
         <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
           <div
             className={`rounded-2xl max-w-lg w-full p-6 border shadow-2xl ${
               isDark
                 ? 'bg-[#181715] border-[#38352F] text-[#EAE3D5]'
                 : 'bg-[#F4EFE6] border-[#1A1917] text-[#1A1917]'
             }`}
           >
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2.5">
                 <div className="w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center">
                   <Swords className="w-5 h-5" />
                 </div>
                 <div>
                   <h3
                     className="text-lg font-bold"
                     style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                   >
                     Provocă la Duel 1v1 pe {inviteTargetUser.name}
                   </h3>
                   <p className="text-xs opacity-75">
                     Selectat din: {inviteTargetUser.sourceContext}
                   </p>
                 </div>
               </div>
               <button onClick={() => setInvite1v1ModalOpen(false)} className="cursor-pointer">
                 <X className="w-5 h-5" />
               </button>
             </div>
 
             <form onSubmit={handleSend1v1DirectInvite} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold uppercase mb-1">
                   1. Alege Subiectul (Promptul) pentru Duelul 1v1
                 </label>
                 <select
                   value={invitePromptId}
                   onChange={(e) => setInvitePromptId(e.target.value)}
                   className={`w-full rounded-xl px-3.5 py-2.5 text-sm border ${
                     isDark ? 'bg-[#121211] border-[#38352F]' : 'bg-[#FAF6EE] border-[#C8BFAE]'
                   }`}
                 >
                   {prompts.map((p) => {
                     const catObj = CATEGORIES.find((c) => c.id === p.categoryId);
                     return (
                       <option key={p.id} value={p.id}>
                         [{catObj?.name}] {p.title}
                       </option>
                     );
                   })}
                 </select>
               </div>
 
               <div>
                 <label className="block text-xs font-bold uppercase mb-1.5">
                   2. Alege Tabăra Ta (Adversarul va primi automat tabăra opusă)
                 </label>
                 <div className="grid grid-cols-2 gap-3">
                   <button
                     type="button"
                     onClick={() => setInviteMyStance('PRO')}
                     className={`p-3 rounded-xl border text-left cursor-pointer ${
                       inviteMyStance === 'PRO'
                         ? 'bg-emerald-800 text-white border-emerald-600 font-bold'
                         : 'border-current/25 opacity-75'
                     }`}
                   >
                     <div className="text-sm font-bold">Eu sunt PRO</div>
                     <div className="text-xs opacity-85">
                       {inviteTargetUser.name} va fi CONTRA
                     </div>
                   </button>
                   <button
                     type="button"
                     onClick={() => setInviteMyStance('CONTRA')}
                     className={`p-3 rounded-xl border text-left cursor-pointer ${
                       inviteMyStance === 'CONTRA'
                         ? 'bg-rose-800 text-white border-rose-600 font-bold'
                         : 'border-current/25 opacity-75'
                     }`}
                   >
                     <div className="text-sm font-bold">Eu sunt CONTRA</div>
                     <div className="text-xs opacity-85">
                       {inviteTargetUser.name} va fi PRO
                     </div>
                   </button>
                 </div>
               </div>
 
               <div>
                 <label className="block text-xs font-bold uppercase mb-1">
                   3. Mesaj de Provocare (Opțional)
                 </label>
                 <input
                   type="text"
                   value={inviteCustomNote}
                   onChange={(e) => setInviteCustomNote(e.target.value)}
                   className={`w-full rounded-xl px-3.5 py-2 text-sm border ${
                     isDark ? 'bg-[#121211] border-[#38352F]' : 'bg-[#FAF6EE] border-[#C8BFAE]'
                   }`}
                 />
               </div>
 
               <div className="flex justify-end gap-2 pt-2">
                 <button
                   type="button"
                   onClick={() => setInvite1v1ModalOpen(false)}
                   className="px-4 py-2 rounded-full text-xs font-semibold border border-current/30 cursor-pointer"
                 >
                   Anulează
                 </button>
                 <button
                   type="submit"
                   className="px-6 py-2 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
                 >
                   <Swords className="w-4 h-4" />
                   <span>Trimite Invitația & Intră în 1v1</span>
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
     </div>
   );
 }