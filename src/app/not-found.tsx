import Link from "next/link";
import { Screen } from "@/components/Screen";
import { Wordmark } from "@/components/Wordmark";

export default function NotFound() {
  return (
    <Screen theme="watch">
      <main className="column flex flex-1 flex-col justify-center py-16">
        <Wordmark className="text-[18px]" />
        <h1 className="mt-10 font-display text-[28px] font-semibold leading-tight">That page isn’t here.</h1>
        <Link href="/search" className="btn mt-10">
          Search a company
        </Link>
      </main>
    </Screen>
  );
}
