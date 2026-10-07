export type Prestation = "Express" | "Classique" | "Repassage";
export type EtatAtelier = "Prêt" | "En lavage" | "À trier" | "Séchage" | "Repassage" | "Contrôle" | "Retiré";
export type Synchro = "À jour" | "En attente";

export interface Depot {
  code: string;
  client: string;
  phone?: string;
  prestation: Prestation;
  articles: string;
  total: number;
  paye: number;
  retrait: string;
  etat: EtatAtelier;
  synchro: Synchro;
  /** Ancienneté de la création, en jours (référence : lun. 28 sept. 2026) */
  daysAgo: number;
  agency: string;
}

export const DEPOTS: Depot[] = [
  { code: "DEP-240928", client: "Aminata Diarra", phone: "07 48 22 19 03", prestation: "Express", articles: "7 pièces", total: 24500, paye: 15000, retrait: "Aujourd'hui, 17h", etat: "Prêt", synchro: "À jour", daysAgo: 0, agency: "Bingerville" },
  { code: "DEP-240927", client: "Jean-Marc Kouassi", phone: "05 66 20 48 91", prestation: "Classique", articles: "4,8 kg", total: 19200, paye: 19200, retrait: "29 sept., 12h", etat: "En lavage", synchro: "À jour", daysAgo: 1, agency: "Bingerville" },
  { code: "DEP-240926", client: "Nadia Bamba", phone: "07 00 40 13 16", prestation: "Repassage", articles: "11 pièces", total: 13500, paye: 5000, retrait: "30 sept., 10h", etat: "À trier", synchro: "À jour", daysAgo: 1, agency: "Bingerville" },
  { code: "DEP-240925", client: "Hôtel Lagoon", prestation: "Classique", articles: "18,2 kg", total: 72800, paye: 50000, retrait: "30 sept., 16h", etat: "Séchage", synchro: "En attente", daysAgo: 2, agency: "Bingerville" },
  { code: "DEP-240924", client: "Fatou Touré", prestation: "Express", articles: "5 pièces", total: 18000, paye: 18000, retrait: "Retiré à 09h12", etat: "Retiré", synchro: "À jour", daysAgo: 0, agency: "Cocody" },
  { code: "DEP-240923", client: "Serge N'Guessan", phone: "05 64 07 91 82", prestation: "Classique", articles: "9 pièces", total: 28750, paye: 10000, retrait: "1 oct., 14h", etat: "En lavage", synchro: "À jour", daysAgo: 2, agency: "Bingerville" },
  { code: "DEP-240922", client: "Awa N'Guessan", phone: "05 45 09 66 20", prestation: "Express", articles: "6 pièces", total: 21300, paye: 21300, retrait: "Retiré à 11h40", etat: "Retiré", synchro: "À jour", daysAgo: 0, agency: "Bingerville" },
  { code: "DEP-240921", client: "Koffi N'Guessan", phone: "05 66 20 48 93", prestation: "Classique", articles: "7,3 kg", total: 26400, paye: 12000, retrait: "29 sept., 17h", etat: "Repassage", synchro: "À jour", daysAgo: 1, agency: "Plateau" },
  { code: "DEP-240920", client: "Mariam Diabaté", phone: "01 40 92 74 31", prestation: "Express", articles: "8 pièces", total: 32600, paye: 32600, retrait: "Retiré à 10h05", etat: "Retiré", synchro: "À jour", daysAgo: 0, agency: "Bingerville" },
  { code: "DEP-240919", client: "Ibrahim Touré", phone: "07 09 44 51 27", prestation: "Classique", articles: "5 pièces", total: 15800, paye: 0, retrait: "2 oct., 09h", etat: "À trier", synchro: "En attente", daysAgo: 3, agency: "Plateau" },
  { code: "DEP-240918", client: "Yannick Seri", phone: "05 96 17 08 44", prestation: "Repassage", articles: "9 pièces", total: 11400, paye: 11400, retrait: "29 sept., 15h", etat: "Contrôle", synchro: "À jour", daysAgo: 1, agency: "Cocody" },
  { code: "DEP-240917", client: "Grâce Yao", phone: "01 53 78 90 12", prestation: "Classique", articles: "6,1 kg", total: 22900, paye: 10000, retrait: "30 sept., 11h", etat: "En lavage", synchro: "À jour", daysAgo: 2, agency: "Cocody" },
  { code: "DEP-240916", client: "Kevin Brou", phone: "07 07 31 28 19", prestation: "Express", articles: "4 pièces", total: 14700, paye: 14700, retrait: "Retiré hier", etat: "Retiré", synchro: "À jour", daysAgo: 1, agency: "Riviera 3" },
  { code: "DEP-240915", client: "Aïcha Bah", phone: "05 74 29 63 80", prestation: "Classique", articles: "12 pièces", total: 38400, paye: 20000, retrait: "2 oct., 16h", etat: "Séchage", synchro: "À jour", daysAgo: 3, agency: "Bingerville" },
  { code: "DEP-240914", client: "Moussa Diarra", phone: "07 47 11 36 58", prestation: "Repassage", articles: "7 pièces", total: 8900, paye: 8900, retrait: "30 sept., 09h", etat: "Prêt", synchro: "À jour", daysAgo: 2, agency: "Marcory" },
  { code: "DEP-240913", client: "Kader Ouattara", phone: "01 42 87 15 69", prestation: "Express", articles: "10 pièces", total: 39200, paye: 15000, retrait: "1 oct., 10h", etat: "En lavage", synchro: "En attente", daysAgo: 4, agency: "Plateau" },
  { code: "DEP-240912", client: "Aminata Sylla", phone: "07 68 52 40 17", prestation: "Classique", articles: "5,5 kg", total: 20100, paye: 20100, retrait: "Retiré hier", etat: "Retiré", synchro: "À jour", daysAgo: 1, agency: "Cocody" },
  { code: "DEP-240911", client: "Yao Kouamé", phone: "05 55 18 72 44", prestation: "Classique", articles: "8 pièces", total: 25600, paye: 0, retrait: "3 oct., 12h", etat: "À trier", synchro: "À jour", daysAgo: 5, agency: "Marcory" },
  { code: "DEP-240910", client: "Adjoua Mensah", phone: "01 70 33 28 91", prestation: "Repassage", articles: "6 pièces", total: 7600, paye: 7600, retrait: "29 sept., 14h", etat: "Repassage", synchro: "À jour", daysAgo: 1, agency: "Riviera 3" },
  { code: "DEP-240909", client: "Seydou Koné", phone: "07 08 91 57 23", prestation: "Express", articles: "3 pièces", total: 12900, paye: 5000, retrait: "30 sept., 18h", etat: "Contrôle", synchro: "À jour", daysAgo: 2, agency: "Bingerville" },
  { code: "DEP-240908", client: "Akissi N'Da", phone: "05 61 74 09 36", prestation: "Classique", articles: "9,4 kg", total: 31200, paye: 31200, retrait: "Retiré il y a 2 j", etat: "Retiré", synchro: "À jour", daysAgo: 0, agency: "Cocody" },
  { code: "DEP-240907", client: "Mamadou Kane", phone: "01 66 05 83 49", prestation: "Classique", articles: "7 pièces", total: 22400, paye: 10000, retrait: "2 oct., 13h", etat: "En lavage", synchro: "En attente", daysAgo: 6, agency: "Plateau" },
  { code: "DEP-240906", client: "Awa Diallo", phone: "07 79 46 12 65", prestation: "Repassage", articles: "5 pièces", total: 6300, paye: 0, retrait: "1 oct., 09h", etat: "À trier", synchro: "À jour", daysAgo: 4, agency: "Marcory" },
  { code: "DEP-240905", client: "Idrissa Cissé", phone: "05 48 90 37 52", prestation: "Express", articles: "11 pièces", total: 44800, paye: 44800, retrait: "Retiré il y a 2 j", etat: "Retiré", synchro: "À jour", daysAgo: 0, agency: "Bingerville" },
  { code: "DEP-240904", client: "N'Guessan Affoué", phone: "01 57 62 94 08", prestation: "Classique", articles: "4 pièces", total: 12600, paye: 6000, retrait: "3 oct., 15h", etat: "Séchage", synchro: "À jour", daysAgo: 7, agency: "Riviera 3" },
  { code: "DEP-240903", client: "Mariam Traoré", phone: "07 31 08 65 94", prestation: "Express", articles: "7 pièces", total: 32500, paye: 32500, retrait: "Retiré il y a 3 j", etat: "Retiré", synchro: "À jour", daysAgo: 0, agency: "Cocody" },
  { code: "DEP-240902", client: "Safiatou Amani", phone: "07 58 73 22 11", prestation: "Classique", articles: "8,6 kg", total: 27900, paye: 15000, retrait: "2 oct., 11h", etat: "Repassage", synchro: "À jour", daysAgo: 3, agency: "Bingerville" },
  { code: "DEP-240901", client: "Franck Kouassi", phone: "05 04 99 31 08", prestation: "Repassage", articles: "4 pièces", total: 5200, paye: 5200, retrait: "Retiré il y a 4 j", etat: "Retiré", synchro: "À jour", daysAgo: 0, agency: "Riviera 3" },
];

export const ETATS_ATELIER: EtatAtelier[] = ["Prêt", "En lavage", "À trier", "Séchage", "Repassage", "Contrôle", "Retiré"];

export const AGENCES_DEPOT = ["Bingerville", "Cocody", "Riviera 3", "Plateau", "Marcory"];

export type StatutCommercial = "Soldé" | "Partiellement payé" | "Non payé";

export function statutCommercial(d: Depot): StatutCommercial {
  if (d.total - d.paye <= 0) return "Soldé";
  if (d.paye > 0) return "Partiellement payé";
  return "Non payé";
}

export function formatFCFA(n: number): string {
  return `${n.toLocaleString("fr-FR").replace(/,/g, " ")}`;
}
