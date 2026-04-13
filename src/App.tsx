import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Workout = lazy(() => import("@/pages/Workout"));
const History = lazy(() => import("@/pages/History"));
const BodyWeight = lazy(() => import("@/pages/BodyWeight"));

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin" aria-label="Načítavam" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="workout" element={<Workout />} />
            <Route path="history" element={<History />} />
            <Route path="weight" element={<BodyWeight />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
