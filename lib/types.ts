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