import type { FigureDTO, SourceDTO } from "./types";

// Splits a figure into its big number and trailing unit, e.g. "₹20,243" + "crore"
// or "$394,328" + "million". Values are shown as filed, never rounded. Rupees
// use Indian digit grouping (1,23,456); other currencies use Western (1,234,567).
export function formatFigure(f: Pick<FigureDTO, "value" | "unit">) {
  const [whole, decimals] = f.value.split(".");
  const m = f.unit.match(/^([₹$€£])\s*(.*)$/);
  const locale = m && m[1] === "₹" ? "en-IN" : f.unit.includes("crore") || f.unit.includes("lakh") ? "en-IN" : "en-US";
  const grouped = Number(whole).toLocaleString(locale) + (decimals ? `.${decimals}` : "");
  return m ? { number: `${m[1]}${grouped}`, unit: m[2] } : { number: grouped, unit: f.unit };
}

export const sourceLine = (s: Pick<SourceDTO, "title" | "period">) =>
  s.title.includes(s.period) ? `Source: ${s.title}` : `Source: ${s.title} · ${s.period}`;
