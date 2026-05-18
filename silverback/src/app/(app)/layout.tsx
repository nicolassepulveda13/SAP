import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-[#181818] overflow-hidden">
      <Topbar />
      <div className="flex h-full pt-14">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
