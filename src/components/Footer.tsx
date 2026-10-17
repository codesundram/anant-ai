import Link from "next/link";
import { COPYRIGHT, DISCLAIMER, TAGLINE } from "@/lib/constants";
import { Wordmark } from "./Wordmark";

const LINKS = [
  ["Search", "/search"],
  ["Notebook", "/notebook"],
  ["Progress", "/progress"],
  ["Free", "/about#free"],
  ["Pro", "/about#pro"],
  ["Campus", "/about#campus"],
  ["About", "/about"],
  ["Disclaimer", "/about#disclaimer"],
] as const;

export function Footer() {
  return (
    <footer className="column mt-auto pb-8 pt-20 text-center">
      <hr className="hairline mb-10" />
      <Link href="/search" aria-label="ANANT home" className="mx-auto">
        <Wordmark className="w-[150px]" />
      </Link>
      <p className="mt-3 text-[14px]">{TAGLINE}</p>
      <nav aria-label="Footer" className="mt-8">
        <ul className="mx-auto grid max-w-[320px] grid-cols-4 gap-x-2 gap-y-1 text-[14px]">
          {LINKS.map(([label, href]) => (
            <li key={label}>
              <Link href={href} className="inline-block py-2 underline-offset-4 hover:underline">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mx-auto mt-8 max-w-[34em] text-[12px] leading-[1.5] text-ash">{DISCLAIMER}</p>
      <p className="mt-4 text-[12px] text-ash">{COPYRIGHT}</p>
    </footer>
  );
}
