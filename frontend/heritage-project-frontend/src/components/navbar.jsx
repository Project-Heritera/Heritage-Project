import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { path: "/courses", label: "LEARN" },
    { path: "/create", label: "CREATE" },
    { path: "/profile", label: "PROFILE" },
    { path: "/about", label: "ABOUT" },
    { path: "/contact", label: "CONTACT" },
  ];

  return (
    // The main nav element is now the relative container.
    // It is fixed and provides the consistent height.
    <nav className="w-full bg-[#023B4E] fixed top-0 left-0 right-0 z-50 min-h-[60px] relative">
      
      {/* 1. Logo (Always 15px from the left edge of the viewport) */}
      <div className="absolute left-[25px] top-1/2 transform -translate-y-1/2">
        <Link to="/" className="flex items-center">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Lobster Two', cursive", color: "#FDD023" }}
          >
            vivan
          </h1>
        </Link>
      </div>

      {/* 2. Centered Nav Links (Desktop Only) */}
      {/* These links are centered relative to the max-width container */}
      <div className="max-w-7xl mx-auto hidden md:flex items-center justify-center min-h-[60px]">
        <ul className="flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-[#FDD023]"
                    : "text-[#FFFFFF] hover:text-[#FDD023]"
                }`}
                style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Hamburger Button (Always 15px from the right edge of the viewport) */}
      <div className="absolute right-[25px] top-1/2 transform -translate-y-1/2">
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((s) => !s)}
            className="text-white hover:text-[#FDD023] focus:outline-none"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Dropdown (Appears below the fixed nav bar) */}
      {open && (
        <div className="pt-2 pb-3 px-4 md:hidden absolute top-[60px] w-full bg-[#023B4E]">
          <ul className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 rounded ${
                    isActive(link.path)
                      ? "text-[#023B4E] bg-[#FDD023]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}