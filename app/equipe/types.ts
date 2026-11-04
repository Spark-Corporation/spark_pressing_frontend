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

/* ------------------------------ GET /roles ------------------------------ */

/** Colonne de permission de la matrice (ex. view -> "Consultation"). */
export interface RoleColumn {
  code: string;
  label: string;
}

/** Domaine de la matrice (ex. clients -> "Clients"). */
export interface RoleDomain {
  code: string;
  label: string;
}

/** Rôle renvoyé par /roles. */
export interface RoleDefinition {
  id: number;
  name: string;
  label: string;
  system: boolean;
  /** code de domaine -> "all" ou liste de codes de colonnes de permission. */
  cells: Record<string, string>;
  summary: {
    permissions: number;
    domains: number;
  };
}

export interface RolesData {
  columns: RoleColumn[];
  domains: RoleDomain[];
  roles: RoleDefinition[];
}
