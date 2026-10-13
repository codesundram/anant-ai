import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Progress } from "@/components/Progress";
import { Screen } from "@/components/Screen";
import { getIndustryTotals } from "@/lib/catalogue";

export const metadata: Metadata = { title: "Progress" };
export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  return (
    <Screen theme="keep">
      <Header />
      <main className="column pt-14">
        <h1 className="font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.02em]">Progress</h1>
        <Progress industries={await getIndustryTotals()} />
      </main>
      <Footer />
    </Screen>
  );
}
