export interface CashCenterAmountCount {
  amount: number;
  count: number;
}

export interface CashCenterData {
  date: string;
  agency: string;
  session: {
    id: number;
    code: string;
    business_date: string;
    status: {
      code: string;
      label: string;
    };
    opened_at: string;
    opened_by: string;
    opening_balance: number;
    closed_at: string | null;
  };
  kpis: {
    receipts: {
      value: number;
      delta_percent: number;
    };
    expenses: {
      value: number;
      count: number;
    };
    unpaid: {
      value: number;
      deposits: number;
    };
    difference: {
      value: number;
      label: string;
    };
  };
  situation: {
    opening: {
      amount: number;
      at: string;
      by: string;
    };
    deposit_receipts: CashCenterAmountCount;
    balance_payments: CashCenterAmountCount;
    cash_in: CashCenterAmountCount;
    cash_out: CashCenterAmountCount;
  };
  theoretical: {
    amount: number;
    computed_at: string;
  };
  counted: {
    amount: number;
    difference: number;
  };
  breakdown: {
    total: number;
    methods: Array<{
      code: string;
      label: string;
      amount: number;
      percent: number;
    }>;
  };
  hourly: {
    series: Array<{
      hour: string;
      in: number;
      out: number;
    }>;
    net: number;
  };
  journal_totals: {
    operations: number;
    total_in: number;
    total_out: number;
  };
}
