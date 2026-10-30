
import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductShowcaseInteractive } from "@/components/product/ProductShowcaseInteractive";
import { Smartphone, ArrowDown } from "lucide-react";

export function ProductShowcase() {
  return (
    <section
      id="showcase"
      className="relative overflow-hidden border-t border-uplink-border bg-white py-24 sm:py-28"
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-44 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-100/40 blur-[130px]" />
        <div className="absolute -right-40 bottom-0 h-[350px] w-[350px] rounded-full bg-indigo-100/30 blur-[110px]" />
      </div>

      <Container className="relative">

        {/* Section heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-uplink-blue">
            <Smartphone className="h-3.5 w-3.5" />
            Explore the Product
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.035em] text-uplink-text sm:text-4xl lg:text-5xl">
            One platform.
            <span className="text-uplink-blue"> Four experiences.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-uplink-text-secondary sm:text-lg">
            Explore the UPLINK mobile experience through interactive previews
            of its four core areas: Discover, Opportunities, Q&A and Mentors.
          </p>
        </div>

        {/* Interactive product stage */}
        <div className="relative overflow-hidden rounded-2xl border border-uplink-border bg-[#F7F9FC] p-5 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.2)] sm:rounded-3xl sm:p-8 lg:p-10">

          {/* Decorative grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #CBD5E1 1px, transparent 1px), linear-gradient(to bottom, #CBD5E1 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "linear-gradient(to bottom, black, transparent 85%)",
            }}
          />

          {/* Ambient glow */}
          <div className="pointer-events-none absolute right-[10%] top-[15%] h-[350px] w-[350px] rounded-full bg-blue-200/30 blur-[100px]" />

          <div className="relative z-10">
            <ProductShowcaseInteractive />
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-uplink-border bg-white text-uplink-blue">
            <ArrowDown className="h-4 w-4" />
          </div>

          <p className="text-xs font-medium tracking-wide text-uplink-text-muted">
            Select a screen above to explore the experience
          </p>
        </div>

      </Container>
    </section>
  );
}
