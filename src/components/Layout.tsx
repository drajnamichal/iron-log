import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

export default function Layout() {
  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-32" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
      <Outlet />
      <Navigation />
    </div>
  );
}
