import { CLIENTS, type Client, type FideliteGroupe } from "../data";

export interface TimelineItem {
  type: "retrait" | "depot";
  title: string;
  detail: string;
  ref: string;
  date: string;
}

export interface Commande {
  ref: string;
  date: string;
  articles: string;
  montant: string;
  statut: "Prête au retrait" | "Retirée";
}

export interface PointEvent {
  label: string;
  date: string;
  ref: string;
  delta: number;
}

export interface ClientNote {
  text: string;
  author: string;
  date: string;
  highlight?: boolean;
}

export interface ClientDetail {
  valeurVie: string;
  depuis: string;
  depots: number;
  frequence: string;
  panier: string;
  panierDelta: string;
  solde: string;
  points: number;
  pointValue: string;
  nextNiveau: string;
  nextAt: number;
  progress: number;
  pointEvents: PointEvent[];
  timeline: TimelineItem[];
  commandes: Commande[];
  totalCommandes: number;
  prefs: { canal: string; creneau: string; traitement: string; instructions: string };
  notes: ClientNote[];
  depuisLe: string;
  consentement: string;
}

const AMINATA: ClientDetail = {
  valeurVie: "486 500 FCFA",
  depuis: "Depuis le 18 mars 2024",
  depots: 42,
  frequence: "2,8 dépôts par mois",
  panier: "24 325 FCFA",
  panierDelta: "+6,4 % sur 6 mois",
  solde: "12 500 FCFA",
  points: 3240,
  pointValue: "16 200 FCFA",
  nextNiveau: "PLATINE",
  nextAt: 760,
  progress: 81,
  pointEvents: [
    { label: "Dépôt premium", date: "28 sept.", ref: "DEP-240928-041", delta: 325 },
    { label: "Remise fidélité", date: "14 sept.", ref: "CMD-240912-063", delta: -800 },
    { label: "Dépôt standard", date: "26 août", ref: "DEP-240826-031", delta: 445 },
    { label: "Bonus anniversaire", date: "09 août", ref: "CAMP-ANNIV", delta: 500 },
  ],
  timeline: [
    { type: "retrait", title: "Retrait effectué", detail: "3 costumes remis • Contrôle qualité validé", ref: "CMD-240928-018", date: "Aujourd'hui • 10:16" },
    { type: "depot", title: "Dépôt enregistré", detail: "5 articles • Traitement premium • 32 500 FCFA", ref: "DEP-240928-041", date: "28 sept. • 09:42" },
    { type: "retrait", title: "Retrait effectué", detail: "2 robes et 1 chemisier • Remis à la cliente", ref: "CMD-240912-063", date: "14 sept. • 16:28" },
    { type: "depot", title: "Dépôt enregistré", detail: "3 articles • Livraison express", ref: "DEP-240912-012", date: "12 sept. • 08:55" },
  ],
  commandes: [
    { ref: "CMD-240928-018", date: "28 sept. 2026", articles: "5 articles", montant: "32 500 FCFA", statut: "Prête au retrait" },
    { ref: "CMD-240912-063", date: "12 sept. 2026", articles: "3 articles", montant: "18 000 FCFA", statut: "Retirée" },
    { ref: "CMD-240826-031", date: "26 août 2026", articles: "7 articles", montant: "44 500 FCFA", statut: "Retirée" },
    { ref: "CMD-240809-007", date: "09 août 2026", articles: "2 articles", montant: "12 000 FCFA", statut: "Retirée" },
  ],
  totalCommandes: 42,
  prefs: {
    canal: "WhatsApp",
    creneau: "Fin de journée • 17h–19h",
    traitement: "Soin premium sans parfum",
    instructions: "Chemises sur cintre, plis légers",
  },
  notes: [
    { text: "Cliente attentive aux finitions. Vérifier systématiquement les boutons nacrés avant emballage.", author: "Fatou", date: "28 sept. 2026", highlight: true },
    { text: "Prévenir 30 minutes avant chaque livraison.", author: "Yao", date: "12 sept. 2026" },
  ],
  depuisLe: "18 mars 2024",
  consentement: "Autorisé",
};

/** Construit une fiche détail plausible pour les autres clients du répertoire. */
function buildGenericDetail(c: Client): ClientDetail {
  const pointValue = `${(c.points * 5).toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`;
  const niveaux: FideliteGroupe[] = ["Essentiel", "Argent", "Or", "Platine"];
  const idx = niveaux.indexOf(c.groupe);
  const next = niveaux[Math.min(idx + 1, 3)];
  return {
    valeurVie: c.valeur,
    depuis: "Depuis le 18 mars 2024",
    depots: Math.max(1, Math.round(c.points / 120)),
    frequence: `${c.frequence.replace(" / mois", "")} dépôts par mois`,
    panier: "18 400 FCFA",
    panierDelta: "+2,1 % sur 6 mois",
    solde: "0 FCFA",
    points: c.points,
    pointValue,
    nextNiveau: next.toUpperCase(),
    nextAt: 4000 - c.points > 0 ? 4000 - c.points : 0,
    progress: Math.min(96, Math.round((c.points / 4000) * 100)),
    pointEvents: [
      { label: "Dépôt standard", date: c.lastDeposit.split("•")[0].trim(), ref: `DEP-240928-${c.id.padStart(3, "0")}`, delta: 180 },
      { label: "Bonus fidélité", date: "14 sept.", ref: `CMD-240912-${c.id.padStart(3, "0")}`, delta: 120 },
    ],
    timeline: [
      { type: "depot", title: "Dépôt enregistré", detail: `Traitement standard • ${c.valeur}`, ref: `DEP-240928-${c.id.padStart(3, "0")}`, date: c.lastDeposit },
      { type: "retrait", title: "Retrait effectué", detail: "Articles remis au client", ref: `CMD-240912-${c.id.padStart(3, "0")}`, date: "14 sept. • 16:28" },
    ],
    commandes: [
      { ref: `CMD-240928-${c.id.padStart(3, "0")}`, date: "28 sept. 2026", articles: "4 articles", montant: c.valeur, statut: "Retirée" },
    ],
    totalCommandes: Math.max(1, Math.round(c.points / 120)),
    prefs: {
      canal: "Appel",
      creneau: "Matinée • 8h–12h",
      traitement: "Soin standard",
      instructions: "Aucune consigne particulière",
    },
    notes: [
      { text: "Fiche créée automatiquement depuis le répertoire réseau.", author: "Système", date: "28 sept. 2026" },
    ],
    depuisLe: "18 mars 2024",
    consentement: "Autorisé",
  };
}

export function getClientDetail(code: string): { client: Client; detail: ClientDetail } | undefined {
  const client = CLIENTS.find((c) => c.code.toLowerCase() === code.toLowerCase());
  if (!client) return undefined;
  if (client.code === "CLI-01842") return { client, detail: AMINATA };
  return { client, detail: buildGenericDetail(client) };
}
