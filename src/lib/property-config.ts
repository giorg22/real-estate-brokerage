import {
  Building2, Home, Warehouse, Leaf, Store, BedSingle,
  Tag, Calendar, CalendarClock, FileKey2
} from "lucide-react";

export const propertyTypes = [
  { id: 0, label: "Apartment", icon: Building2 },
  { id: 1, label: "House", icon: Home },
  { id: 2, label: "Summer cottage", icon: Warehouse },
  { id: 3, label: "Land", icon: Leaf },
  { id: 4, label: "Commercial real estate", icon: Store },
  { id: 5, label: "Hotel", icon: BedSingle },
];

export const dealTypes = [
  { id: 0, name: "For sale", icon: Tag },
  { id: 1, name: "For rent", icon: Calendar },
  { id: 2, name: "Daily rent", icon: CalendarClock },
  { id: 3, name: "Leasehold Mortgage", icon: FileKey2 },
];

export interface LocationItem {
  id: number;
  title: string;
  type: "city" | "municipality";
  group: string;
  isSuburb: boolean;
  districts?: any[];
}
