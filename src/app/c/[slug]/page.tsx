import type { Metadata } from "next";
import Link from "next/link";
import { Player } from "@/components/Player";
import { Screen } from "@/components/Screen";
import { Wordmark } from "@/components/Wordmark";
import { getExplainer } from "@/lib/catalogue";
import { getProState } from "@/lib/pro";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const explainer = await getExplainer(params.slug);
  return { title: explainer ? `${explainer.name} in 60 seconds` : "Not covered yet" };
}

export default async function ExplainerPage({ params }: Props) {
  const [explainer, { isPro }] = await Promise.all([getExplainer(params.slug), getProState()]);
  if (!explainer) {
    return (
      <Screen theme="watch">
        <main className="column flex flex-1 flex-col justify-center py-16">
          <Wordmark className="text-[18px]" />
          <h1 className="mt-10 font-display text-[28px] font-semibold leading-tight">This one isn’t covered yet.</h1>
          <p className="mt-3 text-[16px] leading-[1.5] text-ash">
            We only show companies we have written and checked.
          </p>
          <Link href="/search" className="btn mt-10">
            Search another company
          </Link>
        </main>
      </Screen>
    );
  }
  return <Player explainer={explainer} isPro={isPro} />;
}
