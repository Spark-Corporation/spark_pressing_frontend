export type Facturation = "Pièce" | "Kilo" | "Mixte";

export interface Article {
  code: string;
  nom: string;
  categorie: string;
  mode: Facturation;
  classique: number;
  express: number | null;
  repassage: number;
  statut: "Actif" | "Inactif";
  portee: string;
  daysAgo: number;
  agences: string[];
}

export const ARTICLES: Article[] = [
  { code: "CHE-001", nom: "Chemise", categorie: "Hauts", mode: "Pièce", classique: 1500, express: 2300, repassage: 900, statut: "Actif", portee: "Toutes", daysAgo: 2, agences: ["Bingerville", "Cocody", "Plateau", "Marcory"] },
  { code: "COS-002", nom: "Costume 2 pièces", categorie: "Cérémonie", mode: "Pièce", classique: 6500, express: 9500, repassage: 3500, statut: "Actif", portee: "Toutes", daysAgo: 5, agences: ["Bingerville", "Cocody", "Plateau", "Marcory"] },
  { code: "ROB-014", nom: "Robe longue délicate", categorie: "Robes", mode: "Pièce", classique: 5000, express: 7500, repassage: 2800, statut: "Actif", portee: "Toutes", daysAgo: 9, agences: ["Bingerville", "Cocody", "Plateau"] },
  { code: "LIN-003", nom: "Linge courant au kilo", categorie: "Maison", mode: "Kilo", classique: 2300, express: 3200, repassage: 1400, statut: "Actif", portee: "Toutes", daysAgo: 1, agences: ["Bingerville", "Cocody", "Plateau", "Marcory"] },
  { code: "BOU-007", nom: "Boubou brodé", categorie: "Traditionnel", mode: "Mixte", classique: 4500, express: 6800, repassage: 2500, statut: "Actif", portee: "Toutes", daysAgo: 12, agences: ["Bingerville", "Cocody", "Marcory"] },
  { code: "RID-009", nom: "Rideau épais", categorie: "Maison", mode: "Kilo", classique: 3000, express: null, repassage: 1800, statut: "Inactif", portee: "Partout", daysAgo: 30, agences: [] },
  { code: "PAN-004", nom: "Pantalon costume", categorie: "Hauts", mode: "Pièce", classique: 2500, express: 3800, repassage: 1400, statut: "Actif", portee: "Toutes", daysAgo: 3, agences: ["Bingerville", "Cocody", "Plateau", "Marcory"] },
  { code: "JUP-011", nom: "Jupe plissée", categorie: "Robes", mode: "Pièce", classique: 2800, express: 4200, repassage: 1500, statut: "Actif", portee: "Toutes", daysAgo: 6, agences: ["Bingerville", "Plateau"] },
  { code: "COU-005", nom: "Couette 2 places", categorie: "Maison", mode: "Kilo", classique: 4500, express: 6200, repassage: 2200, statut: "Actif", portee: "Toutes", daysAgo: 4, agences: ["Bingerville", "Cocody", "Plateau", "Marcory"] },
  { code: "CRA-008", nom: "Cravate soie", categorie: "Accessoires", mode: "Pièce", classique: 1200, express: 1800, repassage: 700, statut: "Actif", portee: "Toutes", daysAgo: 8, agences: ["Bingerville", "Plateau"] },
  { code: "TAP-012", nom: "Tapis salon", categorie: "Maison", mode: "Kilo", classique: 3800, express: null, repassage: 2000, statut: "Actif", portee: "Bingerville", daysAgo: 15, agences: ["Bingerville"] },
  { code: "ENS-006", nom: "Ensemble tailleur", categorie: "Cérémonie", mode: "Mixte", classique: 7200, express: 10500, repassage: 3900, statut: "Actif", portee: "Toutes", daysAgo: 7, agences: ["Bingerville", "Cocody", "Plateau"] },
  { code: "DRP-010", nom: "Drap 2 places", categorie: "Maison", mode: "Kilo", classique: 3000, express: 4200, repassage: 1600, statut: "Inactif", portee: "Partout", daysAgo: 45, agences: [] },
  { code: "VES-013", nom: "Veste blazer", categorie: "Hauts", mode: "Pièce", classique: 4200, express: 6300, repassage: 2300, statut: "Actif", portee: "Toutes", daysAgo: 11, agences: ["Bingerville", "Cocody", "Plateau", "Marcory"] },
];

export const CATEGORIES_ARTICLES = ["Hauts", "Robes", "Cérémonie", "Maison", "Traditionnel", "Accessoires"];

export const HISTORIQUE_TARIFS = [
  ["Costume 2 pièces", "Express 9 000 → 9 500", "Nadia Assi • 18 sept. 2026"],
  ["Linge courant au kilo", "Classique 2 100 → 2 300", "Aïcha Koné • 12 sept. 2026"],
  ["Boubou brodé", "Nouveau • Mixte", "Yann M'Bala • 28 août 2026"],
  ["Rideau épais", "Désactivé (saisonnalité)", "Nadia Assi • 15 août 2026"],
  ["Robe longue délicate", "Repassage 2 500 → 2 800", "Aïcha Koné • 02 août 2026"],
  ["Chemise", "Arrondi à 100 FCFA activé", "Système • 20 juil. 2026"],
];

export function formatFCFA(n: number): string {
  return `${n.toLocaleString("fr-FR").replace(/,/g, " ")}`;
}
