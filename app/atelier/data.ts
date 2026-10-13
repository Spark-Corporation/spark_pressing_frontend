export type Colonne = "attente" | "cours" | "traites" | "classes";
export type Priorite = "Urgent" | "Haute" | "Normale";
export type PrestationAtelier = "Express" | "Classique" | "Repassage";

export interface Responsable {
  initials: string;
  nom: string;
  bg: string;
}

export interface Ticket {
  id: string;
  client: string;
  priorite: Priorite;
  prestation: PrestationAtelier;
  volume: string;
  echeance: string;
  jour: "today" | "tomorrow" | "week";
  elapsed: string;
  retard?: string;
  etape: string;
  taches?: string;
  responsable: Responsable | null;
  daysAgo: number;
  agency: string;
  colonne: Colonne;
}

export interface ApercuArticle {
  qte: number;
  label: string;
  detail: string;
}

export interface Apercu {
  articles: ApercuArticle[];
  totalArticles: string;
  remarques: string;
  laveur: Responsable;
  classeur: Responsable;
  chrono: { title: string; detail: string }[];
}

export const COLONNES: { key: Colonne; label: string; sub: string; bar: string; fill: string }[] = [
  { key: "attente", label: "En attente", sub: "1 h 45 estimée", bar: "bg-secondary", fill: "55%" },
  { key: "cours", label: "En cours", sub: "3 h 20 restantes", bar: "bg-secondary", fill: "62%" },
  { key: "traites", label: "Traités", sub: "38 min de classement", bar: "bg-emerald-500", fill: "40%" },
  { key: "classes", label: "Classés", sub: "Prêts au retrait", bar: "bg-primary", fill: "70%" },
];

export const NEXT_COLONNE: Record<Colonne, Colonne | null> = {
  attente: "cours",
  cours: "traites",
  traites: "classes",
  classes: null,
};

export const TICKETS: Ticket[] = [
  // En attente (5)
  { id: "DEP-240928-052", client: "Nadia Yao", priorite: "Urgent", prestation: "Express", volume: "8 articles", echeance: "Aujourd'hui • 12:30", jour: "today", elapsed: "Depuis 42 min", etape: "Tri à contrôler", responsable: null, daysAgo: 0, agency: "Bingerville", colonne: "attente" },
  { id: "DEP-240928-050", client: "Hôtel Onomo", priorite: "Haute", prestation: "Classique", volume: "12,4 kg", echeance: "Aujourd'hui • 16:00", jour: "today", elapsed: "Depuis 1 h 18", etape: "Étiquetage complet", responsable: { initials: "MT", nom: "M. Traoré", bg: "bg-emerald-100 text-emerald-700" }, daysAgo: 0, agency: "Bingerville", colonne: "attente" },
  { id: "DEP-240928-049", client: "Grâce Kouamé", priorite: "Normale", prestation: "Repassage", volume: "14 articles", echeance: "Demain • 09:00", jour: "tomorrow", elapsed: "Depuis 1 h 36", etape: "Linge délicat", responsable: { initials: "AN", nom: "A. N'Guessan", bg: "bg-emerald-100 text-emerald-700" }, daysAgo: 0, agency: "Cocody", colonne: "attente" },
  { id: "DEP-240928-048", client: "Kader Ouattara", priorite: "Normale", prestation: "Classique", volume: "6,1 kg", echeance: "Demain • 11:30", jour: "tomorrow", elapsed: "Depuis 2 h 05", etape: "Tri à contrôler", responsable: null, daysAgo: 1, agency: "Plateau", colonne: "attente" },
  { id: "DEP-240928-046", client: "Awa Diallo", priorite: "Haute", prestation: "Express", volume: "5 articles", echeance: "Aujourd'hui • 15:00", jour: "today", elapsed: "Depuis 58 min", etape: "Détachage à prévoir", responsable: { initials: "JK", nom: "Jean Koffi", bg: "bg-primary text-white" }, daysAgo: 0, agency: "Bingerville", colonne: "attente" },
  // En cours (6)
  { id: "DEP-240928-047", client: "Mme Awa Diabaté", priorite: "Urgent", prestation: "Express", volume: "11 articles", echeance: "Aujourd'hui • 11:30", jour: "today", elapsed: "Depuis 1 h 52", retard: "En retard de 32 min", etape: "Lavage programme P2", taches: "2 taches signalées", responsable: { initials: "JK", nom: "Jean Koffi", bg: "bg-primary text-white" }, daysAgo: 0, agency: "Bingerville", colonne: "cours" },
  { id: "DEP-240928-044", client: "Cabinet Juris CI", priorite: "Haute", prestation: "Classique", volume: "9,8 kg", echeance: "Aujourd'hui • 14:00", jour: "today", elapsed: "En cours • 2 h 06", etape: "Lavage programme P3", responsable: { initials: "CB", nom: "Clarisse B.", bg: "bg-sky-100 text-sky-700" }, daysAgo: 0, agency: "Bingerville", colonne: "cours" },
  { id: "DEP-240928-041", client: "Serge Assi", priorite: "Normale", prestation: "Classique", volume: "6 articles", echeance: "Aujourd'hui • 17:30", jour: "today", elapsed: "En cours • 2 h 44", etape: "Cycle délicat", responsable: { initials: "JK", nom: "Jean Koffi", bg: "bg-primary text-white" }, daysAgo: 0, agency: "Bingerville", colonne: "cours" },
  { id: "DEP-240928-040", client: "Moussa Diarra", priorite: "Normale", prestation: "Repassage", volume: "7 articles", echeance: "Demain • 08:30", jour: "tomorrow", elapsed: "En cours • 1 h 12", etape: "Repassage en cours", responsable: { initials: "PY", nom: "Paul Yapi", bg: "bg-violet-100 text-violet-700" }, daysAgo: 1, agency: "Marcory", colonne: "cours" },
  { id: "DEP-240928-039", client: "Seydou Koné", priorite: "Haute", prestation: "Express", volume: "4 articles", echeance: "Aujourd'hui • 13:30", jour: "today", elapsed: "En cours • 58 min", etape: "Séchage express", responsable: { initials: "MT", nom: "M. Traoré", bg: "bg-emerald-100 text-emerald-700" }, daysAgo: 0, agency: "Cocody", colonne: "cours" },
  { id: "DEP-240928-037", client: "Akissi N'Da", priorite: "Normale", prestation: "Classique", volume: "5,4 kg", echeance: "Demain • 10:00", jour: "tomorrow", elapsed: "En cours • 3 h 10", etape: "Lavage programme P1", responsable: { initials: "CB", nom: "Clarisse B.", bg: "bg-sky-100 text-sky-700" }, daysAgo: 2, agency: "Cocody", colonne: "cours" },
  // Traités (4)
  { id: "DEP-240928-038", client: "Fatou Sylla", priorite: "Haute", prestation: "Classique", volume: "7 articles", echeance: "Aujourd'hui • 13:00", jour: "today", elapsed: "Traité il y a 18 min", etape: "Contrôle qualité OK", responsable: { initials: "MK", nom: "Mariam Koné", bg: "bg-emerald-100 text-emerald-700" }, daysAgo: 0, agency: "Bingerville", colonne: "traites" },
  { id: "DEP-240928-036", client: "Résidence Palmeraie", priorite: "Normale", prestation: "Classique", volume: "15,2 kg", echeance: "Aujourd'hui • 18:00", jour: "today", elapsed: "Traité il y a 34 min", etape: "Séchage terminé", responsable: { initials: "PY", nom: "Paul Yapi", bg: "bg-violet-100 text-violet-700" }, daysAgo: 0, agency: "Plateau", colonne: "traites" },
  { id: "DEP-240928-031", client: "Diane Aka", priorite: "Normale", prestation: "Repassage", volume: "10 articles", echeance: "Demain • 10:00", jour: "tomorrow", elapsed: "Traité il y a 1 h", etape: "Contrôle qualité OK", responsable: { initials: "MK", nom: "Mariam Koné", bg: "bg-emerald-100 text-emerald-700" }, daysAgo: 1, agency: "Bingerville", colonne: "traites" },
  { id: "DEP-240928-030", client: "Mamadou Kane", priorite: "Normale", prestation: "Classique", volume: "6,8 kg", echeance: "Aujourd'hui • 16:30", jour: "today", elapsed: "Traité il y a 52 min", etape: "Pliage terminé", responsable: { initials: "MK", nom: "Mariam Koné", bg: "bg-emerald-100 text-emerald-700" }, daysAgo: 0, agency: "Plateau", colonne: "traites" },
  // Classés (3)
  { id: "DEP-240928-028", client: "Alain N'Dri", priorite: "Urgent", prestation: "Express", volume: "5 articles", echeance: "Aujourd'hui • 10:30", jour: "today", elapsed: "Prêt depuis 24 min", etape: "Housse scellée", responsable: { initials: "OK", nom: "Odile Kassi", bg: "bg-emerald-100 text-emerald-700" }, daysAgo: 0, agency: "Bingerville", colonne: "classes" },
  { id: "DEP-240927-122", client: "Boutique Kente", priorite: "Normale", prestation: "Repassage", volume: "18 articles", echeance: "Aujourd'hui • 15:00", jour: "today", elapsed: "Prêt depuis 1 h 12", etape: "Rayon B • casier 08", responsable: { initials: "OK", nom: "Odile Kassi", bg: "bg-emerald-100 text-emerald-700" }, daysAgo: 1, agency: "Bingerville", colonne: "classes" },
  { id: "DEP-240927-118", client: "Dr Franck Boni", priorite: "Normale", prestation: "Classique", volume: "8 articles", echeance: "Aujourd'hui • 18:30", jour: "today", elapsed: "Prêt depuis 2 h 05", etape: "Rayon A • casier 14", responsable: { initials: "YN", nom: "Yannick N.", bg: "bg-emerald-100 text-emerald-700" }, daysAgo: 1, agency: "Riviera 3", colonne: "classes" },
];

export const RESPONSABLES = ["Jean Koffi", "Mariam Koné", "M. Traoré", "Clarisse B.", "Paul Yapi", "Odile Kassi", "Non affectée"];

const AWA_APERCU: Apercu = {
  articles: [
    { qte: 3, label: "Chemise blanche", detail: "Col fragile" },
    { qte: 2, label: "Pantalon costume", detail: "Pli marqué" },
    { qte: 1, label: "Robe en soie", detail: "Lavage délicat" },
    { qte: 5, label: "Autres articles", detail: "Standard" },
  ],
  totalArticles: "11 au total",
  remarques: "Tache de fond de teint au col de la chemise. Ne pas utiliser de chlore. Cliente informée.",
  laveur: { initials: "JK", nom: "Jean Koffi", bg: "bg-primary text-white" },
  classeur: { initials: "MK", nom: "Mariam Koné", bg: "bg-emerald-100 text-emerald-700" },
  chrono: [
    { title: "Lavage terminé", detail: "10:58 • Validé par Jean Koffi" },
    { title: "Traitement des taches", detail: "10:16 • 2 zones contrôlées" },
    { title: "Pris en charge", detail: "09:42 • Programme Express P2" },
    { title: "Dépôt enregistré", detail: "09:17 • Comptoir • Sarah K." },
  ],
};

export function getApercu(t: Ticket): Apercu {
  if (t.id === "DEP-240928-047") return AWA_APERCU;
  return {
    articles: [
      { qte: 2, label: t.prestation === "Repassage" ? "Linge délicat" : "Articles pressing", detail: "Contrôle standard" },
      { qte: 1, label: "Lot complémentaire", detail: "Standard" },
    ],
    totalArticles: t.volume,
    remarques: `${t.etape}. ${t.taches ?? "Aucun défaut signalé à la réception."}`,
    laveur: t.responsable ?? { initials: "—", nom: "Non assigné", bg: "bg-muted text-muted-foreground" },
    classeur: { initials: "MK", nom: "Mariam Koné", bg: "bg-emerald-100 text-emerald-700" },
    chrono: [
      { title: t.etape, detail: t.elapsed },
      { title: "Pris en charge", detail: "Comptoir • programme standard" },
      { title: "Dépôt enregistré", detail: t.echeance },
    ],
  };
}
