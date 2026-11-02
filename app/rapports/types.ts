export type ReportsPreset = "today" | "7d" | "30d";

export interface ReportsOverviewParams {
  date_from?: string;
  date_to?: string;
  preset?: ReportsPreset;
  agency_id?: number | string;
}

export interface ReportsPeriod {
  from: string;
  to: string;
  compare_from: string;
  compare_to: string;
}

export interface ReportsKpi {
  value: number;
  delta_percent?: number;
  average_basket?: number;
  share_of_revenue?: number;
}

export interface ReportsRevenuePoint {
  date: string;
  revenue: number;
  sales: number;
  average_basket: number;
}

export interface ReportsAgencyRow {
  agency_id: number;
  name: string;
  revenue: number;
  sales: number;
  average_basket: number;
  delta_percent: number;
}

export interface ReportsPaymentMethod {
  code: string;
  label: string;
  amount: number;
  percent: number;
}

export interface ReportsOverviewData {
  period: ReportsPeriod;
  agency_id: number | null;
  kpis: {
    revenue: ReportsKpi;
    sales: ReportsKpi;
    discounts: ReportsKpi;
    unpaid: ReportsKpi;
  };
  revenue_chart: {
    series: ReportsRevenuePoint[];
    totals: { current: number; previous: number; projection: number };
    objective: { target: number; percent: number };
  };
  payments: {
    total: number;
    methods: ReportsPaymentMethod[];
  };
  non_sales_movements: {
    cash_in: number;
    cash_out: number;
    theoretical_balance: number;
  };
  agencies: ReportsAgencyRow[];
  loyalty: {
    active_members: number;
    points_issued: number;
    points_used: number;
    retention_percent: number;
  };
  reports: {
    code: string;
    label: string;
    detail: string;
    endpoint: string;
  }[];
}

export interface ReportsExportFile {
  base64: string;
  mime: string;
  filename: string;
}

/* ------------------------------ Bilan journalier ------------------------------ */

export interface DailyCashierRow {
  user_id: number;
  fullname: string;
  session: { status: string; at: string | null };
  receipts: number;
  sales: number;
  average_basket: number;
  productivity_percent: number;
  gap: number | null;
}

export interface DailyReportData {
  date: string;
  agency: string;
  kpis: {
    receipts: { value: number; delta_percent: number; compared_to: string };
    settled_sales: { value: number; share_percent: number };
    open_unpaid: { value: number; deposits: number };
    cash_gap: { value: number; tolerance: number; within_tolerance: boolean };
  };
  receipts_chart: {
    total: number;
    series: { hour: string; amount: number }[];
    methods: { code: string; label: string; amount: number }[];
  };
  non_deposit_movements: { label: string; amount: number }[];
  reconciliation: {
    theoretical: number;
    counted: number;
    difference: number;
    within_tolerance: boolean;
    comment: string;
  };
  settlement: {
    settled: number;
    settled_percent: number;
    unpaid: number;
    unpaid_amount: number;
  };
  discounts: {
    count: number;
    amount: number;
    share_of_revenue: number;
    sensitive: { threshold_percent: number; count: number };
  };
  cashiers: DailyCashierRow[];
  exports: { csv: boolean; pdf: boolean };
}

export interface DailyReportParams {
  date?: string;
  agency_id?: number | string;
}
