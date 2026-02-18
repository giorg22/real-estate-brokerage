export interface LocationItem {
  id: number;
  title: string;
  type: "city" | "municipality";
  group: string;
  isSuburb: boolean;
  districts?: any[];
}
