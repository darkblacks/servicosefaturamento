import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { ServiceRow, TipoOperacao } from "../types";

interface ChartsSectionProps {
  rows: ServiceRow[];
  usandoSimulacao: boolean;
}

type ChartFilter = TipoOperacao | "ambos";

function getQuantidade(row: ServiceRow, usandoSimulacao: boolean) {
  return usandoSimulacao ? row.quantidadeTeorica : row.quantidadeAtual;
}

function getValor(row: ServiceRow, usandoSimulacao: boolean) {
  const quantidade = getQuantidade(row, usandoSimulacao);
  const preco = usandoSimulacao ? row.precoTeorico : row.precoAtual;
  return quantidade * preco;
}

export function ChartsSection({
  rows,
  usandoSimulacao,
}: ChartsSectionProps) {
  const [chartFilter, setChartFilter] = useState<ChartFilter>("ambos");

  const pizzaData = useMemo(() => {
    const proprio = rows
      .filter((row) => row.tipo === "proprio")
      .reduce((acc, row) => acc + getQuantidade(row, usandoSimulacao), 0);

    const terceiro = rows
      .filter((row) => row.tipo === "terceiro")
      .reduce((acc, row) => acc + getQuantidade(row, usandoSimulacao), 0);

    return {
      proprio,
      terceiro,
      total: proprio + terceiro,
    };
  }, [rows, usandoSimulacao]);

  const faturamentoData = useMemo(() => {
    const proprio = rows
      .filter((row) => row.tipo === "proprio")
      .reduce((acc, row) => acc + getValor(row, usandoSimulacao), 0);

    const terceiro = rows
      .filter((row) => row.tipo === "terceiro")
      .reduce((acc, row) => acc + getValor(row, usandoSimulacao), 0);

    return {
      proprio,
      terceiro,
      total: proprio + terceiro,
    };
  }, [rows, usandoSimulacao]);

  const barData = useMemo(() => {
    const filteredRows =
      chartFilter === "ambos"
        ? rows
        : rows.filter((row) => row.tipo === chartFilter);

    const grouped = new Map<string, number>();

    filteredRows.forEach((row) => {
      const atual = grouped.get(row.servico) ?? 0;
      grouped.set(row.servico, atual + getQuantidade(row, usandoSimulacao));
    });

    const entries = Array.from(grouped.entries()).map(([servico, total]) => ({
      servico,
      total,
    }));

    entries.sort((a, b) => b.total - a.total);

    return entries;
  }, [rows, chartFilter, usandoSimulacao]);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  const pieOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "#ffffff",
      borderColor: "#FFD8CC",
      borderWidth: 1,
      textStyle: {
        color: "#333333",
      },
    },
    legend: {
      bottom: 0,
      left: "center",
      textStyle: {
        color: "#333333",
        fontSize: 13,
        fontWeight: 600,
      },
      itemWidth: 16,
      itemHeight: 10,
    },
    series: [
      {
        name: "Serviços",
        type: "pie",
        radius: ["48%", "72%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#F9F9F9",
          borderWidth: 4,
        },
        label: {
          show: true,
          color: "#333333",
          fontSize: 13,
          fontWeight: 700,
          formatter: "{b}\n{c}",
        },
        labelLine: {
          length: 14,
          length2: 10,
          lineStyle: {
            color: "#FF7F50",
          },
        },
        data: [
          {
            value: pizzaData.proprio,
            name: "Próprio",
            itemStyle: { color: "#FF7F50" },
          },
          {
            value: pizzaData.terceiro,
            name: "Terceiro",
            itemStyle: { color: "#000000" },
          },
        ],
      },
    ],
  };

  const barOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "#ffffff",
      borderColor: "#FFD8CC",
      borderWidth: 1,
      textStyle: {
        color: "#333333",
      },
    },
    grid: {
      left: 36,
      right: 20,
      top: 30,
      bottom: 95,
    },
    xAxis: {
      type: "category",
      data: barData.map((item) => item.servico),
      axisLabel: {
        interval: 0,
        rotate: 24,
        color: "#333333",
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: "#FFD8CC",
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
      name: "Serviços",
      nameTextStyle: {
        color: "#333333",
        fontWeight: 700,
      },
      axisLabel: {
        color: "#333333",
      },
      splitLine: {
        lineStyle: {
          color: "#FFE7DF",
        },
      },
    },
    series: [
      {
        data: barData.map((item) => item.total),
        type: "bar",
        barMaxWidth: 42,
        itemStyle: {
          color: "#FF7F50",
          borderRadius: [10, 10, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: "#000000",
          },
        },
      },
    ],
  };

  return (
    <section className="charts-panel">


      <div className="charts-panel-body">
        <div className="charts-top-row">
          <div className="charts-pie-block">
            <div className="chart-title-wrap">
              <h3>Serviços: Próprio x Terceiro</h3>
              <p>Distribuição por quantidade de serviços realizados</p>
            </div>

            <ReactECharts option={pieOption} style={{ height: 320 }} />
          </div>

          <div className="charts-side-panel">
            <div className="charts-finance-block">
                          <div className="charts-services-block">
              <div className="chart-title-wrap">
                <h3>Serviços</h3>
                <p>Quantidade total de serviços por tipo</p>
              </div>

              <div className="finance-cards finance-cards-inline">
                <div className="mini-finance-card">
                  <span>Próprio</span>
                  <strong>{pizzaData.proprio}</strong>
                </div>

                <div className="mini-finance-card">
                  <span>Terceiro</span>
                  <strong>{pizzaData.terceiro}</strong>
                </div>

                <div className="mini-finance-card total">
                  <span>Total</span>
                  <strong>{pizzaData.total}</strong>
                </div>
              </div>
            </div>
              <div className="chart-title-wrap">
                <h3>Faturamento</h3>
                <p>
                  {usandoSimulacao
                    ? "Valores considerando preço teórico"
                    : "Valores considerando preço original"}
                </p>
              </div>

              <div className="finance-cards finance-cards-inline">
                <div className="mini-finance-card">
                  <span>Próprio</span>
                  <strong>{formatCurrency(faturamentoData.proprio)}</strong>
                </div>

                <div className="mini-finance-card">
                  <span>Terceiro</span>
                  <strong>{formatCurrency(faturamentoData.terceiro)}</strong>
                </div>

                <div className="mini-finance-card total">
                  <span>Total</span>
                  <strong>{formatCurrency(faturamentoData.total)}</strong>
                </div>
              </div>
            </div>


          </div>
        </div>

        <div className="charts-bottom-row">
          <div className="chart-header-row">
            <div className="chart-title-wrap">
              <h3>Serviços realizados por serviço</h3>
              <p>Filtre entre próprio, terceiro ou ambos</p>
            </div>

            <div className="segmented-control">
              <button
                className={`segment-btn ${
                  chartFilter === "proprio" ? "active" : ""
                }`}
                onClick={() => setChartFilter("proprio")}
              >
                Próprio
              </button>

              <button
                className={`segment-btn ${
                  chartFilter === "terceiro" ? "active" : ""
                }`}
                onClick={() => setChartFilter("terceiro")}
              >
                Terceiro
              </button>

              <button
                className={`segment-btn ${
                  chartFilter === "ambos" ? "active" : ""
                }`}
                onClick={() => setChartFilter("ambos")}
              >
                Ambos
              </button>
            </div>
          </div>

          <ReactECharts option={barOption} style={{ height: 390 }} />
        </div>
      </div>
    </section>
  );
}