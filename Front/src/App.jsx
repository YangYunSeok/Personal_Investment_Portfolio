import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import PIPMETAMST01 from "./screens/PIPMETAMST01.jsx";
import PIPACTLOGS01 from "./screens/PIPACTLOGS01/PIPACTLOGS01.jsx";
import PIPFXS01 from "./screens/PIPFXS01/PIPFXS01.jsx";
import PIPPOSHLDS01 from "./screens/PIPPOSHLDS01/PIPPOSHLDS01.jsx";
import PIPDASHS01 from "./screens/PIPDASHS01/PIPDASHS01.jsx";
import PIPSETTINGS01 from "./screens/PIPSETTINGS01/PIPSETTINGS01.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PIPDASHS01 />} />
          <Route path="/meta-master" element={<PIPMETAMST01 />} />
          <Route path="/assets" element={<Navigate to="/meta-master" replace />} />
          <Route path="/activity-log" element={<PIPACTLOGS01 />} />
          <Route path="/fx" element={<PIPFXS01 />} />
          <Route path="/positions" element={<PIPPOSHLDS01 />} />
          <Route path="/settings" element={<PIPSETTINGS01 />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

