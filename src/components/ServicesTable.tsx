import type { ServiceRow } from "../types";

interface ServicesTableProps {
  title: string;
  rows: ServiceRow[];
  onChangeTheoretical: (
    id: string,
    field: "precoTeorico" | "quantidadeTeorica",
    value: number
  ) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ServicesTable({
  title,
  rows,
  onChangeTheoretical,
}: ServicesTableProps) {
  return (
    <div className="table-card">
      <h2>{title}</h2>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Serviço</th>
              <th>Qtd Atual</th>
              <th>Preço Atual</th>
              <th>Total Atual</th>
              <th>Qtd Teórica</th>
              <th>Preço Teórico</th>
              <th>Total Teórico</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const totalAtual = row.quantidadeAtual * row.precoAtual;
              const totalTeorico = row.quantidadeTeorica * row.precoTeorico;

              return (
                <tr key={row.id}>
                  <td>{row.servico}</td>
                  <td>{row.quantidadeAtual}</td>
                  <td>{formatCurrency(row.precoAtual)}</td>
                  <td>{formatCurrency(totalAtual)}</td>

                  <td>
                    <input
                      type="number"
                      min={0}
                      value={row.quantidadeTeorica}
                      onChange={(e) =>
                        onChangeTheoretical(
                          row.id,
                          "quantidadeTeorica",
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.precoTeorico}
                      onChange={(e) =>
                        onChangeTheoretical(
                          row.id,
                          "precoTeorico",
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>

                  <td>{formatCurrency(totalTeorico)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}