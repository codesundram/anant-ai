import type { FigureDTO, SourceDTO } from "./types";

// Splits a figure into its big number and trailing unit, e.g. "₹20,243" + "crore".
// Values are shown as filed: grouped Indian-style, never rounded.
export function formatFigure(f: Pick<FigureDTO, "value" | "unit">) {
  const [whole, decimals] = f.value.split(".");
  const grouped = Number(whole).toLocaleString("en-IN") + (decimals ? `.${decimals}` : "");
  const m = f.unit.match(/^([₹$€£])\s*(.*)$/);
  return m ? { number: `${m[1]}${grouped}`, unit: m[2] } : { number: grouped, unit: f.unit };
}

export const sourceLine = (s: Pick<SourceDTO, "title" | "period">) =>
  s.title.includes(s.period) ? `Source: ${s.title}` : `Source: ${s.title} · ${s.period}`;
