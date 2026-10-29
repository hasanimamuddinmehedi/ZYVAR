import DashboardQuickActions from "../dashboard/DashboardQuickActions";
import NotificationCenter from "../NotificationCenter";

export default function AdminNavbar() {
  return (
    <header className="fixed left-[296px] right-3 top-3 z-40 hidden h-16 rounded-[22px] border border-[#C6922B]/25 bg-[#0B0B0B]/85 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:flex">
      <div className="flex h-full w-full items-center justify-between gap-4 px-6">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-[#C6922B]">Admin Dashboard</p>
          <h1 className="text-lg font-black">Welcome Back</h1>
        </div>
        <div className="flex items-center gap-3">
          <NotificationCenter />
          <DashboardQuickActions role="admin" />
        </div>
      </div>
    </header>
  );
}
