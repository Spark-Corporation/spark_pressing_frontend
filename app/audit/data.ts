export type AuditStatus = "Succès" | "Échec" | "À vérifier";
export type AuditSeverity = "Information" | "Attention" | "Critique";
export type AuditCategory =
  | "Opérations"
  | "Paiements"
  | "Paramétrage"
  | "Impression"
  | "Synchronisation";

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  agency: string;
  category: AuditCategory;
  action: string;
  summary: string;
  resource: string;
  status: AuditStatus;
  severity: AuditSeverity;
  source: string;
  ipAddress: string;
  before?: string;
  after?: string;
  reason?: string;
  relatedRecords: { label: string; value: string }[];
  timeline: { title: string; description: string; timestamp: string }[];
  integrity: { algorithm: string; hash: string; previousHash: string };
}

const timestamp = (hour: number, minute: number, daysAgo = 0) => {
  const date = new Date(Date.UTC(2026, 10, 5, hour, minute));
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString();
};

export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "EVT-20261105-0042",
    timestamp: timestamp(10, 42),
    actor: "Aïcha Koné",
    role: "Administratrice réseau",
    agency: "Bingerville",
    category: "Paramétrage",
    action: "Tarif modifié",
    summary: "Le tarif « Costume deux pièces » a été mis à jour.",
    resource: "Article • COST-002",
    status: "Succès",
    severity: "Attention",
    source: "Web • Chrome / Windows",
    ipAddress: "192.0.2.42",
    before: "12 000 FCFA",
    after: "14 500 FCFA",
    reason: "Mise à jour de la grille tarifaire",
    relatedRecords: [
      { label: "Article lié", value: "COST-002 • Costume deux pièces" },
      { label: "Agence concernée", value: "Bingerville • Toutes les caisses" },
      { label: "Configuration", value: "Grille tarifaire • Version 18" },
    ],
    timeline: [
      { title: "Authentification réussie", description: "Session administrateur confirmée.", timestamp: timestamp(10, 40) },
      { title: "Modification du tarif", description: "COST-002 • 12 000 → 14 500 FCFA.", timestamp: timestamp(10, 42) },
      { title: "Validation enregistrée", description: "La nouvelle valeur est active pour l’agence.", timestamp: timestamp(10, 42) },
      { title: "Événement scellé", description: "Empreinte d’intégrité ajoutée au journal.", timestamp: timestamp(10, 42) },
    ],
    integrity: {
      algorithm: "SHA-256",
      hash: "a93f74c6b81d02e91afc5483310d09c4",
      previousHash: "5d3a1c8b7e9240fa6e31d285bc009471",
    },
  },
  {
    id: "EVT-20261105-0039",
    timestamp: timestamp(10, 31),
    actor: "Nadia Assi",
    role: "Responsable d’agence",
    agency: "Bingerville",
    category: "Opérations",
    action: "Dépôt créé",
    summary: "Un dépôt a été créé et remis en atelier.",
    resource: "Dépôt • DEP-BIN-1842",
    status: "Succès",
    severity: "Information",
    source: "Web • Spark Pressing",
    ipAddress: "192.0.2.18",
    after: "Statut : En traitement",
    reason: "Prise en charge au comptoir",
    relatedRecords: [
      { label: "Dépôt lié", value: "DEP-BIN-1842 • 3 articles" },
      { label: "Agence concernée", value: "Bingerville • Comptoir 1" },
      { label: "Client", value: "CLT-00814 • Référence pseudonymisée" },
    ],
    timeline: [
      { title: "Dépôt enregistré", description: "Référence attribuée par l’agence.", timestamp: timestamp(10, 30) },
      { title: "Paiement rapproché", description: "Paiement initial associé au dépôt.", timestamp: timestamp(10, 31) },
      { title: "Événement scellé", description: "Empreinte d’intégrité ajoutée au journal.", timestamp: timestamp(10, 31) },
    ],
    integrity: {
      algorithm: "SHA-256",
      hash: "e10b82c7a6d1f349c82710aa3f915b64",
      previousHash: "a93f74c6b81d02e91afc5483310d09c4",
    },
  },
  {
    id: "EVT-20261105-0035",
    timestamp: timestamp(10, 18),
    actor: "Mariam Traoré",
    role: "Caissière",
    agency: "Plateau",
    category: "Paiements",
    action: "Paiement encaissé",
    summary: "Un règlement a été enregistré sur un dépôt.",
    resource: "Paiement • PAY-728184",
    status: "Succès",
    severity: "Information",
    source: "Caisse • Terminal 02",
    ipAddress: "192.0.2.35",
    after: "18 000 FCFA • Espèces",
    reason: "Règlement du solde",
    relatedRecords: [
      { label: "Paiement lié", value: "PAY-728184 • Espèces" },
      { label: "Dépôt lié", value: "DEP-PLA-0831" },
      { label: "Agence concernée", value: "Plateau • Caisse 02" },
    ],
    timeline: [
      { title: "Paiement initié", description: "Saisie du montant au terminal de caisse.", timestamp: timestamp(10, 17) },
      { title: "Paiement confirmé", description: "Le règlement a été rapproché du dépôt.", timestamp: timestamp(10, 18) },
      { title: "Événement scellé", description: "Empreinte d’intégrité ajoutée au journal.", timestamp: timestamp(10, 18) },
    ],
    integrity: {
      algorithm: "SHA-256",
      hash: "30ac709b6d4185efc823ab67f99410d2",
      previousHash: "e10b82c7a6d1f349c82710aa3f915b64",
    },
  },
  {
    id: "EVT-20261105-0031",
    timestamp: timestamp(9, 56),
    actor: "Mariam Traoré",
    role: "Caissière",
    agency: "Plateau",
    category: "Paiements",
    action: "Annulation demandée",
    summary: "Une annulation attend la validation d’un responsable.",
    resource: "Paiement • PAY-728106",
    status: "À vérifier",
    severity: "Critique",
    source: "Caisse • Terminal 02",
    ipAddress: "192.0.2.35",
    before: "18 000 FCFA • Encaissé",
    after: "Annulation en attente",
    reason: "Erreur de saisie signalée par l’opératrice",
    relatedRecords: [
      { label: "Paiement lié", value: "PAY-728106 • Annulation en attente" },
      { label: "Dépôt lié", value: "DEP-PLA-0827" },
      { label: "Validation", value: "Responsable d’agence requise" },
    ],
    timeline: [
      { title: "Demande d’annulation", description: "Motif fourni par l’opératrice.", timestamp: timestamp(9, 55) },
      { title: "Validation requise", description: "Le paiement reste inchangé jusqu’à approbation.", timestamp: timestamp(9, 56) },
    ],
    integrity: {
      algorithm: "SHA-256",
      hash: "b01c38f9e45a762db490a632f88104ce",
      previousHash: "30ac709b6d4185efc823ab67f99410d2",
    },
  },
  {
    id: "EVT-20261105-0028",
    timestamp: timestamp(9, 42),
    actor: "Imprimante comptoir",
    role: "Service d’impression",
    agency: "Cocody Angré",
    category: "Impression",
    action: "Ticket imprimé",
    summary: "Le ticket de dépôt a été imprimé avec succès.",
    resource: "Ticket • TKT-ANG-2241",
    status: "Succès",
    severity: "Information",
    source: "Local • SPK-ANG-01",
    ipAddress: "192.0.2.28",
    after: "1 exemplaire • 2 pages",
    relatedRecords: [
      { label: "Ticket lié", value: "TKT-ANG-2241" },
      { label: "Dépôt lié", value: "DEP-ANG-2241" },
      { label: "Imprimante", value: "Comptoir • SPK-ANG-01" },
    ],
    timeline: [
      { title: "Document préparé", description: "Gabarit reçu par le service d’impression.", timestamp: timestamp(9, 42) },
      { title: "Impression terminée", description: "1 exemplaire transmis sans erreur.", timestamp: timestamp(9, 42) },
    ],
    integrity: {
      algorithm: "SHA-256",
      hash: "c4f291a70de3586b129f47a8c036e5d1",
      previousHash: "b01c38f9e45a762db490a632f88104ce",
    },
  },
  {
    id: "EVT-20261105-0024",
    timestamp: timestamp(9, 21),
    actor: "Service de synchronisation",
    role: "Synchronisation locale",
    agency: "Marcory",
    category: "Synchronisation",
    action: "Synchronisation réconciliée",
    summary: "Les opérations locales ont été rapprochées du serveur.",
    resource: "Lot offline • SYNC-MAR-091",
    status: "À vérifier",
    severity: "Attention",
    source: "Local → Serveur",
    ipAddress: "192.0.2.24",
    before: "Référence locale : TMP-MAR-091",
    after: "Référence serveur : DEP-MAR-091",
    reason: "Connexion rétablie après une période hors ligne",
    relatedRecords: [
      { label: "Lot de synchronisation", value: "SYNC-MAR-091 • 5 opérations" },
      { label: "Référence temporaire", value: "TMP-MAR-091" },
      { label: "Référence serveur", value: "DEP-MAR-091" },
    ],
    timeline: [
      { title: "Connexion rétablie", description: "Le terminal a retrouvé le réseau.", timestamp: timestamp(9, 19) },
      { title: "Lot transmis", description: "5 opérations envoyées au serveur.", timestamp: timestamp(9, 20) },
      { title: "Références rapprochées", description: "1 opération nécessite une vérification.", timestamp: timestamp(9, 21) },
    ],
    integrity: {
      algorithm: "SHA-256",
      hash: "a8e7c13b95d0426f8b310a4ce67952fd",
      previousHash: "c4f291a70de3586b129f47a8c036e5d1",
    },
  },
  {
    id: "EVT-20261105-0018",
    timestamp: timestamp(8, 48, 10),
    actor: "Nadia Assi",
    role: "Responsable d’agence",
    agency: "Bingerville",
    category: "Paramétrage",
    action: "Rôle mis à jour",
    summary: "Les habilitations d’un rôle d’agence ont été modifiées.",
    resource: "Rôle • ROLE-AG-04",
    status: "Succès",
    severity: "Attention",
    source: "Web • Chrome / Windows",
    ipAddress: "192.0.2.18",
    before: "Export des journaux : désactivé",
    after: "Export des journaux : activé",
    reason: "Accès accordé pour les contrôles de fin de journée",
    relatedRecords: [
      { label: "Rôle concerné", value: "ROLE-AG-04 • Responsable d’agence" },
      { label: "Agence concernée", value: "Bingerville" },
      { label: "Habilitation", value: "Consultation et export d’audit" },
    ],
    timeline: [
      { title: "Modification des habilitations", description: "L’export des journaux a été activé.", timestamp: timestamp(8, 48, 10) },
      { title: "Événement scellé", description: "Empreinte d’intégrité ajoutée au journal.", timestamp: timestamp(8, 48, 10) },
    ],
    integrity: {
      algorithm: "SHA-256",
      hash: "7f2ab904c8516d30eac1725b4893d601",
      previousHash: "a8e7c13b95d0426f8b310a4ce67952fd",
    },
  },
  {
    id: "EVT-20261105-0012",
    timestamp: timestamp(8, 16, 24),
    actor: "Service de synchronisation",
    role: "Synchronisation locale",
    agency: "Cocody Angré",
    category: "Synchronisation",
    action: "Envoi hors ligne échoué",
    summary: "Un lot local n’a pas pu être envoyé au serveur.",
    resource: "Lot offline • SYNC-ANG-088",
    status: "Échec",
    severity: "Critique",
    source: "Local • SPK-ANG-02",
    ipAddress: "192.0.2.12",
    before: "3 opérations en attente",
    after: "Envoi différé • aucune donnée supprimée",
    reason: "Délai de connexion dépassé",
    relatedRecords: [
      { label: "Lot de synchronisation", value: "SYNC-ANG-088 • 3 opérations" },
      { label: "Dernier accusé serveur", value: "08:02 • Référence ACK-ANG-507" },
      { label: "Terminal", value: "SPK-ANG-02 • Cocody Angré" },
    ],
    timeline: [
      { title: "Envoi lancé", description: "Le terminal a transmis 3 opérations en attente.", timestamp: timestamp(8, 15, 24) },
      { title: "Délai dépassé", description: "Le lot est conservé localement pour une nouvelle tentative.", timestamp: timestamp(8, 16, 24) },
    ],
    integrity: {
      algorithm: "SHA-256",
      hash: "29d7e10a8fc634b1d560af3482c97e05",
      previousHash: "7f2ab904c8516d30eac1725b4893d601",
    },
  },
];
