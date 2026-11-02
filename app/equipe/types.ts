/* ------------------------------ GET /team/overview ------------------------------ */

export interface TeamTab {
  code: string;
  label: string;
  count: number;
}

/** Option renvoyée par l'API pour les filtres (agences, rôles, statuts). */
export type TeamFilterOption =
  | string
  | {
      id?: number | string;
      code?: string;
      value?: string;
      key?: string;
      name?: string;
      label?: string;
      count?: number;
    };

export interface TeamActivityItem {
  description?: string;
  message?: string;
  action?: string;
  label?: string;
  actor?: string;
  user?: string;
  time?: string;
  at?: string;
  when?: string;
  ago?: string;
  [key: string]: unknown;
}

export interface TeamOverviewData {
  kpis: {
    active_users: { value: number; new_this_month: number };
    managers: { value: number; multi_agency: number };
    invitations: { value: number; expiring_soon: number };
    connections_today: { value: number; team_percent: number };
  };
  mfa: { enrolled: number; percent: number; required: number };
  tabs: TeamTab[];
  filters: {
    agencies: TeamFilterOption[];
    roles: TeamFilterOption[];
    statuses: TeamFilterOption[];
  };
  recent_activity: TeamActivityItem[];
}

/* ------------------------------ GET /team/users ------------------------------ */

export interface TeamUser {
  id: number;
  fullname: string;
  email: string | null;
  phone_number: string | null;
  pressing_id: number | null;
  agency_id: number | null;
  status: boolean;
  roles: string[];
}

export interface TeamUsersMeta {
  page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
}

export interface TeamUsersEnvelope {
  data: TeamUser[];
  meta?: TeamUsersMeta;
}

export interface TeamUsersParams {
  page?: number;
  per_page?: number;
}
