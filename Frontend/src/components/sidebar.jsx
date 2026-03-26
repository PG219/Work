import SidebarItem from "./sidebar_item";
import PeopleIcon from "@mui/icons-material/People";
import {
  Play,
  Home,
  BarChart3,
  ClipboardList,
  Clock,
  Heart,
  HelpCircle,
  X, // 1. Import the 'X' icon for closing
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// 2. Accept the 'onToggle' prop from Layout.js
const Sidebar = ({ open, onToggle }) => {
  const { isAdmin } = useAuth();

  return (
    <aside
      className={`
        h-full bg-slate-800 min-h-screen text-white flex flex-col py-6 shadow-md
        transition-all duration-300 overflow-y-auto
        ${open ? "px-4" : "px-2"} {/* 3. Adjust padding based on state */}
      `}
    >
      {/* 4. Reworked Logo/Header section */}
      <div
        className={`flex items-center mb-8 ${
          open ? "justify-between" : "justify-center"
        }`}
      >
        <div className="flex items-center flex-1 overflow-hidden">
          <img
            src="/logo.png"
            alt="RAKfort Logo"
            className="w-8 h-8 flex-shrink-0"
          />

          {/* This text will now hide/show with a transition */}
          <div
            className={`overflow-hidden transition-all ${
              open ? "ml-2 w-auto opacity-100" : "w-0 opacity-0"
            }`}
          >
            <h1 className="text-lg font-bold whitespace-nowrap">RAKFORT</h1>
            <p className="text-xs text-white/70 whitespace-nowrap">
              AI Governance & Security
            </p>
          </div>
        </div>

        {/* 5. Mobile-only Close button */}
        {/* This button is hidden on desktop (md:hidden) */}
        <button
          onClick={onToggle}
          className="p-1 rounded-full hover:bg-white/20 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-col space-y-2">
        <SidebarItem icon={<Play />} label="Demo" to="/demo" open={open} />
        <SidebarItem icon={<Home />} label="Dashboard" to="/" open={open} />

        {/* AI Section */}
        <SidebarItem
          icon={<BarChart3 />}
          label="AI System"
          to="#"
          open={open}
          subItems={[
            {
              label: "AI Risk Assessment",
              to: "/ai-risk-assessment",
            },
            { label: "AI Control Assessment", to: "/ai-control-assessment" },
            //{ label: "AI Policy", to: "/ai-policy" },
            //{label: "AI Regulatory Assessment",to: "/ai-regulatory-assessment"},
          ]}
        />

        <SidebarItem
          icon={<Clock />}
          label="Cybersecurity Management"
          to="#"
          open={open}
          subItems={[
            { label: "Risk Assessment", to: "/cyber-risk-assessment" },
            { label: "Control Assessment", to: "/cyber-control-assessment" },
            //{ label: "Risk Analysis", to: "/cyber-risk-analysis" },
          ]}
        />

        {/* <SidebarItem
          icon={<Users />}
          label="Third-Party Assessment"
          to="/3passessements"
          open={open}
        /> */}

        {/*<SidebarItem icon={<ChatIcon />} label="Chat" to="/chat" open={open} />*/}

        {/* Admin-only section */}
        {isAdmin() && (
          <>
            <div
              className={`border-t border-white/20 my-2 ${
                open ? "mx-4" : "mx-2"
              }`}
            />
            <SidebarItem
              icon={<ClipboardList />}
              label="Template Builder"
              to="/templates"
              open={open}
            />
            <SidebarItem
              icon={<PeopleIcon />}
              label="User Management"
              to="/users"
              open={open}
            />
            <SidebarItem
              icon={<Heart />}
              label="Trust Center"
              to="#"
              open={open}
              subItems={[
                { label: "Documents", to: "/documents" },
                //{ label: "Insights", to: "/insights" },
              ]}
            />
          </>
        )}
        <div className="border-t border-white/20 my-2"></div>

        <SidebarItem
          icon={<HelpCircle />}
          label="Support"
          to="/support"
          open={open}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;
