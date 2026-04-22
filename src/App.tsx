import { Link, Navigate, Route, Routes } from "react-router-dom";
import Servicos from "./pages/servicos";

import AnaliseAbastecimentoTerceiros from "./pages/AnaliseAbastecimentoTerceiros";

export default function App() {
  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: "12px",
          padding: "16px 24px",
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "24px",
          background: "#fff",
        }}
      >
        <Link to="/servicos">Serviços</Link>
        <Link to="/analise-abastecimento-terceiros">
          Análise Abastecimento Terceiros
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/servicos" replace />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route
          path="/analise-abastecimento-terceiros"
          element={<AnaliseAbastecimentoTerceiros />}
        />
      </Routes>
    </div>
  );
}
