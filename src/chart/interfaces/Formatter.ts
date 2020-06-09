export interface IFormatter {
  type: string;
  decimalPlace?: number;
  thousandPlace?: number;
  multiple?: number;
  divider?: number;
  prefix?: string;
  suffix?: string;
  unit?: string;
  formal?: string;
  format?: (value: any) => any;
}

export interface IFilter {
  normal?: Normal;
}

type Normal = Inclusion | Exclusion;

type Inclusion = [];

type Exclusion = [];
