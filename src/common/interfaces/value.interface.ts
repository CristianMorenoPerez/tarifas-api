export type KpiColorScheme =
  | 'primary'
  | 'blue'
  | 'red'
  | 'green'
  | 'purple'
  | 'orange';

export interface Value {
  value: string | number;
  label: string;
  description: string;
  icon: string;
  colorScheme: KpiColorScheme;
}
