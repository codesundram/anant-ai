import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/constants";

const SIZES = [180, 192, 512];

export function generateStaticParams() {
  return SIZES.map((size) => ({ size: String(size) }));
}

// The app icon is the wordmark on Black Room. There is no logo.
export async function GET(_req: Request, { params }: { params: { size: string } }) {
  const size = Number(params.size);
  if (!SIZES.includes(size)) return new Response("Not found", { status: 404 });
  const font = await readFile(
    join(process.cwd(), "node_modules/@fontsource/inter-tight/files/inter-tight-latin-600-normal.woff"),
  );
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0E0D0C",
          color: "#E8DFCF",
          fontFamily: "Inter Tight",
          fontSize: size * 0.145,
          letterSpacing: "-0.01em",
        }}
      >
        {BRAND}
      </div>
    ),
    { width: size, height: size, fonts: [{ name: "Inter Tight", data: font, weight: 600, style: "normal" }] },
  );
}
