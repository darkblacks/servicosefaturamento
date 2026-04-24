import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  grafico1Data: { mes: string; valor: number }[];
  grafico2Data: { mes: string; valor: number }[];
  placaSelecionada: string;
  metricaLabel: string;
  tooltipFormatter: (value: unknown) => string;
  formatNumero: (value: number, casas?: number) => string;
};

function EmptyChart({ message }: { message: string }) {
  return <div className="empty-chart">{message}</div>;
}

export default function GraficosPrimeiraLinha({
  grafico1Data,
  grafico2Data,
  placaSelecionada,
  metricaLabel,
  tooltipFormatter,
  formatNumero,
}: Props) {
  return (
    <>
      <article className="chart-card">
        <div className="chart-header">
          <h2 className="chart-title">Evolução mensal geral</h2>
          <p className="chart-subtitle">
            Não muda ao selecionar placa · Métrica: {metricaLabel}
          </p>
        </div>

        <div className="chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={grafico1Data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => formatNumero(Number(value), 0)} />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Line
                type="monotone"
                dataKey="valor"
                name={metricaLabel}
                strokeWidth={3}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="chart-card">
        <div className="chart-header">
          <h2 className="chart-title">Placa selecionada</h2>
          <p className="chart-subtitle">Métrica: {metricaLabel}</p>
        </div>

        <div className="chart-area">
          {placaSelecionada ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={grafico2Data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis
                  tickFormatter={(value) => formatNumero(Number(value), 0)}
                />
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="valor"
                  name={placaSelecionada}
                  strokeWidth={3}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Nenhuma Placa selecionada" />
          )}
        </div>
      </article>
    </>
  );
}