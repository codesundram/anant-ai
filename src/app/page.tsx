import type { Metadata } from "next";
import Link from "next/link";
import { InfinityMark } from "@/components/InfinityMark";
import { Intro } from "@/components/Intro";
import { LoginForm } from "@/components/LoginForm";
import { Screen } from "@/components/Screen";
import { Wordmark } from "@/components/Wordmark";
import { DISCLAIMER, SAMPLE_SLUGS, TAGLINE } from "@/lib/constants";

export const metadata: Metadata = { title: "Sign in" };

export default async function Landing({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  // Only allow in-app relative paths as the post-login destination.
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/search";

  return (
    <Intro>
      <Screen theme="watch">
        <main className="column flex flex-1 flex-col items-center pt-24 text-center">
          <div className="flex items-center justify-center gap-3">
            <InfinityMark className="w-[72px]" />
            <Wordmark className="w-[188px]" />
          </div>
          <p className="mt-6 font-serif text-[20px] italic leading-[1.3] text-bone">{TAGLINE}</p>

          <div className="mt-2 w-full max-w-[360px] text-left">
            <LoginForm next={dest} />
          </div>

          <p className="mt-8 text-[14px] text-ash">
            No account yet?{" "}
            <Link
              href={`/c/${SAMPLE_SLUGS[0]}`}
              className="text-bone underline decoration-brass underline-offset-4 transition-colors hover:text-brass"
            >
              Try one now
            </Link>
          </p>
        </main>

        <footer className="column pb-10 pt-16 text-center">
          <p className="mx-auto max-w-[34em] text-[12px] leading-[1.5] text-ash">{DISCLAIMER}</p>
        </footer>
      </Screen>
    </Intro>
  );
}
