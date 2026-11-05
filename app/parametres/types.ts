export interface SettingsSummary {
  categories: number;
  up_to_date: number;
  to_check: number;
  action_required: number;
  label: string;
}

export interface SettingsFilter {
  code: string;
  label: string;
  count: number;
}

export interface SettingsCard {
  key: string;
  group: string;
  label: string;
  summary: string | null;
  status: "up_to_date" | "to_check" | "action_required" | (string & {});
  status_label: string;
  updated_at: string | null;
  updated_relative: string | null;
  endpoint: string;
}

export interface SettingsGroup {
  code: string;
  label: string;
  cards: SettingsCard[];
}

export interface SettingsRecentChange {
  at: string;
  description: string;
  by: string;
  scope: string;
}

export interface SettingsData {
  summary: SettingsSummary;
  filters: SettingsFilter[];
  groups: SettingsGroup[];
  recent_changes: SettingsRecentChange[];
}

export interface SettingsEnvelope {
  data: SettingsData;
  errors: unknown;
}
