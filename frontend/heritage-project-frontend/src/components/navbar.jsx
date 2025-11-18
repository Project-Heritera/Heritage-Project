import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { path: "/login", label: "LOGIN/SIGNUP" },
    { path: "/courses", label: "COURSES" },
    { path: "/create", label: "CREATE" },
    { path: "/profile", label: "PROFILE" },
    { path: "/", label: "HOME" },
    { path: "/about", label: "ABOUT" },
    { path: "/contact", label: "CONTACT" },
  ];

  return (
    <nav className="w-full bg-[#023B4E] px-6 py-4 fixed top-0 left-0 right-0 z-50">

      <div className="flex items-center justify-between max-w-7xl ml-8">
        <Link to="/" className="flex items-center">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Lobster Two', cursive" }}>
            vivan
          </h1>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={` font-medium transition-colors ${
                isActive(link.path)
                  ? "text-[#FDD023]"
                  : "text-[#FFFFFF] hover:text-[#FDD023]"
              }`}
              style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div
            className="flex items-center justify-center text-[#FFFFFF] hover:text-[#FDD023] transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-10 h-10" strokeWidth={2.5} />
          </div>

      </div>

    </nav>
  );
}
