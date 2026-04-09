import { useEffect, useMemo, useState } from "react";
import { loadBaseData } from "./data/base";
import { DashboardCards } from "./components/DashboardCards";
import { ServicesTable } from "./components/ServicesTable";
import { ChartsSection } from "./components/ChartsSection";
import type { ServiceRow, TipoOperacao } from "./types";

function App() {
  const [originalRows, setOriginalRows] = useState<ServiceRow[]>([]);
  const [editableRows, setEditableRows] = useState<ServiceRow[]>([]);
  const [usandoSimulacao, setUsandoSimulacao] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState("total");
  const [tipoSelecionado, setTipoSelecionado] =
    useState<TipoOperacao>("proprio");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadBaseData();
        setOriginalRows(data);
        setEditableRows(data);
        setMesSelecionado("total");
      } catch (error) {
        console.error("Erro ao carregar Base.xlsx:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const meses = useMemo(() => {
    return [...new Set(originalRows.map((item) => item.mes))];
  }, [originalRows]);

  const visibleRows = useMemo(() => {
    if (mesSelecionado === "total") {
      return editableRows;
    }

    return editableRows.filter((row) => row.mes === mesSelecionado);
  }, [editableRows, mesSelecionado]);

  const tabelaRows = useMemo(() => {
    return visibleRows.filter((row) => row.tipo === tipoSelecionado);
  }, [visibleRows, tipoSelecionado]);

  const tituloPeriodo =
    mesSelecionado === "total" ? "Todos os meses" : mesSelecionado;

  function handleChangeTheoretical(
    id: string,
    field: "precoTeorico" | "quantidadeTeorica",
    value: number
  ) {
    setEditableRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        return {
          ...row,
          [field]: Number.isNaN(value) ? 0 : value,
        };
      })
    );
  }

  function handleApplyTheoretical() {
    setUsandoSimulacao(true);
  }

  function handleResetOriginal() {
    const resetRows = originalRows.map((row) => ({
      ...row,
      quantidadeTeorica: row.quantidadeAtual,
      precoTeorico: row.precoAtual,
    }));

    setEditableRows(resetRows);
    setUsandoSimulacao(false);
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="container">
          <h1>Carregando base...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Dashboard Faturamento</h1>
            <p>Dashboard de serviços e preços, original e teórico — {tituloPeriodo}</p>
          </div>

          <div className="actions">
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
            >
              <option value="total">Total</option>

              {meses.map((mes) => (
                <option key={mes} value={mes}>
                  {mes}
                </option>
              ))}
            </select>

            <button className="btn primary" onClick={handleApplyTheoretical}>
              Aplicar teórico
            </button>

            <button className="btn secondary" onClick={handleResetOriginal}>
              Voltar ao original
            </button>
          </div>
        </div>

        <DashboardCards usandoSimulacao={usandoSimulacao} />

        <ChartsSection rows={visibleRows} usandoSimulacao={usandoSimulacao} />

        <div className="table-switch-card">
          <div className="table-switch-header">
            <div>
              <h2>Detalhamento por Tipo</h2>
              <p>
                Visualize e edite os valores teóricos de{" "}
                {tipoSelecionado === "proprio" ? "próprio" : "terceiro"}.
              </p>
            </div>

            <div className="segmented-control">
              <button
                className={`segment-btn ${
                  tipoSelecionado === "proprio" ? "active" : ""
                }`}
                onClick={() => setTipoSelecionado("proprio")}
              >
                Próprio
              </button>

              <button
                className={`segment-btn ${
                  tipoSelecionado === "terceiro" ? "active" : ""
                }`}
                onClick={() => setTipoSelecionado("terceiro")}
              >
                Terceiro
              </button>
            </div>
          </div>

          <ServicesTable
            title={
              tipoSelecionado === "proprio"
                ? "Tabela de Próprio"
                : "Tabela de Terceiro"
            }
            rows={tabelaRows}
            onChangeTheoretical={handleChangeTheoretical}
          />
        </div>
      </div>
    </div>
  );
}

export default App;