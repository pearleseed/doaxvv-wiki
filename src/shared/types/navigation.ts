import { LucideIcon } from "lucide-react";

/**
 * Represents a single navigation item (link)
 */
export interface NavItem {
  path: string;
  label: string;
  icon?: LucideIcon;
}

/**
 * Represents a group of navigation items with a common category
 */
export interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}
