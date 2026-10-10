import { createContext, useContext } from "react";

export const DashboardDataContext = createContext(null);

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) throw new Error("DashboardDataProvider is required.");
  return context;
}

const ADMIN_SECTIONS = [
  { label: "Dashboard", path: "/admin/dashboard", keywords: ["home", "overview", "stats"] },
  { label: "Upload Product", path: "/admin/upload", keywords: ["upload", "add product"] },
  { label: "Products", path: "/admin/products", keywords: ["inventory", "stock"] },
  { label: "Orders", path: "/admin/orders", keywords: ["purchases", "sales"] },
  { label: "Product Requests", path: "/admin/product-requests", keywords: ["requests"] },
  { label: "Partner Applications", path: "/admin/partner-applications", keywords: ["applications"] },
  { label: "Partner Coupons", path: "/admin/partner-coupons", keywords: ["coupons"] },
  { label: "Reviews", path: "/admin/reviews", keywords: ["ratings"] },
  { label: "Customers and Partners", path: "/admin/users", keywords: ["users", "customers", "members"] },
  { label: "Settings", path: "/admin/settings", keywords: ["preferences"] },
];

const PARTNER_SECTIONS = [
  { label: "Dashboard", path: "/partner-dashboard", keywords: ["home", "overview"] },
  { label: "Uploads", path: "/partner-dashboard/uploads", keywords: ["upload", "add product"] },
  { label: "Products", path: "/partner-dashboard/products", keywords: ["inventory", "stock"] },
  { label: "Orders", path: "/partner-dashboard/orders", keywords: ["purchases", "sales"] },
  { label: "Reviews", path: "/partner-dashboard/reviews", keywords: ["ratings"] },
  { label: "Earnings", path: "/partner-dashboard/earnings", keywords: ["revenue", "payments"] },
  { label: "Settings", path: "/partner-dashboard/settings", keywords: ["preferences"] },
];

export function getDashboardSearchResults(role, records, queryText) {
  const queryValue = queryText.trim().toLowerCase();
  if (!queryValue) return [];
  const sections = role === "admin" ? ADMIN_SECTIONS : PARTNER_SECTIONS;
  const sectionResults = sections
    .filter((section) => `${section.label} ${section.keywords.join(" ")}`.toLowerCase().includes(queryValue))
    .map((section) => ({ ...section, key: `section:${section.path}`, subtitle: "Dashboard section" }));
  const recordResults = records
    .filter((record) => record.searchText.includes(queryValue))
    .map(({ key, label, subtitle, path, type }) => ({
      key,
      label,
      subtitle,
      path,
      type,
    }));
  return [...sectionResults, ...recordResults].slice(0, 30);
}
