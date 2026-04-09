import * as XLSX from "xlsx";
import type { ServiceRow, TipoOperacao } from "../types";
import baseFile from "./Base.xlsx?url";

const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "" || value === "-") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value)
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function excelSerialToDate(serial: number): Date {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);

  const fractionalDay = serial - Math.floor(serial) + 0.0000001;
  let totalSeconds = Math.floor(86400 * fractionalDay);

  const seconds = totalSeconds % 60;
  totalSeconds -= seconds;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds / 60) % 60;

  return new Date(
    dateInfo.getUTCFullYear(),
    dateInfo.getUTCMonth(),
    dateInfo.getUTCDate(),
    hours,
    minutes,
    seconds
  );
}

function parseMonth(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return MONTHS_PT[value.getMonth()];
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const date = excelSerialToDate(value);
    if (!Number.isNaN(date.getTime())) {
      return MONTHS_PT[date.getMonth()];
    }
  }

  const text = String(value ?? "").trim();

  if (!text) return "";

  const asDate = new Date(text);
  if (!Number.isNaN(asDate.getTime())) {
    return MONTHS_PT[asDate.getMonth()];
  }

  const normalized = normalizeText(text);

  const monthMap: Record<string, string> = {
    janeiro: "Janeiro",
    fevereiro: "Fevereiro",
    marco: "Março",
    março: "Março",
    abril: "Abril",
    maio: "Maio",
    junho: "Junho",
    julho: "Julho",
    agosto: "Agosto",
    setembro: "Setembro",
    outubro: "Outubro",
    novembro: "Novembro",
    dezembro: "Dezembro",
  };

  return monthMap[normalized] ?? text;
}

function normalizeTipo(value: unknown): TipoOperacao | "" {
  const text = normalizeText(value);

  if (text === "proprio") return "proprio";
  if (text === "próprio") return "proprio";
  if (text === "terceiro") return "terceiro";

  return "";
}

function findColumnKey(obj: Record<string, unknown>, possibleNames: string[]) {
  for (const key of Object.keys(obj)) {
    const normalizedKey = normalizeText(key);
    if (possibleNames.includes(normalizedKey)) {
      return key;
    }
  }

  return undefined;
}

function mapRow(raw: Record<string, unknown>): ServiceRow | null {
  const mesKey = findColumnKey(raw, ["mes", "mês"]);
  const tipoKey = findColumnKey(raw, [
    "tipo",
    "proprio_terceiro",
    "proprio terceiro",
    "próprio_terceiro",
    "próprio terceiro",
  ]);
  const servicoKey = findColumnKey(raw, ["servico", "serviço"]);
  const quantidadeKey = findColumnKey(raw, [
    "quantidade",
    "quantidade atual",
    "quantidade_atual",
    "quantidadeatual",
  ]);
  const precoKey = findColumnKey(raw, [
    "preco",
    "preço",
    "preco atual",
    "preço atual",
    "preco_atual",
    "precoatual",
  ]);
  const quantidadeTeoricaKey = findColumnKey(raw, [
    "quantidadeteorica",
    "quantidade teorica",
    "quantidade teórica",
    "quantidade_teorica",
  ]);
  const precoTeoricoKey = findColumnKey(raw, [
    "precoteorico",
    "preco teorico",
    "preço teórico",
    "preco_teorico",
  ]);

  const mes = parseMonth(mesKey ? raw[mesKey] : "");
  const tipo = normalizeTipo(tipoKey ? raw[tipoKey] : "");
  const servico = String(servicoKey ? raw[servicoKey] ?? "" : "").trim();

  if (!mes || !tipo || !servico) {
    return null;
  }

  const quantidadeAtual = toNumber(quantidadeKey ? raw[quantidadeKey] : 0);
  const precoAtual = toNumber(precoKey ? raw[precoKey] : 0);

  const quantidadeTeorica = quantidadeTeoricaKey
    ? toNumber(raw[quantidadeTeoricaKey])
    : quantidadeAtual;

  const precoTeorico = precoTeoricoKey
    ? toNumber(raw[precoTeoricoKey])
    : precoAtual;

  return {
    id: `${mes}|${servico}|${tipo}`,
    mes,
    servico,
    tipo,
    quantidadeAtual,
    precoAtual,
    quantidadeTeorica,
    precoTeorico,
  };
}

export async function loadBaseData(): Promise<ServiceRow[]> {
  const response = await fetch(baseFile);
  const arrayBuffer = await response.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, {
    type: "array",
    cellDates: true,
  });

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
    raw: true,
  });

  const mappedRows = jsonRows
    .map((row) => mapRow(row))
    .filter((row): row is ServiceRow => row !== null);

  return mappedRows;
}