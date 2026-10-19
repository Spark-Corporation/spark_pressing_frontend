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