// S5-Voz: interpretación del dictado para el registro de entrenamiento (CU-003-002, secuencia "opt entrada por voz")
// Función pura: recibe la transcripción de la Web Speech API y extrae ejercicio, peso y repeticiones.
// Ejemplos: "sentadilla 80 kilos 10 repeticiones" · "press banca 62,5 kg 8 reps" · "remo cuarenta kilos doce veces"

export type Dictado = { ejercicio?: string; peso?: number; reps?: number };

const NUMEROS: Record<string, number> = {
  uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18,
  diecinueve: 19, veinte: 20, treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70,
  ochenta: 80, noventa: 90, cien: 100, ciento: 100,
};

const UNIDAD_PESO = "(?:kilos?|kilogramos?|kgs?)";
const UNIDAD_REPS = "(?:repeticiones?|reps?|veces)";
const NUM = "(\\d+(?:[.,]\\d+)?)";
const RELLENO = new Set(["hice", "con", "de", "a", "por", "y", "en"]);

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // sin tildes: "dieciséis" → "dieciseis"
    .replace(/\b([a-z]+)\s+y\s+([a-z]+)\b/g, (m, a, b) =>
      NUMEROS[a] !== undefined && NUMEROS[b] !== undefined ? String(NUMEROS[a] + NUMEROS[b]) : m) // "cuarenta y cinco"
    .replace(/\b[a-z]+\b/g, (w) => (NUMEROS[w] !== undefined ? String(NUMEROS[w]) : w));
}

const aNumero = (s: string) => Number(s.replace(",", "."));

export function interpretarDictado(texto: string): Dictado {
  const t = normalizar(texto);
  const resultado: Dictado = {};

  const peso = t.match(new RegExp(`${NUM}\\s*${UNIDAD_PESO}\\b`));
  const reps = t.match(new RegExp(`${NUM}\\s*${UNIDAD_REPS}\\b`));
  if (peso) resultado.peso = aNumero(peso[1]);
  if (reps) resultado.reps = Math.round(aNumero(reps[1]));

  // Sin unidades ("sentadilla 80 10"): el primer número es el peso y el segundo las repeticiones
  if (!peso || !reps) {
    const sueltos = [...t.matchAll(new RegExp(NUM, "g"))].map((m) => aNumero(m[1]));
    if (!peso && !reps && sueltos.length >= 2) {
      resultado.peso = sueltos[0];
      resultado.reps = Math.round(sueltos[1]);
    }
  }

  // Ejercicio: las palabras antes del primer número, sin muletillas
  const antesDelNumero = t.split(/\d/)[0];
  const palabras = antesDelNumero.split(/\s+/).filter((p) => p && !RELLENO.has(p));
  if (palabras.length > 0) resultado.ejercicio = palabras.join(" ").toUpperCase();

  return resultado;
}
