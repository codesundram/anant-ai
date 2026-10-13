import type { ReactNode } from "react";

export type Theme = "watch" | "keep";

// Every screen declares which side it is on: dark for watching, Paper for keeping.
export function Screen({ theme, children, className = "" }: { theme: Theme; children: ReactNode; className?: string }) {
  return (
    <div data-theme={theme} className={`screen flex flex-col ${className}`}>
      {children}
    </div>
  );
}
