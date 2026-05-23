import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-[#14161a] text-white dark:bg-white dark:text-[#14161a]"
        : "text-[#3f4652] hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f7f8fb]/82 backdrop-blur-xl dark:border-white/10 dark:bg-[#08090b]/82">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="text-lg font-bold tracking-tight">
          Adarsh
        </NavLink>
        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          <button onClick={toggleTheme} className="button-secondary px-4 py-2">
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
        <button className="button-secondary px-4 py-2 md:hidden" onClick={() => setOpen((value) => !value)}>
          Menu
        </button>
      </nav>
      {open && (
        <div className="mx-auto grid max-w-6xl gap-2 px-5 pb-4 md:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <button onClick={toggleTheme} className="button-secondary px-4 py-2">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      )}
    </header>
  );
}
