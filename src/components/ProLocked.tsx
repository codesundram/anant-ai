import { GoPro } from "./GoPro";

export function ProLocked({ feature = "tracks" }: { feature?: string }) {
  return (
    <div className="mt-8 border-t border-brass pt-8">
      <p className="text-[12px] uppercase tracking-label text-brass">ANANT Pro · ₹149 / month</p>
      <h2 className="mt-3 font-display text-[24px] font-semibold leading-tight">
        Interview ready, one {feature === "certificate" ? "certificate" : "track"} at a time.
      </h2>
      <p className="mt-3 max-w-[32em] text-[16px] leading-[1.5] text-ash">
        Sector tracks and interview kits group companies into a path, mark each with a Brass tick as you finish it, and
        award a certificate when a track is complete.
      </p>
      <div className="mt-6 max-w-[320px]">
        <GoPro />
      </div>
    </div>
  );
}
