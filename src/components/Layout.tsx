import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

export default function Layout() {
  return (
    <div
      className="mx-auto min-h-screen max-w-lg px-4 pb-32 transition-[padding-top] duration-200"
      style={{
        paddingTop:
          "calc(max(1rem, env(safe-area-inset-top, 0px)) + var(--pwa-update-pad, 0px))",
      }}
    >
      <Outlet />
      <Navigation />
    </div>
  );
}
