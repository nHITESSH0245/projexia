
import { useAuth } from "@/contexts/AuthContext";
import { Home, Users, ClipboardCheck, Bell, Book } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function AppSidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  if (!currentUser) return null;

  const navItems = [
    { label: "Dashboard", icon: Home, to: "/" },
    currentUser.role === "student"
      ? { label: "My Team", icon: Users, to: "/teams" }
      : currentUser.role === "mentor"
      ? { label: "My Teams", icon: Users, to: "/mentorship" }
      : null,
    { label: "Submissions", icon: ClipboardCheck, to: "/projects" },
    { label: "Notifications", icon: Bell, to: "#" },
    { label: "Help / FAQ", icon: Book, to: "#" },
  ].filter(Boolean) as { label: string; icon: any; to: string }[];

  return (
    <div className="hidden md:flex flex-col bg-white border-r min-h-screen w-56 p-4 rounded-tr-2xl rounded-br-2xl shadow-lg">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-projexia-600 rounded-full text-white font-bold px-2.5 py-1.5 text-lg">
            P
          </span>
          <span className="ml-1 font-semibold text-projexia-700 text-xl">Projexia</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map(({ label, icon: Icon, to }) => (
          <Link
            to={to}
            key={label}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium hover:bg-projexia-50 transition ${
              location.pathname === to
                ? "bg-projexia-100 text-projexia-700"
                : "text-gray-700"
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
