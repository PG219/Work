import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen w-screen bg-background overflow-x-hidden">
      
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      <div
        className={`
          transition-all duration-300
          bg-[#1d4ed8] text-white
          h-full z-30 

          fixed 
          w-64
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}

          md:relative
          md:translate-x-0
          ${sidebarOpen ? "md:w-64" : "md:w-16"}
        `}
      >
        <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="h-16 w-full shadow z-10">
          <Navbar onToggleSidebar={toggleSidebar} />
        </div>

        <main className="flex-1 overflow-y-auto p-6 bg-[#f5f7fa]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;