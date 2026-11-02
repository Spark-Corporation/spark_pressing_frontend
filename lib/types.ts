/* ---------------------------------- Auth ---------------------------------- */

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  token: string | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/* --------------------------- Backend (staff) ------------------------------ */

export interface Agency {
  id: number;
  pressing_id: number;
  name: string;
  address: string;
  contact: string;
  country_code: string;
  currency: string;
  code_prefix: string;
  code_suffix: string;
  status: boolean;
}

export interface Pressing {
  id: number;
  name: string;
  details: string;
  status: boolean;
  pricing_mode: string;
  workflow_laveur_enabled: boolean;
  workflow_classeur_enabled: boolean;
  qr_labels_enabled: boolean;
  block_retrieve_if_unpaid: boolean;
  reporting_currency: string | null;
  collection_fee: number;
  delivery_fee: number;
  loyalty_points_rate: number;
  hours_classic: number | null;
  hours_express: number | null;
  hours_repass: number | null;
}

export interface StaffUser {
  id: number;
  fullname: string;
  email: string;
  phone_number: string | null;
  pressing_id: number;
  agency_id: number;
  status: boolean;
  roles: string[];
  agency: Agency;
  agencies: Agency[];
  pressing: Pressing;
  can_view_all_agencies: boolean;
}

export interface LoginResult {
  token: string;
  token_type: string;
  actor: string;
  user: StaffUser;
}

/* --------------------------- Clients (backend) ---------------------------- */

export interface ApiClient {
  id: number;
  pressing_id: number;
  agency_id: number;
  code: string;
  fullname: string;
  email: string;
  phone_number: string;
  address: string | null;
  city: string;
  loyalty_points: number;
  wallet_balance: number;
  sponsor_code: string;
  referred_by_id: number | null;
  last_deposit_at: string;
  status: boolean;
}

export interface ClientsEnvelope {
  data: ApiClient[];
  meta: { page: number; per_page: number; total: number; last_page: number };
  errors: null;
}

/* ----------------------------- Articles (backend) ------------------------ */

export interface ApiArticle {
  id: number;
  name: string;
  description: string | null;
  classic_price: number | null;
  express_price: number | null;
  repass_price: number | null;
  classic_price_kilo: number | null;
  express_price_kilo: number | null;
  repass_price_kilo: number | null;
  status: boolean;
  code: string;
  icon: string | null;
  category_id: number | null;
  category: { id: number; name: string } | null;
  billing_mode: "piece" | "kilo" | "mixed";
  allow_discount: boolean;
  round_to: number | null;
  price_editable: boolean;
  delays: { classic: number | null; express: number | null; repass: number | null };
  priority: string;
  accepted_defects: string[];
  compatible_renders: number[];
  services: string[];
  price_updated_at: string | null;
  billing_mode_label: string;
  scope: {
    status: { code: string; label: string };
    label: string;
    agencies: number;
  };
}

export interface ArticlesKpis {
  active_articles: { value: number; new_this_month: number };
  categories: { value: number; shared: number };
  average_price: { value: number; delta_percent: number };
  to_review: { value: number; rule: string };
  updated_at: string;
}

export interface ArticlesEnvelope {
  data: ApiArticle[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
    kpis: ArticlesKpis;
  };
}

export interface ApiArticleCategory {
  id: number;
  name: string;
  icon: string | null;
  shared: boolean;
  sort_order: number;
  articles_count: number;
  active_articles_count: number;
}

export interface ArticleCategoriesEnvelope {
  data: ApiArticleCategory[];
}

export interface ApiArticleDetail extends ApiArticle {
  kilo_tiers: { min_kg: number; max_kg: number; classic: number; express: number }[];
  availability: {
    active: number;
    total: number;
    agencies: {
      agency_id: number;
      agency: string;
      available: boolean;
      status: { code: string; label: string };
      price_adjust_percent: number;
      note: string | null;
    }[];
  };
  preview: {
    title: string;
    subtitle: string;
    badge: string;
    prices: { label: string; amount: number }[];
  };
  checks: { code: string; label: string; ok: boolean }[];
  recommendations: { code: string; label: string }[];
  last_modification: { by: string | null; at: string | null };
  options: {
    defects: { code: string; label: string }[];
    renders: { id: number; title: string }[];
    services: { code: string; label: string }[];
    priorities: { code: string; label: string }[];
  };
}

export interface ArticleDetailEnvelope {
  data: ApiArticleDetail;
}

export interface ArticleHistoryEntry {
  at: string;
  article_id: number;
  article: string;
  action: string;
  label: string;
  changes: string[];
  by: string;
}

export interface ArticlesHistoryEnvelope {
  data: ArticleHistoryEntry[];
}

/* ----------------------------- Retrievais (backend) ------------------------ */

export interface ApiRetrievalUnit {
  id: number;
  article_id: number | null;
  service_id: number | null;
  designation: string;
  pricing_type: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  state: string | null;
  is_express: boolean;
  express_supplement: number;
  color: string | null;
  defects: { code: string; label: string }[];
  internal_notes: string | null;
}

export interface ApiRetrievalTransaction {
  id: number;
  amount: number;
  type: string;
  payment_method: string;
  transaction_date: string;
}

export interface ApiRetrieval {
  id: number;
  client_uuid: string;
  code: string;
  qr_token: string | null;
  pressing_id: number;
  agency_id: number | null;
  currency: string;
  client_id: number;
  deposit_date: string;
  retrieve_date: string;
  retrieved_at: string | null;
  subtotal: number;
  collection_fee: number;
  delivery_fee: number;
  discount: number;
  discount_percent: number;
  promo_code: string | null;
  points_earned: number;
  points_redeemed: number;
  total: number;
  advanced: number;
  left_to_pay: number;
  payment_method: string;
  status: string;
  etat: string;
  etat_label: string;
  colonne: string | null;
  workshop_status: { code: string; label: string } | null;
  payment_status: { code: string; label: string } | null;
  service: { code: string; label: string } | null;
  is_express: boolean;
  express_supplement: number;
  pieces_count: number;
  weight_kg_total: number;
  quantity_label: string | null;
  terminal: string | null;
  local_ref: string | null;
  storage_location: string | null;
  discount_reason: string | null;
  sync_status: { code: string; label: string; synced_at?: string | null } | null;
  delivery_status: { code: string; label: string } | null;
  notes: string | null;
  items_count: number;
  articles_label: string | null;
  client_name: string;
  client_phone: string | null;
  agency: { id: number; name: string } | null;
  units: ApiRetrievalUnit[];
  transactions: ApiRetrievalTransaction[];
  notification: { code: string; label: string; channel: string | null; at: string | null } | null;
}

export interface RetrievalCenterKpis {
  ready_today: { value: number; pieces: number };
  awaiting_notification: { value: number; by_channel: Record<string, number> };
  retrieved_today: { value: number; delta_percent: number; compared_to: string };
  unpaid_balances: { value: number; deposits: number };
}

export interface RetrievalTodaySchedule {
  id: number;
  code: string;
  time: string;
  client: string;
  pieces: number;
  payment: { code: string; label: string } | null;
}

export interface RetrievalCenterEnvelope {
  data: ApiRetrieval[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
    kpis: RetrievalCenterKpis;
    today_schedule: RetrievalTodaySchedule[];
  };
}

/* ----------------------------- Dashboard (backend) ------------------------ */

export interface DashboardKpis {
  revenue_today: number;
  revenue_delta_pct: number;
  deposits_today: number;
  pieces_today: number;
  retrieves_today: number;
  retrieve_rate_pct: number;
  loyalty_clients: number;
  new_clients_month: number;
  clients: number;
  deposits_open: number;
  unpaid_orders: number;
  overdue_retrieves: number;
}

export interface DashboardSeriesPoint {
  date: string;
  revenue: number;
  deposits: number;
}

export interface DashboardAgency {
  agency_id: number;
  name: string;
  revenue: number;
  revenue_delta_pct: number;
  deposits: number;
  retrieves: number;
  unpaid_count: number;
  unpaid_amount: number;
  cash_balance: number;
}

export interface WorkshopColumn {
  etat: string;
  colonne: string;
  label: string;
  deposits: number;
  pieces: number;
}

export interface DashboardWorkshop {
  in_progress_deposits: number;
  in_progress_pieces: number;
  columns: WorkshopColumn[];
  due_soon: unknown[];
}

export interface DashboardCash {
  balance: number;
  cash_in: number;
  cash_out: number;
  receipts_deposits: number;
  by_payment_method: Record<string, number>;
}

export interface UnpaidBucket {
  count: number;
  amount: number;
}

export interface DashboardUnpaidAging {
  total_amount: number;
  total_count: number;
  overdue_count: number;
  buckets: {
    "0_30": UnpaidBucket;
    "31_89": UnpaidBucket;
    "90_plus": UnpaidBucket;
  };
}

export interface DashboardSync {
  online: boolean;
  last_sync_at: string;
  pending_ops: number;
  pending: unknown[];
}

export interface DashboardData {
  currency: string;
  generated_at: string;
  kpis: DashboardKpis;
  clients: number;
  deposits_today: number;
  retrieves_today: number;
  receipts_today: number;
  cash_balance_today: number;
  series_7d: DashboardSeriesPoint[];
  agencies: DashboardAgency[];
  workshop_pipeline: DashboardWorkshop;
  cash: DashboardCash;
  unpaid_aging: DashboardUnpaidAging;
  recent_activity: unknown[];
  sync: DashboardSync;
  scope: { pressing_id: number; agency_id: number | null; network_wide: boolean };
}

/* ------------------------------ Deposits (backend) ------------------------ */

export interface DepositUnit {
  id: number;
  article_id: number | null;
  service_id: number | null;
  designation: string;
  pricing_type: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  state: string | null;
}

export interface DepositTransaction {
  id: number;
  amount: number;
  type: string;
  payment_method: string;
  transaction_date: string;
}

export interface ApiDeposit {
  id: number;
  client_uuid: string;
  code: string;
  qr_token: string | null;
  pressing_id: number;
  agency_id: number;
  currency: string;
  client_id: number;
  deposit_date: string;
  retrieve_date: string | null;
  retrieved_at: string | null;
  subtotal: number;
  collection_fee: number;
  delivery_fee: number;
  discount: number;
  discount_percent: number;
  promo_code: string | null;
  points_earned: number;
  points_redeemed: number;
  total: number;
  advanced: number;
  left_to_pay: number;
  payment_method: string;
  status: string;
  etat: string;
  etat_label: string;
  colonne: string;
  delivery_status: string | null;
  notes: string | null;
  items_count: number;
  articles_label: string;
  client_name: string;
  client_phone: string | null;
  agency: { id: number; name: string } | null;
  client?: { id: number; fullname: string; phone_number: string | null } | null;
  units?: DepositUnit[];
  transactions?: DepositTransaction[];
}

export interface DepositsEnvelope {
  data: ApiDeposit[];
  meta: { page: number; per_page: number; total: number; last_page: number };
  errors: unknown;
}