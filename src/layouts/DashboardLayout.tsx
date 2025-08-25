import { Outlet } from "react-router-dom";
import Sidebar from "../ui/Sidebar";
import Topbar from "../ui/Topbar";

export default function DashboardLayout() {
  return (
    <div className="flex h-dvh w-dvw overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-[#0b1424]">
        <Topbar />
        <main className="min-h-0 min-w-0 flex-1 overflow-auto p-0 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
