import { DEPOTS, formatFCFA, type Depot } from "../data";

export interface DepotArticle {
  label: string;
  detail: string;
  qte: number;
  prix: number;
}

export interface Acompte {
  moyen: string;
  date: string;
  recuPar: string;
  montant: number;
}

export interface ChronoItem {
  heure: string;
  title: string;
  detail: string;
}

export interface AuditItem {
  heure: string;
  auteur: string;
  action: string;
}

export interface DepotDetail {
  statutCommercial: string;
  statutDetail: string;
  etatAtelier: string;
  etatDetail: string;
  synchro: string;
  synchroDetail: string;
  createdAt: string;
  ticket: string;
  articles: DepotArticle[];
  sousTotal: number;
  express: number;
  remise: number;
  pointsUtilises: number;
  pointsMontant: number;
  total: number;
  acomptes: Acompte[];
  tags: string[];
  mode: string;
  agenceRetrait: string;
  retraitPrevu: string;
  remarques: string;
  chrono: ChronoItem[];
  audit: AuditItem[];
  clientSince: string;
  fidelite: string;
  impaye: string;
}

const FULL: DepotDetail = {
  statutCommercial: "En cours",
  statutDetail: "Retrait prévu aujourd'hui",
  etatAtelier: "Prêt",
  etatDetail: "Contrôle validé à 10:38",
  synchro: "À jour",
  synchroDetail: "Cloud confirmé à 10:34",
  createdAt: "Créé aujourd'hui à 10:21",
  ticket: "Ticket POS-01",
  articles: [
    { label: "Chemise homme", detail: "Blanches • tache au col", qte: 2, prix: 1500 },
    { label: "Pantalon costume", detail: "Noir • poche vérifiée", qte: 2, prix: 2000 },
    { label: "Robe délicate", detail: "Soie • petite tache devant", qte: 1, prix: 3500 },
    { label: "Costume 2 pièces", detail: "Bleu nuit • ourlet", qte: 1, prix: 6500 },
    { label: "Drap 2 places", detail: "Blanc • bon état", qte: 1, prix: 3000 },
  ],
  sousTotal: 20000,
  express: 6000,
  remise: 500,
  pointsUtilises: 500,
  pointsMontant: 1000,
  total: 24500,
  acomptes: [{ moyen: "Espèces", date: "Aujourd'hui à 10:25", recuPar: "Awa N.", montant: 15000 }],
  tags: ["Express • 8 h", "Taches signalées", "Rendu sur cintre", "7 pièces comptées"],
  mode: "Retrait en agence",
  agenceRetrait: "Bingerville",
  retraitPrevu: "Aujourd'hui, 17h00",
  remarques: "Traiter délicatement la robe en soie. Appeler Mme Diarra avant tout détachage",
  chrono: [
    { heure: "10:38", title: "Prêt pour retrait", detail: "Contrôle qualité validé par Mariam K." },
    { heure: "09:42", title: "Repassage terminé", detail: "7 pièces mises sur cintre" },
    { heure: "08:26", title: "Lavage terminé", detail: "Cycle express terminé sans incident" },
    { heure: "07:58", title: "Pris en charge", detail: "Lot AT-0928-14 créé à l'atelier" },
  ],
  audit: [
    { heure: "10:40", auteur: "Mariam K.", action: "État atelier passé à « Prêt »" },
    { heure: "10:34", auteur: "Système", action: "Synchronisation cloud confirmée" },
    { heure: "10:25", auteur: "Awa N.", action: "Acompte espèces de 15 000 FCFA enregistré" },
    { heure: "10:21", auteur: "Awa N.", action: "Dépôt créé depuis POS-01" },
  ],
  clientSince: "mars 2025",
  fidelite: "740 points disponibles",
  impaye: "Aucun impayé antérieur",
};

function buildGenericDetail(d: Depot): DepotDetail {
  const sousTotal = Math.round(d.total / 1.3);
  return {
    statutCommercial: d.total - d.paye <= 0 ? "Soldé" : "En cours",
    statutDetail: `Retrait prévu ${d.retrait.toLowerCase()}`,
    etatAtelier: d.etat,
    etatDetail: "Suivi atelier en temps réel",
    synchro: d.synchro,
    synchroDetail: d.synchro === "À jour" ? "Cloud confirmé à 10:34" : "En attente de connexion",
    createdAt: "Créé aujourd'hui à 10:21",
    ticket: "Ticket POS-01",
    articles: [
      { label: d.prestation === "Repassage" ? "Lot repassage" : "Lot pressing", detail: "Vérifié à la réception", qte: 3, prix: Math.round(sousTotal / 3) },
      { label: "Articles complémentaires", detail: "Bon état général", qte: 2, prix: Math.round(sousTotal / 5) },
    ],
    sousTotal,
    express: d.prestation === "Express" ? d.total - sousTotal : 0,
    remise: 0,
    pointsUtilises: 0,
    pointsMontant: 0,
    total: d.total,
    acomptes:
      d.paye > 0
        ? [{ moyen: "Espèces", date: "Aujourd'hui à 10:25", recuPar: "Awa N.", montant: d.paye }]
        : [],
    tags: [d.prestation, "Rendu sur cintre", d.articles],
    mode: "Retrait en agence",
    agenceRetrait: d.agency,
    retraitPrevu: d.retrait,
    remarques: "Aucune consigne particulière pour ce dépôt.",
    chrono: [
      { heure: "09:42", title: d.etat, detail: "Étape suivie par l'atelier" },
      { heure: "07:58", title: "Pris en charge", detail: `Lot créé à l'atelier ${d.agency}` },
    ],
    audit: [
      { heure: "10:34", auteur: "Système", action: "Synchronisation cloud confirmée" },
      { heure: "10:21", auteur: "Awa N.", action: "Dépôt créé depuis POS-01" },
    ],
    clientSince: "mars 2025",
    fidelite: "320 points disponibles",
    impaye: "Aucun impayé antérieur",
  };
}

export function getDepotDetail(code: string): { depot: Depot; detail: DepotDetail } | undefined {
  const depot = DEPOTS.find((d) => d.code.toLowerCase() === code.toLowerCase());
  if (!depot) return undefined;
  if (depot.code === "DEP-240928") return { depot, detail: FULL };
  return { depot, detail: buildGenericDetail(depot) };
}

export { formatFCFA };
