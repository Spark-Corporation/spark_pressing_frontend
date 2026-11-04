export interface NetworkOverviewParams {
  date_from?: string;
  date_to?: string;
}

export interface NetworkPeriod {
  from: string;
  to: string;
  compare_from: string;
  compare_to: string;
}

export interface NetworkKpis {
  revenue: { value: number; delta_percent: number };
  deposits: { value: number; pieces: number };
  retrievals: { value: number; finalized_percent: number };
  cash_flow: { value: number; delta_percent: number };
  unpaid: { value: number; deposits: number; share_of_revenue: number };
  loyalty: { members: number; points_issued: number };
  sync_health: { percent: number; online_agencies: number; agencies: number };
  network_objective: { percent: number; target: number; agencies_above_85: number };
}

export interface NetworkRankingRow {
  rank: number;
  agency_id: number;
  name: string;
  revenue: number;
  delta_percent: number;
  share_percent: number;
}

export interface NetworkComparisonRow {
  agency_id: number;
  name: string;
  deposits: number;
  retrieved: number;
  unpaid: number;
  unpaid_level: string;
  objective: {
    target: number;
    percent: number;
    remaining: number;
    level: string;
  };
}

export interface NetworkAlert {
  agency_id: number;
  type: string;
  severity: string;
  title: string;
  detail: string;
  endpoint: string;
}

export interface NetworkAgencyState {
  agency_id: number;
  name: string;
  address: string;
  online: boolean;
  status_label: string;
  deposits: number;
  objective_percent: number;
  endpoint: string;
}

export interface NetworkOverviewData {
  period: NetworkPeriod;
  kpis: NetworkKpis;
  revenue_chart: {
    total: number;
    series: { date: string; revenue: number }[];
  };
  ranking: NetworkRankingRow[];
  comparison: NetworkComparisonRow[];
  alerts: NetworkAlert[];
  agencies: NetworkAgencyState[];
}

/* --------------------------- Détail agence --------------------------- */

export interface NetworkAgencyDetailData {
  agency: {
    id: number;
    name: string;
    code: string;
    address: string;
    contact: string;
    email: string;
    opening_hours: {
      opens_at: string;
      closes_at: string;
      label: string;
    };
  };
  kpis: {
    revenue: { value: number; delta_percent: number; network_rank: number };
    cash_today: { value: number; gap: number; session_status: string };
    deposits_retrievals: { deposits: number; retrieved: number; retrieval_rate: number };
    objective: { target: number; percent: number; remaining: number; level: string };
  };
  performance_chart: {
    total: number;
    cumulative: boolean;
    series: { date: string; revenue: number; cumulative: number }[];
  };
  network_comparison: {
    code: string;
    label: string;
    value: number;
    unit: string;
    detail: string;
  }[];
  workshop: {
    orders: number;
    pieces: number;
    columns: { etat: string; label: string; deposits: number; pieces: number }[];
    due_soon: number;
    late: number;
  };
  clients: {
    active: number;
    new_this_month: number;
    loyalty_members: number;
    members_percent: number;
    points_this_month: number;
    new_vip_7d: number;
    distribution: { code: string; label: string; count: number }[];
  };
  delays_unpaid: {
    to_recover: { amount: number; deposits: number };
    workshop_delays: { deposits: number; over_24h: number };
    unpaid_followup: { clients: number; amount: number; since_days: number };
    rows: {
      deposit_id: number;
      code: string;
      client: string;
      delay: string;
      left_to_pay: number;
    }[];
  };
  team: {
    members: number;
    present: number;
    list: {
      user_id: number;
      fullname: string;
      initials: string;
      role: string;
      present: boolean;
      status_label: string;
    }[];
  };
  history: {
    at: string;
    type: string;
    title: string;
    subtitle: string;
    amount: number;
    amount_type: string;
  }[];
  sync: {
    online: boolean;
    status_label: string;
    last_sync_at: string;
    pending_operations: number;
    interruptions_30d: number;
    last_batch_status: string;
    availability_percent: number;
  };
}
