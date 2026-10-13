export interface Membre {
  id: string;
  initials: string;
  nom: string;
  email: string;
  role: string;
  agency: string;
  statut: "Actif" | "Inactif";
  connexion: string;
  daysAgo: number;
  avatarBg: string;
}

export const MEMBRES: Membre[] = [
  { id: "1", initials: "NA", nom: "Nadia Assi", email: "nadia.assi@spark.ci", role: "Manager", agency: "Cocody + 2", statut: "Actif", connexion: "Aujourd'hui, 09:42", daysAgo: 0, avatarBg: "bg-amber-100 text-amber-700" },
  { id: "2", initials: "KM", nom: "Koffi Mensah", email: "koffi.mensah@spark.ci", role: "Caissier", agency: "Cocody", statut: "Actif", connexion: "Aujourd'hui, 08:01", daysAgo: 0, avatarBg: "bg-slate-200 text-slate-600" },
  { id: "3", initials: "AD", nom: "Aïcha Diomandé", email: "aicha.diomande@spark.ci", role: "Caissier", agency: "Plateau", statut: "Actif", connexion: "Hier, 16:34", daysAgo: 1, avatarBg: "bg-stone-200 text-stone-600" },
  { id: "4", initials: "SB", nom: "Serge Bamba", email: "serge.bamba@spark.ci", role: "Laveur", agency: "Atelier central", statut: "Actif", connexion: "Aujourd'hui, 07:14", daysAgo: 0, avatarBg: "bg-orange-100 text-orange-700" },
  { id: "5", initials: "FM", nom: "Fatoumata Mélé", email: "fatoumata.mele@spark.ci", role: "Classeur", agency: "Marcory", statut: "Inactif", connexion: "12 sept. 2026", daysAgo: 16, avatarBg: "bg-violet-100 text-violet-700" },
  { id: "6", initials: "AK", nom: "Awa Koné", email: "awa.kone@spark.ci", role: "Admin", agency: "Toutes les agences", statut: "Actif", connexion: "Aujourd'hui, 10:18", daysAgo: 0, avatarBg: "bg-amber-200 text-amber-800" },
  { id: "7", initials: "EB", nom: "Eric Boli", email: "eric.boli@spark.ci", role: "Manager", agency: "Cocody", statut: "Actif", connexion: "Aujourd'hui, 09:05", daysAgo: 0, avatarBg: "bg-sky-100 text-sky-700" },
  { id: "8", initials: "MT", nom: "Mariam Traoré", email: "mariam.traore@spark.ci", role: "Caissier", agency: "Plateau", statut: "Actif", connexion: "Hier, 17:52", daysAgo: 1, avatarBg: "bg-emerald-100 text-emerald-700" },
  { id: "9", initials: "YK", nom: "Yao Kouassi", email: "yao.kouassi@spark.ci", role: "Laveur", agency: "Bingerville", statut: "Actif", connexion: "Il y a 2 j", daysAgo: 2, avatarBg: "bg-orange-100 text-orange-700" },
  { id: "10", initials: "CB", nom: "Clarisse B.", email: "clarisse.b@spark.ci", role: "Caissier", agency: "Bingerville", statut: "Actif", connexion: "Aujourd'hui, 08:44", daysAgo: 0, avatarBg: "bg-sky-100 text-sky-700" },
  { id: "11", initials: "PY", nom: "Paul Yapi", email: "paul.yapi@spark.ci", role: "Laveur", agency: "Marcory", statut: "Inactif", connexion: "20 sept. 2026", daysAgo: 8, avatarBg: "bg-stone-200 text-stone-600" },
  { id: "12", initials: "OK", nom: "Odile Kassi", email: "odile.kassi@spark.ci", role: "Classeur", agency: "Bingerville", statut: "Actif", connexion: "Hier, 15:20", daysAgo: 1, avatarBg: "bg-emerald-100 text-emerald-700" },
];

export const ROLES = ["Admin", "Manager", "Caissier", "Laveur", "Classeur"];

export interface Invitation {
  id: string;
  email: string;
  role: string;
  expires: string;
}

export const INVITATIONS_INIT: Invitation[] = [
  { id: "i1", email: "mariam.traore@spark.ci", role: "Caissier", expires: "Expire dans 2 j" },
  { id: "i2", email: "yao.kouassi@spark.ci", role: "Laveur", expires: "Expire dans 1 j" },
  { id: "i3", email: "fatou.diarra@spark.ci", role: "Classeur", expires: "Expire dans 3 j" },
];

export const ACTIVITES_EQUIPE = [
  ["Awa Koné a modifié le rôle Manager", "18 min"],
  ["Nadia Assi a affecté Koffi Mensah à Plateau", "1 h"],
  ["Serge Bamba nouvel appareil connecté", "3 h"],
  ["Système invitation expirée désactivée", "5 h"],
  ["Eric Boli a validé la clôture de Cocody", "8 h"],
  ["Mariam Traoré a rejoint l'agence Plateau", "Hier"],
  ["Aïcha Diomandé a changé son mot de passe", "Hier"],
  ["Système rappel MFA envoyé à 4 comptes", "Il y a 2 j"],
];

export interface RolePerm {
  role: string;
  systeme: boolean;
  utilisateurs: number;
}

export const ROLES_PERM: RolePerm[] = [
  { role: "Admin", systeme: true, utilisateurs: 3 },
  { role: "Manager", systeme: true, utilisateurs: 6 },
  { role: "Caissier", systeme: true, utilisateurs: 18 },
  { role: "Laveur", systeme: false, utilisateurs: 8 },
  { role: "Classeur", systeme: false, utilisateurs: 5 },
];

export interface DomainePerm {
  domaine: string;
  sub: string;
  actions: string[];
  sensibles: string[];
  droits: Record<string, boolean[]>;
}

const R = ["Admin", "Manager", "Caissier", "Laveur", "Classeur"];

export const MATRICE: DomainePerm[] = [
  { domaine: "Clients", sub: "Voir, créer, modifier, fidélité", actions: ["Voir", "Créer", "Modifier"], sensibles: [], droits: { Admin: [true, true, true], Manager: [true, true, true], Caissier: [true, true, true], Laveur: [false, false, false], Classeur: [false, false, false] } },
  { domaine: "Dépôts", sub: "Créer, encaisser, annuler, réimprimer", actions: ["Créer", "Encaisser", "Annuler"], sensibles: [], droits: { Admin: [true, true, true], Manager: [true, true, true], Caissier: [true, true, true], Laveur: [false, false, false], Classeur: [false, false, false] } },
  { domaine: "Paiements", sub: "Encaisser, rembourser, remise", actions: ["Encaisser", "Rembourser", "Remise"], sensibles: ["Encaisser", "Rembourser", "Remise"], droits: { Admin: [true, true, true], Manager: [true, true, true], Caissier: [true, true, true], Laveur: [false, false, false], Classeur: [false, false, false] } },
  { domaine: "Atelier", sub: "Traiter, relancer, changer le statut", actions: ["Traiter", "Relancer", "Statut"], sensibles: [], droits: { Admin: [true, true, true], Manager: [true, true, true], Caissier: [true, true, true], Laveur: [true, true, false], Classeur: [false, false, false] } },
  { domaine: "Retraits", sub: "Créer, remettre, annuler", actions: ["Créer", "Remettre", "Annuler"], sensibles: [], droits: { Admin: [true, true, true], Manager: [true, true, true], Caissier: [true, true, true], Laveur: [false, false, false], Classeur: [true, false, false] } },
  { domaine: "Caisse", sub: "Ouvrir, débloquer, corriger", actions: ["Ouvrir", "Débloquer", "Corriger"], sensibles: ["Ouvrir", "Débloquer", "Corriger"], droits: { Admin: [true, true, true], Manager: [true, true, true], Caissier: [true, true, true], Laveur: [false, false, false], Classeur: [false, false, false] } },
  { domaine: "Rapports", sub: "Ouvrir, planifier", actions: ["Ouvrir", "Planifier"], sensibles: [], droits: { Admin: [true, true], Manager: [true, true], Caissier: [false, false], Laveur: [false, false], Classeur: [false, false] } },
  { domaine: "Paramètres", sub: "Configurer taxes, reçus", actions: ["Configurer", "Reçus"], sensibles: ["Configurer", "Reçus"], droits: { Admin: [true, true], Manager: [true, true], Caissier: [false, false], Laveur: [false, false], Classeur: [false, false] } },
  { domaine: "Agences", sub: "Créer, affecter, partager", actions: ["Créer", "Affecter", "Partager"], sensibles: [], droits: { Admin: [true, true, true], Manager: [true, true, false], Caissier: [false, false, false], Laveur: [false, false, false], Classeur: [false, false, false] } },
  { domaine: "Audit", sub: "Journaliser et exporter", actions: ["Journaliser", "Exporter"], sensibles: ["Journaliser", "Exporter"], droits: { Admin: [true, true], Manager: [true, true], Caissier: [false, false], Laveur: [false, false], Classeur: [false, false] } },
];

export { R as ROLES_COLONNES };

export const MANAGER_USERS = [
  ["NA", "Nadia Assi", "3 agences", "bg-amber-100 text-amber-700"],
  ["EB", "Eric Boli", "Cocody", "bg-sky-100 text-sky-700"],
  ["MT", "Mariam Traoré", "Plateau", "bg-emerald-100 text-emerald-700"],
  ["YK", "Yao Kouassi", "2 agences", "bg-orange-100 text-orange-700"],
];

export const PERM_HISTORIQUE = [
  ["Awa Koné a modifié le rôle Manager", "Paiements • Remise ajoutée • 18 min"],
  ["Système a journalisé 4 exports financiers", "Audit • il y a 2 h"],
  ["Nadia Assi a limité Caissier à son agence", "Agences • hier"],
];
