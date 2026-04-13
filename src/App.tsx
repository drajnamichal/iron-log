import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Workout from "@/pages/Workout";
import History from "@/pages/History";
import BodyWeight from "@/pages/BodyWeight";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="workout" element={<Workout />} />
          <Route path="history" element={<History />} />
          <Route path="weight" element={<BodyWeight />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
