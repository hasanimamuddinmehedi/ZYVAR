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
import NotificationCenter from "../../components/NotificationCenter";

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
        <header className="fixed left-2 right-2 top-2 z-50 flex h-14 items-center justify-between rounded-[22px] border border-[#C6922B]/25 bg-[#0B0B0B]/85 px-3 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:left-[296px] lg:right-3 lg:top-3 lg:h-16 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open partner navigation"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:border-[#C6922B] hover:text-[#C6922B] lg:hidden"
            >
              <FaBars />
            </button>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-[#C6922B]">Partner Dashboard</p>
              <h1 className="truncate text-sm font-black sm:text-base">Welcome Back</h1>
            </div>
          </div>
          <div className="ml-3 shrink-0">
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <DashboardQuickActions role="partner" />
            </div>
          </div>
        </header>

        <aside className="fixed bottom-3 left-3 top-3 z-50 hidden w-[260px] flex-col rounded-[22px] border border-[#C6922B]/25 bg-[#0B0B0B]/85 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:flex">
          <div className="mb-7 flex items-center gap-3">
            <img
              src="/android-chrome-192x192.png"
              alt="ZYVAR Logo"
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-xl font-black tracking-[0.16em] text-[#C6922B]">ZYVAR</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">Partner Dashboard</p>
            </div>
          </div>
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
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              aria-label="Close partner navigation"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <aside className="absolute inset-y-2 left-2 flex w-[min(18rem,calc(100vw-1rem))] flex-col overflow-y-auto rounded-[22px] border border-[#C6922B]/25 bg-[#0B0B0B]/95 p-5 shadow-2xl backdrop-blur-2xl">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <p className="text-xl font-black tracking-[0.16em] text-[#C6922B]">ZYVAR</p>
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

        <main className="min-h-screen w-full overflow-x-hidden px-4 pb-6 pt-20 sm:px-6 lg:pl-[280px] lg:pt-24">
          <div className="p-0 md:p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </DashboardDataProvider>
  );
}
