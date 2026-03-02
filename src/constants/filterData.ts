import { Building2, Home, Warehouse, Leaf, Store, BedSingle, Tag, Calendar, CalendarClock, FileKey2 } from "lucide-react";

export const ICON_MAP: Record<string, any> = {
  Building2, Home, Warehouse, Leaf, Store, BedSingle, Tag, Calendar, CalendarClock, FileKey2
};

export const PROPERTY_TYPES = [
  { id: 0, label: "Apartment", iconName: "Building2" },
  { id: 1, label: "House", iconName: "Home" },
  { id: 2, label: "Summer cottage", iconName: "Warehouse" },
  { id: 3, label: "Land", iconName: "Leaf" },
  { id: 4, label: "Commercial real estate", iconName: "Store" },
  { id: 5, label: "Hotel", iconName: "BedSingle" }
];

export const DEAL_TYPES = [
  { id: 0, name: "For sale", iconName: "Tag" },
  { id: 1, name: "For rent", iconName: "Calendar" },
  { id: 2, name: "Daily rent", iconName: "CalendarClock" },
  { id: 3, name: "Leasehold Mortgage", iconName: "FileKey2" }
];