export type TipoOperacao = "proprio" | "terceiro";

export interface ServiceRow {
  id: string;
  mes: string;
  servico: string;
  tipo: TipoOperacao;

  quantidadeAtual: number;
  precoAtual: number;

  quantidadeTeorica: number;
  precoTeorico: number;
}

export interface DashboardTotals {
  totalQuantidade: number;
  totalValor: number;
}