import type { MetricaKey } from "../../pages/AnaliseAbastecimentoTerceiros";

type Props = {
  propriedades: string[];
  placas: string[];
  propriedadeSelecionada: string;
  placaSelecionada: string;
  metricaSelecionada: MetricaKey;
  setPropriedadeSelecionada: (value: string) => void;
  setPlacaSelecionada: (value: string) => void;
  setMetricaSelecionada: (value: MetricaKey) => void;
};

export default function FiltrosAnalise({
  propriedades,
  placas,
  propriedadeSelecionada,
  placaSelecionada,
  metricaSelecionada,
  setPropriedadeSelecionada,
  setPlacaSelecionada,
  setMetricaSelecionada,
}: Props) {
  return (
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
  );
}