interface PillBase {
  name?: string;
  field?: string;
  alias?: string;
  type?: string;
  duplex?: boolean;
}

interface PillWithField extends PillBase {
  field: string;
}

export interface PillWithName extends PillBase {
  name: string;
}

export type PillObject = PillWithField | PillWithName;

export type Pill = string | PillWithField | PillWithName;
