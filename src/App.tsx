import { Link, Navigate, Route, Routes } from "react-router-dom";
import Servicos from "./pages/servicos";
import "./App.css";
import AnaliseAbastecimentoTerceiros from "./pages/AnaliseAbastecimentoTerceiros";

export default function App() {
  return (
    <div>
      <nav className="app-navbar">
        <div className="app-navbar__brand">Dashboard Serviços</div>

        <div className="app-navbar__links">
          <Link to="/servicos">Serviços</Link>
          <Link to="/analise-abastecimento-terceiros">
            Análise Abastecimento Terceiros
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/servicos" replace />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route
          path="/analise-abastecimento-terceiros"
          element={<AnaliseAbastecimentoTerceiros />}
        />
        <Route path="*" element={<Navigate to="/servicos" replace />} />
      </Routes>
    </div>
  );
}
