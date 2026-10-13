export type Flux = "Entrée" | "Sortie";
export type OpStatut = "Synchronisé" | "Validé" | "Hors ligne";

export interface JournalOp {
  date: string;
  ref: string;
  categorie: string;
  operateur: string;
  paiement: string;
  flux: Flux;
  montant: number;
  statut: OpStatut;
  daysAgo: number;
}

export const JOURNAL: JournalOp[] = [
  { date: "28/09 • 16:38", ref: "DEP-02684", categorie: "Dépôt", operateur: "Grâce A.", paiement: "Mobile Money", flux: "Entrée", montant: 32500, statut: "Synchronisé", daysAgo: 0 },
  { date: "28/09 • 16:14", ref: "SOL-01827", categorie: "Solde dépôt", operateur: "Moussa K.", paiement: "Espèces", flux: "Entrée", montant: 8000, statut: "Synchronisé", daysAgo: 0 },
  { date: "28/09 • 15:42", ref: "MVT-00418", categorie: "Fournitures", operateur: "Aïcha K.", paiement: "Espèces", flux: "Sortie", montant: 45000, statut: "Validé", daysAgo: 0 },
  { date: "28/09 • 14:58", ref: "DEP-02679", categorie: "Dépôt", operateur: "Grâce A.", paiement: "Carte", flux: "Entrée", montant: 24500, statut: "Synchronisé", daysAgo: 0 },
  { date: "28/09 • 13:31", ref: "MVT-00417", categorie: "Monnaie agence", operateur: "Moussa K.", paiement: "Espèces", flux: "Entrée", montant: 25000, statut: "Hors ligne", daysAgo: 0 },
  { date: "28/09 • 11:46", ref: "SOL-01810", categorie: "Solde dépôt", operateur: "Grâce A.", paiement: "Mobile Money", flux: "Entrée", montant: 14000, statut: "Synchronisé", daysAgo: 0 },
  { date: "28/09 • 09:12", ref: "MVT-00416", categorie: "Transport", operateur: "Moussa K.", paiement: "Espèces", flux: "Sortie", montant: 12000, statut: "Validé", daysAgo: 0 },
  { date: "28/09 • 08:35", ref: "DEP-02671", categorie: "Dépôt", operateur: "Grâce A.", paiement: "Espèces", flux: "Entrée", montant: 18700, statut: "Synchronisé", daysAgo: 0 },
  { date: "28/09 • 08:20", ref: "SOL-01802", categorie: "Solde dépôt", operateur: "Moussa K.", paiement: "Carte", flux: "Entrée", montant: 9600, statut: "Synchronisé", daysAgo: 0 },
  { date: "27/09 • 17:05", ref: "MVT-00415", categorie: "Maintenance", operateur: "Aïcha K.", paiement: "Espèces", flux: "Sortie", montant: 28000, statut: "Validé", daysAgo: 1 },
  { date: "27/09 • 15:44", ref: "DEP-02666", categorie: "Dépôt", operateur: "Grâce A.", paiement: "Mobile Money", flux: "Entrée", montant: 41200, statut: "Synchronisé", daysAgo: 1 },
  { date: "27/09 • 12:19", ref: "MVT-00414", categorie: "Transport", operateur: "Moussa K.", paiement: "Espèces", flux: "Sortie", montant: 7500, statut: "Validé", daysAgo: 1 },
  { date: "27/09 • 10:02", ref: "DEP-02660", categorie: "Dépôt", operateur: "Grâce A.", paiement: "Espèces", flux: "Entrée", montant: 22300, statut: "Synchronisé", daysAgo: 1 },
  { date: "26/09 • 16:51", ref: "SOL-01798", categorie: "Solde dépôt", operateur: "Moussa K.", paiement: "Mobile Money", flux: "Entrée", montant: 17800, statut: "Synchronisé", daysAgo: 2 },
  { date: "26/09 • 14:26", ref: "MVT-00413", categorie: "Fournitures", operateur: "Aïcha K.", paiement: "Espèces", flux: "Sortie", montant: 31500, statut: "Validé", daysAgo: 2 },
  { date: "26/09 • 11:08", ref: "DEP-02655", categorie: "Dépôt", operateur: "Grâce A.", paiement: "Carte", flux: "Entrée", montant: 26900, statut: "Synchronisé", daysAgo: 2 },
  { date: "25/09 • 17:33", ref: "DEP-02651", categorie: "Dépôt", operateur: "Grâce A.", paiement: "Espèces", flux: "Entrée", montant: 19400, statut: "Synchronisé", daysAgo: 3 },
  { date: "25/09 • 15:12", ref: "SOL-01790", categorie: "Solde dépôt", operateur: "Moussa K.", paiement: "Espèces", flux: "Entrée", montant: 11200, statut: "Synchronisé", daysAgo: 3 },
  { date: "24/09 • 16:47", ref: "MVT-00412", categorie: "Monnaie agence", operateur: "Moussa K.", paiement: "Espèces", flux: "Entrée", montant: 15000, statut: "Hors ligne", daysAgo: 4 },
  { date: "24/09 • 09:25", ref: "DEP-02648", categorie: "Dépôt", operateur: "Grâce A.", paiement: "Mobile Money", flux: "Entrée", montant: 28750, statut: "Synchronisé", daysAgo: 4 },
  { date: "23/09 • 14:58", ref: "MVT-00411", categorie: "Transport", operateur: "Moussa K.", paiement: "Espèces", flux: "Sortie", montant: 9000, statut: "Validé", daysAgo: 5 },
];

export const CATEGORIES = ["Dépôt", "Solde dépôt", "Fournitures", "Transport", "Monnaie agence", "Maintenance"];

export const CATEGORIES_ENTREE = ["Apport monnaie", "Remboursement fournisseur", "Avance associée", "Autre entrée"];

export const CATEGORIES_SORTIE = ["Fournitures", "Transport", "Maintenance", "Frais de garde", "Autre sortie"];

export const FLUX_HEURES = [
  { h: "7h", entrees: 38, sorties: 8 },
  { h: "8h", entrees: 55, sorties: 10 },
  { h: "9h", entrees: 42, sorties: 6 },
  { h: "10h", entrees: 70, sorties: 22 },
  { h: "11h", entrees: 48, sorties: 8 },
  { h: "12h", entrees: 78, sorties: 14 },
  { h: "13h", entrees: 52, sorties: 30 },
  { h: "14h", entrees: 88, sorties: 12 },
  { h: "15h", entrees: 40, sorties: 55 },
  { h: "16h", entrees: 96, sorties: 20 },
];

export function formatFCFA(n: number): string {
  return `${n.toLocaleString("fr-FR").replace(/,/g, " ")}`;
}
