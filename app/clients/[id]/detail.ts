import type { ApiClientDetail } from "@/lib/types";
import { formatClientMoney, mapApiClient } from "../client-mapper";
import type { Client } from "../data";

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
  statut: string;
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
  pointValuePerPoint: number;
  loyaltyTier: string;
  nextNiveau: string;
  nextAt: number;
  progress: number;
  conversionPoints: number;
  conversionValue: number;
  minimumPoints: number;
  pointEvents: PointEvent[];
  timeline: TimelineItem[];
  commandes: Commande[];
  totalCommandes: number;
  prefs: { canal: string; creneau: string; traitement: string; instructions: string };
  notes: ClientNote[];
  notesCount: number;
  depuisLe: string;
  consentement: string;
  consentSms: boolean;
  consentEmail: boolean;
}

function formatDate(value: string, withTime = false): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", withTime
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "long", year: "numeric" });
}

export function mapClientDetail(apiClient: ApiClientDetail): { client: Client; detail: ClientDetail } {
  const client = mapApiClient(apiClient);
  const stats = apiClient.stats;
  const loyalty = apiClient.loyalty;
  const conversion = loyalty.conversion;
  const pointValuePerPoint = conversion.points > 0 ? conversion.value / conversion.points : 0;

  return {
    client,
    detail: {
      valeurVie: formatClientMoney(stats.lifetime_value),
      depuis: `Depuis le ${formatDate(stats.client_since)}`,
      depots: stats.deposits,
      frequence: `${stats.frequency_per_month.toLocaleString("fr-FR")} dépôts par mois`,
      panier: formatClientMoney(stats.average_basket),
      panierDelta: `${stats.average_basket_delta_percent_6m >= 0 ? "+" : ""}${stats.average_basket_delta_percent_6m?.toLocaleString("fr-FR")} % sur 6 mois`,
      solde: formatClientMoney(stats.balance_due),
      points: loyalty.points,
      pointValue: formatClientMoney(loyalty.value),
      pointValuePerPoint,
      loyaltyTier: loyalty.tier.label,
      nextNiveau: loyalty.next_tier?.label.toUpperCase() ?? "NIVEAU MAXIMUM",
      nextAt: loyalty.points_to_next_tier,
      progress: loyalty.progress_percent,
      conversionPoints: conversion.points,
      conversionValue: conversion.value,
      minimumPoints: conversion.minimum_points,
      pointEvents: apiClient.points_history.map((event) => ({
        label: event.label,
        date: formatDate(event.at),
        ref: event.reference || event.reason,
        delta: event.points,
      })),
      timeline: apiClient.timeline.map((item) => ({
        type: (item.type === "retrieve" ? "retrait" : "depot") as "retrait" | "depot",
        title: item.title,
        detail: item.detail,
        ref: item.reference,
        date: formatDate(item.at, true),
      })),
      commandes: apiClient.recent_orders.map((order) => ({
        ref: order.code,
        date: formatDate(order.date),
        articles: `${order.articles} article${order.articles > 1 ? "s" : ""}`,
        montant: formatClientMoney(order.total),
        statut: order.status.label,
      })),
      totalCommandes: stats.deposits,
      prefs: {
        canal: apiClient.preferences.contact_channel,
        creneau: apiClient.preferences.pickup_slot,
        traitement: apiClient.preferences.favorite_treatment,
        instructions: apiClient.preferences.instructions,
      },
      notes: apiClient.notes.items.map((note) => ({
        text: note.body,
        author: note.author,
        date: formatDate(note.created_at),
      })),
      notesCount: apiClient.notes.count,
      depuisLe: formatDate(apiClient.account.client_since),
      consentement: apiClient.account.marketing_consent ? "Autorisé" : "Non autorisé",
      consentSms: apiClient.account.consents.sms,
      consentEmail: apiClient.account.consents.email,
    },
  };
}
