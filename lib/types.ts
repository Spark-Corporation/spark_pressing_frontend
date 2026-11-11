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
  first_name?: string | null;
  last_name?: string | null;
  initials?: string | null;
  email: string | null;
  phone_number: string;
  phone_secondary?: string | null;
  address: string | null;
  city: string | null;
  loyalty_points: number;
  wallet_balance: number;
  sponsor_code: string;
  referred_by_id: number | null;
  last_deposit_at: string | null;
  status: boolean;
  contact_preference?: string | { code: string; label: string } | null;
  consent_sms?: boolean;
  consent_email?: boolean;
  archived_at?: string | null;
  tier?: { code: string; label: string } | null;
  agency?: { id: number; name: string } | null;
  deposits_count?: number | null;
  frequency_per_month?: number | null;
  lifetime_value?: number | null;
  crm_status?: { code: string; label: string } | null;
}

export interface ClientsEnvelope {
  data: ApiClient[];
  meta: { page: number; per_page: number; total: number; last_page: number };
  errors: null;
}

export interface ApiClientDetail extends ApiClient {
  stats: {
    lifetime_value: number;
    client_since: string;
    deposits: number;
    frequency_per_month: number;
    average_basket: number;
    average_basket_delta_percent_6m: number;
    balance_due: number;
  };
  loyalty: {
    points: number;
    value: number;
    tier: { code: string; label: string };
    next_tier: { code: string; label: string; min_points: number } | null;
    points_to_next_tier: number;
    progress_percent: number;
    conversion: { points: number; value: number; minimum_points: number };
  };
  points_history: {
    label: string;
    reason: string;
    reference: string;
    points: number;
    at: string;
  }[];
  timeline: {
    type: string;
    title: string;
    detail: string;
    reference: string;
    at: string;
  }[];
  recent_orders: {
    id: number;
    code: string;
    date: string;
    articles: number;
    total: number;
    status: { code: string; label: string };
  }[];
  preferences: {
    contact_channel: string;
    pickup_slot: string;
    favorite_treatment: string;
    instructions: string;
  };
  notes: {
    count: number;
    items: { id: number; body: string; author: string; created_at: string }[];
  };
  account: {
    client_since: string;
    agency: string;
    marketing_consent: boolean;
    consents: {
      sms: boolean;
      email: boolean;
      updated_at: string;
    };
    archived_at: string | null;
  };
}

export interface ClientDetailEnvelope {
  data: ApiClientDetail;
}

/* ------------------------ Clients (création) ------------------------------ */

/** Charge utile de création d'un client (POST /clients). */
export interface ClientCreatePayload {
  fullname: string;
  last_name?: string;
  first_name?: string;
  phone_number: string;
  email?: string;
  address?: string;
  city?: string;
  password?: string;
  sponsor_code?: string;
  phone_secondary?: string;
  agency_id?: number;
  contact_preference?: string;
  loyalty_tier?: string;
  consent_sms?: boolean;
  consent_email?: boolean;
  pickup_slot?: string;
  favorite_treatment?: string;
  instructions?: string;
  note?: string;
  status?: boolean;
}

/** Client existant détecté par le contrôle des doublons. */
export interface ClientDuplicateMatch {
  id: number;
  code: string;
  fullname: string;
  phone_number: string;
  agency: string;
}

/** Réponse du contrôle des doublons (GET /clients/duplicates). */
export interface ClientDuplicatesData {
  has_duplicates: boolean;
  matches: ClientDuplicateMatch[];
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

/** Charge utile de création d'une catégorie d'articles (POST /article-categories). */
export interface ArticleCategoryCreatePayload {
  name: string;
  icon?: string;
  shared?: boolean;
  sort_order?: number;
}

/* ------------------------ Articles (création) ------------------------------ */

/** Tranche tarifaire au kilo (kilo_tiers). */
export interface ArticleKiloTierPayload {
  min_kg: number;
  max_kg: number;
  classic: number;
  express: number;
}

/** Disponibilité de l'article pour une agence. */
export interface ArticleAvailabilityPayload {
  agency_id: number;
  available: boolean;
  price_adjust_percent?: number;
  note?: string;
}

/** Charge utile de création d'un article (POST /articles). */
export interface ArticleCreatePayload {
  name: string;
  description?: string;
  classic_price?: number | null;
  express_price?: number | null;
  repass_price?: number | null;
  classic_price_kilo?: number | null;
  express_price_kilo?: number | null;
  repass_price_kilo?: number | null;
  status: boolean;
  code: string;
  category_id: number | null;
  billing_mode: "piece" | "kilo" | "mixed";
  icon?: string;
  allow_discount?: boolean;
  round_to?: number | null;
  price_editable?: boolean;
  classic_hours?: number | null;
  express_hours?: number | null;
  repass_hours?: number | null;
  priority?: string;
  accepted_defects?: string[];
  compatible_renders?: number[];
  services?: string[];
  kilo_tiers?: ArticleKiloTierPayload[];
  availability?: ArticleAvailabilityPayload[];
}

/** Catalogue d'options de traitement (états, rendus, services, priorités). */
export interface ArticleOptionsCatalog {
  defects: { code: string; label: string }[];
  renders: { id: number; title: string }[];
  services: { code: string; label: string }[];
  priorities: { code: string; label: string }[];
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
  options: ArticleOptionsCatalog;
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

/* --------------------- Dépôt (détail GET /deposits/{id}) ------------------- */

export interface ApiDepositClient {
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
  last_deposit_at: string | null;
  status: boolean;
  first_name: string | null;
  last_name: string | null;
  phone_secondary: string | null;
  contact_preference: string | null;
  consent_sms: boolean;
  consent_email: boolean;
  archived_at: string | null;
  tier: { code: string; label: string } | null;
}

export interface ApiDepositDetailUnit {
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

export interface ApiDepositPayment {
  id: number;
  label: string;
  amount: number;
  payment_method: { code: string; label: string } | null;
  at: string;
  received_by: string | null;
}

export interface ApiDepositTimelineItem {
  at: string;
  code: string;
  title: string;
  detail: string | null;
}

export interface ApiDepositAuditItem {
  at: string;
  actor: string;
  action: string;
  message: string;
}

/** Réponse détaillée d'un dépôt (GET /deposits/{id}). */
export interface ApiDepositDetail {
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
  client: ApiDepositClient | null;
  units: ApiDepositDetailUnit[];
  transactions: {
    id: number;
    amount: number;
    type: string;
    payment_method: string;
    transaction_date: string;
  }[];
  invoice_number: string | null;
  commercial_status: { code: string; label: string; retrieve_date: string | null } | null;
  workshop_detail: { status: { code: string; label: string } | null; updated_at: string | null } | null;
  pricing_mode: string;
  treatment: {
    express_hours: number | null;
    defects_reported: boolean;
    renders: number[];
    pieces_counted: number | null;
  } | null;
  pickup: {
    mode: string;
    label: string;
    agency: string | null;
    retrieve_date: string | null;
    address: string | null;
  } | null;
  client_summary: {
    id: number;
    fullname: string;
    phone_number: string | null;
    client_since: string | null;
    loyalty_points: number;
    previous_unpaid_count: number;
    previous_unpaid_amount: number;
  } | null;
  totals: {
    currency: string;
    subtotal: number;
    express_supplement: number;
    express_percent: number;
    fees: number;
    discount: number;
    points_used: number;
    points_discount: number;
    tax: number;
    total: number;
    paid: number;
    left_to_pay: number;
  } | null;
  payments: ApiDepositPayment[];
  timeline: ApiDepositTimelineItem[];
  audit: ApiDepositAuditItem[];
  actions: {
    can_print: boolean;
    can_edit: boolean;
    can_add_payment: boolean;
    can_cancel: boolean;
    can_follow_workshop: boolean;
  } | null;
}

/* ------------------------ Dépôts (création) ------------------------------- */

/** Ligne de prestation d'un dépôt (POST /deposits). */
export interface DepositLinePayload {
  article_id: number;
  service_id?: number;
  quantity: number;
  type_action?: number;
  pricing_type: "piece" | "kilo";
  weight_kg?: number;
  unit_price: number;
  designation?: string;
  state?: string;
  render_id?: number;
  express?: boolean;
  color?: string;
  defects?: string[];
  internal_notes?: string;
}

/** Charge utile de création d'un dépôt (POST /deposits). */
export interface DepositCreatePayload {
  client_uuid?: string;
  client_id: number;
  discount?: number;
  discount_percent?: number;
  promo_code?: string;
  promo_special_code?: string;
  points_to_redeem?: number;
  with_collection?: boolean;
  with_delivery?: boolean;
  collection_fee?: number;
  delivery_fee?: number;
  delivery_zone_id?: number;
  delivery_address?: string;
  advanced?: number;
  payment_method?: string;
  deposit_date?: string;
  retrieve_date?: string;
  notes?: string;
  lines: DepositLinePayload[];
  terminal?: string;
  local_ref?: string;
  discount_reason?: string;
}