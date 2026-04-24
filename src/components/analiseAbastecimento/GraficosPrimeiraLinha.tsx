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
  grafico1Data: {
  mes: string;
  valor: number;
  totalLitros: number;
  diferencaMesAnterior: number;
  totalDiferenca: number;
}[];
  grafico2Data: { mes: string; valor: number }[];
  placaSelecionada: string;
  metricaLabel: string;
  tooltipFormatter: (value: unknown) => string;
  formatNumero: (value: number, casas?: number) => string;
};

function EmptyChart({ message }: { message: string }) {
  return <div className="empty-chart">{message}</div>;
}

function TooltipGraficoGeral({
  active,
  payload,
  label,
  tooltipFormatter,
}: any) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;

  const valor = item?.valor ?? 0;
  const diferenca = item?.diferencaMesAnterior ?? 0;
  const totalDiferenca = item?.totalDiferenca ?? 0;

  const corTotalDiferenca =
    totalDiferenca > 0 ? "#dc2626" : totalDiferenca < 0 ? "#16a34a" : "#64748b";

  return (
    <div className="custom-tooltip">
      <strong className="custom-tooltip__title">{label}</strong>

      <div className="custom-tooltip__line">
        <span>Valor:</span>
        <strong>{tooltipFormatter(valor)}</strong>
      </div>

      <div className="custom-tooltip__line">
        <span>Diferença mês anterior:</span>
        <strong>{tooltipFormatter(diferenca)}</strong>
      </div>

      <div className="custom-tooltip__line">
        <span>Total da diferença:</span>
        <strong style={{ color: corTotalDiferenca }}>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalDiferenca)}
        </strong>
      </div>
    </div>
  );
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
  <Tooltip
  content={
    <TooltipGraficoGeral tooltipFormatter={tooltipFormatter} />
  }
  formatter={(value, name, item) => {
    const payload = item.payload as {
      diferencaMesAnterior?: number;
      totalDiferenca?: number;
    };

    const diferenca = payload.diferencaMesAnterior ?? 0;
    const totalDiferenca = payload.totalDiferenca ?? 0;

    return [
      `${tooltipFormatter(value)} | Dif. mês anterior: ${tooltipFormatter(
        diferenca
      )} | Total da diferença: ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(totalDiferenca)}`,
      name,
    ];
  }}
/>
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