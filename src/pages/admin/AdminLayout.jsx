import {
  Outlet,
} from "react-router-dom";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminMobileSidebar from "../../components/admin/AdminMobileSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function AdminLayout() {

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white">

      {/* DESKTOP SIDEBAR */}
      <AdminSidebar />

      {/* MOBILE SIDEBAR */}
      <AdminMobileSidebar />

      {/* TOP NAVBAR */}
      <AdminNavbar />

      {/* MAIN CONTENT */}
      <main
        className="
        min-h-screen
        w-full
        lg:pl-[280px]
        pt-24
        overflow-x-hidden
      "
      >

        <div
          className="
          p-4
          md:p-8
        "
        >

          <Outlet />

        </div>

      </main>

    </div>
  );
}