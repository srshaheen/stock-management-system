import { Sidebar } from "@/components/Sidebar";
import LogoutButton from "./LogoutButton";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 bg-slate-50/30">
        <header className="h-16 border-b bg-white flex items-center px-8 justify-between sticky top-0 z-10">
          <h2 className="text-sm font-medium text-slate-500">
            Welcome back, Sohel!
          </h2>

          {/* Logout Button */}
          <div>
            <LogoutButton />
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
