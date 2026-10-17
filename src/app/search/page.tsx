import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Search } from "@/components/Search";
import { countCompanies, searchCompanies } from "@/lib/catalogue";

export const metadata: Metadata = { title: "Search" };
export const dynamic = "force-dynamic";

export default async function SearchHome() {
  const [initial, total] = await Promise.all([searchCompanies("", 48), countCompanies()]);
  return (
    <Screen theme="watch">
      <Header />
      <main className="column pt-16">
        <h1 className="font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.02em]">
          Sixty seconds. One company.{" "}
          <span className="font-serif font-normal italic tracking-normal">Ready for the interview.</span>
        </h1>
        <div className="mt-12">
          <Search initial={initial} total={total} />
        </div>
      </main>
      <Footer />
    </Screen>
  );
}
