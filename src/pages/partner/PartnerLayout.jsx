import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBoxOpen,
  FaChartLine,
  FaCog,
  FaMoneyBillWave,
  FaPlus,
  FaShoppingBag,
  FaSignOutAlt,
  FaStar,
  FaTimes,
} from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import DashboardQuickActions from "../../components/dashboard/DashboardQuickActions";
import { DashboardDataProvider } from "../../components/dashboard/DashboardDataProvider";

const menu = [
  { name: "Dashboard", icon: <FaChartLine />, path: "/partner-dashboard", end: true },
  { name: "Uploads", icon: <FaPlus />, path: "/partner-dashboard/uploads" },
  { name: "Products", icon: <FaBoxOpen />, path: "/partner-dashboard/products" },
  { name: "Orders", icon: <FaShoppingBag />, path: "/partner-dashboard/orders" },
  { name: "Reviews", icon: <FaStar />, path: "/partner-dashboard/reviews" },
  { name: "Earnings", icon: <FaMoneyBillWave />, path: "/partner-dashboard/earnings" },
  { name: "Settings", icon: <FaCog />, path: "/partner-dashboard/settings" },
];

export default function PartnerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Partner sign out failed:", error);
      window.alert("Unable to sign out. Please try again.");
      return;
    }
    ["zyvar-admin", "zyvar-user", "zyvar-user-id", "zyvar-user-data", "zyvar-remember", "token"].forEach((key) => localStorage.removeItem(key));
    navigate("/login");
  };

  const linkClass = ({ isActive }) => `flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
    isActive
      ? "border-[#C6922B] bg-[#C6922B] font-bold text-black"
      : "border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B]"
  }`;
  const logoutButton = "flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-red-400 transition hover:border-red-400 hover:bg-red-400/10";

  return (
    <DashboardDataProvider role="partner">
      <div className="min-h-screen bg-[#0B0B0B] text-white">
        <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0B0B0B]/95 px-3 backdrop-blur-2xl lg:left-[280px] lg:h-16 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open partner navigation"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 lg:hidden"
            >
              <FaBars />
            </button>
            <div>
              <p className="text-sm font-black text-[#C6922B] sm:text-base">ZYVAR Partner</p>
              <p className="hidden text-[10px] uppercase tracking-[0.2em] text-gray-500 lg:block">Partner Dashboard</p>
            </div>
          </div>
          <DashboardQuickActions role="partner" />
        </header>

        <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-[280px] flex-col border-r border-white/10 bg-[#0A0A0A] p-5 lg:flex">
          <p className="mb-7 text-2xl font-black text-[#C6922B]">ZYVAR Partner</p>
          <nav className="space-y-2 overflow-y-auto">
            {menu.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.end} className={linkClass}>
                {item.icon}
                {item.name}
              </NavLink>
            ))}
            <button type="button" onClick={handleLogout} className={logoutButton}>
              <FaSignOutAlt />
              Log Out
            </button>
          </nav>
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <button
              type="button"
              aria-label="Close partner navigation"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,calc(100vw-2rem))] flex-col overflow-y-auto border-r border-white/10 bg-[#0A0A0A] p-5 shadow-2xl">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <p className="text-xl font-black text-[#C6922B]">ZYVAR Partner</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">Dashboard</p>
                </div>
                <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <FaTimes />
                </button>
              </div>
              <nav className="space-y-2">
                {menu.map((item) => (
                  <NavLink key={item.path} to={item.path} end={item.end} onClick={() => setMobileMenuOpen(false)} className={linkClass}>
                    {item.icon}
                    {item.name}
                  </NavLink>
                ))}
                <button type="button" onClick={handleLogout} className={logoutButton}>
                  <FaSignOutAlt />
                  Log Out
                </button>
              </nav>
            </aside>
          </div>
        )}

        <main className="min-h-screen w-full overflow-x-hidden px-4 pb-6 pt-14 sm:px-6 lg:pl-[280px] lg:pt-16">
          <div className="p-0 md:p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </DashboardDataProvider>
  );
}
