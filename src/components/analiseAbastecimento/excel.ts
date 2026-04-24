import * as XLSX from "xlsx-js-style";
import type { LinhaTratada } from "../../pages/AnaliseAbastecimentoTerceiros";

type Resumo = {
  totalReais: number;
  totalLitros: number;
  reaisPorLitro: number;
};

const COLS_POR_MES = 6;

function calcularResumo(items: LinhaTratada[]): Resumo {
  const totalReais = items.reduce((acc, item) => acc + item.total, 0);
  const totalLitros = items.reduce((acc, item) => acc + item.litros, 0);
  const reaisPorLitro = totalLitros ? totalReais / totalLitros : 0;

  return { totalReais, totalLitros, reaisPorLitro };
}

function formatarNomeMes(mes: string) {
  const nomes: Record<string, string> = {
    "01": "Janeiro",
    "02": "Fevereiro",
    "03": "Março",
    "04": "Abril",
    "05": "Maio",
    "06": "Junho",
    "07": "Julho",
    "08": "Agosto",
    "09": "Setembro",
    "10": "Outubro",
    "11": "Novembro",
    "12": "Dezembro",
  };

  const [, numeroMes] = mes.split("-");
  return nomes[numeroMes] ?? mes;
}

function calcularDiferenca(atual: Resumo, anterior?: Resumo) {
  if (!anterior || atual.totalLitros === 0 || anterior.totalLitros === 0) {
    return 0;
  }

  return (atual.reaisPorLitro - anterior.reaisPorLitro) * atual.totalLitros;
}

const border = {
  top: { style: "thin", color: { rgb: "D9D9D9" } },
  bottom: { style: "thin", color: { rgb: "D9D9D9" } },
  left: { style: "thin", color: { rgb: "D9D9D9" } },
  right: { style: "thin", color: { rgb: "D9D9D9" } },
};

const estiloMes = {
  font: { bold: true, color: { rgb: "000000" } },
  alignment: { horizontal: "center", vertical: "center" },
  fill: { fgColor: { rgb: "FFFFFF" } },
};

const estiloCabecalho = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "4F81BD" } },
  alignment: { horizontal: "center", vertical: "center" },
  border,
};

const estiloCelula = {
  border,
};

const estiloTotal = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "1F4E79" } },
  alignment: { horizontal: "center", vertical: "center" },
  border,
};

export function exportarResumoAbastecimentoExcel(dados: LinhaTratada[]) {
  if (!dados?.length) {
    alert("Não há dados para exportar.");
    return;
  }

  const meses = [...new Set(dados.map((item) => item.mes))].sort();
  const propriedades = [...new Set(dados.map((item) => item.propriedade))].sort();

  const linhasExcel: Array<Array<string | number>> = [];

  const linhaMeses: Array<string | number> = [];

  meses.forEach((mes) => {
    linhaMeses.push(formatarNomeMes(mes), "", "", "", "", "");
  });

  linhasExcel.push(linhaMeses);

  propriedades.forEach((propriedade) => {
    const linhaCabecalho: Array<string | number> = [];

    meses.forEach(() => {
      linhaCabecalho.push(
        propriedade,
        "Reais Total",
        "Litros Total",
        "Reais por Litro",
        "Diferença",
        ""
      );
    });

    linhasExcel.push(linhaCabecalho);

    const placas = [
      ...new Set(
        dados
          .filter((item) => item.propriedade === propriedade)
          .map((item) => item.placa)
      ),
    ].sort();

    placas.forEach((placa) => {
      const linhaPlaca: Array<string | number> = [];

      meses.forEach((mes, indexMes) => {
        const atual = dados.filter(
          (item) =>
            item.mes === mes &&
            item.propriedade === propriedade &&
            item.placa === placa
        );

        const resumoAtual = calcularResumo(atual);

        const mesAnterior = meses[indexMes - 1];

        const anterior = mesAnterior
          ? dados.filter(
              (item) =>
                item.mes === mesAnterior &&
                item.propriedade === propriedade &&
                item.placa === placa
            )
          : [];

        const resumoAnterior = anterior.length
          ? calcularResumo(anterior)
          : undefined;

        linhaPlaca.push(
          placa,
          resumoAtual.totalReais,
          resumoAtual.totalLitros,
          resumoAtual.reaisPorLitro,
          calcularDiferenca(resumoAtual, resumoAnterior),
          ""
        );
      });

      linhasExcel.push(linhaPlaca);
    });

    const linhaTotalPropriedade: Array<string | number> = [];

    meses.forEach((mes, indexMes) => {
      const atual = dados.filter(
        (item) => item.mes === mes && item.propriedade === propriedade
      );

      const resumoAtual = calcularResumo(atual);

      const mesAnterior = meses[indexMes - 1];

      const anterior = mesAnterior
        ? dados.filter(
            (item) =>
              item.mes === mesAnterior && item.propriedade === propriedade
          )
        : [];

      const resumoAnterior = anterior.length
        ? calcularResumo(anterior)
        : undefined;

      linhaTotalPropriedade.push(
        `${propriedade} TOTAL`,
        resumoAtual.totalReais,
        resumoAtual.totalLitros,
        resumoAtual.reaisPorLitro,
        calcularDiferenca(resumoAtual, resumoAnterior),
        ""
      );
    });

    linhasExcel.push(linhaTotalPropriedade);
  });

  const linhaTotalGeral: Array<string | number> = [];

  meses.forEach((mes, indexMes) => {
    const atual = dados.filter((item) => item.mes === mes);
    const resumoAtual = calcularResumo(atual);

    const mesAnterior = meses[indexMes - 1];

    const anterior = mesAnterior
      ? dados.filter((item) => item.mes === mesAnterior)
      : [];

    const resumoAnterior = anterior.length ? calcularResumo(anterior) : undefined;

    linhaTotalGeral.push(
      "TOTAL GERAL",
      resumoAtual.totalReais,
      resumoAtual.totalLitros,
      resumoAtual.reaisPorLitro,
      calcularDiferenca(resumoAtual, resumoAnterior),
      ""
    );
  });

  linhasExcel.push(linhaTotalGeral);

  const worksheet = XLSX.utils.aoa_to_sheet(linhasExcel);

  worksheet["!cols"] = meses.flatMap(() => [
    { wch: 22 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 4 },
  ]);

  worksheet["!merges"] = meses.map((_, index) => {
    const startCol = index * COLS_POR_MES;
    return {
      s: { r: 0, c: startCol },
      e: { r: 0, c: startCol + 4 },
    };
  });

  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];

      if (!cell) continue;

      const colDentroBloco = col % COLS_POR_MES;

      if (colDentroBloco === 5) {
        cell.s = {
          fill: { fgColor: { rgb: "FFFFFF" } },
        };
        continue;
      }

      cell.s = estiloCelula;

      if (row === 0) {
        cell.s = estiloMes;
      }

      const primeiraCelulaDaLinha =
        worksheet[
          XLSX.utils.encode_cell({
            r: row,
            c: col - colDentroBloco,
          })
        ];

      const primeiraValor = String(primeiraCelulaDaLinha?.v ?? "");

      if (propriedades.includes(primeiraValor)) {
        cell.s = estiloCabecalho;
      }

      if (primeiraValor.endsWith(" TOTAL") || primeiraValor === "TOTAL GERAL") {
        cell.s = estiloTotal;
      }

      if (row > 0) {
        if (colDentroBloco === 1) {
          cell.t = "n";
          cell.z = '"R$" #,##0';
        }

        if (colDentroBloco === 2) {
          cell.t = "n";
          cell.z = "#,##0";
        }

        if (colDentroBloco === 3) {
          cell.t = "n";
          cell.z = '"R$" #,##0.00';
        }

        if (colDentroBloco === 4) {
          cell.t = "n";
          cell.z = '"R$" #,##0';
        }
      }
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Resumo Mensal");

  XLSX.writeFile(workbook, "resumo_abastecimento_terceiros.xlsx");
}