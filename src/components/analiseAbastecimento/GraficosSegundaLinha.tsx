import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  meses: string[];
  mesGraficoFornecedor: string;
  setMesGraficoFornecedor: (value: string) => void;
  grafico3Data: { nome: string; valor: number }[];
  grafico4Data: { placa: string; valor: number }[];
  propriedadeSelecionada: string;
  metricaLabel: string;
  tooltipFormatter: (value: unknown) => string;
  formatNumero: (value: number, casas?: number) => string;
};

function EmptyChart({ message }: { message: string }) {
  return <div className="empty-chart">{message}</div>;
}

export default function GraficosSegundaLinha({
  meses,
  mesGraficoFornecedor,
  setMesGraficoFornecedor,
  grafico3Data,
  grafico4Data,
  propriedadeSelecionada,
  metricaLabel,
  tooltipFormatter,
  formatNumero,
}: Props) {
  return (
    <article className="chart-card chart-card--full">
      <div className="chart-header chart-header--split">
        <div>
          <h2 className="chart-title">Comparações por mês local</h2>
          <p className="chart-subtitle">
            Fornecedores e placas · Métrica: {metricaLabel}
          </p>
        </div>

        <div className="chart-local-filter">
          <label className="filter-label filter-label--small" htmlFor="filtro-mes-grafico">
            Mês local
          </label>

          <select
            id="filtro-mes-grafico"
            className="filter-select"
            value={mesGraficoFornecedor}
            onChange={(e) => setMesGraficoFornecedor(e.target.value)}
          >
            <option value="Todos">Todos</option>

            {meses.map((mes) => (
              <option key={mes} value={mes}>
                {mes}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="charts-grid charts-grid--inside">
        <article className="chart-card chart-card--inner">
          <div className="chart-header">
            <h2 className="chart-title">Comparação de fornecedores</h2>
            <p className="chart-subtitle">Métrica: {metricaLabel}</p>
          </div>

          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grafico3Data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis
                  tickFormatter={(value) => formatNumero(Number(value), 0)}
                />
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
                <Bar
                  dataKey="valor"
                  name={metricaLabel}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="chart-card chart-card--inner">
          <div className="chart-header">
            <h2 className="chart-title">
              Comparação das placas da Propriedade selecionada
            </h2>
            <p className="chart-subtitle">Métrica: {metricaLabel}</p>
          </div>

          <div className="chart-area">
            {propriedadeSelecionada ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grafico4Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="placa" />
                  <YAxis
                    tickFormatter={(value) => formatNumero(Number(value), 0)}
                  />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Bar
                    dataKey="valor"
                    name={propriedadeSelecionada}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Nenhuma Propriedade selecionada" />
            )}
          </div>
        </article>
      </div>
    </article>
  );
}