import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { Dumbbell, LayoutDashboard, History, Scale } from "lucide-react";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Prehľad" },
  { to: "/workout", icon: Dumbbell, label: "Tréning" },
  { to: "/history", icon: History, label: "História" },
  { to: "/weight", icon: Scale, label: "Váha" },
];

function NavItem({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
}) {
  return (
    <NavLink
      key={to}
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-3 py-2 text-[11px] font-medium transition-colors ${
          isActive
            ? "text-brand-400"
            : "text-slate-500 active:text-slate-300"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export default function Navigation() {
  /* Portal: iOS/WebKit can break position:fixed when the bar shares a subtree with long scroll content.
     Outer shell stays fixed without backdrop-filter — blur on inner avoids fixed+backdrop containing-block bugs. */
  return createPortal(
    <nav className="fixed inset-x-0 bottom-0 z-50" aria-label="Hlavná navigácia">
      <div className="border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/80">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1">
          {links.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </div>
      </div>
    </nav>,
    document.body,
  );
}
