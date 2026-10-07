export type FideliteGroupe = "Essentiel" | "Argent" | "Or" | "Platine";
export type ClientStatut = "Actif" | "Inactif" | "Archivé" | "VIP";

export interface Client {
  id: string;
  code: string;
  nom: string;
  prenoms: string;
  initials: string;
  phone: string;
  agency: string;
  lastDeposit: string;
  /** Ancienneté du dernier dépôt, en jours (référence : lun. 28 sept. 2026) */
  daysAgo: number;
  frequence: string;
  valeur: string;
  points: number;
  groupe: FideliteGroupe;
  statut: ClientStatut;
  avatarBg: string;
}

export const CLIENTS: Client[] = [
  { id: "1", code: "CLI-01842", nom: "Koné", prenoms: "Aminata", initials: "AK", phone: "+225 07 48 22 16 03", agency: "Bingerville", lastDeposit: "28 sept. • 09:42", daysAgo: 0, frequence: "2,8 / mois", valeur: "486 500 FCFA", points: 3240, groupe: "Or", statut: "Actif", avatarBg: "bg-amber-100 text-amber-700" },
  { id: "2", code: "CLI-01798", nom: "Seri", prenoms: "Yannick", initials: "YS", phone: "+225 05 96 17 08 44", agency: "Cocody", lastDeposit: "27 sept. • 17:12", daysAgo: 1, frequence: "1,4 / mois", valeur: "278 000 FCFA", points: 1890, groupe: "Argent", statut: "Actif", avatarBg: "bg-slate-200 text-slate-600" },
  { id: "3", code: "CLI-01654", nom: "Diabaté", prenoms: "Mariam", initials: "MD", phone: "+225 01 40 92 74 31", agency: "Bingerville", lastDeposit: "26 sept. • 11:08", daysAgo: 2, frequence: "3,6 / mois", valeur: "712 400 FCFA", points: 5620, groupe: "Platine", statut: "VIP", avatarBg: "bg-stone-200 text-stone-600" },
  { id: "4", code: "CLI-01671", nom: "Brou", prenoms: "Kevin", initials: "KB", phone: "+225 07 07 31 28 19", agency: "Riviera 3", lastDeposit: "25 sept. • 15:27", daysAgo: 3, frequence: "0,8 / mois", valeur: "96 500 FCFA", points: 620, groupe: "Essentiel", statut: "Actif", avatarBg: "bg-stone-200 text-stone-600" },
  { id: "5", code: "CLI-01488", nom: "N'Guessan", prenoms: "Awa", initials: "AN", phone: "+225 05 45 09 66 20", agency: "Bingerville", lastDeposit: "22 sept. • 08:51", daysAgo: 6, frequence: "2,1 / mois", valeur: "352 800 FCFA", points: 2540, groupe: "Or", statut: "Actif", avatarBg: "bg-amber-100 text-amber-700" },
  { id: "6", code: "CLI-01402", nom: "Touré", prenoms: "Ibrahim", initials: "IT", phone: "+225 07 09 44 51 27", agency: "Plateau", lastDeposit: "21 sept. • 14:05", daysAgo: 7, frequence: "1,9 / mois", valeur: "301 200 FCFA", points: 2110, groupe: "Argent", statut: "Actif", avatarBg: "bg-sky-100 text-sky-700" },
  { id: "7", code: "CLI-01132", nom: "Ehouman", prenoms: "Jean", initials: "JE", phone: "+225 01 02 86 14 57", agency: "Cocody", lastDeposit: "18 sept. • 18:04", daysAgo: 10, frequence: "0,3 / mois", valeur: "68 000 FCFA", points: 240, groupe: "Essentiel", statut: "Inactif", avatarBg: "bg-slate-200 text-slate-600" },
  { id: "8", code: "CLI-00864", nom: "Amani", prenoms: "Safiatou", initials: "SA", phone: "+225 07 58 73 22 11", agency: "Bingerville", lastDeposit: "16 sept. • 10:33", daysAgo: 12, frequence: "1,7 / mois", valeur: "224 300 FCFA", points: 1460, groupe: "Argent", statut: "Actif", avatarBg: "bg-slate-200 text-slate-600" },
  { id: "9", code: "CLI-01377", nom: "N'Guessan", prenoms: "Koffi", initials: "KN", phone: "+225 05 66 20 48 93", agency: "Plateau", lastDeposit: "13 sept. • 12:20", daysAgo: 15, frequence: "2,4 / mois", valeur: "418 900 FCFA", points: 2980, groupe: "Or", statut: "Actif", avatarBg: "bg-emerald-100 text-emerald-700" },
  { id: "10", code: "CLI-01255", nom: "Yao", prenoms: "Grâce", initials: "GY", phone: "+225 01 53 78 90 12", agency: "Cocody", lastDeposit: "10 sept. • 16:44", daysAgo: 18, frequence: "1,1 / mois", valeur: "154 700 FCFA", points: 980, groupe: "Essentiel", statut: "Actif", avatarBg: "bg-violet-100 text-violet-700" },
  { id: "11", code: "CLI-01098", nom: "Diarra", prenoms: "Moussa", initials: "MD", phone: "+225 07 47 11 36 58", agency: "Marcory", lastDeposit: "07 sept. • 09:15", daysAgo: 21, frequence: "0,9 / mois", valeur: "121 400 FCFA", points: 760, groupe: "Essentiel", statut: "Actif", avatarBg: "bg-orange-100 text-orange-700" },
  { id: "12", code: "CLI-01044", nom: "Bah", prenoms: "Aïcha", initials: "AB", phone: "+225 05 74 29 63 80", agency: "Bingerville", lastDeposit: "03 sept. • 13:52", daysAgo: 25, frequence: "3,1 / mois", valeur: "529 600 FCFA", points: 3870, groupe: "Platine", statut: "VIP", avatarBg: "bg-sky-100 text-sky-700" },
  { id: "13", code: "CLI-00971", nom: "Kouassi", prenoms: "Franck", initials: "FK", phone: "+225 05 04 99 31 08", agency: "Riviera 3", lastDeposit: "02 août • 13:16", daysAgo: 57, frequence: "0,1 / mois", valeur: "44 500 FCFA", points: 80, groupe: "Essentiel", statut: "Archivé", avatarBg: "bg-stone-200 text-stone-600" },
  { id: "14", code: "CLI-00933", nom: "Ouattara", prenoms: "Kader", initials: "KO", phone: "+225 01 42 87 15 69", agency: "Plateau", lastDeposit: "29 août • 10:02", daysAgo: 30, frequence: "1,5 / mois", valeur: "198 300 FCFA", points: 1340, groupe: "Argent", statut: "Actif", avatarBg: "bg-emerald-100 text-emerald-700" },
  { id: "15", code: "CLI-00890", nom: "Sylla", prenoms: "Aminata", initials: "AS", phone: "+225 07 68 52 40 17", agency: "Cocody", lastDeposit: "24 août • 15:37", daysAgo: 35, frequence: "0,6 / mois", valeur: "87 900 FCFA", points: 410, groupe: "Essentiel", statut: "Inactif", avatarBg: "bg-rose-100 text-rose-700" },
  { id: "16", code: "CLI-00812", nom: "Kouamé", prenoms: "Yao", initials: "YK", phone: "+225 05 55 18 72 44", agency: "Marcory", lastDeposit: "19 août • 11:26", daysAgo: 40, frequence: "2,2 / mois", valeur: "366 100 FCFA", points: 2690, groupe: "Or", statut: "Actif", avatarBg: "bg-amber-100 text-amber-700" },
  { id: "17", code: "CLI-00764", nom: "Mensah", prenoms: "Adjoua", initials: "AM", phone: "+225 01 70 33 28 91", agency: "Riviera 3", lastDeposit: "12 août • 09:48", daysAgo: 47, frequence: "1,0 / mois", valeur: "132 800 FCFA", points: 870, groupe: "Essentiel", statut: "Actif", avatarBg: "bg-violet-100 text-violet-700" },
  { id: "18", code: "CLI-00721", nom: "Koné", prenoms: "Seydou", initials: "SK", phone: "+225 07 08 91 57 23", agency: "Bingerville", lastDeposit: "28 juil. • 17:05", daysAgo: 62, frequence: "0,4 / mois", valeur: "59 200 FCFA", points: 190, groupe: "Essentiel", statut: "Inactif", avatarBg: "bg-slate-200 text-slate-600" },
  { id: "19", code: "CLI-00688", nom: "N'Da", prenoms: "Akissi", initials: "AN", phone: "+225 05 61 74 09 36", agency: "Cocody", lastDeposit: "20 juil. • 12:11", daysAgo: 70, frequence: "2,7 / mois", valeur: "441 500 FCFA", points: 3120, groupe: "Or", statut: "Actif", avatarBg: "bg-amber-100 text-amber-700" },
  { id: "20", code: "CLI-00654", nom: "Kane", prenoms: "Mamadou", initials: "MK", phone: "+225 01 66 05 83 49", agency: "Plateau", lastDeposit: "09 juil. • 08:59", daysAgo: 81, frequence: "1,8 / mois", valeur: "287 400 FCFA", points: 1980, groupe: "Argent", statut: "Actif", avatarBg: "bg-sky-100 text-sky-700" },
  { id: "21", code: "CLI-00602", nom: "Diallo", prenoms: "Awa", initials: "AD", phone: "+225 07 79 46 12 65", agency: "Marcory", lastDeposit: "29 juin • 14:33", daysAgo: 91, frequence: "0,5 / mois", valeur: "73 600 FCFA", points: 320, groupe: "Essentiel", statut: "Archivé", avatarBg: "bg-stone-200 text-stone-600" },
  { id: "22", code: "CLI-00571", nom: "Cissé", prenoms: "Idrissa", initials: "IC", phone: "+225 05 48 90 37 52", agency: "Bingerville", lastDeposit: "18 juin • 10:47", daysAgo: 102, frequence: "3,3 / mois", valeur: "598 200 FCFA", points: 4310, groupe: "Platine", statut: "VIP", avatarBg: "bg-emerald-100 text-emerald-700" },
  { id: "23", code: "CLI-00519", nom: "Affoué", prenoms: "N'Guessan", initials: "NA", phone: "+225 01 57 62 94 08", agency: "Riviera 3", lastDeposit: "05 juin • 16:22", daysAgo: 115, frequence: "0,7 / mois", valeur: "91 300 FCFA", points: 540, groupe: "Essentiel", statut: "Inactif", avatarBg: "bg-orange-100 text-orange-700" },
  { id: "24", code: "CLI-00487", nom: "Traoré", prenoms: "Mariam", initials: "MT", phone: "+225 07 31 08 65 94", agency: "Cocody", lastDeposit: "27 mai • 09:30", daysAgo: 124, frequence: "1,3 / mois", valeur: "176 900 FCFA", points: 1150, groupe: "Argent", statut: "Actif", avatarBg: "bg-rose-100 text-rose-700" },
];

export const FIDELITE_TOTAUX: { key: FideliteGroupe | "Tous"; label: string; total: string }[] = [
  { key: "Tous", label: "Tous", total: "2 846" },
  { key: "Essentiel", label: "Essentiel", total: "1 624" },
  { key: "Argent", label: "Argent", total: "738" },
  { key: "Or", label: "Or", total: "358" },
  { key: "Platine", label: "Platine", total: "126" },
];

export const AGENCES = ["Bingerville", "Cocody", "Riviera 3", "Plateau", "Marcory"];

/** Normalise un numéro pour la détection de doublons (chiffres uniquement). */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Retrouve un client existant à partir d'un numéro (compare les 8 derniers chiffres). */
export function findDuplicateByPhone(phone: string): Client | undefined {
  const digits = normalizePhone(phone);
  if (digits.length < 8) return undefined;
  const tail = digits.slice(-8);
  return CLIENTS.find((c) => normalizePhone(c.phone).endsWith(tail));
}
