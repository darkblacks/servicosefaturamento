import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./css/AnaliseAbastecimentoTerceiros.css";

type LinhaOriginal = Record<string, unknown>;

type LinhaTratada = {
  mes: string;
  placa: string;
  propriedadeLinha: string;
  propriedade: string;
  litros: number;
  total: number;
  viagens: number;
  rsLitro: number;
};

type MetricaKey = "total" | "litros" | "rsLitro";

const NOME_ARQUIVO = encodeURI("/04 - ABRIL.xlsx");

function normalizarTexto(valor: unknown) {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizarCabecalho(valor: unknown) {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\$/g, "rs")
    .replace(/[^\w]+/g, "");
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (value == null || value === "") {
    return 0;
  }

  const text = String(value)
    .trim()
    .replace(/\s+/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizarMes(valor: unknown) {
  const texto = String(valor ?? "").trim();
  if (!texto) return "";
  if (/^\d{4}-\d{2}$/.test(texto)) return texto;
  return texto;
}

function pick(row: LinhaOriginal, aliases: string[]) {
  const entries = Object.entries(row);

  for (const alias of aliases) {
    const aliasNormalizado = normalizarCabecalho(alias);
    const found = entries.find(
      ([key]) => normalizarCabecalho(key) === aliasNormalizado
    );
    if (found) return found[1];
  }

  return "";
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatNumero(value: number, casas = 0) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(value);
}

function getMetricLabel(metrica: MetricaKey) {
  if (metrica === "total") return "Reais";
  if (metrica === "litros") return "Litros";
  return "R$ por Litro";
}

function getMetricValue(item: LinhaTratada, metrica: MetricaKey) {
  if (metrica === "total") return item.total;
  if (metrica === "litros") return item.litros;
  return item.rsLitro;
}

function formatMetricValue(value: number, metrica: MetricaKey) {
  if (metrica === "total") return formatBRL(value);
  if (metrica === "litros") return formatNumero(value, 0);
  return formatNumero(value, 2);
}

function EmptyChart({
  message,
}: {
  message: string;
}) {
  return <div className="empty-chart">{message}</div>;
}

export default function AnaliseAbastecimentoTerceiros() {
  const [rows, setRows] = useState<LinhaTratada[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [propriedadeSelecionada, setPropriedadeSelecionada] = useState("");
  const [placaSelecionada, setPlacaSelecionada] = useState("");
  const [metricaSelecionada, setMetricaSelecionada] =
    useState<MetricaKey>("total");

  const [mesGraficoFornecedor, setMesGraficoFornecedor] = useState("Todos");

  useEffect(() => {
    async function carregarArquivo() {
      try {
        setLoading(true);
        setErro("");

        const response = await fetch(NOME_ARQUIVO);

        if (!response.ok) {
          throw new Error(`Arquivo não encontrado. Status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (
          contentType.includes("text/html") ||
          contentType.includes("application/json")
        ) {
          throw new Error(
            "A URL retornou HTML/JSON em vez do Excel. Verifique se o arquivo está em public/04 - ABRIL.xlsx."
          );
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const nomeAba = workbook.SheetNames.find(
          (name) => normalizarTexto(name) === "abastecimento consolidado"
        );

        if (!nomeAba) {
          throw new Error("A aba 'ABASTECIMENTO CONSOLIDADO' não foi encontrada.");
        }

        const sheet = workbook.Sheets[nomeAba];
        const json = XLSX.utils.sheet_to_json<LinhaOriginal>(sheet, {
          defval: "",
        });

        const tratados = json
          .map((item) => {
            const mes = normalizarMes(pick(item, ["Mês", "MES", "mes"]));
            const placa = String(pick(item, ["Placa", "PLACA"])).trim();
            const propriedadeLinha = String(
              pick(item, ["PROPRIEDADE", "Propriedade"])
            ).trim();
            const propriedade = String(
              pick(item, ["proprio", "Proprio", "Fornecedor", "fornecedor"])
            ).trim();

            const litros = toNumber(pick(item, ["Litros", " Litros "]));
            const total = toNumber(pick(item, ["R$TOTAL", " R$TOTAL ", "Total"]));
            const viagens = toNumber(
              pick(item, ["Total de Viagens", "TotalViagens"])
            );
            const rsLitro = toNumber(pick(item, ["R$/Litros", "R$/Litro"]));

            return {
              mes,
              placa,
              propriedadeLinha,
              propriedade,
              litros,
              total,
              viagens,
              rsLitro,
            };
          })
          .filter((item) => {
            const propriedadeLinhaNormalizada = normalizarTexto(item.propriedadeLinha);
            const propriedadeNormalizada = normalizarTexto(item.propriedade);

            return (
              propriedadeLinhaNormalizada === "terceiro" &&
              propriedadeNormalizada !== "ignorar" &&
              propriedadeNormalizada !== "proprio" &&
              item.mes !== "" &&
              item.placa !== "" &&
              item.propriedade !== ""
            );
          });

        setRows(tratados);
      } catch (e) {
        console.error(e);
        setErro(e instanceof Error ? e.message : "Erro ao ler arquivo.");
      } finally {
        setLoading(false);
      }
    }

    carregarArquivo();
  }, []);

  const meses = useMemo(() => {
    return [...new Set(rows.map((item) => item.mes))].sort();
  }, [rows]);

  const propriedades = useMemo(() => {
    return [...new Set(rows.map((item) => item.propriedade))].sort();
  }, [rows]);

  const placas = useMemo(() => {
    const base = propriedadeSelecionada
      ? rows.filter((item) => item.propriedade === propriedadeSelecionada)
      : rows;

    return [...new Set(base.map((item) => item.placa))].sort();
  }, [rows, propriedadeSelecionada]);

  const baseSemFiltroPlaca = useMemo(() => {
    return rows.filter((item) => {
      if (propriedadeSelecionada && item.propriedade !== propriedadeSelecionada) {
        return false;
      }
      return true;
    });
  }, [rows, propriedadeSelecionada]);

  const baseComFiltrosPrincipais = useMemo(() => {
    return rows.filter((item) => {
      if (propriedadeSelecionada && item.propriedade !== propriedadeSelecionada) {
        return false;
      }
      if (placaSelecionada && item.placa !== placaSelecionada) {
        return false;
      }
      return true;
    });
  }, [rows, propriedadeSelecionada, placaSelecionada]);

  const kpis = useMemo(() => {
    const totalReais = baseComFiltrosPrincipais.reduce((acc, item) => acc + item.total, 0);
    const totalLitros = baseComFiltrosPrincipais.reduce((acc, item) => acc + item.litros, 0);
    const totalViagens = baseComFiltrosPrincipais.reduce((acc, item) => acc + item.viagens, 0);

    return {
      totalReais,
      totalLitros,
      totalViagens,
      rsLitroMedio: totalLitros ? totalReais / totalLitros : 0,
    };
  }, [baseComFiltrosPrincipais]);

const grafico1Data = useMemo(() => {
  const grupos = new Map<string, LinhaTratada[]>();

  baseSemFiltroPlaca.forEach((item) => {
    if (!grupos.has(item.mes)) {
      grupos.set(item.mes, []);
    }

    grupos.get(item.mes)!.push(item);
  });

  return Array.from(grupos.entries())
    .map(([mes, items]) => {
      let valor = 0;

      if (metricaSelecionada === "total") {
        valor = items.reduce((acc, item) => acc + item.total, 0);
      } else if (metricaSelecionada === "litros") {
        valor = items.reduce((acc, item) => acc + item.litros, 0);
      } else {
        const somaRsLitro = items.reduce((acc, item) => acc + item.rsLitro, 0);
        valor = items.length ? somaRsLitro / items.length : 0;
      }

      return { mes, valor };
    })
    .sort((a, b) => a.mes.localeCompare(b.mes));
}, [baseSemFiltroPlaca, metricaSelecionada]);

  const grafico2Data = useMemo(() => {
    if (!placaSelecionada) return [];

    const mapa = new Map<string, number>();

    baseComFiltrosPrincipais.forEach((item) => {
      mapa.set(
        item.mes,
        (mapa.get(item.mes) ?? 0) + getMetricValue(item, metricaSelecionada)
      );
    });

    return Array.from(mapa.entries())
      .map(([mes, valor]) => ({ mes, valor }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [baseComFiltrosPrincipais, placaSelecionada, metricaSelecionada]);

const grafico3Data = useMemo(() => {
  const baseMes =
    mesGraficoFornecedor === "Todos"
      ? baseSemFiltroPlaca
      : baseSemFiltroPlaca.filter((item) => item.mes >= mesGraficoFornecedor);

  const grupos = new Map<string, LinhaTratada[]>();

  baseMes.forEach((item) => {
    if (!grupos.has(item.propriedade)) {
      grupos.set(item.propriedade, []);
    }

    grupos.get(item.propriedade)!.push(item);
  });

  return Array.from(grupos.entries())
    .map(([nome, items]) => {
      let valor = 0;

      if (metricaSelecionada === "total") {
        valor = items.reduce((acc, item) => acc + item.total, 0);
      } else if (metricaSelecionada === "litros") {
        valor = items.reduce((acc, item) => acc + item.litros, 0);
      } else {
        const somaRsLitro = items.reduce((acc, item) => acc + item.rsLitro, 0);
        valor = items.length ? somaRsLitro / items.length : 0;
      }

      return { nome, valor };
    })
    .sort((a, b) => b.valor - a.valor);
}, [baseSemFiltroPlaca, mesGraficoFornecedor, metricaSelecionada]);

const grafico4Data = useMemo(() => {
  if (!propriedadeSelecionada) return [];

  // Criamos um mapa para agrupar os itens por placa
  const grupos = new Map<string, LinhaTratada[]>();

  rows
    .filter((item) => item.propriedade === propriedadeSelecionada)
    .forEach((item) => {
      if (!grupos.has(item.placa)) {
        grupos.set(item.placa, []);
      }
      grupos.get(item.placa)!.push(item);
    });

  return Array.from(grupos.entries())
    .map(([placa, items]) => {
      let valor = 0;

      if (metricaSelecionada === "total") {
        valor = items.reduce((acc, item) => acc + item.total, 0);
      } else if (metricaSelecionada === "litros") {
        valor = items.reduce((acc, item) => acc + item.litros, 0);
      } else {
        // Para R$ por Litro, tiramos a média dos valores das linhas daquela placa
        const somaRsLitro = items.reduce((acc, item) => acc + item.rsLitro, 0);
        valor = items.length ? somaRsLitro / items.length : 0;
      }

      return { placa, valor };
    })
    .sort((a, b) => b.valor - a.valor); // Mantém o ranking do maior para o menor
}, [rows, propriedadeSelecionada, metricaSelecionada]);

const tooltipFormatter = (value: number | string | any) => {
  if (value === undefined || value === null) return "";
  
  // Retornamos apenas a string formatada do valor
  return formatMetricValue(Number(value), metricaSelecionada);
};

  if (loading) {
    return (
      <div className="analise-page">
        <div className="analise-container">
          <div className="analise-state">Carregando arquivo Excel...</div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="analise-page">
        <div className="analise-container">
          <div className="analise-error-card">
            <h1 className="analise-title">Erro ao carregar análise</h1>
            <p className="analise-error-text">{erro}</p>
            <p className="analise-helper">
              Verifique se o arquivo está em <strong>public/04 - ABRIL.xlsx</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analise-page">
      <div className="analise-container">
        <header className="analise-header">
          <div>
            <h1 className="analise-title">Análise de Abastecimento - Terceiros</h1>
            <p className="analise-subtitle">
              Dashboard com 3 filtros principais e 4 gráficos analíticos.
            </p>
          </div>
        </header>

        <section className="kpi-grid">
          <article className="kpi-card">
            <span className="kpi-label">Reais</span>
            <strong className="kpi-value">{formatBRL(kpis.totalReais)}</strong>
          </article>

          <article className="kpi-card">
            <span className="kpi-label">Litros</span>
            <strong className="kpi-value">{formatNumero(kpis.totalLitros, 0)}</strong>
          </article>

          <article className="kpi-card">
            <span className="kpi-label">Viagens</span>
            <strong className="kpi-value">{formatNumero(kpis.totalViagens, 0)}</strong>
          </article>

          <article className="kpi-card">
            <span className="kpi-label">R$ por Litro médio</span>
            <strong className="kpi-value">{formatNumero(kpis.rsLitroMedio, 2)}</strong>
          </article>
        </section>

        <section className="filters-grid filters-grid--top">
          <div className="filter-card">
            <label className="filter-label" htmlFor="filtro-propriedade">
              Propriedade
            </label>
            <select
              id="filtro-propriedade"
              className="filter-select"
              value={propriedadeSelecionada}
              onChange={(e) => {
                setPropriedadeSelecionada(e.target.value);
                setPlacaSelecionada("");
              }}
            >
              <option value="">Selecione uma Propriedade</option>
              {propriedades.map((propriedade) => (
                <option key={propriedade} value={propriedade}>
                  {propriedade}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-card">
            <label className="filter-label" htmlFor="filtro-placa">
              Placa
            </label>
            <select
              id="filtro-placa"
              className="filter-select"
              value={placaSelecionada}
              onChange={(e) => setPlacaSelecionada(e.target.value)}
            >
              <option value="">Selecione uma Placa</option>
              {placas.map((placa) => (
                <option key={placa} value={placa}>
                  {placa}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-card">
            <label className="filter-label" htmlFor="filtro-metrica">
              Valor que governa os gráficos
            </label>
            <select
              id="filtro-metrica"
              className="filter-select"
              value={metricaSelecionada}
              onChange={(e) => setMetricaSelecionada(e.target.value as MetricaKey)}
            >
              <option value="total">Reais</option>
              <option value="rsLitro">R$ por Litro</option>
              <option value="litros">Litros</option>
            </select>
          </div>
        </section>

        <section className="charts-grid">
          <article className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">
                Evolução mensal geral (não influenciado pela placa selecionada)
              </h2>
              <p className="chart-subtitle">
                Eixo X = meses · Métrica: {getMetricLabel(metricaSelecionada)}
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
                    name={getMetricLabel(metricaSelecionada)}
                    strokeWidth={3}
                    dot={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Placa selecionada</h2>
              <p className="chart-subtitle">
                Eixo X = meses · Métrica: {getMetricLabel(metricaSelecionada)}
              </p>
            </div>

            <div className="chart-area">
              {placaSelecionada ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={grafico2Data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => formatNumero(Number(value), 0)} />
                    <Tooltip formatter={tooltipFormatter} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      name={placaSelecionada}
                      strokeWidth={3}
                      dot={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="Nenhuma Placa selecionada" />
              )}
            </div>
          </article>

          <article className="chart-card">
            <div className="chart-header chart-header--split">
              <div>
                <h2 className="chart-title">Comparação de fornecedores</h2>
                <p className="chart-subtitle">
                  Barras por fornecedor · Métrica: {getMetricLabel(metricaSelecionada)}
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

            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grafico3Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis tickFormatter={(value) => formatNumero(Number(value), 0)} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Bar
                    dataKey="valor"
                    name={getMetricLabel(metricaSelecionada)}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Comparação das placas da Propriedade selecionada</h2>
              <p className="chart-subtitle">
                Métrica: {getMetricLabel(metricaSelecionada)}
              </p>
            </div>

            <div className="chart-area">
              {propriedadeSelecionada ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={grafico4Data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="placa" />
                    <YAxis tickFormatter={(value) => formatNumero(Number(value), 0)} />
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
        </section>
      </div>
    </div>
  );
}
