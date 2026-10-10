import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminMobileSidebar from "../../components/admin/AdminMobileSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { DashboardDataProvider } from "../../components/dashboard/DashboardDataProvider";

export default function AdminLayout() {
  return (
    <DashboardDataProvider role="admin">
      <div className="min-h-screen bg-[#0B0B0B] text-white">
        <AdminSidebar />
        <AdminMobileSidebar />
        <AdminNavbar />
        <main className="min-h-screen w-full overflow-x-hidden pt-14 lg:pl-[280px] lg:pt-16">
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </DashboardDataProvider>
  );
}
