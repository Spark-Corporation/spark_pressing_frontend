export interface Retrait {
  code: string;
  client: string;
  phone: string;
  articles: string;
  retrait: string;
  jour: "today" | "tomorrow" | "week";
  atelier: "Prêt" | "Contrôle";
  total: number;
  reste: number;
  notif: string;
  notifTone: "ok" | "warn" | "muted";
  sync: "ok" | "pending";
  paiement: string;
  daysAgo: number;
  agency: string;
}

export const RETRAITS: Retrait[] = [
  { code: "BG-02641", client: "Aminata Diarra", phone: "07 48 22 19 03", articles: "7 pièces", retrait: "Aujourd'hui • 10:30", jour: "today", atelier: "Prêt", total: 18500, reste: 4000, notif: "SMS lu • 09:42", notifTone: "ok", sync: "ok", paiement: "Espèces", daysAgo: 0, agency: "Bingerville" },
  { code: "BG-02638", client: "Koffi N'Guessan", phone: "05 74 16 30 88", articles: "4 pièces", retrait: "Aujourd'hui • 11:00", jour: "today", atelier: "Prêt", total: 12000, reste: 0, notif: "SMS envoyé", notifTone: "muted", sync: "ok", paiement: "Mobile Money", daysAgo: 0, agency: "Bingerville" },
  { code: "BG-02635", client: "Mariam Traoré", phone: "01 53 90 24 11", articles: "9,4 kg", retrait: "Aujourd'hui • 12:30", jour: "today", atelier: "Prêt", total: 21750, reste: 9750, notif: "À notifier", notifTone: "warn", sync: "pending", paiement: "Espèces", daysAgo: 0, agency: "Bingerville" },
  { code: "BG-02629", client: "Jean-Marc Yao", phone: "07 07 64 62 10", articles: "3 costumes", retrait: "Aujourd'hui • 14:00", jour: "today", atelier: "Contrôle", total: 19500, reste: 0, notif: "WhatsApp lu", notifTone: "ok", sync: "ok", paiement: "Carte", daysAgo: 0, agency: "Cocody" },
  { code: "BG-02624", client: "Fatou Bamba", phone: "05 66 08 41 72", articles: "6 pièces", retrait: "Aujourd'hui • 16:30", jour: "today", atelier: "Prêt", total: 14000, reste: 2500, notif: "Relance requise", notifTone: "warn", sync: "ok", paiement: "Espèces", daysAgo: 0, agency: "Bingerville" },
  { code: "BG-02618", client: "Seydou Konaté", phone: "07 98 26 14 36", articles: "12,2 kg", retrait: "Hier • 17:00", jour: "today", atelier: "Prêt", total: 28900, reste: 0, notif: "SMS lu", notifTone: "ok", sync: "ok", paiement: "Mobile Money", daysAgo: 1, agency: "Bingerville" },
  { code: "BG-02615", client: "Awa N'Guessan", phone: "05 45 09 66 20", articles: "5 pièces", retrait: "Aujourd'hui • 17:30", jour: "today", atelier: "Prêt", total: 16200, reste: 6200, notif: "SMS envoyé", notifTone: "muted", sync: "ok", paiement: "Espèces", daysAgo: 0, agency: "Bingerville" },
  { code: "BG-02612", client: "Ibrahim Touré", phone: "07 09 44 51 27", articles: "7,3 kg", retrait: "Demain • 09:00", jour: "tomorrow", atelier: "Contrôle", total: 24800, reste: 0, notif: "À notifier", notifTone: "warn", sync: "pending", paiement: "Carte", daysAgo: 1, agency: "Plateau" },
  { code: "BG-02610", client: "Yannick Seri", phone: "05 96 17 08 44", articles: "4 pièces", retrait: "Demain • 10:30", jour: "tomorrow", atelier: "Prêt", total: 11500, reste: 1500, notif: "WhatsApp envoyé", notifTone: "muted", sync: "ok", paiement: "Mobile Money", daysAgo: 2, agency: "Cocody" },
  { code: "BG-02608", client: "Grâce Yao", phone: "01 53 78 90 12", articles: "6 pièces", retrait: "Demain • 14:00", jour: "tomorrow", atelier: "Prêt", total: 17300, reste: 0, notif: "SMS lu", notifTone: "ok", sync: "ok", paiement: "Espèces", daysAgo: 2, agency: "Cocody" },
  { code: "BG-02605", client: "Kader Ouattara", phone: "01 42 87 15 69", articles: "8,5 kg", retrait: "29 sept. • 11:00", jour: "week", atelier: "Prêt", total: 23400, reste: 8400, notif: "Relance requise", notifTone: "warn", sync: "ok", paiement: "Espèces", daysAgo: 3, agency: "Plateau" },
  { code: "BG-02602", client: "Aïcha Bah", phone: "05 74 29 63 80", articles: "6 pièces", retrait: "29 sept. • 15:30", jour: "week", atelier: "Contrôle", total: 19800, reste: 0, notif: "SMS envoyé", notifTone: "muted", sync: "pending", paiement: "Carte", daysAgo: 4, agency: "Bingerville" },
];

export interface Ancien {
  client: string;
  phone: string;
  classe: string;
  attente: string;
  pieces: string;
  valeur: number;
  decision: "Relancer" | "Frais de garde";
}

export const ANCIENS: Ancien[] = [
  { client: "Aminata Diarra", phone: "07 48 22 19 03", classe: "28 sept.", attente: "31 j", pieces: "7 pièces", valeur: 18500, decision: "Relancer" },
  { client: "Koffi N'Guessan", phone: "05 74 16 30 88", classe: "27 sept.", attente: "32 j", pieces: "4 pièces", valeur: 12000, decision: "Frais de garde" },
  { client: "Mariam Traoré", phone: "01 53 90 24 11", classe: "24 sept.", attente: "35 j", pieces: "9,4 kg", valeur: 21750, decision: "Relancer" },
  { client: "Jean-Marc Yao", phone: "07 07 64 62 10", classe: "20 sept.", attente: "39 j", pieces: "3 costumes", valeur: 19500, decision: "Frais de garde" },
  { client: "Fatou Bamba", phone: "05 66 08 41 72", classe: "14 sept.", attente: "45 j", pieces: "6 pièces", valeur: 14000, decision: "Relancer" },
  { client: "Seydou Konaté", phone: "07 98 26 14 36", classe: "08 sept.", attente: "55 j", pieces: "12,2 kg", valeur: 28900, decision: "Frais de garde" },
  { client: "Awa N'Guessan", phone: "05 45 09 66 20", classe: "02 sept.", attente: "61 j", pieces: "5 pièces", valeur: 16200, decision: "Relancer" },
  { client: "Ibrahim Touré", phone: "07 09 44 51 27", classe: "28 août", attente: "66 j", pieces: "7,3 kg", valeur: 24800, decision: "Frais de garde" },
  { client: "Yannick Seri", phone: "05 96 17 08 44", classe: "20 août", attente: "74 j", pieces: "4 pièces", valeur: 11500, decision: "Relancer" },
  { client: "Grâce Yao", phone: "01 53 78 90 12", classe: "12 août", attente: "82 j", pieces: "6 pièces", valeur: 17300, decision: "Frais de garde" },
  { client: "Kader Ouattara", phone: "01 42 87 15 69", classe: "28 juil.", attente: "97 j", pieces: "8,5 kg", valeur: 23400, decision: "Frais de garde" },
  { client: "Aïcha Bah", phone: "05 74 29 63 80", classe: "10 juil.", attente: "115 j", pieces: "6 pièces", valeur: 19800, decision: "Frais de garde" },
];

/* ------------------------- Détail : traiter le retrait ------------------------ */

export interface RetraitArticle {
  id: string;
  label: string;
  detail: string;
  total: number;
  controleRequis?: boolean;
}

export interface RetraitDetail {
  createdAt: string;
  reception: string;
  commande: string;
  retraitPrevu: string;
  acompte: number;
  articles: RetraitArticle[];
  remarques: string;
  chrono: { title: string; sub: string }[];
}

const FULL: RetraitDetail = {
  createdAt: "Créé le 26 sept. • 09:18",
  reception: "Réception • Grâce A.",
  commande: "7 pièces • Classique",
  retraitPrevu: "Retrait prévu aujourd'hui • 10:30",
  acompte: 14500,
  articles: [
    { id: "a1", label: "Chemise homme", detail: "Blanche • tache au col traitée", total: 3 },
    { id: "a2", label: "Pantalon costume", detail: "Noir • poche vérifiée", total: 2 },
    { id: "a3", label: "Robe délicate", detail: "Soie • housse individuelle", total: 1, controleRequis: true },
    { id: "a4", label: "Drap 2 places", detail: "Blanc • plié", total: 1 },
  ],
  remarques: "La cliente récupère 6 pièces. La robe en soie reste à l'agence pour un contrôle complémentaire de la couture latérale.",
  chrono: [
    { title: "Réceptionné", sub: "26 sept. • Grâce" },
    { title: "Lavage", sub: "27 sept. • Yao" },
    { title: "Repassage", sub: "27 sept. • Awa" },
    { title: "Contrôle", sub: "28 sept. • Grâce" },
    { title: "Prêt", sub: "28 sept. • 08:46" },
    { title: "Remis", sub: "En attente" },
  ],
};

function buildGenericDetail(r: Retrait): RetraitDetail {
  return {
    createdAt: "Créé le 26 sept. • 09:18",
    reception: `Réception • ${r.agency}`,
    commande: `${r.articles} • Classique`,
    retraitPrevu: `Retrait prévu ${r.retrait.split("•")[0].trim().toLowerCase()} • ${r.retrait.split("•")[1]?.trim() ?? ""}`,
    acompte: Math.max(0, r.total - r.reste),
    articles: [
      { id: "a1", label: "Lot pressing", detail: "Vérifié au contrôle", total: 3 },
      { id: "a2", label: "Compléments", detail: "Bon état général", total: 2 },
    ],
    remarques: "Vérifier l'identité du réceptionnaire avant toute remise.",
    chrono: [
      { title: "Réceptionné", sub: "26 sept. • Comptoir" },
      { title: "Lavage", sub: "27 sept. • Atelier" },
      { title: "Repassage", sub: "27 sept. • Atelier" },
      { title: "Contrôle", sub: "28 sept. • Atelier" },
      { title: "Prêt", sub: "28 sept. • 08:46" },
      { title: "Remis", sub: "En attente" },
    ],
  };
}

export function getRetraitDetail(code: string): { retrait: Retrait; detail: RetraitDetail } | undefined {
  const retrait = RETRAITS.find((r) => r.code.toLowerCase() === code.toLowerCase());
  if (!retrait) return undefined;
  if (retrait.code === "BG-02641") return { retrait, detail: FULL };
  return { retrait, detail: buildGenericDetail(retrait) };
}

export function formatFCFA(n: number): string {
  return `${n.toLocaleString("fr-FR").replace(/,/g, " ")}`;
}
