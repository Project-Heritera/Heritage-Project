import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { LuScrollText } from "react-icons/lu";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import NavbarDropDown from "@/assets/navbar/NavbarDropDown";

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { path: "/home", label: "HOME" },
    { path: "/courses", label: "COURSES" },
    { path: "/create", label: "CREATE" },
    { path: "/about", label: "ABOUT" },
    { path: "/dictionary/creole", label: "DICTIONARY" },
    { path: "/login", label: "LOGIN/SIGNUP" },
  ];

  return (
    <nav className="w-full bg-background border-b sticky top-0 left-0 right-0 z-50 min-h-[60px]">
      <div className="w-full flex items-center justify-between min-h-[60px] px-8 sm:px-6">
        <Link to="/home" className="flex items-center gap-2">
          {/* <LuScrollText className = "text-2xl" /> */}

          <h1
            className="text-3xl font-bold tracking-tight text-primary "
            style={{ fontFamily: "'Lobster Two', cursive" }}
          >
            heritera
          </h1>
        </Link>

        <div className="hidden md:flex flex-1 justify-center">
          <ul className="flex items-center gap-2">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Button
                  asChild
                  variant="ghost"
                  style={{ fontFamily: "'Zalando Sans Expanded'" }}
                  className={`text-base font-medium h-auto px-4 py-2 ${
                    isActive(link.path)
                      ? "text-primary hover:text-primary-foreground"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  <Link to={link.path}>{link.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="hover:cursor-pointer">
          <NavbarDropDown />
        </div>
      </div>
    </nav>
  );
}
