export interface AgencePerf {
  nom: string;
  ca: string;
  ventes: number;
  panier: string;
  evolution: string;
  up: boolean;
}

export const AGENCES_PERF: AgencePerf[] = [
  { nom: "Cocody Angré", ca: "7 842 500 FCFA", ventes: 514, panier: "15 257 FCFA", evolution: "+15,8 %", up: true },
  { nom: "Plateau Centre", ca: "5 106 500 FCFA", ventes: 352, panier: "14 507 FCFA", evolution: "+9,4 %", up: true },
  { nom: "Marcory Zone 4", ca: "3 994 000 FCFA", ventes: 291, panier: "13 691 FCFA", evolution: "+4,2 %", up: true },
  { nom: "Bingerville", ca: "1 710 000 FCFA", ventes: 127, panier: "13 465 FCFA", evolution: "−2,1 %", up: false },
];

export const CA_JOURS = [
  { v: 34, label: "58k" },
  { v: 48, label: "82k" },
  { v: 40, label: "61k" },
  { v: 56, label: "96k" },
  { v: 62, label: "105k" },
  { v: 52, label: "88k" },
  { v: 72, label: "121k" },
  { v: 68, label: "113k" },
  { v: 80, label: "138k" },
  { v: 76, label: "126k" },
  { v: 86, label: "146k" },
  { v: 100, label: "132k" },
];

export const VENTES_JOURS = [
  { v: 40, label: "38" },
  { v: 52, label: "45" },
  { v: 44, label: "41" },
  { v: 60, label: "52" },
  { v: 58, label: "50" },
  { v: 55, label: "48" },
  { v: 68, label: "59" },
  { v: 64, label: "55" },
  { v: 75, label: "64" },
  { v: 70, label: "61" },
  { v: 82, label: "70" },
  { v: 100, label: "74" },
];

export const PANIER_JOURS = [
  { v: 60, label: "13,1" },
  { v: 66, label: "13,8" },
  { v: 58, label: "12,9" },
  { v: 70, label: "14,2" },
  { v: 68, label: "14,0" },
  { v: 72, label: "14,5" },
  { v: 76, label: "14,9" },
  { v: 74, label: "14,6" },
  { v: 82, label: "15,3" },
  { v: 80, label: "15,1" },
  { v: 88, label: "15,8" },
  { v: 100, label: "16,2" },
];

export interface Caissier {
  initials: string;
  nom: string;
  session: string;
  recettes: string;
  ventes: number;
  panier: string;
  productivite: number;
  ecart: string;
  ecartTone: "amber" | "emerald" | "red";
  avatarBg: string;
}

export const CAISSIERS: Caissier[] = [
  { initials: "NA", nom: "Nadia Assi", session: "Cocody Angré • 08:02–18:34", recettes: "2 846 500 FCFA", ventes: 184, panier: "15 470 FCFA", productivite: 92, ecart: "+2 500 FCFA", ecartTone: "amber", avatarBg: "bg-amber-100 text-amber-700" },
  { initials: "KM", nom: "Koffi Mensah", session: "Clôture à 18:34", recettes: "2 214 000 FCFA", ventes: 151, panier: "14 663 FCFA", productivite: 84, ecart: "0 FCFA", ecartTone: "emerald", avatarBg: "bg-slate-200 text-slate-600" },
  { initials: "AD", nom: "Aïcha Diomandé", session: "Pause à 12:00", recettes: "1 986 500 FCFA", ventes: 143, panier: "13 892 FCFA", productivite: 78, ecart: "−5 000 FCFA", ecartTone: "red", avatarBg: "bg-stone-200 text-stone-600" },
  { initials: "YS", nom: "Yannick Soro", session: "Pause à 12:00", recettes: "1 174 000 FCFA", ventes: 88, panier: "13 341 FCFA", productivite: 70, ecart: "+500 FCFA", ecartTone: "amber", avatarBg: "bg-orange-100 text-orange-700" },
];

export const BILAN_BARS = [
  { h: "9h", v: 24 },
  { h: "10h", v: 34 },
  { h: "11h", v: 30 },
  { h: "12h", v: 36 },
  { h: "13h", v: 32 },
  { h: "14h", v: 44 },
  { h: "15h", v: 52 },
  { h: "16h", v: 38 },
  { h: "17h", v: 100 },
];

export function formatFCFA(n: number): string {
  return `${n.toLocaleString("fr-FR").replace(/,/g, " ")}`;
}
