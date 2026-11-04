"use server";

import { cookies } from "next/headers";
import { api, API_BACKEND_URL } from "@/lib/api-client";
import { LoginResult } from "@/lib/types";
import { CashCenterData } from "@/app/caisse/types";
import {
  DailyReportData,
  DailyReportParams,
  ReportsExportFile,
  ReportsOverviewData,
  ReportsOverviewParams,
} from "@/app/rapports/types";
import {
  RolesData,
  TeamOverviewData,
  TeamUsersEnvelope,
  TeamUsersParams,
} from "@/app/equipe/types";
import {
  NetworkAgencyDetailData,
  NetworkOverviewData,
  NetworkOverviewParams,
} from "@/app/multi-agences/types";
import type {
  ArticleCategoriesEnvelope,
  ArticleDetailEnvelope,
  ArticlesEnvelope,
  ArticlesHistoryEnvelope,
  RetrievalCenterEnvelope,
} from "@/lib/types";




// ------------------------- AUTHENTIFICATION ---------------------------------
export async function loginAction(params?: { email: string; password: string }) {
  try {
    const result = await api.post("/auth/staff/login", params);
    const payload = (result?.data ?? result) as LoginResult;
    if (!payload?.token || !payload?.user) {
      throw new Error("Réponse inattendue du serveur.");
    }
    return { success: true, data: payload };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}



// ------------------------- CLIENTS ---------------------------------
export async function getClientsAction() {
  try {
    const result = await api.get("/clients");
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ------------------------- ARTICLES ---------------------------------
export async function getArticlesAction(): Promise<
  | { success: true; data: ArticlesEnvelope }
  | { success: false; error: string }
> {
  try {
    const result = await api.get("/articles");
    if (!result || !Array.isArray(result.data) || !result.meta) {
      throw new Error("Réponse inattendue du serveur pour les articles.");
    }
    return { success: true, data: result as ArticlesEnvelope };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getArticleCategoriesAction(): Promise<
  | { success: true; data: ArticleCategoriesEnvelope }
  | { success: false; error: string }
> {
  try {
    const result = await api.get("/article-categories");
    if (!result || !Array.isArray(result.data)) {
      throw new Error("Réponse inattendue du serveur pour les catégories d’articles.");
    }
    return { success: true, data: result as ArticleCategoriesEnvelope };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getArticleDetailAction(
  code: string,
): Promise<
  | { success: true; data: ArticleDetailEnvelope }
  | { success: false; error: string }
> {
  try {
    const result = await api.get(`/articles/${encodeURIComponent(code)}`);
    if (!result || typeof result !== "object" || result.data === undefined) {
      throw new Error("Réponse inattendue du serveur pour l’article.");
    }
    return { success: true, data: result as ArticleDetailEnvelope };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getArticlesHistoryAction(): Promise<
  | { success: true; data: ArticlesHistoryEnvelope }
  | { success: false; error: string }
> {
  try {
    const result = await api.get("/articles/history");
    if (!result || !Array.isArray(result.data)) {
      throw new Error("Réponse inattendue du serveur pour l’historique des articles.");
    }
    return { success: true, data: result as ArticlesHistoryEnvelope };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ------------------------- DASHBOARD ---------------------------------
export async function getDashboardAction() {
  try {
    const result = await api.get("/dashboard");
    return { success: true, data: result.data ?? result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ------------------------- DEPOSITS ---------------------------------
export async function getDepositsAction() {
  try {
    const result = await api.get("/deposits");
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ------------------------- ATELIER ---------------------------------
export async function getWorkshopAction() {
  try {
    const result = await api.get("/deposits/workshop");
    const data = result?.data ?? result;
    if (!data?.capacity || !data?.board) {
      throw new Error("Réponse inattendue du serveur pour l'atelier.");
    }
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ------------------------- RETRAITS ---------------------------------
export async function getRetrievalCenterAction(): Promise<
  | { success: true; data: RetrievalCenterEnvelope }
  | { success: false; error: string }
> {
  try {
    const result = await api.get("/retrievals/center");
    if (!result || !Array.isArray(result.data) || !result.meta) {
      throw new Error("Réponse inattendue du serveur pour le centre de retrait.");
    }
    return { success: true, data: result as RetrievalCenterEnvelope };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ------------------------- RAPPORTS ---------------------------------
export async function getReportsOverviewAction(
  params?: ReportsOverviewParams,
): Promise<
  | { success: true; data: ReportsOverviewData }
  | { success: false; error: string }
> {
  try {
    const search = new URLSearchParams();
    if (params?.preset) search.set("preset", params.preset);
    if (params?.date_from) search.set("date_from", params.date_from);
    if (params?.date_to) search.set("date_to", params.date_to);
    if (params?.agency_id && params.agency_id !== "all") {
      search.set("agency_id", String(params.agency_id));
    }
    const qs = search.toString();
    const result = await api.get(`/reports/overview${qs ? `?${qs}` : ""}`);
    const data = result?.data ?? result;
    if (!data?.period || !data?.kpis) {
      throw new Error("Réponse inattendue du serveur pour les rapports.");
    }
    return { success: true, data: data as ReportsOverviewData };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function exportReportsAction(
  endpoint: "/reports/overview" | "/reports/daily",
  format: "csv" | "pdf",
  params?: ReportsOverviewParams & DailyReportParams,
): Promise<
  | { success: true; data: ReportsExportFile }
  | { success: false; error: string }
> {
  try {
    const search = new URLSearchParams();
    if (params?.preset) search.set("preset", params.preset);
    if (params?.date_from) search.set("date_from", params.date_from);
    if (params?.date_to) search.set("date_to", params.date_to);
    if (params?.date) search.set("date", params.date);
    if (params?.agency_id && params.agency_id !== "all") {
      search.set("agency_id", String(params.agency_id));
    }
    search.set("format", format);

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const res = await fetch(`${API_BACKEND_URL}${endpoint}?${search.toString()}`, {
      headers: {
        Accept: format === "csv" ? "text/csv" : "application/pdf",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Non autorisé. Veuillez vous connecter.");
      }
      const error = await res.json().catch(() => null);
      const message =
        error?.details || error?.error || error?.message || "L'export du rapport a échoué.";
      throw new Error(message);
    }
    const mime =
      res.headers.get("content-type") ?? (format === "csv" ? "text/csv" : "application/pdf");
    const buffer = Buffer.from(await res.arrayBuffer());
    const stamp = new Date().toISOString().slice(0, 10);
    const slug = endpoint.replace(/^\/reports\//, "");
    return {
      success: true,
      data: {
        base64: buffer.toString("base64"),
        mime,
        filename: `${slug}-${stamp}.${format}`,
      },
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ------------------------- RAPPORTS : BILAN JOURNALIER ---------------------------------
export async function getReportsDailyAction(
  params?: DailyReportParams,
): Promise<
  | { success: true; data: DailyReportData }
  | { success: false; error: string }
> {
  try {
    const search = new URLSearchParams();
    if (params?.date) search.set("date", params.date);
    if (params?.agency_id && params.agency_id !== "all") {
      search.set("agency_id", String(params.agency_id));
    }
    const qs = search.toString();
    const result = await api.get(`/reports/daily${qs ? `?${qs}` : ""}`);
    const data = result?.data ?? result;
    if (!data?.date || !data?.kpis) {
      throw new Error("Réponse inattendue du serveur pour le bilan journalier.");
    }
    return { success: true, data: data as DailyReportData };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ------------------------- RÉSEAU : VUE CONSOLIDÉE MULTI-AGENCES ---------------------------------
export async function getNetworkOverviewAction(
  params?: NetworkOverviewParams,
): Promise<
  | { success: true; data: NetworkOverviewData }
  | { success: false; error: string }
> {
  try {
    const search = new URLSearchParams();
    if (params?.date_from) search.set("date_from", params.date_from);
    if (params?.date_to) search.set("date_to", params.date_to);
    const qs = search.toString();
    // Mois en cours par défaut côté API si aucune période transmise.
    const result = await api.get(`/network/overview${qs ? `?${qs}` : ""}`);
    const data = result?.data ?? result;
    if (!data?.period || !data?.kpis) {
      throw new Error("Réponse inattendue du serveur pour la vue multi-agences.");
    }
    return { success: true, data: data as NetworkOverviewData };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ------------------------- RÉSEAU : DÉTAIL AGENCE ---------------------------------
export async function getNetworkAgencyAction(
  params?: { agency_id: number | string },
): Promise<
  | { success: true; data: NetworkAgencyDetailData }
  | { success: false; error: string }
> {
  try {
    const agencyId = params?.agency_id;
    if (!agencyId) {
      throw new Error("Agence inconnue. Veuillez réessayer.");
    }
    const result = await api.get(`/network/agencies/${agencyId}`);
    const data = result?.data ?? result;
    if (!data?.agency || !data?.kpis) {
      throw new Error("Réponse inattendue du serveur pour le détail de l'agence.");
    }
    return { success: true, data: data as NetworkAgencyDetailData };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ------------------------- ÉQUIPE : OVERVIEW ---------------------------------
export async function getTeamOverviewAction(): Promise<
  | { success: true; data: TeamOverviewData }
  | { success: false; error: string }
> {
  try {
    const result = await api.get("/team/overview");
    const data = result?.data ?? result;
    if (!data?.kpis || !data?.tabs) {
      throw new Error("Réponse inattendue du serveur pour l'équipe.");
    }
    return { success: true, data: data as TeamOverviewData };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ------------------------- ÉQUIPE : UTILISATEURS ---------------------------------
export async function getTeamUsersAction(
  params?: TeamUsersParams,
): Promise<
  | { success: true; data: TeamUsersEnvelope }
  | { success: false; error: string }
> {
  try {
    const search = new URLSearchParams();
    search.set("page", String(params?.page ?? 1));
    search.set("per_page", String(params?.per_page ?? 200));
    const result = await api.get(`/team/users?${search.toString()}`);
    const data = Array.isArray(result)
      ? { data: result }
      : Array.isArray(result?.data)
        ? result
        : result?.data ?? result;
    if (!data || !Array.isArray(data.data)) {
      throw new Error("Réponse inattendue du serveur pour les utilisateurs.");
    }
    return { success: true, data: data as TeamUsersEnvelope };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ------------------------- ÉQUIPE : RÔLES ---------------------------------
export async function getRolesAction(): Promise<
  | { success: true; data: RolesData }
  | { success: false; error: string }
> {
  try {
    const result = await api.get("/roles");
    const data = result?.data ?? result;
    if (!data || !Array.isArray(data.roles)) {
      throw new Error("Réponse inattendue du serveur pour les rôles.");
    }
    return { success: true, data: data as RolesData };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ------------------------- CAISSE ---------------------------------
type CashCenterActionResult =
  | { success: true; data: CashCenterData }
  | { success: false; error: string };

export async function getCashCenterAction(): Promise<CashCenterActionResult> {
  try {
    const result = await api.get("/cash/center");
    const data = result?.data ?? result;
    if (!data?.session || !data?.kpis || !data?.situation || !data?.journal_totals) {
      throw new Error("Réponse inattendue du serveur pour le centre de caisse.");
    }
    return { success: true, data: data as CashCenterData };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
