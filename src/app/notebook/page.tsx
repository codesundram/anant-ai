import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Notebook } from "@/components/Notebook";
import { Screen } from "@/components/Screen";

export const metadata: Metadata = { title: "Notebook" };

export default function NotebookPage() {
  return (
    <Screen theme="keep">
      <Header />
      <main className="column pt-14">
        <h1 className="font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.02em]">Notebook</h1>
        <Notebook />
      </main>
      <Footer />
    </Screen>
  );
}
