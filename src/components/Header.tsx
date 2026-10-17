import Link from "next/link";
import { SignOutButton } from "./SignOutButton";
import { Wordmark } from "./Wordmark";

export function Header() {
  return (
    <header className="column flex items-center justify-between pt-6">
      <Link href="/search" aria-label="ANANT home">
        <Wordmark className="w-[104px]" />
      </Link>
      <nav aria-label="Main" className="flex items-center gap-5 text-[14px]">
        <Link href="/notebook" className="lk">Notebook</Link>
        <Link href="/progress" className="lk">Progress</Link>
        <SignOutButton />
      </nav>
    </header>
  );
}
