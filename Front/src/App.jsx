import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import PIPMETAMST01 from "./screens/PIPMETAMST01.jsx";
import PIPACTLOGS01 from "./screens/PIPACTLOGS01/PIPACTLOGS01.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/meta-master" replace />} />
          <Route path="/meta-master" element={<PIPMETAMST01 />} />
          <Route path="/assets" element={<Navigate to="/meta-master" replace />} />
          <Route path="/activity-log" element={<PIPACTLOGS01 />} />
          <Route path="*" element={<Navigate to="/meta-master" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
