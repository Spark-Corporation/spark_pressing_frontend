export interface Agence {
  slug: string;
  nom: string;
  adresse: string;
  code: string;
  ca: string;
  caDelta: string;
  depots: number;
  retraits: number;
  impayes: string;
  objectif: number;
  pieces: string;
  caisse: string;
  tauxRetrait: string;
  objectifReste: string;
  panier: string;
  impayesPct: string;
  retardsPct: string;
  satisfaction: string;
  atelier: { label: string; value: number; sub: string }[];
  atelierTotal: string;
  clientsActifs: number;
  membresFidelite: number;
  fidelitePct: string;
  points: string;
  nouveauxVip: string;
  repartition: [number, number, number];
  retards: { code: string; client: string; duree: string; montant: string }[];
  retardsNote: string;
  impayesClients: string;
  impayesNote: string;
  equipe: { initials: string; nom: string; role: string; statut: "Présent" | "Pause"; bg: string }[];
  historique: { heure: string; title: string; sub: string }[];
}

export const AGENCES: Agence[] = [
  {
    slug: "bingerville",
    nom: "Bingerville",
    adresse: "Carrefour Feh Kessé",
    code: "BGV-01",
    ca: "4 965 500 FCFA",
    caDelta: "+12,4 %",
    depots: 342,
    retraits: 311,
    impayes: "186 750 FCFA",
    objectif: 88,
    pieces: "4 186 pièces reçues",
    caisse: "983 500 FCFA",
    tauxRetrait: "Taux de retrait 90,9 %",
    objectifReste: "Il reste 678 000 FCFA",
    panier: "14 520 FCFA",
    impayesPct: "3,8 %",
    retardsPct: "6,1 %",
    satisfaction: "4,8 / 5",
    atelier: [
      { label: "En attente", value: 14, sub: "46 pièces" },
      { label: "Lavage", value: 22, sub: "78 pièces" },
      { label: "Repassage", value: 18, sub: "61 pièces" },
      { label: "Contrôle", value: 9, sub: "31 pièces" },
      { label: "Classés", value: 23, sub: "68 pièces" },
    ],
    atelierTotal: "86 commandes • 284 pièces en circulation",
    clientsActifs: 846,
    membresFidelite: 612,
    fidelitePct: "72 % du portefeuille",
    points: "126 400",
    nouveauxVip: "18",
    repartition: [45, 35, 20],
    retards: [
      { code: "BG-02634", client: "Awa Diabaté", duree: "32 min", montant: "12 500 FCFA" },
      { code: "BG-02598", client: "Koffi N'Guessan", duree: "1 j 4 h", montant: "0 FCFA" },
      { code: "BG-02581", client: "Sarah Coulibaly", duree: "2 j 2 h", montant: "18 000 FCFA" },
    ],
    retardsNote: "2 dépôts plus de 24 h",
    impayesClients: "8 clients",
    impayesNote: "62 500 FCFA depuis 30+ jours",
    equipe: [
      { initials: "GA", nom: "Grâce Amani", role: "Responsable agence", statut: "Présent", bg: "bg-primary text-white" },
      { initials: "MK", nom: "Moussa Koné", role: "Caissier", statut: "Présent", bg: "bg-primary text-white" },
      { initials: "JK", nom: "Jean Koffi", role: "Laveur", statut: "Présent", bg: "bg-stone-200 text-stone-600" },
      { initials: "MK", nom: "Mariam Koné", role: "Classeur", statut: "Pause", bg: "bg-emerald-100 text-emerald-700" },
    ],
    historique: [
      { heure: "10:38", title: "Retrait finalisé • BG-02612", sub: "18 pièces • Grâce A." },
      { heure: "10:31", title: "Synchronisation terminée", sub: "42 opérations envoyées" },
      { heure: "10:18", title: "Dépôt Express enregistré • BG-02624", sub: "Awa Diabaté • 12 500 FCFA" },
      { heure: "09:56", title: "Relance impayé envoyée", sub: "8 clients • SMS" },
      { heure: "09:14", title: "Frais de livraison modifiés", sub: "1 500 → 2 000 FCFA" },
    ],
  },
  {
    slug: "plateau",
    nom: "Plateau",
    adresse: "Carrefour Fahi Chardy",
    code: "PLT-01",
    ca: "5 620 000 FCFA",
    caDelta: "+14,2 %",
    depots: 386,
    retraits: 344,
    impayes: "215 000 FCFA",
    objectif: 92,
    pieces: "4 810 pièces reçues",
    caisse: "1 120 000 FCFA",
    tauxRetrait: "Taux de retrait 89,1 %",
    objectifReste: "Il reste 490 000 FCFA",
    panier: "15 840 FCFA",
    impayesPct: "3,8 %",
    retardsPct: "4,2 %",
    satisfaction: "4,9 / 5",
    atelier: [
      { label: "En attente", value: 16, sub: "52 pièces" },
      { label: "Lavage", value: 25, sub: "88 pièces" },
      { label: "Repassage", value: 20, sub: "70 pièces" },
      { label: "Contrôle", value: 11, sub: "36 pièces" },
      { label: "Classés", value: 28, sub: "79 pièces" },
    ],
    atelierTotal: "100 commandes • 325 pièces en circulation",
    clientsActifs: 912,
    membresFidelite: 704,
    fidelitePct: "77 % du portefeuille",
    points: "148 200",
    nouveauxVip: "22",
    repartition: [40, 38, 22],
    retards: [
      { code: "PL-03112", client: "Yao Kouassi", duree: "45 min", montant: "9 800 FCFA" },
      { code: "PL-03098", client: "Aya Mensah", duree: "1 j 1 h", montant: "0 FCFA" },
    ],
    retardsNote: "1 dépôt plus de 24 h",
    impayesClients: "6 clients",
    impayesNote: "48 300 FCFA depuis 30+ jours",
    equipe: [
      { initials: "DO", nom: "Didier Oka", role: "Responsable agence", statut: "Présent", bg: "bg-primary text-white" },
      { initials: "SL", nom: "Sara Lou", role: "Caissière", statut: "Présent", bg: "bg-primary text-white" },
      { initials: "BK", nom: "Boris Komenan", role: "Laveur", statut: "Présent", bg: "bg-stone-200 text-stone-600" },
    ],
    historique: [
      { heure: "10:41", title: "Retrait finalisé • PL-03120", sub: "12 pièces • Sara L." },
      { heure: "10:22", title: "Dépôt Express enregistré • PL-03119", sub: "15 800 FCFA" },
      { heure: "09:48", title: "Relance impayé envoyée", sub: "6 clients • SMS" },
    ],
  },
  {
    slug: "cocody",
    nom: "Cocody Angré",
    adresse: "Boulevard Valéry Giscard",
    code: "COC-01",
    ca: "4 320 000 FCFA",
    caDelta: "+7,8 %",
    depots: 298,
    retraits: 276,
    impayes: "294 500 FCFA",
    objectif: 81,
    pieces: "3 640 pièces reçues",
    caisse: "812 400 FCFA",
    tauxRetrait: "Taux de retrait 92,6 %",
    objectifReste: "Il reste 1 012 000 FCFA",
    panier: "13 980 FCFA",
    impayesPct: "6,8 %",
    retardsPct: "8,4 %",
    satisfaction: "4,6 / 5",
    atelier: [
      { label: "En attente", value: 12, sub: "38 pièces" },
      { label: "Lavage", value: 19, sub: "64 pièces" },
      { label: "Repassage", value: 15, sub: "52 pièces" },
      { label: "Contrôle", value: 12, sub: "28 pièces" },
      { label: "Classés", value: 18, sub: "55 pièces" },
    ],
    atelierTotal: "76 commandes • 237 pièces en circulation",
    clientsActifs: 598,
    membresFidelite: 438,
    fidelitePct: "73 % du portefeuille",
    points: "98 600",
    nouveauxVip: "11",
    repartition: [50, 30, 20],
    retards: [
      { code: "CA-02287", client: "Nadia Sylla", duree: "1 j 6 h", montant: "14 200 FCFA" },
      { code: "CA-02271", client: "Oumar Bah", duree: "2 j 3 h", montant: "7 500 FCFA" },
    ],
    retardsNote: "12 retards • 6 retraits promis aujourd'hui",
    impayesClients: "11 clients",
    impayesNote: "88 100 FCFA depuis 30+ jours",
    equipe: [
      { initials: "FB", nom: "Fatou Bah", role: "Responsable agence", statut: "Présent", bg: "bg-primary text-white" },
      { initials: "IS", nom: "Ibrahim Sy", role: "Caissier", statut: "Pause", bg: "bg-stone-200 text-stone-600" },
    ],
    historique: [
      { heure: "10:35", title: "Dépôt enregistré • CA-02290", sub: "9 400 FCFA" },
      { heure: "09:52", title: "Relance impayé envoyée", sub: "11 clients • SMS" },
    ],
  },
  {
    slug: "marcory",
    nom: "Marcory",
    adresse: "Boulevard Valéry Giscard",
    code: "MAR-01",
    ca: "3 185 500 FCFA",
    caDelta: "−2,1 %",
    depots: 241,
    retraits: 219,
    impayes: "543 750 FCFA",
    objectif: 67,
    pieces: "2 980 pièces reçues",
    caisse: "594 200 FCFA",
    tauxRetrait: "Taux de retrait 90,8 %",
    objectifReste: "Il reste 1 568 000 FCFA",
    panier: "12 760 FCFA",
    impayesPct: "17,1 %",
    retardsPct: "9,8 %",
    satisfaction: "4,4 / 5",
    atelier: [
      { label: "En attente", value: 10, sub: "30 pièces" },
      { label: "Lavage", value: 15, sub: "51 pièces" },
      { label: "Repassage", value: 12, sub: "40 pièces" },
      { label: "Contrôle", value: 7, sub: "22 pièces" },
      { label: "Classés", value: 14, sub: "44 pièces" },
    ],
    atelierTotal: "58 commandes • 187 pièces en circulation",
    clientsActifs: 490,
    membresFidelite: 312,
    fidelitePct: "64 % du portefeuille",
    points: "71 300",
    nouveauxVip: "7",
    repartition: [55, 28, 17],
    retards: [
      { code: "MA-01877", client: "Koffi Mensah", duree: "3 j 1 h", montant: "22 400 FCFA" },
    ],
    retardsNote: "Impayés élevés • +6 % sur 7 jours",
    impayesClients: "19 clients",
    impayesNote: "210 400 FCFA depuis 30+ jours",
    equipe: [
      { initials: "AD", nom: "Alain Doh", role: "Responsable agence", statut: "Présent", bg: "bg-primary text-white" },
      { initials: "KE", nom: "Koffi Eboué", role: "Caissier", statut: "Présent", bg: "bg-stone-200 text-stone-600" },
    ],
    historique: [
      { heure: "10:29", title: "Escalade impayés créée", sub: "19 clients • 210 400 FCFA" },
      { heure: "09:40", title: "Dépôt enregistré • MA-01880", sub: "11 200 FCFA" },
    ],
  },
];

export function getAgence(slug: string): Agence | undefined {
  return AGENCES.find((a) => a.slug === slug);
}

export function formatFCFA(n: number): string {
  return `${n.toLocaleString("fr-FR").replace(/,/g, " ")}`;
}
