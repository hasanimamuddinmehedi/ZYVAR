import DashboardQuickActions from "../dashboard/DashboardQuickActions";

export default function AdminNavbar() {
  return (
    <header className="fixed left-[280px] right-0 top-0 z-40 hidden h-16 border-b border-white/10 bg-[#0B0B0B]/95 backdrop-blur-2xl lg:flex">
      <div className="flex h-full w-full items-center justify-between gap-4 px-6">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-[#C6922B]">Admin Dashboard</p>
          <h1 className="text-lg font-black">Welcome Back</h1>
        </div>
        <DashboardQuickActions role="admin" />
      </div>
    </header>
  );
}
