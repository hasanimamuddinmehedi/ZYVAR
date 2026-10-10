import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaChartPie,
  FaClipboardList,
  FaCog,
  FaHandshake,
  FaPlus,
  FaShoppingBag,
  FaSignOutAlt,
  FaStar,
  FaTicketAlt,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import DashboardQuickActions from "../dashboard/DashboardQuickActions";

const links = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <FaChartPie /> },
  { label: "Upload Product", path: "/admin/upload", icon: <FaPlus /> },
  { label: "Products", path: "/admin/products", icon: <FaBoxOpen /> },
  { label: "Orders", path: "/admin/orders", icon: <FaShoppingBag /> },
  { label: "Product Requests", path: "/admin/product-requests", icon: <FaClipboardList /> },
  { label: "Partner Applications", path: "/admin/partner-applications", icon: <FaHandshake /> },
  { label: "Partner Coupons", path: "/admin/partner-coupons", icon: <FaTicketAlt /> },
  { label: "Users", path: "/admin/users", icon: <FaUsers /> },
  { label: "Settings", path: "/admin/settings", icon: <FaCog /> },
  { label: "Reviews", path: "/admin/reviews", icon: <FaStar /> },
];

export default function AdminMobileSidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Admin sign out failed:", error);
      window.alert("Unable to sign out. Please try again.");
      return;
    }
    ["zyvar-admin", "zyvar-user", "zyvar-user-id", "zyvar-user-data", "zyvar-remember", "token"].forEach((key) => localStorage.removeItem(key));
    navigate("/login");
  };

  const navClass = ({ isActive }) => `flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-sm transition ${
    isActive
      ? "border-[#C6922B] bg-[#C6922B] font-bold text-black"
      : "border-white/10 bg-white/5 text-white hover:border-[#C6922B] hover:text-[#C6922B]"
  }`;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0B0B0B]/95 px-3 backdrop-blur-2xl lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg"
        >
          ☰
        </button>
        <button type="button" onClick={() => navigate("/")} className="text-base font-black tracking-[0.2em] text-[#C6922B]">
          ZYVAR
        </button>
        <DashboardQuickActions role="admin" />
      </header>

      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,calc(100vw-2rem))] flex-col overflow-y-auto border-r border-white/10 bg-[#111] p-5 shadow-2xl">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-xl font-black tracking-[0.18em] text-[#C6922B]">ZYVAR</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-gray-500">Admin Dashboard</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <FaTimes />
              </button>
            </div>
            <nav className="space-y-2">
              {links.map((link) => (
                <NavLink key={link.path} to={link.path} onClick={() => setOpen(false)} className={navClass}>
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
              <button type="button" onClick={handleLogout} className={`${navClass({ isActive: false })} text-red-400 hover:border-red-400 hover:text-red-300`}>
                <FaSignOutAlt />
                Log Out
              </button>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
