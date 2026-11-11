import type { ApiClient } from "@/lib/types";
import type { Client } from "./data";

export function formatClientMoney(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

function mapClientStatus(client: ApiClient): Client["statut"] {
  const code = client.crm_status?.code.toLowerCase();
  const label = client.crm_status?.label.trim().toLowerCase();
  if (client.archived_at || code === "archived" || label === "archivé" || label === "archived") {
    return "Archivé";
  }
  if (code === "vip" || label === "vip") return "VIP";
  if (code === "inactive" || label === "inactif") return "Inactif";
  if (code === "active" || label === "actif") return "Actif";
  return client.status ? "Actif" : "Inactif";
}

export function mapApiClient(client: ApiClient): Client {
  const nameParts = (client.fullname || "").trim().split(/\s+/).filter(Boolean);
  const prenoms = client.first_name?.trim() || nameParts[0] || "";
  const nom = client.last_name?.trim() || nameParts.slice(1).join(" ");
  const fullname = client.fullname?.trim() || [prenoms, nom].filter(Boolean).join(" ") || "Client sans nom";
  const initials = client.initials?.trim() || `${prenoms.charAt(0)}${nom.charAt(0)}`.toUpperCase() || "?";
  const parsedDate = client.last_deposit_at ? new Date(client.last_deposit_at) : null;
  const date = parsedDate && Number.isFinite(parsedDate.getTime()) ? parsedDate : null;
  const lastDeposit = date
    ? date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) + " • " + date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : "—";
  const daysAgo = date ? Math.floor((Date.now() - date.getTime()) / 86400000) : 999;
  const groupe = client.tier?.label?.trim() || client.tier?.code?.trim() || "Non classé";
  const contactPreference = client.contact_preference;

  return {
    id: String(client.id),
    code: client.code,
    nom,
    prenoms,
    fullname,
    initials,
    phone: client.phone_number,
    phoneSecondary: client.phone_secondary,
    email: client.email,
    agency: client.agency?.name || client.city || "—",
    city: client.city,
    address: client.address,
    lastDeposit,
    daysAgo,
    frequence: client.frequency_per_month == null
      ? "—"
      : `${client.frequency_per_month.toLocaleString("fr-FR")} / mois`,
    valeur: formatClientMoney(client.lifetime_value),
    soldePortefeuille: formatClientMoney(client.wallet_balance),
    depositsCount: client.deposits_count,
    frequencyPerMonth: client.frequency_per_month,
    lifetimeValue: client.lifetime_value,
    points: client.loyalty_points ?? 0,
    groupe,
    statut: mapClientStatus(client),
    avatarBg: groupe.toLowerCase() === "or"
      ? "bg-amber-100 text-amber-700"
      : groupe.toLowerCase() === "platine"
        ? "bg-sky-100 text-sky-700"
        : "bg-slate-200 text-slate-600",
    sponsorCode: client.sponsor_code,
    referredById: client.referred_by_id,
    contactPreference: typeof contactPreference === "string"
      ? contactPreference
      : contactPreference?.label ?? contactPreference?.code ?? null,
    consentSms: client.consent_sms,
    consentEmail: client.consent_email,
    archivedAt: client.archived_at,
  };
}
