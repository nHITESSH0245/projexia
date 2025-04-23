
import Navbar from "@/components/Navbar";
import AppSidebar from "@/components/AppSidebar";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="w-full max-w-7xl mx-auto px-2 md:px-8 py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
