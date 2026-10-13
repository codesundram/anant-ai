import Link from "next/link";
import { Wordmark } from "./Wordmark";

export function Header() {
  return (
    <header className="column flex items-center justify-between pt-6">
      <Wordmark className="text-[18px]" />
      <nav aria-label="Main" className="flex gap-5 text-[14px]">
        <Link href="/notebook">Notebook</Link>
        <Link href="/progress">Progress</Link>
      </nav>
    </header>
  );
}
