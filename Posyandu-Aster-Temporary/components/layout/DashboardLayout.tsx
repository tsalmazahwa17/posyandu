"use client";

import { useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import type { SessionPayload } from "@/lib/session";

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionPayload;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/60">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar user={user} isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Navbar user={user} onMenuToggle={openSidebar} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
