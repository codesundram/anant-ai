import type { PartKind } from "./constants";

export type SourceDTO = {
  id: string;
  title: string;
  doc_type: string;
  period: string;
  url: string | null;
};

// A figure always travels with its source; there is no figure type without one.
export type FigureDTO = {
  label: string;
  value: string;
  unit: string;
  period: string;
  source: SourceDTO;
};

export type PartDTO = {
  kind: PartKind;
  order: number;
  body: string;
  figure: FigureDTO | null;
};

export type ProfileDTO = { hq: string; leader: string; leader_role: string; as_of: string };

export type ExplainerDTO = {
  id: string;
  slug: string;
  name: string;
  type: string;
  // "supplied" | "unreviewed" | "approved"
  review: string;
  profile: ProfileDTO | null;
  industry: { slug: string; name: string; total: number };
  parts: PartDTO[];
  note_30w: string;
  sources: SourceDTO[];
};

export type SearchResult = {
  slug: string;
  name: string;
  type: string;
  industry: string;
  covered: true;
};

export type QuizQuestionDTO = {
  id: string;
  part_kind: PartKind;
  prompt: string;
  options: string[];
};

export type QuizResult = { score: number; total: number; correct: number[] };
